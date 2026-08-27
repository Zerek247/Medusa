// GET /admin/bind-sync/bitacora -- las últimas sincronizaciones con Bind
// ERP (Fase 6, panel de operación). Ver src/lib/bind-sync/bitacora.ts.
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { obtenerBitacora } from "../../../../lib/bind-sync/bitacora";

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const corridas = await obtenerBitacora();
  res.json({ corridas });
}
