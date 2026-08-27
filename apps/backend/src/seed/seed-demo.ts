// Crea los 8 productos de demostración (Fase 6B) a partir de
// productos-demo.jsonc -- edita ESE archivo, no este script, para cambiar
// nombres/precios/fotos. Idempotente por SKU: si el producto ya existe, no
// lo duplica (para poder correr esto de nuevo después de editar el JSON
// sin generar copias).
//
// A diferencia de sync-catalog.ts (Fase 3), esto NO viene de Bind ERP --
// por eso NO se marca con bind_id/bind_sku, y por eso el sync de Bind
// nunca va a tocar/actualizar estos productos (su filtro es por SKU
// existente en Bind, que estos SKUs "DEMO-" nunca van a tener).
//
// Uso:
//   npx medusa exec ./src/seed/seed-demo.ts
import fs from "node:fs";
import path from "node:path";
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils";
import { createProductsWorkflow, createInventoryLevelsWorkflow } from "@medusajs/medusa/core-flows";

interface ProductoDemo {
  sku: string;
  nombre: string;
  descripcion: string;
  precio: number;
  existencia: number;
  categoria: string;
  peso_kg: number;
  largo_cm: number;
  ancho_cm: number;
  alto_cm: number;
  imagen: string | null;
}

function leerProductosDemo(): ProductoDemo[] {
  const ruta = path.join(__dirname, "productos-demo.jsonc");
  const crudo = fs.readFileSync(ruta, "utf-8");
  // JSONC -> JSON: quita comentarios de línea "//" (JSON de verdad no los
  // soporta). Suficiente para este archivo controlado por nosotros -- no
  // es un parser JSONC completo, no hace falta serlo aquí.
  const sinComentarios = crudo.replace(/^\s*\/\/.*$/gm, "");
  return JSON.parse(sinComentarios);
}

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mismo hallazgo que sync-catalog.ts (Fase 3): pedir inventory_item_id
// justo después de createProductsWorkflow a veces no lo trae -- el link
// variant<->inventory_item tarda un instante en asentarse. Reintentamos en
// vez de perseguir la causa exacta dentro del motor de workflows.
async function resolverInventoryItemId(query: any, sku: string): Promise<string | null> {
  for (let intento = 1; intento <= 3; intento++) {
    const { data } = await query.graph({
      entity: "product_variant",
      fields: ["id", "sku", "inventory_items.inventory_item_id"],
      filters: { sku },
    });
    const id = (data[0] as any)?.inventory_items?.[0]?.inventory_item_id;
    if (id) return id;
    await esperar(300 * intento);
  }
  return null;
}

export default async function seedDemo({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const productos = leerProductosDemo();

  const { data: existentes } = await query.graph({
    entity: "product_variant",
    fields: ["sku", "inventory_items.inventory.location_levels.location_id"],
    filters: { sku: productos.map((p) => p.sku) },
  });
  const skusExistentes = new Set(existentes.map((v: any) => v.sku));
  const skusSinNivelDeInventario = new Set(
    (existentes as any[])
      .filter((v) => !(v.inventory_items?.[0]?.inventory?.location_levels?.length > 0))
      .map((v) => v.sku)
  );

  const [{ data: salesChannels }, { data: stockLocations }, { data: shippingProfiles }, { data: categorias }] =
    await Promise.all([
      query.graph({ entity: "sales_channel", fields: ["id"], pagination: { take: 1 } }),
      query.graph({ entity: "stock_location", fields: ["id"], pagination: { take: 1 } }),
      query.graph({ entity: "shipping_profile", fields: ["id"], pagination: { take: 1 } }),
      query.graph({ entity: "product_category", fields: ["id", "name"] }),
    ]);
  const idPorCategoria = new Map((categorias as any[]).map((c) => [c.name, c.id]));

  const { data: stockLocationsBackfill } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
    pagination: { take: 1 },
  });

  let creados = 0;
  for (const producto of productos) {
    if (skusExistentes.has(producto.sku)) {
      if (skusSinNivelDeInventario.has(producto.sku)) {
        const inventoryItemId = await resolverInventoryItemId(query, producto.sku);
        if (inventoryItemId) {
          await createInventoryLevelsWorkflow(container).run({
            input: {
              inventory_levels: [
                {
                  inventory_item_id: inventoryItemId,
                  location_id: stockLocationsBackfill[0].id,
                  stocked_quantity: producto.existencia,
                },
              ],
            },
          });
          logger.info(`[seed-demo] ${producto.sku} ya existía -- existencia completada (faltaba).`);
        }
      } else {
        logger.info(`[seed-demo] ${producto.sku} ya existía, se omite.`);
      }
      continue;
    }

    const categoryId = idPorCategoria.get(producto.categoria);
    if (!categoryId) {
      logger.warn(
        `[seed-demo] "${producto.categoria}" no es una categoría que exista (producto ${producto.sku}) -- ` +
          `corre crear-categorias.ts primero, o corrige el nombre en productos-demo.jsonc. Se omite este producto.`
      );
      continue;
    }

    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: producto.nombre,
            description: producto.descripcion,
            status: ProductStatus.PUBLISHED,
            thumbnail: producto.imagen || undefined,
            metadata: { demo: true },
            category_ids: [categoryId],
            options: [{ title: "Default", values: ["Default"] }],
            shipping_profile_id: shippingProfiles[0].id,
            sales_channels: [{ id: salesChannels[0].id }],
            variants: [
              {
                title: producto.nombre,
                sku: producto.sku,
                manage_inventory: true,
                options: { Default: "Default" },
                prices: [{ currency_code: "mxn", amount: producto.precio }],
                weight: producto.peso_kg,
                length: producto.largo_cm,
                width: producto.ancho_cm,
                height: producto.alto_cm,
              },
            ],
          },
        ],
      },
    });

    const inventoryItemId = await resolverInventoryItemId(query, producto.sku);
    if (inventoryItemId) {
      await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: [
            {
              inventory_item_id: inventoryItemId,
              location_id: stockLocations[0].id,
              stocked_quantity: producto.existencia,
            },
          ],
        },
      });
    } else {
      logger.warn(`[seed-demo] ${producto.sku}: no se pudo resolver inventory_item_id, existencia no capturada.`);
    }

    creados += 1;
    logger.info(`[seed-demo] Creado: ${producto.sku} -- ${producto.nombre}`);
  }

  logger.info(`[seed-demo] Terminado: ${creados} producto(s) nuevo(s) de ${productos.length} en el archivo.`);
}
