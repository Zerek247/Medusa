// Constantes de negocio de la tienda (requisitos del cliente).

// Pedidos mayores a este monto (MXN) no pagan envío.
export const UMBRAL_ENVIO_GRATIS = 3000

export const formatoMXN = (n: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n)

// Todavía no hay fotos reales de producto: mientras tanto se usan imágenes
// genéricas de Picsum, sembradas con el handle del producto para que cada
// uno muestre SIEMPRE la misma foto. Quitar cuando el catálogo traiga fotos.
export const imagenGenerica = (seed: string) =>
  `https://picsum.photos/seed/biobackup-${seed}/600/600`

// WhatsApp de ventas (el mismo que aparece en el pie de página y Contacto).
export const WHATSAPP_VENTAS = "526143143157"

// Enlace de WhatsApp para pedir cotización de un producto sin precio.
export const enlaceCotizacion = (titulo: string, sku?: string | null) =>
  `https://wa.me/${WHATSAPP_VENTAS}?text=${encodeURIComponent(
    `Hola, quiero cotizar: ${titulo}${sku ? ` (código ${sku})` : ""}.`
  )}`
