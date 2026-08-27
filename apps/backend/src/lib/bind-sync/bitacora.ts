// Bitácora de las últimas sincronizaciones con Bind ERP (Fase 6, para el
// panel de operación). syncBindCatalog ya registra cada corrida en los logs
// del contenedor worker -- esto además la GUARDA en Redis (una lista
// acotada a las últimas 20) para que el panel de admin pueda mostrarla sin
// tener que ir a buscar en `docker compose logs`, que no es algo que el
// equipo de operación normalmente tiene a la mano.
import IORedis from "ioredis";
import { ResumenSync } from "./sync-catalog";

const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";
const CLAVE = "bind-sync:bitacora";
const MAX_ENTRADAS = 20;

let redis: IORedis | null = null;
function conexion() {
  if (!redis) redis = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
  return redis;
}

export async function registrarEnBitacora(resumen: ResumenSync) {
  const r = conexion();
  await r.lpush(CLAVE, JSON.stringify(resumen));
  await r.ltrim(CLAVE, 0, MAX_ENTRADAS - 1);
}

export async function obtenerBitacora(): Promise<ResumenSync[]> {
  const r = conexion();
  const entradas = await r.lrange(CLAVE, 0, MAX_ENTRADAS - 1);
  return entradas.map((e) => JSON.parse(e) as ResumenSync);
}
