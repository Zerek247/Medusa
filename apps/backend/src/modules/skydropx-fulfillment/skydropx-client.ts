// Cliente HTTP hacia el mock de Skydropx. Mismo patrón que
// src/lib/bind-sync/bind-client.ts: aislado en su propio archivo para que
// cambiar la URL/autenticación real de Skydropx el día de mañana no toque
// la lógica del proveedor de envíos.
const SKYDROPX_BASE_URL = process.env.SKYDROPX_BASE_URL || "http://mock-skydropx:4002";
const SKYDROPX_API_TOKEN = process.env.SKYDROPX_API_TOKEN || "skydropx-mock-token-local";

export interface TarifaSkydropx {
  rate_id: string;
  carrier: string;
  servicio: string;
  precio: number;
  moneda: string;
  dias_entrega: number;
}

async function pedir(path: string, init?: RequestInit) {
  const respuesta = await fetch(`${SKYDROPX_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${SKYDROPX_API_TOKEN}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!respuesta.ok) {
    throw new Error(`Skydropx respondió ${respuesta.status}: ${await respuesta.text()}`);
  }
  return respuesta.json();
}

export async function cotizar(params: {
  cpOrigen: string;
  cpDestino: string;
  pesoKg: number;
  largoCm: number;
  anchoCm: number;
  altoCm: number;
}): Promise<{ quotation_id: string; tarifas: TarifaSkydropx[] }> {
  return pedir("/api/v1/quotations", {
    method: "POST",
    body: JSON.stringify({
      origen: { cp: params.cpOrigen },
      destino: { cp: params.cpDestino },
      peso_kg: params.pesoKg,
      largo_cm: params.largoCm,
      ancho_cm: params.anchoCm,
      alto_cm: params.altoCm,
    }),
  });
}

export async function crearEnvio(
  rateId: string,
  claveIdempotencia?: string
): Promise<{
  numero_guia: string;
  url_rastreo: string;
  url_etiqueta: string;
}> {
  return pedir("/api/v1/shipments", {
    method: "POST",
    body: JSON.stringify({ rate_id: rateId, clave_idempotencia: claveIdempotencia }),
  });
}
