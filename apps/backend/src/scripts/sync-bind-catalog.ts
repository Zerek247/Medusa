// Disparo manual de la sincronización con Bind ERP. Corre exactamente la
// misma lógica que el job programado (src/jobs/sync-bind-catalog.ts) --
// nunca se duplica el código de sync entre los dos puntos de entrada.
//
// Uso:
//   docker compose exec worker sh -c "cd apps/backend && npx medusa exec ./src/scripts/sync-bind-catalog.ts"
import { ExecArgs } from "@medusajs/framework/types";
import { syncBindCatalog } from "../lib/bind-sync/sync-catalog";

export default async function syncBindCatalogScript({ container }: ExecArgs) {
  const resumen = await syncBindCatalog(container, { trigger: "manual" });
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(resumen, null, 2));
}
