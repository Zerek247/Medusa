// Cambia la contraseña de un usuario admin (proveedor "emailpass").
//
// Lo usa scripts/demo-tunel.ps1 -ConPanel: mientras el panel está publicado por
// el túnel de la demo, la contraseña "de pruebas" del admin local
// (admin@local.test) se cambia por una aleatoria, y al terminar se restaura.
// Sin eso, cualquiera que llegara al enlace del panel podría probar la
// contraseña de pruebas del README.
//
// Uso (las dos variables son obligatorias):
//   ADMIN_EMAIL=admin@local.test NUEVA_CLAVE=... npx medusa exec ./src/scripts/admin-clave.ts
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function adminClave({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const email = process.env.ADMIN_EMAIL;
  const clave = process.env.NUEVA_CLAVE;
  if (!email || !clave) {
    throw new Error("Faltan las variables ADMIN_EMAIL y NUEVA_CLAVE.");
  }

  const auth = container.resolve(Modules.AUTH);
  const resultado: any = await auth.updateProvider("emailpass", { entity_id: email, password: clave });
  if (resultado && resultado.success === false) {
    throw new Error(`No se pudo cambiar la contraseña de ${email}: ${resultado.error || "error desconocido"}`);
  }
  // No se imprime la contraseña, solo el resultado.
  logger.info(`[admin-clave] Contraseña de ${email} actualizada.`);
  console.log("ADMIN_CLAVE_OK");
}
