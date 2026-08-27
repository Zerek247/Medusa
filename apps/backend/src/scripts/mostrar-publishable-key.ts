// Utilidad para consultar la publishable API key que el seed inicial ya
// creó (no hace falta generar una nueva) -- la necesita el storefront para
// poder llamar a la Store API.
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function mostrarPublishableKey({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: keys } = await query.graph({
    entity: "api_key",
    fields: ["token", "title"],
    filters: { type: "publishable" },
  });

  if (keys.length === 0) {
    logger.warn("No hay ninguna publishable API key todavía. Corre las migraciones (npx medusa db:migrate) primero.");
    return;
  }

  for (const key of keys) {
    logger.info(`${key.title}: ${key.token}`);
  }
}
