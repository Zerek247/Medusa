import { haySesion } from "@lib/data/sesion"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"

// Tarjeta de producto del catálogo, con el diseño de la marca. Los datos
// (precio, existencias, categoría) vienen de Medusa, que a su vez se
// sincroniza desde Bind ERP.
export default async function ProductPreview({
  product,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })
  // Sin sesión no se ven precios (clientes con precios especiales).
  const sesion = await haySesion()

  const categoria = product.categories?.[0]?.name
  const variante = product.variants?.[0]
  const existencia =
    variante?.manage_inventory && typeof variante.inventory_quantity === "number"
      ? variante.inventory_quantity
      : null
  const pocasPiezas = existencia !== null && existencia > 0 && existencia <= 3

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/70 bg-surface p-2.5 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.35)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_44px_-16px_rgba(0,143,205,0.55)] dark:border-white/10"
      data-testid="product-wrapper"
    >
      <div className="relative overflow-hidden rounded-2xl">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="square"
          seed={product.handle}
          className="transition duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-biobackup-navy/15 via-transparent to-transparent" />
        {categoria && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-semibold text-biobackup-blue backdrop-blur">
            {categoria}
          </span>
        )}
        {pocasPiezas && (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-950">
            Últimas {existencia}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-3">
        <p
          className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-biobackup-ink"
          data-testid="product-title"
        >
          {product.title}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="flex flex-col leading-tight">
            {!sesion ? (
              <span
                className="text-xs font-semibold text-biobackup-blue"
                data-testid="price-login"
              >
                Inicia sesión para ver precio
              </span>
            ) : cheapestPrice ? (
              <>
                {cheapestPrice.con_descuento && (
                  <span
                    className="text-xs text-biobackup-ink/45 line-through"
                    data-testid="original-price"
                  >
                    {cheapestPrice.original_price}
                  </span>
                )}
                <span
                  className="text-gradient text-lg font-extrabold"
                  data-testid="price"
                >
                  {cheapestPrice.calculated_price}
                </span>
                {cheapestPrice.con_descuento && (
                  <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                    Precio especial
                  </span>
                )}
              </>
            ) : (
              <span
                className="text-sm font-bold text-biobackup-ink/70"
                data-testid="price-quote"
              >
                Precio por cotizar
              </span>
            )}
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-biobackup-blue/10 text-biobackup-blue transition group-hover:bg-biobackup-blue group-hover:text-white">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M13 6l6 6-6 6"
              />
            </svg>
          </span>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
