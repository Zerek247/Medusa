import "server-only"
import { cache } from "react"
import { getAuthHeaders } from "./cookies"

/**
 * ¿Hay un cliente con sesión iniciada? Solo mira la cookie del token (sin
 * llamar al backend), así que es barato y se puede usar en cada tarjeta de
 * producto. `cache` evita repetir la lectura dentro de una misma petición.
 *
 * Sirve para decidir si se muestran precios: los visitantes sin cuenta no
 * ven precios; con sesión, Medusa devuelve el precio que le corresponde al
 * grupo del cliente (estándar o especial).
 */
export const haySesion = cache(async (): Promise<boolean> => {
  const headers = await getAuthHeaders()
  return "authorization" in headers
})
