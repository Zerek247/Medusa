// Guarda el resultado de una tarea post-pago en order.metadata, protegido
// por el candado de idempotencia.ts para que las cuatro tareas (que corren
// en paralelo sobre la MISMA orden) no se pisen entre sí. Ver el comentario
// grande en idempotencia.ts.
import { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { conCandadoDeOrden } from "./idempotencia";

export async function guardarResultadoEnOrden(
  container: MedusaContainer,
  orderId: string,
  cambios: Record<string, unknown>
) {
  await conCandadoDeOrden(orderId, async () => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const orderModuleService = container.resolve(Modules.ORDER);

    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "metadata"],
      filters: { id: orderId },
    });
    const metadataActual = data[0]?.metadata || {};

    await orderModuleService.updateOrders({
      id: orderId,
      metadata: { ...metadataActual, ...cambios },
    });
  });
}
