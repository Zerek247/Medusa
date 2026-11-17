// SOLO PARA DEMOSTRACIÓN -- NO usar en producción.
//
// Prepara en el Medusa LOCAL lo necesario para enseñar los precios por tipo
// de cliente mientras el cliente real todavía no captura sus precios:
//
//  1. PRECIOS DE EJEMPLO (inventados): precio estándar = costo de Bind x 1.35,
//     solo para los productos que tienen costo en Bind. Los demás quedan sin
//     precio (la tienda muestra "Precio por cotizar"). El costo se LEE de
//     Bind (GET); nunca se escribe nada en Bind ni se guarda el costo en
//     Medusa.
//  2. Un grupo de clientes "Cliente especial" y una lista de precios ligada a
//     ese grupo con 10% menos que el estándar.
//
// Los clientes de ejemplo (uno normal y uno especial) se crean aparte con la
// API (ver demo-clientes en el README); sus datos:
//   normal   : demo-normal@biobackup.mx   / Demo2026!
//   especial : demo-especial@biobackup.mx / Demo2026!
//
// Es idempotente: se puede correr varias veces.
//
// Uso (con las variables de Bind, solo lectura):
//   npx medusa exec ./src/scripts/demo-precios-y-clientes.ts
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  createCustomerGroupsWorkflow,
  createPriceListsWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows";
import { obtenerCatalogoBind } from "../lib/bind-sync/bind-client";

const MARGEN_DEMO = 1.35;
const DESCUENTO_ESPECIAL = 0.9;
const NOMBRE_GRUPO = "Cliente especial";
const TITULO_LISTA = "Precios clientes especiales (DEMO)";

export default async function demoPreciosYClientes({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  // 1) Costos de Bind (solo lectura) -> precios estándar de ejemplo
  const catalogo = await obtenerCatalogoBind(logger);
  const costoPorSku = new Map(catalogo.filter((p) => p.costo).map((p) => [p.sku, p.costo as number]));

  const { data: variantes } = await query.graph({
    entity: "product_variant",
    fields: ["id", "sku"],
  });

  const conPrecio: Array<{ variantId: string; precio: number }> = [];
  for (const v of variantes as any[]) {
    const costo = v.sku ? costoPorSku.get(v.sku) : undefined;
    if (costo) conPrecio.push({ variantId: v.id, precio: Math.ceil(costo * MARGEN_DEMO) });
  }
  logger.info(`[demo] ${conPrecio.length} de ${variantes.length} variantes tienen costo en Bind -> precio estándar de ejemplo.`);

  for (const { variantId, precio } of conPrecio) {
    await updateProductVariantsWorkflow(container).run({
      input: {
        product_variants: [{ id: variantId, prices: [{ currency_code: "mxn", amount: precio }] }],
      },
    });
  }

  // 2) Grupo "Cliente especial"
  const { data: grupos } = await query.graph({
    entity: "customer_group",
    fields: ["id", "name"],
    filters: { name: NOMBRE_GRUPO },
  });
  let grupoId = (grupos as any[])[0]?.id as string | undefined;
  if (!grupoId) {
    const { result } = await createCustomerGroupsWorkflow(container).run({
      input: { customersData: [{ name: NOMBRE_GRUPO }] },
    });
    grupoId = result[0].id;
    logger.info(`[demo] Grupo "${NOMBRE_GRUPO}" creado.`);
  }

  // 3) Lista de precios del grupo (10% menos)
  const { data: listas } = await query.graph({
    entity: "price_list",
    fields: ["id", "title"],
    filters: { title: TITULO_LISTA },
  });
  if ((listas as any[]).length === 0) {
    await createPriceListsWorkflow(container).run({
      input: {
        price_lists_data: [
          {
            title: TITULO_LISTA,
            description: "Precio de ejemplo para clientes especiales (demostración).",
            status: "active" as any,
            type: "sale" as any,
            rules: { "customer.groups.id": [grupoId] },
            prices: conPrecio.map(({ variantId, precio }) => ({
              variant_id: variantId,
              currency_code: "mxn",
              amount: Math.ceil(precio * DESCUENTO_ESPECIAL),
            })),
          },
        ],
      },
    });
    logger.info(`[demo] Lista "${TITULO_LISTA}" creada con ${conPrecio.length} precios.`);
  } else {
    logger.info(`[demo] La lista "${TITULO_LISTA}" ya existía, no se vuelve a crear.`);
  }

  console.log(JSON.stringify({ variantes_con_precio_demo: conPrecio.length, grupo_id: grupoId }));
}
