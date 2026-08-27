// Cliente HTTP hacia la API de Bind ERP (o su mock local). Aislado en su
// propio archivo para que el día que cambie la URL/autenticación real de
// Bind, el cambio quede contenido aquí -- el resto del sync no sabe ni le
// importa cómo se obtienen los datos.
import { Logger } from "@medusajs/framework/types";

export interface ProductoBind {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string;
  precio: number;
  existencia: number;
  unidad: string;
  peso_kg: number | null;
  largo_cm: number | null;
  ancho_cm: number | null;
  alto_cm: number | null;
  activo: boolean;
}

interface RespuestaPaginada {
  productos: ProductoBind[];
  paginacion: {
    pagina: number;
    por_pagina: number;
    total_productos: number;
    total_paginas: number;
  };
}

const BIND_BASE_URL = process.env.BIND_BASE_URL || "http://mock-bind:4001";
const BIND_API_KEY = process.env.BIND_API_KEY || "bind-mock-key-local";
// Cuántos productos pedimos por página y cuánto esperamos entre una
// petición y la siguiente. Con el límite del mock (150 cada 5 min) y nuestro
// catálogo de 60 productos, ni siquiera nos acercamos al límite -- pero
// paginamos y esperamos de todos modos porque así se vería el cliente
// contra el Bind ERP real, que puede tener miles de productos.
const POR_PAGINA = Number(process.env.BIND_SYNC_PAGE_SIZE || 20);
const DEMORA_ENTRE_PETICIONES_MS = Number(process.env.BIND_SYNC_BATCH_DELAY_MS || 400);
const MAX_REINTENTOS = 3;

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pedirConReintentos(url: string, logger: Logger): Promise<RespuestaPaginada> {
  let ultimoError: unknown;
  for (let intento = 1; intento <= MAX_REINTENTOS; intento++) {
    try {
      const respuesta = await fetch(url, {
        headers: { "X-Api-Key": BIND_API_KEY },
      });
      if (respuesta.status === 429) {
        // Nos pasamos del rate limit -- esperamos más que nuestra demora
        // normal antes de reintentar, en vez de insistir de inmediato.
        const demora = DEMORA_ENTRE_PETICIONES_MS * 2 ** intento;
        logger.warn(`[bind-sync] 429 de Bind ERP, esperando ${demora}ms antes de reintentar (intento ${intento}/${MAX_REINTENTOS})`);
        await esperar(demora);
        continue;
      }
      if (!respuesta.ok) {
        throw new Error(`Bind ERP respondió ${respuesta.status}: ${await respuesta.text()}`);
      }
      return (await respuesta.json()) as RespuestaPaginada;
    } catch (error) {
      ultimoError = error;
      const demora = DEMORA_ENTRE_PETICIONES_MS * 2 ** intento;
      logger.warn(`[bind-sync] Falló la petición a Bind ERP (intento ${intento}/${MAX_REINTENTOS}): ${(error as Error).message}. Reintentando en ${demora}ms.`);
      await esperar(demora);
    }
  }
  throw new Error(`No se pudo obtener datos de Bind ERP tras ${MAX_REINTENTOS} intentos: ${(ultimoError as Error)?.message}`);
}

/**
 * Trae el catálogo COMPLETO de Bind ERP, paginando secuencialmente (nunca
 * en paralelo) y esperando entre página y página -- así es como se respeta
 * el límite de tasa de un ERP real desde el lado del cliente, sin depender
 * de que el servidor nos corte con un 429.
 */
export interface ItemVentaBind {
  id: number; // id NUMÉRICO interno de Bind (no el SKU) -- ver bind_id en metadata del producto.
  cantidad: number;
}

export interface VentaBind {
  folio: string;
  items: unknown[];
  total: number;
  fecha: string;
  estatus: string;
}

/**
 * Registra una venta en Bind ERP. A propósito UN SOLO intento de red, sin el
 * reintento-con-backoff-corto de pedirConReintentos: esta llamada la hace
 * una tarea de la cola post-pago (Fase 5), y ahí los reintentos los maneja
 * BullMQ con SU backoff (30s/2min/10min) -- si reintentáramos aquí TAMBIÉN
 * por dentro, tendríamos dos capas de reintento pisándose y sería mucho más
 * difícil ver en los logs "la tarea falló, se reintentó, pasó" como pide la
 * verificación de esta fase.
 */
export async function registrarVenta(
  items: ItemVentaBind[],
  claveIdempotencia: string,
  cliente?: { nombre?: string; email?: string }
): Promise<VentaBind> {
  const respuesta = await fetch(`${BIND_BASE_URL}/api/ventas`, {
    method: "POST",
    headers: {
      "X-Api-Key": BIND_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items, clave_idempotencia: claveIdempotencia, cliente }),
  });
  if (!respuesta.ok) {
    throw new Error(`Bind ERP respondió ${respuesta.status} al registrar la venta: ${await respuesta.text()}`);
  }
  return (await respuesta.json()) as VentaBind;
}

export async function obtenerCatalogoBind(logger: Logger): Promise<ProductoBind[]> {
  const productos: ProductoBind[] = [];
  let pagina = 1;
  let totalPaginas = 1;

  do {
    const url = `${BIND_BASE_URL}/api/productos?pagina=${pagina}&por_pagina=${POR_PAGINA}`;
    const respuesta = await pedirConReintentos(url, logger);
    productos.push(...respuesta.productos);
    totalPaginas = respuesta.paginacion.total_paginas;
    logger.info(`[bind-sync] Página ${pagina}/${totalPaginas} obtenida (${respuesta.productos.length} productos)`);

    pagina += 1;
    if (pagina <= totalPaginas) {
      await esperar(DEMORA_ENTRE_PETICIONES_MS);
    }
  } while (pagina <= totalPaginas);

  return productos;
}
