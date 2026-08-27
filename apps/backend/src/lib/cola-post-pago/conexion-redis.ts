// Conexión de Redis compartida por BullMQ (la cola en sí) y por nuestras
// propias operaciones atómicas de idempotencia/candado (ver idempotencia.ts).
//
// Por qué NO reusamos el cliente de Redis que ya usa Medusa internamente
// (cache-redis/event-bus-redis/workflow-engine-redis en medusa-config.ts):
// esos son clientes PRIVADOS de cada módulo, el framework no los expone
// para uso general. BullMQ, además, exige su propia configuración de
// conexión (en particular `maxRetriesPerRequest: null`, requisito documentado
// de BullMQ para las conexiones que hacen operaciones bloqueantes tipo
// BRPOPLPUSH; sin esto, ioredis agota sus reintentos internos y BullMQ
// pierde la conexión de "escucha" de la cola).
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";

export function crearConexionRedis() {
  return new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
  });
}
