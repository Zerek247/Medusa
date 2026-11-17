// Middlewares de la API de la tienda.
//
// REGLA DE NEGOCIO: los precios dependen del cliente (estándar, especial) y
// los visitantes sin cuenta NO deben verlos. Ocultarlos solo en la pantalla
// no alcanza -- la llave pública de la API va dentro de la propia página, así
// que cualquiera podría consultar la API directo. Por eso aquí se quitan los
// precios de las respuestas de /store/products* cuando no hay un cliente con
// sesión, y se exige sesión para agregar productos al carrito.
import {
  authenticate,
  defineMiddlewares,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";

// Llaves que llevan precios en las respuestas de productos.
const LLAVES_DE_PRECIO = new Set(["calculated_price", "prices", "original_price", "original_price_incl_tax"]);

function quitarPrecios(valor: unknown): unknown {
  if (Array.isArray(valor)) return valor.map(quitarPrecios);
  if (valor && typeof valor === "object") {
    const limpio: Record<string, unknown> = {};
    for (const [llave, v] of Object.entries(valor as Record<string, unknown>)) {
      if (LLAVES_DE_PRECIO.has(llave)) continue;
      limpio[llave] = quitarPrecios(v);
    }
    return limpio;
  }
  return valor;
}

function esClienteConSesion(req: MedusaRequest): boolean {
  const auth = (req as any).auth_context;
  return auth?.actor_type === "customer" && !!auth?.actor_id;
}

/** Quita los precios de la respuesta si quien consulta no es un cliente con sesión. */
function ocultarPreciosAVisitantes(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  if (esClienteConSesion(req)) return next();

  const jsonOriginal = res.json.bind(res);
  res.json = ((cuerpo: unknown) => jsonOriginal(quitarPrecios(cuerpo))) as typeof res.json;
  next();
}

/** Para comprar hay que tener cuenta: sin sesión no se agregan productos al carrito. */
function exigirSesion(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  if (esClienteConSesion(req)) return next();
  res.status(401).json({
    type: "unauthorized",
    message: "Inicia sesión para agregar productos al carrito.",
  });
}

// authenticate con allowUnauthenticated: identifica al cliente si trae sesión,
// pero no rechaza a los visitantes (el catálogo sigue siendo público).
const identificarCliente = authenticate("customer", ["session", "bearer"], {
  allowUnauthenticated: true,
});

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/products*",
      method: ["GET"],
      middlewares: [identificarCliente, ocultarPreciosAVisitantes],
    },
    {
      matcher: "/store/carts/:id/line-items",
      method: ["POST"],
      middlewares: [identificarCliente, exigirSesion],
    },
  ],
});
