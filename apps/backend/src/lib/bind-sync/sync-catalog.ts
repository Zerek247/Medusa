// Sincronización de catálogo: Bind ERP -> Medusa.
//
// REGLA DE ORO de este archivo, la más importante de toda la Fase 3:
// "Bind manda, la tienda obedece" pero SOLO para precio y existencia.
//
//   - Producto NUEVO en Bind (SKU que no existe todavía en Medusa):
//     se crea completo con lo que manda Bind (nombre, descripción, precio,
//     existencia, peso/dimensiones si las trae). No hay nada que "proteger"
//     todavía porque el producto no existe.
//
//   - Producto YA EXISTENTE en Medusa (SKU que ya se sincronizó antes):
//     se actualiza SOLO precio, existencia y la bandera
//     `requiere_datos_envio`. Nunca se tocan título, descripción, imágenes,
//     categorías web ni peso/dimensiones -- esos quedan a criterio del
//     equipo de la tienda una vez que el producto ya existe, y machacarlos
//     en cada sync destruiría cualquier curaduría manual (fotos, categorías,
//     copy de marketing, corrección de un peso mal capturado en el ERP).
//
// Esta es la razón por la que el código de creación y el de actualización
// mandan campos distintos a Medusa -- no es un descuido, es la política.
import { Logger, MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  updateInventoryLevelsWorkflow,
  updateProductsWorkflow,
  updateProductVariantsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { obtenerCatalogoBind, ProductoBind } from "./bind-client";
import { registrarEnBitacora } from "./bitacora";

const MONEDA_BIND = "mxn";

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Reintenta una operación hasta 3 veces con espera creciente.
 *
 * Por qué existe: se observó que llamar a createInventoryLevelsWorkflow
 * INMEDIATAMENTE después de que createProductsWorkflow termina puede fallar
 * con "Item X is not stocked at location Y" -- pero la MISMA llamada,
 * repetida unos cientos de ms después, funciona sin problema. Todo apunta
 * a una carrera transitoria del motor de workflows sobre Redis (algún
 * efecto posterior a la creación del inventory_item que no queda visible
 * de inmediato), no a un error de nuestra lógica. Reintentar con una
 * espera corta es más simple y robusto que perseguir la causa exacta
 * dentro del motor de workflows de Medusa.
 */
async function reintentar<T>(fn: () => Promise<T>, etiqueta: string, logger: Logger): Promise<T> {
  const intentos = 3;
  let ultimoError: unknown;
  for (let intento = 1; intento <= intentos; intento++) {
    try {
      return await fn();
    } catch (error) {
      ultimoError = error;
      if (intento < intentos) {
        const demora = 300 * intento;
        logger.warn(`[bind-sync] ${etiqueta} falló (intento ${intento}/${intentos}), reintentando en ${demora}ms: ${(error as Error).message}`);
        await esperar(demora);
      }
    }
  }
  throw ultimoError;
}

export interface ResumenSync {
  disparado_por: "scheduled" | "manual";
  fecha: string;
  total_productos_bind: number;
  creados: number;
  actualizados: number;
  fallidos: number;
  errores: Array<{ sku: string; error: string }>;
  marcados_requiere_datos_envio: string[];
}

function requiereDatosEnvio(producto: ProductoBind): boolean {
  return (
    producto.peso_kg == null ||
    producto.largo_cm == null ||
    producto.ancho_cm == null ||
    producto.alto_cm == null
  );
}

/** Asegura que la tienda tenga "mxn" en sus monedas soportadas -- Bind
 * manda precios en pesos mexicanos y no tiene sentido guardarlos con otra
 * moneda. No quita las monedas que ya existan (el seed de ejemplo trae
 * eur/usd de productos demo); solo agrega mxn si falta. */
async function asegurarMonedaMxn(container: MedusaContainer, logger: Logger) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "supported_currencies.currency_code", "supported_currencies.is_default"],
  });
  const store = stores[0];
  const yaTieneMxn = store.supported_currencies?.some((c: any) => c.currency_code === "mxn");
  if (yaTieneMxn) return;

  logger.info('[bind-sync] La tienda no soportaba "mxn" -- agregándola a supported_currencies.');
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          ...(store.supported_currencies || []).map((c: any) => ({
            currency_code: c.currency_code,
            is_default: c.is_default,
          })),
          { currency_code: "mxn", is_default: false },
        ],
      },
    },
  });
}

interface DatosDefault {
  salesChannelId: string;
  stockLocationId: string;
  shippingProfileId: string;
}

async function obtenerDatosDefault(container: MedusaContainer): Promise<DatosDefault> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const [{ data: salesChannels }, { data: stockLocations }, { data: shippingProfiles }] = await Promise.all([
    query.graph({ entity: "sales_channel", fields: ["id"], pagination: { take: 1 } }),
    query.graph({ entity: "stock_location", fields: ["id"], pagination: { take: 1 } }),
    query.graph({ entity: "shipping_profile", fields: ["id"], pagination: { take: 1 } }),
  ]);

  if (!salesChannels[0] || !stockLocations[0] || !shippingProfiles[0]) {
    throw new Error(
      "Faltan datos base de la tienda (canal de ventas, ubicación de inventario o perfil de envío). " +
        "Corre las migraciones (npx medusa db:migrate) antes de sincronizar -- el seed inicial las crea."
    );
  }

  return {
    salesChannelId: salesChannels[0].id,
    stockLocationId: stockLocations[0].id,
    shippingProfileId: shippingProfiles[0].id,
  };
}

interface VariantExistente {
  variantId: string;
  productId: string;
  inventoryItemId: string | null;
  // Si el inventory_item ya tiene un nivel para NUESTRA ubicación de stock.
  // Importa porque updateInventoryLevelsWorkflow necesita que el nivel ya
  // exista (si no, truena) -- puede pasar que un producto se haya creado
  // en una corrida anterior pero el paso de inventario haya fallado, y en
  // ese caso hay que CREAR el nivel, no actualizarlo, aunque el producto
  // en sí ya exista.
  tieneNivelDeInventario: boolean;
}

/** Trae, en UNA sola consulta, qué SKUs de Bind ya existen como variantes
 * en Medusa -- así sabemos cuáles van por el camino de creación y cuáles
 * por el de actualización sin pedir producto por producto. */
async function obtenerVariantesExistentes(
  container: MedusaContainer,
  skus: string[],
  stockLocationId: string
): Promise<Map<string, VariantExistente>> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const mapa = new Map<string, VariantExistente>();
  if (skus.length === 0) return mapa;

  const { data } = await query.graph({
    entity: "product_variant",
    fields: [
      "id",
      "sku",
      "product_id",
      "inventory_items.inventory_item_id",
      "inventory_items.inventory.location_levels.location_id",
    ],
    filters: { sku: skus },
  });

  for (const variant of data) {
    if (!variant.sku) continue;
    const inventoryItem = variant.inventory_items?.[0];
    const locationLevels = (inventoryItem as any)?.inventory?.location_levels || [];
    mapa.set(variant.sku, {
      variantId: variant.id,
      productId: variant.product_id,
      inventoryItemId: inventoryItem?.inventory_item_id ?? null,
      tieneNivelDeInventario: locationLevels.some((l: any) => l.location_id === stockLocationId),
    });
  }
  return mapa;
}

export async function syncBindCatalog(
  container: MedusaContainer,
  opciones: { trigger: "scheduled" | "manual" }
): Promise<ResumenSync> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const inicio = Date.now();

  const resumen: ResumenSync = {
    disparado_por: opciones.trigger,
    fecha: new Date().toISOString(),
    total_productos_bind: 0,
    creados: 0,
    actualizados: 0,
    fallidos: 0,
    errores: [],
    marcados_requiere_datos_envio: [],
  };

  logger.info(`[bind-sync] Iniciando sincronización (disparada: ${opciones.trigger})`);

  await asegurarMonedaMxn(container, logger);
  const { salesChannelId, stockLocationId, shippingProfileId } = await obtenerDatosDefault(container);

  const catalogoBind = await obtenerCatalogoBind(logger);
  resumen.total_productos_bind = catalogoBind.length;
  logger.info(`[bind-sync] ${catalogoBind.length} productos obtenidos de Bind ERP.`);

  const skus = catalogoBind.map((p) => p.sku);
  const existentes = await obtenerVariantesExistentes(container, skus, stockLocationId);

  // Procesamos SECUENCIALMENTE (no en un solo batch) a propósito: si
  // agrupáramos los 60 en una sola llamada a createProductsWorkflow y UNO
  // fallara, perderíamos la cuenta exacta de cuáles fallaron y por qué. A
  // esta escala (decenas de productos, todo contra la BD local, no contra
  // Bind) el costo de ir uno por uno es insignificante comparado con la
  // precisión que gana la bitácora.
  for (const producto of catalogoBind) {
    const flagEnvio = requiereDatosEnvio(producto);
    if (flagEnvio) resumen.marcados_requiere_datos_envio.push(producto.sku);

    try {
      const existente = existentes.get(producto.sku);
      if (existente) {
        await actualizarProducto(container, producto, existente, flagEnvio, stockLocationId);
        resumen.actualizados += 1;
      } else {
        await crearProducto(container, producto, flagEnvio, {
          salesChannelId,
          stockLocationId,
          shippingProfileId,
        });
        resumen.creados += 1;
      }
    } catch (error) {
      resumen.fallidos += 1;
      resumen.errores.push({ sku: producto.sku, error: (error as Error).message });
      logger.error(`[bind-sync] Falló el SKU ${producto.sku}: ${(error as Error).message}`);
    }
  }

  const duracionMs = Date.now() - inicio;
  logger.info(
    `[bind-sync] Sincronización terminada en ${duracionMs}ms -- ` +
      `${resumen.creados} creados, ${resumen.actualizados} actualizados, ${resumen.fallidos} fallidos, ` +
      `${resumen.marcados_requiere_datos_envio.length} marcados con requiere_datos_envio.`
  );
  if (resumen.errores.length > 0) {
    logger.warn(`[bind-sync] Detalle de fallos: ${JSON.stringify(resumen.errores)}`);
  }

  // Bitácora persistida en Redis (Fase 6) -- ver el comentario en
  // bitacora.ts sobre por qué, además de los logs del contenedor.
  await registrarEnBitacora(resumen);

  return resumen;
}

// --- Actualización: SOLO precio, existencia y la bandera de envío. ---
async function actualizarProducto(
  container: MedusaContainer,
  producto: ProductoBind,
  existente: VariantExistente,
  flagEnvio: boolean,
  stockLocationId: string
) {
  await updateProductVariantsWorkflow(container).run({
    input: {
      product_variants: [
        {
          id: existente.variantId,
          prices: [{ currency_code: MONEDA_BIND, amount: producto.precio }],
        },
      ],
    },
  });

  if (existente.inventoryItemId) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    // Caso normal: ya hay un nivel de inventario para este producto en
    // nuestra ubicación -> se actualiza. Caso de recuperación: el producto
    // existe pero (por ejemplo, por una corrida anterior que falló a medio
    // camino) nunca llegó a tener nivel de inventario -> hay que crearlo,
    // no actualizarlo.
    if (existente.tieneNivelDeInventario) {
      await reintentar(
        () =>
          updateInventoryLevelsWorkflow(container).run({
            input: {
              updates: [
                {
                  inventory_item_id: existente.inventoryItemId as string,
                  location_id: stockLocationId,
                  stocked_quantity: producto.existencia,
                },
              ],
            },
          }),
        `actualizar existencia de ${producto.sku}`,
        logger
      );
    } else {
      await reintentar(
        () =>
          createInventoryLevelsWorkflow(container).run({
            input: {
              inventory_levels: [
                {
                  inventory_item_id: existente.inventoryItemId as string,
                  location_id: stockLocationId,
                  stocked_quantity: producto.existencia,
                },
              ],
            },
          }),
        `crear existencia faltante de ${producto.sku}`,
        logger
      );
    }
  }

  // metadata SÍ se actualiza, pero solo la llave requiere_datos_envio -- se
  // combina con lo que ya hubiera en metadata en vez de reemplazarlo, para
  // no pisar otras llaves que el equipo de la tienda haya agregado a mano.
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: productos } = await query.graph({
    entity: "product",
    fields: ["id", "metadata"],
    filters: { id: existente.productId },
  });
  const metadataActual = productos[0]?.metadata || {};

  await updateProductsWorkflow(container).run({
    input: {
      products: [
        {
          id: existente.productId,
          // bind_id (además de requiere_datos_envio) también se refresca en
          // cada sync: no es "contenido" de la tienda que haya que proteger,
          // es el id numérico interno de Bind para este producto -- una
          // llave foránea técnica que Fase 5 necesita para registrar ventas
          // (POST /api/ventas de Bind pide {id, cantidad}, no el SKU). Los
          // 60 productos creados en Fase 3, antes de que este campo
          // existiera, lo obtienen aquí la próxima vez que corra el sync.
          metadata: { ...metadataActual, requiere_datos_envio: flagEnvio, bind_id: producto.id },
        },
      ],
    },
  });
}

// --- Creación: acá sí se manda todo lo que Bind trae, porque el producto
// no existe todavía y no hay nada de "la tienda" que proteger. ---
async function crearProducto(
  container: MedusaContainer,
  producto: ProductoBind,
  flagEnvio: boolean,
  datosDefault: DatosDefault
) {
  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: producto.nombre,
          description: producto.descripcion,
          status: ProductStatus.PUBLISHED,
          metadata: {
            requiere_datos_envio: flagEnvio,
            bind_sku: producto.sku,
            // Ver el comentario en actualizarProducto sobre por qué se
            // guarda esto (Fase 5: registrar_venta_en_bind lo necesita).
            bind_id: producto.id,
          },
          options: [{ title: "Default", values: ["Default"] }],
          shipping_profile_id: datosDefault.shippingProfileId,
          sales_channels: [{ id: datosDefault.salesChannelId }],
          variants: [
            {
              title: producto.nombre,
              sku: producto.sku,
              manage_inventory: true,
              options: { Default: "Default" },
              prices: [{ currency_code: MONEDA_BIND, amount: producto.precio }],
              weight: producto.peso_kg ?? undefined,
              length: producto.largo_cm ?? undefined,
              width: producto.ancho_cm ?? undefined,
              height: producto.alto_cm ?? undefined,
            },
          ],
        },
      ],
    },
  });

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  // OJO: NO confiamos en result[0].variants[0].inventory_items -- se
  // observó que ese campo del resultado del workflow no siempre viene
  // poblado justo al terminar createProductsWorkflow (el link variant <->
  // inventory_item parece asentarse un instante después). Re-consultamos
  // por SKU, con reintento, en vez de confiar en el resultado inmediato.
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const inventoryItemId = await reintentar(
    async () => {
      const { data } = await query.graph({
        entity: "product_variant",
        fields: ["id", "sku", "inventory_items.inventory_item_id"],
        filters: { sku: producto.sku },
      });
      const id = (data[0] as any)?.inventory_items?.[0]?.inventory_item_id;
      if (!id) throw new Error("inventory_item_id todavía no visible para la variante recién creada");
      return id as string;
    },
    `resolver inventory_item_id de ${producto.sku}`,
    logger
  );

  await reintentar(
    () =>
      createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: [
            {
              inventory_item_id: inventoryItemId,
              location_id: datosDefault.stockLocationId,
              stocked_quantity: producto.existencia,
            },
          ],
        },
      }),
    `crear existencia de ${producto.sku}`,
    logger
  );
}
