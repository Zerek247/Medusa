// Cliente HTTP hacia la API REAL de Bind ERP (https://api.bind.com.mx).
//
// REGLA: este cliente SOLO LEE de Bind (GET). Bind es el ERP del negocio:
// escribir ahí (ventas, existencias) afecta inventario y ventas reales, así
// que no se hace desde aquí. La única función que escribe, registrarVenta,
// está bloqueada salvo que se active a propósito (BIND_PERMITIR_ESCRITURA).
//
// Aislado en su propio archivo para que cualquier cambio de URL/autenticación
// de Bind quede contenido aquí -- el resto del sync trabaja con
// ProductoBind/CategoriaBind y no sabe cómo se obtienen los datos.
import { Logger } from "@medusajs/framework/types";

export interface ProductoBind {
  /** ID interno de Bind (GUID). Va en metadata.bind_id del producto. */
  id: string | number;
  /** Código del producto en Bind (campo "Code"), único; es el SKU en Medusa. */
  sku: string;
  nombre: string;
  descripcion: string;
  /** Bind NO trae precio de venta en el producto (los precios están en listas
   * de precios) -- los precios se manejan en el panel de Medusa. Siempre null. */
  precio: number | null;
  /** Costo de compra en Bind (campo "Cost"). NO es precio de venta y NO se
   * guarda en Medusa: solo lo usa el script de demostración. */
  costo: number | null;
  existencia: number;
  unidad: string;
  peso_kg: number | null;
  largo_cm: number | null;
  ancho_cm: number | null;
  alto_cm: number | null;
  activo: boolean;
  /** ID de Bind de la categoría más específica del producto, si tiene. */
  categoria_bind_id: string | null;
  /** URL de la foto en Bind, si tiene. */
  imagen_url: string | null;
}

export interface CategoriaBind {
  id: string;
  nombre: string;
  padre_id: string | null;
}

const BIND_BASE_URL = (process.env.BIND_BASE_URL || "https://api.bind.com.mx").replace(/\/+$/, "");
const BIND_API_KEY = process.env.BIND_API_KEY || "";
// Bind permite del orden de 150 llamadas cada 5 minutos con la API key sola.
// Pedimos de 100 en 100 y esperamos entre páginas para quedar muy por debajo.
const POR_PAGINA = Number(process.env.BIND_SYNC_PAGE_SIZE || 100);
const DEMORA_ENTRE_PETICIONES_MS = Number(process.env.BIND_SYNC_BATCH_DELAY_MS || 400);
const MAX_REINTENTOS = 3;

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** ÚNICA puerta de lectura hacia Bind: siempre GET, siempre con Bearer. */
async function bindGet<T>(ruta: string, logger: Logger): Promise<T> {
  if (!BIND_API_KEY) {
    throw new Error("Falta BIND_API_KEY en el .env del backend.");
  }
  const url = `${BIND_BASE_URL}${ruta}`;
  let ultimoError: unknown;
  for (let intento = 1; intento <= MAX_REINTENTOS; intento++) {
    try {
      const respuesta = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${BIND_API_KEY}`, Accept: "application/json" },
      });
      if (respuesta.status === 429) {
        const demora = DEMORA_ENTRE_PETICIONES_MS * 2 ** (intento + 2);
        logger.warn(`[bind-sync] 429 de Bind ERP, esperando ${demora}ms antes de reintentar (intento ${intento}/${MAX_REINTENTOS})`);
        await esperar(demora);
        continue;
      }
      if (respuesta.status === 401 || respuesta.status === 403) {
        // No tiene sentido reintentar: la clave es incorrecta, venció o no tiene permiso.
        throw new Error(
          `Bind ERP respondió ${respuesta.status}: la API key es inválida, venció (duran 1 año) o su usuario no tiene permiso.`
        );
      }
      if (!respuesta.ok) {
        throw new Error(`Bind ERP respondió ${respuesta.status} en ${ruta}`);
      }
      return (await respuesta.json()) as T;
    } catch (error) {
      ultimoError = error;
      if (/respondió 40[13]/.test((error as Error).message)) throw error;
      const demora = DEMORA_ENTRE_PETICIONES_MS * 2 ** intento;
      logger.warn(`[bind-sync] Falló la petición a Bind ERP (intento ${intento}/${MAX_REINTENTOS}): ${(error as Error).message}. Reintentando en ${demora}ms.`);
      await esperar(demora);
    }
  }
  throw new Error(`No se pudo obtener datos de Bind ERP tras ${MAX_REINTENTOS} intentos: ${(ultimoError as Error)?.message}`);
}

// --- Forma "cruda" de lo que devuelve Bind (solo lo que usamos) ---
interface ProductoBindCrudo {
  ID: string;
  Code?: string | null;
  SKU?: string | null;
  Title?: string | null;
  Description?: string | null;
  CurrentInventory?: number | null;
  Cost?: number | null;
  Unit?: string | null;
  Weight?: number | null;
  Category1ID?: string | null;
  Category2ID?: string | null;
  Category3ID?: string | null;
  ImageUrl?: string | null;
}

interface PaginaBind<T> {
  value: T[];
  nextLink?: string | null;
  count?: number;
}

interface CategoriaBindCruda {
  ID: string;
  Name: string;
  SubCategories?: CategoriaBindCruda[];
}

function mapearProducto(crudo: ProductoBindCrudo): ProductoBind | null {
  const sku = (crudo.Code || crudo.SKU || "").trim();
  if (!sku) return null; // sin código no hay forma estable de identificarlo
  const peso = Number(crudo.Weight) || 0;
  return {
    id: crudo.ID,
    sku,
    nombre: (crudo.Title || sku).trim(),
    descripcion: (crudo.Description || "").trim(),
    precio: null,
    costo: Number(crudo.Cost) > 0 ? Number(crudo.Cost) : null,
    existencia: Math.max(0, Math.floor(Number(crudo.CurrentInventory) || 0)),
    unidad: crudo.Unit || "PIEZA",
    // Bind manda 0 cuando no se capturó: 0 kg significa "no sabemos", no "no pesa".
    peso_kg: peso > 0 ? peso : null,
    largo_cm: null,
    ancho_cm: null,
    alto_cm: null,
    activo: true,
    categoria_bind_id: crudo.Category3ID || crudo.Category2ID || crudo.Category1ID || null,
    imagen_url: crudo.ImageUrl || null,
  };
}

/**
 * Trae el catálogo COMPLETO de Bind ERP, paginando secuencialmente (nunca en
 * paralelo) y esperando entre página y página para respetar su límite de tasa.
 */
export async function obtenerCatalogoBind(logger: Logger): Promise<ProductoBind[]> {
  const productos: ProductoBind[] = [];
  let omitidos = 0;
  let skip = 0;

  for (;;) {
    const pagina = await bindGet<PaginaBind<ProductoBindCrudo>>(`/api/Products?$top=${POR_PAGINA}&$skip=${skip}`, logger);
    for (const crudo of pagina.value) {
      const mapeado = mapearProducto(crudo);
      if (mapeado) productos.push(mapeado);
      else omitidos += 1;
    }
    logger.info(`[bind-sync] Bind: ${skip + pagina.value.length} productos leídos hasta ahora`);
    if (pagina.value.length < POR_PAGINA) break;
    skip += POR_PAGINA;
    await esperar(DEMORA_ENTRE_PETICIONES_MS);
  }

  if (omitidos > 0) logger.warn(`[bind-sync] ${omitidos} producto(s) de Bind sin código se omitieron.`);

  // Dos productos de Bind pueden traer el MISMO código; en Medusa el SKU es
  // único, así que a los repetidos se les agrega un sufijo estable sacado de
  // su ID de Bind (estable = no depende del orden en que lleguen).
  const conteo = new Map<string, number>();
  for (const p of productos) conteo.set(p.sku, (conteo.get(p.sku) || 0) + 1);
  for (const p of productos) {
    if ((conteo.get(p.sku) || 0) > 1) {
      const original = p.sku;
      p.sku = `${original}-${String(p.id).replace(/-/g, "").slice(0, 4)}`;
      logger.warn(`[bind-sync] Código repetido en Bind: "${original}" -> "${p.sku}" (${p.nombre}).`);
    }
  }
  return productos;
}

/** Categorías de Bind, aplanadas con su padre (Bind las devuelve anidadas). */
export async function obtenerCategoriasBind(logger: Logger): Promise<CategoriaBind[]> {
  const raiz = await bindGet<CategoriaBindCruda[]>("/api/Categories", logger);
  const plano: CategoriaBind[] = [];
  const recorrer = (cats: CategoriaBindCruda[], padre: string | null) => {
    for (const c of cats || []) {
      plano.push({ id: c.ID, nombre: (c.Name || "").trim(), padre_id: padre });
      if (c.SubCategories?.length) recorrer(c.SubCategories, c.ID);
    }
  };
  recorrer(raiz, null);
  return plano;
}

// ---------------------------------------------------------------------------
// ESCRITURA en Bind -- BLOQUEADA por defecto.
// ---------------------------------------------------------------------------
export interface ItemVentaBind {
  id: string | number; // ID interno de Bind (bind_id en la metadata del producto)
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
 * Registra una venta en Bind. ESCRIBE en el ERP y descuenta existencia real,
 * así que está bloqueada: solo funciona con BIND_PERMITIR_ESCRITURA=true (y
 * la tarea post-pago que la llama tiene su propio candado aparte). La ruta y
 * el formato están escritos para el mock; antes de usarla con Bind real hay
 * que revisarlos contra la documentación oficial.
 */
export async function registrarVenta(
  items: ItemVentaBind[],
  claveIdempotencia: string,
  cliente?: { nombre?: string; email?: string }
): Promise<VentaBind> {
  if (process.env.BIND_PERMITIR_ESCRITURA !== "true") {
    throw new Error(
      "Escritura en Bind bloqueada (BIND_PERMITIR_ESCRITURA != true). Esta integración solo LEE de Bind."
    );
  }
  const respuesta = await fetch(`${BIND_BASE_URL}/api/ventas`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BIND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items, clave_idempotencia: claveIdempotencia, cliente }),
  });
  if (!respuesta.ok) {
    throw new Error(`Bind ERP respondió ${respuesta.status} al registrar la venta: ${await respuesta.text()}`);
  }
  return (await respuesta.json()) as VentaBind;
}
