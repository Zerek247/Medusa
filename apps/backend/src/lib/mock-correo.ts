// Mock de un proveedor de correo (Resend, SendGrid, SES, etc.): en vez de
// mandar un correo de verdad, escribe uno "de mentiras" a un archivo de
// texto -- mismo espíritu que los demás mocks (mismo contrato de "qué
// información lleva un correo de confirmación"), sin necesitar credenciales
// de ningún proveedor real ni arriesgarnos a mandarle correos de prueba a
// una dirección real por accidente.
//
// No es un servicio HTTP aparte como mock-bind/mock-skydropx/mock-cfdi
// porque no hay ningún "contrato de red" real que simular -- un proveedor
// de correo real se integra con su SDK/API, no con una llamada que Medusa
// tenga que orquestar en varios pasos. Aquí basta una función.
import fs from "node:fs/promises";
import path from "node:path";

// OJO: DENTRO de .medusa/, no como carpeta hermana de src/. `medusa develop`
// vigila TODO el árbol del proyecto (no solo src/) y reinicia el servidor
// completo ante cualquier archivo nuevo -- incluida una carpeta de "correos"
// que nosotros mismos escribimos. Eso tumbaba a la mitad cualquier tarea
// que estuviera corriendo justo cuando se "enviaba" un correo (el proceso
// entero se reiniciaba con "Gracefully shutting down server"). .medusa/ es
// una carpeta que Medusa YA excluye de su watcher (la usa para su propio
// build interno), así que escribir ahí evita el reinicio en bucle.
const CARPETA_CORREOS = path.join(process.cwd(), ".medusa", "correos-enviados");

export interface CorreoConfirmacion {
  orderId: string;
  displayId: number | string;
  para: string;
  total: string;
  items: Array<{ titulo: string; cantidad: number }>;
}

/**
 * Devuelve true si ya se había "enviado" (escrito) el correo de esta orden
 * -- la existencia del archivo ES la idempotencia, no hace falta nada más.
 */
export async function correoYaEnviado(orderId: string): Promise<boolean> {
  try {
    await fs.access(path.join(CARPETA_CORREOS, `${orderId}.txt`));
    return true;
  } catch {
    return false;
  }
}

export async function enviarCorreoConfirmacion(correo: CorreoConfirmacion): Promise<string> {
  await fs.mkdir(CARPETA_CORREOS, { recursive: true });
  const archivo = path.join(CARPETA_CORREOS, `${correo.orderId}.txt`);

  const cuerpo = [
    `Para: ${correo.para}`,
    `Asunto: Confirmación de tu pedido #${correo.displayId}`,
    `Fecha: ${new Date().toISOString()}`,
    "",
    `¡Gracias por tu compra! Este es un resumen de tu pedido #${correo.displayId}:`,
    "",
    ...correo.items.map((i) => `  - ${i.cantidad} x ${i.titulo}`),
    "",
    `Total: ${correo.total}`,
    "",
    "(Este correo es un archivo de prueba -- Fase 5 usa un mock de correo que",
    " escribe a disco en vez de enviar de verdad. Ver src/lib/mock-correo.ts.)",
  ].join("\n");

  await fs.writeFile(archivo, cuerpo, "utf-8");
  return archivo;
}
