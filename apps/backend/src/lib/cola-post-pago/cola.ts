// La cola de BullMQ que le da su nombre a Fase 5: cuando el pago se aprueba,
// Medusa NO ejecuta Bind/CFDI/Skydropx/correo en línea (dentro de la misma
// petición HTTP del webhook) -- solo encola cuatro trabajos independientes
// en Redis y responde de inmediato. Un proceso aparte (el worker, ver
// loader.ts) los va sacando de la cola y procesando por su cuenta, con sus
// propios reintentos. Esto es lo que hace posible que la confirmación de
// pago tarde "dos segundos" (crear la orden) en vez de "lo que tarden Bind +
// el PAC + Skydropx + el correo, todos en serie, dentro de la misma
// petición" -- que en un ERP real lento podría ser varios segundos o fallar
// del todo y tumbar la confirmación de una compra que SÍ se cobró.
import { Queue } from "bullmq";
import { crearConexionRedis } from "./conexion-redis";

export const NOMBRE_COLA = "post-pago";

export const TAREAS = {
  REGISTRAR_VENTA_BIND: "registrar_venta_en_bind",
  TIMBRAR_CFDI: "timbrar_cfdi",
  GENERAR_GUIA_ENVIO: "generar_guia_envio",
  ENVIAR_CORREO: "enviar_correo",
} as const;

export type NombreTarea = (typeof TAREAS)[keyof typeof TAREAS];

// 30s, 2min, 10min -- exactamente los tres reintentos que pidió el negocio.
// Configurable por si algún día se quiere ajustar sin tocar código; el
// default es el spec tal cual.
const BACKOFF_MS = (process.env.POST_PAGO_BACKOFF_MS || "30000,120000,600000")
  .split(",")
  .map((s) => parseInt(s.trim(), 10));

// 1 intento inicial + un reintento por cada delay de BACKOFF_MS.
export const INTENTOS_MAXIMOS = BACKOFF_MS.length + 1;

export function backoffPersonalizado(attemptsMade: number): number {
  // attemptsMade=1 -> ya falló el intento inicial, este es el delay ANTES
  // del primer reintento (BACKOFF_MS[0] = 30s), y así sucesivamente.
  return BACKOFF_MS[attemptsMade - 1] ?? -1; // -1 = ya no reintentar (BullMQ lo mueve a "failed").
}

let colaSingleton: Queue | null = null;

export function obtenerCola(): Queue {
  if (!colaSingleton) {
    colaSingleton = new Queue(NOMBRE_COLA, {
      connection: crearConexionRedis(),
      defaultJobOptions: {
        attempts: INTENTOS_MAXIMOS,
        backoff: { type: "custom" },
        // Los trabajos completados no necesitan conservarse indefinidamente
        // (ya quedaron reflejados en la orden); los FALLIDOS sí -- son
        // justo la "cola de fallidos visible" que pide el negocio, y
        // borrarlos automáticamente la dejaría vacía.
        removeOnComplete: { count: 200 },
        removeOnFail: false,
      },
    });
  }
  return colaSingleton;
}

/**
 * Encola las cuatro tareas post-pago para una orden recién colocada.
 *
 * jobId = `${orderId}:${tarea}` a propósito: si por lo que sea este
 * subscriber llegara a correr dos veces para la MISMA orden (Redis
 * Streams garantiza "al menos una vez", no "exactamente una vez"), BullMQ
 * ve que ya existe un job con ese id y no lo duplica -- una capa más de
 * idempotencia, esta vez a nivel "no metas el mismo trabajo dos veces a la
 * cola", antes incluso de que un worker lo tome.
 */
export async function encolarTareasPostPago(orderId: string) {
  const cola = obtenerCola();
  const tareas = Object.values(TAREAS);
  await Promise.all(
    tareas.map((tarea) =>
      cola.add(
        tarea,
        { orderId },
        // OJO: BullMQ NO permite ":" en un jobId custom (Job.validateOptions
        // truena con "Custom Id cannot contain :") -- por eso "__" aquí, a
        // diferencia de las claves de idempotencia hacia los mocks
        // (orderId:tarea, con ":"), que sí lo aceptan sin problema porque
        // ahí es solo la llave de un Map de JavaScript, no un jobId de
        // BullMQ.
        { jobId: `${orderId}__${tarea}` }
      )
    )
  );
  return tareas;
}
