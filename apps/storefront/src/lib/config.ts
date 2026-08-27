import { getLocaleHeader } from "@lib/util/get-locale-header"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

// Defaults to standard port for Medusa server
let MEDUSA_BACKEND_URL = "http://localhost:9000"

// Dentro de Docker, el navegador y el propio contenedor del storefront
// necesitan URLs DISTINTAS para llegar al backend: el navegador (fuera de
// Docker) solo conoce "localhost:9000" (el puerto publicado), mientras que
// el contenedor del storefront (donde corre el renderizado en servidor de
// Next.js) tiene que usar el nombre de servicio de Docker Compose,
// "backend:9000" -- "localhost" ahí apuntaría al propio contenedor del
// storefront, no al backend. MEDUSA_BACKEND_URL_INTERNAL (sin el prefijo
// NEXT_PUBLIC_, así que nunca se filtra al bundle del navegador) resuelve
// esto: se usa solo cuando el código corre en el servidor.
if (typeof window === "undefined" && process.env.MEDUSA_BACKEND_URL_INTERNAL) {
  MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL_INTERNAL
} else if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
}

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const headers = init?.headers ?? {}
  let localeHeader: Record<string, string | null> | undefined
  try {
    localeHeader = await getLocaleHeader()
    headers["x-medusa-locale"] ??= localeHeader["x-medusa-locale"]
  } catch {}

  const newHeaders = {
    ...localeHeader,
    ...headers,
  }
  init = {
    ...init,
    headers: newHeaders,
  }
  return originalFetch(input, init)
}
