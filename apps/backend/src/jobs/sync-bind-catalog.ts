// Job programado: sincroniza el catálogo desde Bind ERP automáticamente.
// Solo se registra/ejecuta en un proceso con WORKER_MODE=worker o "shared"
// -- por eso el contenedor "backend" (WORKER_MODE=server) no la corre, y
// evitamos que la sincronización se dispare dos veces si algún día
// escalamos el backend a varias réplicas.
import { MedusaContainer } from "@medusajs/framework/types";
import { syncBindCatalog } from "../lib/bind-sync/sync-catalog";

export default async function syncBindCatalogJob(container: MedusaContainer) {
  await syncBindCatalog(container, { trigger: "scheduled" });
}

export const config = {
  name: "sync-bind-catalog",
  // Cron de 5 campos, configurable por variable de entorno. Por defecto,
  // cada 15 minutos.
  schedule: process.env.BIND_SYNC_CRON || "*/15 * * * *",
};
