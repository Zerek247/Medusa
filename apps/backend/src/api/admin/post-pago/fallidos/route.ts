// GET /admin/post-pago/fallidos -- lista las tareas de la cola post-pago
// (Fase 5) que agotaron sus reintentos, para el panel de operación (Fase 6).
// Mismo dato que ya mostraba el script ver-cola-fallidos.ts, aquí expuesto
// como API para que el admin lo pinte en una tabla en vez de una consola.
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { obtenerCola } from "../../../../lib/cola-post-pago/cola";

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const cola = obtenerCola();
  const fallidos = await cola.getFailed(0, 100);

  const tareas = await Promise.all(
    fallidos.map(async (job) => {
      const logs = await cola.getJobLogs(job.id!);
      return {
        job_id: job.id,
        tarea: job.name,
        order_id: (job.data as any)?.orderId,
        intentos_hechos: job.attemptsMade,
        fallo_en: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
        error: job.failedReason,
        error_completo: job.stacktrace?.join("\n") || job.failedReason,
        bitacora: logs.logs,
      };
    })
  );

  res.json({ tareas, count: tareas.length });
}
