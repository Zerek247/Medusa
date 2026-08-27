// Dos mecanismos de idempotencia/concurrencia distintos, para dos problemas
// distintos:
//
// 1) "¿Ya completé esta tarea antes?" (marcarCompletado/yaSeCompleto): un
//    atajo en Redis para que un reintento NI SIQUIERA llame al servicio
//    externo si ya sabemos que la tarea terminó bien. La protección REAL
//    contra duplicar la venta/factura/guía vive del lado del mock (cada uno
//    acepta una "clave_idempotencia" y devuelve el mismo resultado si la ve
//    dos veces -- ver mock-bind/mock-cfdi/mock-skydropx) porque esa
//    protección sobrevive aunque el proceso de Medusa truene justo después
//    de la llamada externa y antes de guardar este atajo. Este atajo es una
//    optimización, no la garantía de fondo.
//
// 2) candadoOrden: un candado distribuido corto para la sección crítica de
//    "leer order.metadata, mezclar mi resultado, escribir de vuelta". Las
//    cuatro tareas de una misma orden corren EN PARALELO (son
//    independientes a propósito) y sin esto, dos tareas que terminan casi
//    al mismo tiempo pueden pisarse: ambas leen el mismo metadata viejo,
//    cada una escribe su versión mezclada, y la que escribe segundo borra
//    silenciosamente lo que escribió la primera ("lost update"). Medusa no
//    ofrece un update parcial/atómico de metadata (updateOrders reemplaza
//    el campo completo), así que el candado es nuestro.
import { crearConexionRedis } from "./conexion-redis";

const redis = crearConexionRedis();

const TTL_COMPLETADO_SEGUNDOS = 7 * 24 * 60 * 60; // 7 días: suficiente para inspeccionar, no eterno.

function clavesCompletado(orderId: string, tarea: string) {
  return `post-pago:hecho:${orderId}:${tarea}`;
}

export async function yaSeCompleto<T = unknown>(orderId: string, tarea: string): Promise<T | null> {
  const valor = await redis.get(clavesCompletado(orderId, tarea));
  return valor ? (JSON.parse(valor) as T) : null;
}

export async function marcarCompletado(orderId: string, tarea: string, resultado: unknown) {
  await redis.set(
    clavesCompletado(orderId, tarea),
    JSON.stringify(resultado),
    "EX",
    TTL_COMPLETADO_SEGUNDOS
  );
}

/**
 * Ejecuta `fn` con un candado corto sobre la orden (SET NX + expiración,
 * con reintento simple si alguien más lo tiene). Úsalo alrededor de
 * cualquier lectura-modificación-escritura de order.metadata.
 */
export async function conCandadoDeOrden<T>(orderId: string, fn: () => Promise<T>): Promise<T> {
  const clave = `post-pago:candado:${orderId}`;
  const valorPropio = `${process.pid}-${Date.now()}-${Math.random()}`;
  const MAX_INTENTOS = 20;
  const ESPERA_ENTRE_INTENTOS_MS = 150;

  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    // PX 5000: 5s de vida máxima -- si el proceso muriera con el candado
    // tomado, se libera solo en vez de bloquear la orden para siempre.
    const obtenido = await redis.set(clave, valorPropio, "PX", 5000, "NX");
    if (obtenido === "OK") {
      try {
        return await fn();
      } finally {
        // Solo borramos el candado si sigue siendo el nuestro (pudo haber
        // expirado y ser tomado por alguien más mientras `fn` corría).
        const actual = await redis.get(clave);
        if (actual === valorPropio) {
          await redis.del(clave);
        }
      }
    }
    await new Promise((resolve) => setTimeout(resolve, ESPERA_ENTRE_INTENTOS_MS));
  }
  throw new Error(`No se pudo obtener el candado de la orden ${orderId} tras ${MAX_INTENTOS} intentos`);
}
