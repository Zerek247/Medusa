// Script de verificación rápida para confirmar visualmente (sin depender
// del navegador) el estado final tras la sincronización.
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function verificarFase3({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: productos } = await query.graph({
    entity: "product",
    fields: ["id", "title", "metadata"],
  });
  const bindProductos = productos.filter((p: any) => p.metadata?.bind_sku);
  const marcados = bindProductos.filter((p: any) => p.metadata?.requiere_datos_envio === true);

  logger.info(`Total productos en Medusa: ${productos.length}`);
  logger.info(`Productos con origen Bind ERP (metadata.bind_sku): ${bindProductos.length}`);
  logger.info(`De esos, marcados requiere_datos_envio=true: ${marcados.length}`);
  logger.info(`SKUs marcados: ${marcados.map((p: any) => p.metadata.bind_sku).sort().join(", ")}`);
}
