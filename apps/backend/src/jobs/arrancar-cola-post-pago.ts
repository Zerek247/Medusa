// Arranca el consumidor de la cola post-pago (BullMQ) -- ver
// src/lib/cola-post-pago/procesador.ts.
//
// Por qué esto es un "scheduled job" y no el loader de un módulo custom
// (que sería lo más directo -- así se intentó primero): un loader de
// módulo recibe el contenedor de dependencias AISLADO de ESE módulo, no el
// contenedor completo de la aplicación. `query` (usado por CADA tarea para
// leer la orden) no existe todavía en ese contenedor aislado -- se
// registra hasta que TODOS los módulos terminan de cargar. El resultado
// era "Could not resolve 'query'" en cuanto la primera tarea intentaba
// correr. Un scheduled job, en cambio, recibe el MISMO contenedor completo
// que ya usan los subscribers (sync-bind-catalog.ts, envio-manual.ts) --
// por eso lo reusamos aquí, aunque esto no sea periódico de verdad.
//
// numberOfExecutions:1 hace que Medusa lo corra una sola vez por arranque
// del proceso (el contador se reinicia si el proceso se reinicia -- que es
// justo lo que queremos: "arranca el consumidor una vez por vida del
// proceso worker"). El primer disparo puede tardar hasta 60s desde que el
// contenedor arranca (el cron dispara en el siguiente minuto en punto) --
// un costo de arranque único, no una demora por tarea.
//
// Medusa mismo restringe los scheduled jobs a WORKER_MODE=worker/shared
// (igual que sync-bind-catalog.ts) -- no hace falta repetir aquí el filtro
// manual que sí necesitaba el loader descartado.
import { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { iniciarProcesadorPostPago } from "../lib/cola-post-pago/procesador";

export default async function arrancarColaPostPagoJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  iniciarProcesadorPostPago(container);
  logger.info("[post-pago] Consumidor de la cola post-pago arrancado.");
}

export const config = {
  name: "arrancar-cola-post-pago",
  schedule: "* * * * *",
  numberOfExecutions: 1,
};
