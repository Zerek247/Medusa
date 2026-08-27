"use server"

// Rastreo de pedido (Fase 6) -- consume el endpoint público
// GET /store/rastreo?numero=&email= (ver apps/backend/src/api/store/rastreo/route.ts).
// Server action (no cliente directo) para no tener que exponer/duplicar la
// URL base del backend ni la publishable key en el bundle del navegador --
// el sdk ya sabe resolverlas del lado del servidor (ver lib/config.ts).
import { sdk } from "@lib/config"

export type ResultadoRastreo = {
  numero: number
  fecha: string
  estatus: string
  metodo_envio: string | null
  guia: { numero: string; url_rastreo: string } | null
  articulos: Array<{ titulo: string; cantidad: number }>
}

export async function rastrearPedido(
  _currentState: unknown,
  formData: FormData
): Promise<{ resultado: ResultadoRastreo | null; error: string | null }> {
  const numero = (formData.get("numero") as string | null)?.trim()
  const email = (formData.get("email") as string | null)?.trim()

  if (!numero || !email) {
    return { resultado: null, error: "Captura el número de pedido y el correo con el que compraste." }
  }

  try {
    const respuesta = await sdk.client.fetch<{ pedido: ResultadoRastreo }>("/store/rastreo", {
      method: "GET",
      query: { numero, email },
    })
    return { resultado: respuesta.pedido, error: null }
  } catch (error: any) {
    return {
      resultado: null,
      error: "No encontramos un pedido con ese número y correo. Verifica ambos datos.",
    }
  }
}
