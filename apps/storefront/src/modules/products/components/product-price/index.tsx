import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return (
      <div className="block h-9 w-32 animate-pulse rounded-full bg-biobackup-blue/10" />
    )
  }

  return (
    <div className="flex flex-col">
      {selectedPrice.con_descuento && (
        <span className="mb-1 inline-flex w-fit items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          Precio especial para ti
        </span>
      )}
      <span className="text-gradient text-4xl font-extrabold">
        {!variant && (product.variants?.length ?? 0) > 1 && (
          <span className="mr-1 text-base font-semibold">Desde</span>
        )}
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
      </span>
      {selectedPrice.con_descuento && (
        <p className="mt-1 text-sm">
          <span className="text-biobackup-ink/50">Antes: </span>
          <span
            className="text-biobackup-ink/50 line-through"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            {selectedPrice.original_price}
          </span>
          <span className="ml-2 font-bold text-emerald-600">
            -{selectedPrice.percentage_diff}%
          </span>
        </p>
      )}
    </div>
  )
}
