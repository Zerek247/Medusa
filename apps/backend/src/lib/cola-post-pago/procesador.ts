// El worker de BullMQ que realmente CONSUME la cola "post-pago" -- lo que
// arranca esto es el scheduled job src/jobs/arrancar-cola-post-pago.ts, una
// sola vez por arranque del proceso, solo en el contenedor worker. Ver el
// comentario grande en ese archivo sobre por qué se arranca así (con un
// scheduled job) y no con un loader de módulo custom.
import { Worker, Job } from "bullmq";
import { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { crearConexionRedis } from "./conexion-redis";
import { NOMBRE_COLA, INTENTOS_MAXIMOS, backoffPersonalizado } from "./cola";
import { MANEJADORES } from "./tareas";

// Concurrencia = 1 A PROPÓSITO, no por limitación técnica de BullMQ.
//
// Las cuatro tareas de una orden son independientes entre sí (ninguna
// depende del resultado de otra) pero SÍ comparten un recurso: la misma
// fila de order.metadata. guardarResultadoEnOrden ya usa un candado
// (idempotencia.ts) para que dos tareas no se pisen si llegaran a correr
// en paralelo -- pero ese candado hace que, con concurrencia > 1, una tarea
// simplemente se quede esperando el candado de la otra en vez de avanzar
// de verdad en paralelo. Para un prototipo local, es más simple (y más
// fácil de leer en los logs, que es justo lo que pide la verificación de
// esta fase) procesarlas una a la vez: siguen siendo tareas separadas, con
// su propio reintento/bitácora/cola de fallidos cada una, solo que el
// worker las atiende en fila en vez de a la vez. En producción, con
// volumen real, la forma correcta de habilitar concurrencia de verdad
// sería mover cada resultado a su propia fila/tabla en vez de compartir
// order.metadata.
const CONCURRENCIA = Number(process.env.POST_PAGO_CONCURRENCIA || 1);

let workerSingleton: Worker | null = null;

export function iniciarProcesadorPostPago(container: MedusaContainer): Worker {
  if (workerSingleton) return workerSingleton;

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  const worker = new Worker(
    NOMBRE_COLA,
    async (job: Job) => {
      const { orderId } = job.data as { orderId: string };
      const intento = job.attemptsMade + 1;

      await job.log(`Intento ${intento}/${INTENTOS_MAXIMOS} de "${job.name}" para la orden ${orderId}.`);
      logger.info(`[post-pago] Intento ${intento}/${INTENTOS_MAXIMOS} de "${job.name}" (orden ${orderId}, job ${job.id})`);

      const manejador = MANEJADORES[job.name as keyof typeof MANEJADORES];
      if (!manejador) {
        throw new Error(`No hay manejador registrado para la tarea "${job.name}"`);
      }

      try {
        await manejador(container, orderId, job);
      } catch (error) {
        const mensaje = (error as Error).message;
        await job.log(`FALLÓ el intento ${intento}/${INTENTOS_MAXIMOS}: ${mensaje}`);
        logger.warn(`[post-pago] "${job.name}" (orden ${orderId}) falló en el intento ${intento}/${INTENTOS_MAXIMOS}: ${mensaje}`);
        throw error; // BullMQ decide reintentar (backoffPersonalizado) o mover a "failed" según INTENTOS_MAXIMOS.
      }
    },
    {
      connection: crearConexionRedis(),
      concurrency: CONCURRENCIA,
      settings: {
        backoffStrategy: backoffPersonalizado,
      },
    }
  );

  worker.on("completed", (job) => {
    logger.info(`[post-pago] "${job.name}" completada (orden ${(job.data as any)?.orderId}, job ${job.id}).`);
  });

  worker.on("failed", (job, error) => {
    if (!job) return;
    const agotoReintentos = job.attemptsMade >= INTENTOS_MAXIMOS;
    if (agotoReintentos) {
      // Esto es "la cola de fallidos": BullMQ deja el job en estado
      // "failed" (no lo borra -- removeOnFail:false en cola.ts) con el
      // error COMPLETO adjunto. Se puede listar con
      // `npx medusa exec ./src/scripts/ver-cola-fallidos.ts`.
      logger.error(
        `[post-pago] "${job.name}" (orden ${(job.data as any)?.orderId}, job ${job.id}) AGOTÓ sus ${INTENTOS_MAXIMOS} intentos y quedó en la cola de fallidos. ` +
          `La orden NO se pierde ni se revierte -- solo esta tarea de fondo quedó pendiente de revisión manual. Error: ${error.message}`
      );
    } else {
      logger.warn(`[post-pago] "${job.name}" (orden ${(job.data as any)?.orderId}, job ${job.id}) falló, se reintentará: ${error.message}`);
    }
  });

  workerSingleton = worker;
  return worker;
}
