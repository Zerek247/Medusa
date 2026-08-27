// Cliente HTTP hacia el mock del PAC de CFDI (apps/mock-cfdi). Mismo criterio
// que bind-client.ts/skydropx-client.ts: aislado en su propio archivo, un
// solo intento de red por llamada (los reintentos los maneja la cola de
// BullMQ, no este cliente -- ver el comentario en registrarVenta de
// bind-client.ts).
const CFDI_BASE_URL = process.env.CFDI_BASE_URL || "http://mock-cfdi:4003";
const CFDI_API_KEY = process.env.CFDI_API_KEY || "cfdi-mock-key-local";
// RFC del NEGOCIO (emisor). En un negocio real este es su RFC ante el SAT,
// ligado a su Certificado de Sello Digital -- aquí es un valor de prueba
// fijo porque este prototipo nunca timbra ante el SAT de verdad (ver el
// comentario al inicio de apps/mock-cfdi/src/index.js).
const CFDI_EMISOR_RFC = process.env.CFDI_EMISOR_RFC || "AAA010101AAA";
const CFDI_EMISOR_NOMBRE = process.env.CFDI_EMISOR_NOMBRE || "Negocio de Prueba SA de CV";

export interface ConceptoCfdi {
  descripcion: string;
  cantidad: number;
  valor_unitario: number;
}

export interface FacturaCfdi {
  uuid: string;
  folio_fiscal: string;
  fecha_timbrado: string;
  estatus: string;
  xml_base64: string;
}

/**
 * Timbra un CFDI para una orden. receptorRfc default = RFC genérico del SAT
 * para "público en general" (XAXX010101000) -- lo correcto cuando el
 * comprador no capturó su propio RFC/razón social en el checkout, que es el
 * único flujo que este storefront mínimo soporta por ahora.
 */
export async function timbrarCfdi(params: {
  ordenId: string;
  conceptos: ConceptoCfdi[];
  subtotal: number;
  iva: number;
  total: number;
  claveIdempotencia: string;
  receptorRfc?: string;
  receptorNombre?: string;
}): Promise<FacturaCfdi> {
  const respuesta = await fetch(`${CFDI_BASE_URL}/api/timbrar`, {
    method: "POST",
    headers: {
      "X-Api-Key": CFDI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orden_medusa_id: params.ordenId,
      emisor: { rfc: CFDI_EMISOR_RFC, nombre: CFDI_EMISOR_NOMBRE },
      receptor: {
        rfc: params.receptorRfc || "XAXX010101000",
        nombre: params.receptorNombre || "PUBLICO EN GENERAL",
      },
      conceptos: params.conceptos,
      subtotal: params.subtotal,
      iva: params.iva,
      total: params.total,
      clave_idempotencia: params.claveIdempotencia,
    }),
  });
  if (!respuesta.ok) {
    throw new Error(`El PAC (mock-cfdi) respondió ${respuesta.status} al timbrar: ${await respuesta.text()}`);
  }
  return (await respuesta.json()) as FacturaCfdi;
}
