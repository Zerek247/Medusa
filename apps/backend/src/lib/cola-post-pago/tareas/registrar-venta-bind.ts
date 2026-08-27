// Tarea 1 de 4: avisarle a Bind ERP que se vendieron estos productos, para
// que descuente existencia de SU lado (Bind es la fuente de verdad de
// inventario -- Fase 3 -- así que si no le avisamos, Bind se queda con
// existencia desactualizada aunque en Medusa sí se haya descontado).
import type { Job } from "bullmq";
import { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { registrarVenta, ItemVentaBind } from "../../bind-sync/bind-client";
import { yaSeCompleto, marcarCompletado } from "../idempotencia";
import { guardarResultadoEnOrden } from "../resultado-en-orden";
import { TAREAS } from "../cola";

export async function tareaRegistrarVentaBind(container: MedusaContainer, orderId: string, job: Job) {
  const tarea = TAREAS.REGISTRAR_VENTA_BIND;
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  const yaHecho = await yaSeCompleto<{ folio: string }>(orderId, tarea);
  if (yaHecho) {
    await job.log(`Ya se había registrado esta venta en Bind antes (folio ${yaHecho.folio}) -- se omite, no se vuelve a llamar a Bind.`);
    logger.info(`[post-pago:${tarea}] orden ${orderId}: ya completada antes (folio ${yaHecho.folio}), se omite.`);
    return;
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  // OJO: "items.quantity" como campo EXPLÍCITO en la lista, junto a otros
  // campos explícitos, se ve raro en este entorno -- query.graph lo omite
  // en silencio del resultado (sin error, sin null, simplemente no viene).
  // "items.*" sí lo trae bien, ya como number plano (no como el objeto
  // raw_quantity de BigNumber). Se pidió explícito en un principio y costó
  // detectar porque no truena, solo faltaba el dato.
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "email", "items.*", "items.product.metadata"],
    filters: { id: orderId },
  });
  const order = orders[0] as any;
  if (!order) {
    throw new Error(`No se encontró la orden ${orderId}`);
  }

  const items: ItemVentaBind[] = [];
  for (const item of order.items || []) {
    const bindId = item.product?.metadata?.bind_id;
    if (bindId == null) {
      // No hay a quién registrarle la venta en Bind si el producto nunca
      // vino de Bind (por ejemplo, productos DEMO del starter). Esto es un
      // error real, no algo que debamos silenciar: entra al mismo camino de
      // reintento/cola de fallidos que cualquier otro fallo.
      throw new Error(
        `El producto del renglón "${item.title}" (sku ${item.variant_sku}) no tiene metadata.bind_id -- no vino de la sincronización con Bind ERP.`
      );
    }
    items.push({ id: bindId, cantidad: item.quantity });
  }

  await job.log(`Registrando venta en Bind ERP: ${items.length} renglón(es) -- ${JSON.stringify(items)}`);
  logger.info(`[post-pago:${tarea}] orden ${orderId}: registrando venta en Bind ERP (${items.length} renglón(es))...`);

  // La clave_idempotencia es SIEMPRE la misma para esta orden+tarea, sin
  // importar cuántas veces se reintente -- así, si un intento anterior sí
  // llegó a Bind pero la respuesta se perdió en el camino (timeout de red),
  // Bind nos devuelve la MISMA venta en vez de registrar una segunda.
  const venta = await registrarVenta(items, `${orderId}:${tarea}`, { email: order.email });

  await job.log(`Bind ERP respondió: folio ${venta.folio}, total $${venta.total}.`);
  await marcarCompletado(orderId, tarea, { folio: venta.folio });
  await guardarResultadoEnOrden(container, orderId, { bind_folio_venta: venta.folio });

  logger.info(`[post-pago:${tarea}] orden ${orderId}: venta registrada en Bind, folio ${venta.folio}.`);
}
