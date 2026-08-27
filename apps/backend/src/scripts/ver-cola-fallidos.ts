// Muestra la "cola de fallidos visible" que pide el negocio: las tareas
// post-pago que agotaron sus 3 reintentos (30s/2min/10min) y se quedaron en
// estado "failed" de BullMQ, con el error COMPLETO.
//
// Uso:
//   npx medusa exec ./src/scripts/ver-cola-fallidos.ts
import { obtenerCola } from "../lib/cola-post-pago/cola";

export default async function verColaFallidos() {
  const cola = obtenerCola();
  const fallidos = await cola.getFailed(0, 100);

  if (fallidos.length === 0) {
    console.log("No hay tareas en la cola de fallidos ahora mismo.");
    await cola.close();
    return;
  }

  console.log(`${fallidos.length} tarea(s) en la cola de fallidos:\n`);
  for (const job of fallidos) {
    console.log("─".repeat(70));
    console.log(`Tarea:          ${job.name}`);
    console.log(`Orden:          ${(job.data as any)?.orderId}`);
    console.log(`Job id:         ${job.id}`);
    console.log(`Intentos hechos: ${job.attemptsMade}`);
    console.log(`Falló en:       ${job.finishedOn ? new Date(job.finishedOn).toISOString() : "?"}`);
    console.log(`Error completo:\n${job.stacktrace?.join("\n") || job.failedReason}`);
    const logs = await cola.getJobLogs(job.id!);
    if (logs.logs.length > 0) {
      console.log(`Bitácora de intentos:`);
      logs.logs.forEach((linea) => console.log(`  ${linea}`));
    }
  }
  console.log("─".repeat(70));

  await cola.close();
}
