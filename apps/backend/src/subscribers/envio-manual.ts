// Al colocarse una orden, revisa si el método de envío elegido fue el de
// respaldo "Envío por cotizar" (proveedor manual, sin cálculo real de
// Skydropx -- eso pasa cuando algún producto del carrito no tenía peso o
// dimensiones). Si fue así, marca la orden con metadata.requiere_revision_manual
// para que alguien del equipo confirme el costo de envío a mano antes de
// despacharla. Mismo patrón que metadata.requiere_datos_envio de Fase 3.
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

// Debe coincidir EXACTO con el "name" de la opción de respaldo creada en
// src/scripts/setup-envio-mexico.ts.
const NOMBRE_OPCION_POR_COTIZAR = "Envío por cotizar";

export default async function envioManualHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const orderModuleService = container.resolve(Modules.ORDER);

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "metadata", "shipping_methods.name"],
    filters: { id: data.id },
  });
  const order = orders[0];
  if (!order) {
    logger.warn(`[envio-manual] No se encontró la orden ${data.id}`);
    return;
  }

  // OJO: el shipping_method de una orden YA COLOCADA es una copia
  // congelada de lo que se cobró (no mantiene una relación viva a
  // shipping_option -- esa opción se pudo haber borrado o modificado
  // después). Por eso comparamos por nombre y no por provider_id/type.code
  // de shipping_option, que aquí no vienen poblados.
  const usaEnvioPorCotizar = (order as any).shipping_methods?.some(
    (sm: any) => sm.name === NOMBRE_OPCION_POR_COTIZAR
  );

  if (!usaEnvioPorCotizar) return;

  await orderModuleService.updateOrders({
    id: order.id,
    metadata: { ...(order.metadata || {}), requiere_revision_manual: true },
  });

  logger.info(`[envio-manual] Orden ${order.id} marcada requiere_revision_manual=true (envío por cotizar).`);
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
