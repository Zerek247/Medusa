// El PRODUCTOR de la cola post-pago (Fase 5): en cuanto Medusa termina de
// colocar una orden -- lo que pasa automáticamente en cuanto el webhook de
// Stripe confirma el pago y el motor de pagos completa el carrito -- este
// subscriber encola las cuatro tareas y ya. No llama a Bind, no timbra, no
// pide guía, no manda correo: eso es EXACTAMENTE lo que pide el negocio
// ("Medusa NO debe ejecutar los procesos posteriores en línea").
//
// Por qué "order.placed" y no reaccionar directamente al webhook de Stripe:
// el webhook de pago solo AUTORIZA/CAPTURA el pago -- es Medusa quien,
// internamente, decide cuándo eso implica "completar el carrito y crear la
// orden" (puede haber otros pasos, otras formas de pago, o un pago que se
// autoriza pero la orden se completa después). "order.placed" es el punto
// único donde sabemos con certeza que la orden YA EXISTE y ya tiene todo lo
// que las cuatro tareas necesitan leer (items, direcciones, método de
// envío elegido). Mismo patrón que ya usa envio-manual.ts (Fase 4).
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { encolarTareasPostPago } from "../lib/cola-post-pago/cola";

export default async function encolarPostPagoHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  // Espera corta antes de encolar (Fase 6): se observó que order.metadata
  // -- en particular datos_fiscales, copiado desde cart.metadata al
  // completar el carrito -- a veces todavía no es visible en la primera
  // lectura que hace una tarea justo después de este evento (una carrera
  // de visibilidad entre el commit de esa copia y el propio evento
  // order.placed, no un error de nuestro código). Encolar es barato;
  // preferimos perder medio segundo aquí a que timbrar_cfdi tenga que
  // caer al RFC genérico por una carrera evitable.
  await new Promise((resolve) => setTimeout(resolve, 500));

  const tareas = await encolarTareasPostPago(data.id);

  logger.info(
    `[post-pago] Orden ${data.id}: encoladas ${tareas.length} tareas (${tareas.join(", ")}). ` +
      `La orden ya quedó creada y confirmada -- estas tareas se procesan aparte, en el worker.`
  );
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
