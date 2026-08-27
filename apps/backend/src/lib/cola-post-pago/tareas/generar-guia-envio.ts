// Tarea 3 de 4: pedirle a Skydropx la guía de envío. Antes (Fase 4) esto
// solo pasaba si alguien del equipo entraba al admin y le daba "Crear
// cumplimiento" a mano; ahora se dispara solo en cuanto el pago se aprueba.
//
// CASO especial (no es un error): si la orden usó la opción de respaldo
// "Envío por cotizar" (porque algún producto no tenía peso/dimensiones,
// Fase 4), no hay rate_id de Skydropx -- no hay nada que pedirle a
// Skydropx todavía, porque el envío se tiene que cotizar A MANO primero.
// Esta tarea lo detecta y termina bien (no es una falla), dejando la
// bandera requiere_revision_manual (ya puesta por el subscriber de Fase 4)
// como la señal de que alguien tiene que actuar.
import type { Job } from "bullmq";
import { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { crearEnvio } from "../../../modules/skydropx-fulfillment/skydropx-client";
import { yaSeCompleto, marcarCompletado } from "../idempotencia";
import { guardarResultadoEnOrden } from "../resultado-en-orden";
import { TAREAS } from "../cola";

export async function tareaGenerarGuiaEnvio(container: MedusaContainer, orderId: string, job: Job) {
  const tarea = TAREAS.GENERAR_GUIA_ENVIO;
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  const yaHecho = await yaSeCompleto<{ numero_guia?: string; sin_guia_automatica?: boolean }>(orderId, tarea);
  if (yaHecho) {
    await job.log(
      yaHecho.numero_guia
        ? `Ya se había generado la guía antes (${yaHecho.numero_guia}) -- se omite, no se genera una segunda.`
        : `Ya se había determinado antes que esta orden requiere guía manual -- se omite.`
    );
    logger.info(`[post-pago:${tarea}] orden ${orderId}: ya completada antes, se omite.`);
    return;
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "shipping_methods.name", "shipping_methods.data"],
    filters: { id: orderId },
  });
  const order = orders[0] as any;
  if (!order) {
    throw new Error(`No se encontró la orden ${orderId}`);
  }

  const shippingMethod = (order.shipping_methods || [])[0];
  const rateId = shippingMethod?.data?.skydropx_rate_id as string | undefined;

  if (!rateId) {
    await job.log(`La orden usó "${shippingMethod?.name ?? "envío desconocido"}" -- sin rate_id de Skydropx, requiere cotización/guía manual. No es un error.`);
    await marcarCompletado(orderId, tarea, { sin_guia_automatica: true });
    logger.info(`[post-pago:${tarea}] orden ${orderId}: sin guía automática (envío por cotizar), completada sin llamar a Skydropx.`);
    return;
  }

  await job.log(`Solicitando guía a Skydropx para rate_id ${rateId}.`);
  logger.info(`[post-pago:${tarea}] orden ${orderId}: solicitando guía a Skydropx...`);

  const envio = await crearEnvio(rateId, `${orderId}:${tarea}`);

  await job.log(`Skydropx respondió: guía ${envio.numero_guia}.`);
  await marcarCompletado(orderId, tarea, { numero_guia: envio.numero_guia });
  await guardarResultadoEnOrden(container, orderId, {
    guia_envio_numero: envio.numero_guia,
    guia_envio_rastreo: envio.url_rastreo,
  });

  logger.info(`[post-pago:${tarea}] orden ${orderId}: guía generada, ${envio.numero_guia}.`);
}
