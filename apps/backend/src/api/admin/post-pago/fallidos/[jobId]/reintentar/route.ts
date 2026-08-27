// POST /admin/post-pago/fallidos/:jobId/reintentar -- botón "Reintentar"
// del panel de operación. resetAttemptsMade:true a propósito: si alguien
// del equipo le da a este botón es porque ya arregló lo que causaba la
// falla (por ejemplo, revivió a Bind ERP) -- tiene sentido que la tarea
// vuelva a tener sus 3 reintentos completos en vez de heredar los que ya
// había gastado antes de la corrección.
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { obtenerCola } from "../../../../../../lib/cola-post-pago/cola";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { jobId } = req.params;
  const cola = obtenerCola();

  const job = await cola.getJob(jobId);
  if (!job) {
    res.status(404).json({ error: `No existe la tarea ${jobId} (o ya se limpió de la cola).` });
    return;
  }

  await job.retry("failed", { resetAttemptsMade: true });
  res.json({ mensaje: `Tarea ${jobId} reencolada para reintento.` });
}
