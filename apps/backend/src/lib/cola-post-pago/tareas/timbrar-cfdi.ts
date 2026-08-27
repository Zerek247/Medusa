// Tarea 2 de 4: timbrar el CFDI de la venta con el PAC (mockeado -- ver el
// comentario al inicio de apps/mock-cfdi/src/index.js sobre por qué esto
// nunca puede ser un timbrado fiscal real en este prototipo).
import type { Job } from "bullmq";
import { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { timbrarCfdi, ConceptoCfdi } from "../../cfdi-client";
import { yaSeCompleto, marcarCompletado } from "../idempotencia";
import { guardarResultadoEnOrden } from "../resultado-en-orden";
import { TAREAS } from "../cola";

export async function tareaTimbrarCfdi(container: MedusaContainer, orderId: string, job: Job) {
  const tarea = TAREAS.TIMBRAR_CFDI;
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  const yaHecho = await yaSeCompleto<{ uuid: string }>(orderId, tarea);
  if (yaHecho) {
    await job.log(`Ya se había timbrado esta orden antes (UUID ${yaHecho.uuid}) -- se omite, NO se timbra dos veces.`);
    logger.info(`[post-pago:${tarea}] orden ${orderId}: ya completada antes (UUID ${yaHecho.uuid}), se omite.`);
    return;
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  // "items.*" a propósito -- ver el comentario en registrar-venta-bind.ts
  // sobre por qué NO se piden items.quantity/items.unit_price como campos
  // explícitos sueltos.
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "items.*", "subtotal", "tax_total", "total", "metadata"],
    filters: { id: orderId },
  });
  const order = orders[0] as any;
  if (!order) {
    throw new Error(`No se encontró la orden ${orderId}`);
  }

  const conceptos: ConceptoCfdi[] = (order.items || []).map((item: any) => ({
    descripcion: item.title,
    cantidad: item.quantity,
    valor_unitario: item.unit_price,
  }));

  // Datos fiscales capturados en el checkout (Fase 6, cart.metadata ->
  // order.metadata). Si el comprador no los llenó (no quería factura),
  // timbrarCfdi cae de vuelta al RFC genérico de "público en general".
  const datosFiscales = order.metadata?.datos_fiscales as
    | { rfc?: string; razon_social?: string }
    | undefined;

  await job.log(`Timbrando CFDI: ${conceptos.length} concepto(s), total $${order.total}.`);
  logger.info(`[post-pago:${tarea}] orden ${orderId}: timbrando CFDI...`);

  const factura = await timbrarCfdi({
    ordenId: orderId,
    conceptos,
    subtotal: order.subtotal,
    iva: order.tax_total,
    total: order.total,
    claveIdempotencia: `${orderId}:${tarea}`,
    receptorRfc: datosFiscales?.rfc,
    receptorNombre: datosFiscales?.razon_social,
  });

  await job.log(`PAC respondió: UUID ${factura.uuid}, timbrado ${factura.fecha_timbrado}.`);
  await marcarCompletado(orderId, tarea, { uuid: factura.uuid });
  await guardarResultadoEnOrden(container, orderId, {
    cfdi_uuid: factura.uuid,
    cfdi_fecha_timbrado: factura.fecha_timbrado,
  });

  logger.info(`[post-pago:${tarea}] orden ${orderId}: CFDI timbrado, UUID ${factura.uuid}.`);
}
