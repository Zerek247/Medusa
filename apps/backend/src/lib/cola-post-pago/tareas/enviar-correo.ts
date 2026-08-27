// Tarea 4 de 4: mandar el correo de confirmación. Va al final de la lista
// del negocio pero no depende de las otras tres -- por diseño, las cuatro
// tareas son independientes entre sí (ninguna espera a que otra termine).
import type { Job } from "bullmq";
import { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { correoYaEnviado, enviarCorreoConfirmacion } from "../../mock-correo";
import { TAREAS } from "../cola";

export async function tareaEnviarCorreo(container: MedusaContainer, orderId: string, job: Job) {
  const tarea = TAREAS.ENVIAR_CORREO;
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  // Idempotencia por existencia de archivo -- no hace falta la marca en
  // Redis de las otras tareas, el propio archivo destino ya es la prueba.
  if (await correoYaEnviado(orderId)) {
    await job.log("Ya se había escrito el correo de esta orden antes -- se omite.");
    logger.info(`[post-pago:${tarea}] orden ${orderId}: correo ya enviado antes, se omite.`);
    return;
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  // "items.*" a propósito -- ver el comentario en registrar-venta-bind.ts.
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "email", "currency_code", "total", "items.*"],
    filters: { id: orderId },
  });
  const order = orders[0] as any;
  if (!order) {
    throw new Error(`No se encontró la orden ${orderId}`);
  }

  await job.log(`Escribiendo correo de confirmación para ${order.email}.`);

  const archivo = await enviarCorreoConfirmacion({
    orderId,
    displayId: order.display_id,
    para: order.email,
    total: `${Number(order.total).toFixed(2)} ${order.currency_code?.toUpperCase()}`,
    items: (order.items || []).map((i: any) => ({ titulo: i.title, cantidad: i.quantity })),
  });

  await job.log(`Correo escrito en ${archivo}.`);
  logger.info(`[post-pago:${tarea}] orden ${orderId}: correo de confirmación escrito en ${archivo}.`);
}
