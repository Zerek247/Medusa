import { HttpTypes } from "@medusajs/types"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const sku = product.variants?.[0]?.sku

  return (
    <div id="product-info">
      <h1
        className="text-2xl font-bold text-biobackup-ink sm:text-3xl"
        data-testid="product-title"
      >
        {product.title}
      </h1>
      {sku && <p className="mt-1 text-xs text-biobackup-ink/50">SKU {sku}</p>}
      {product.description && (
        <p
          className="mt-4 whitespace-pre-line text-sm leading-relaxed text-biobackup-ink/80"
          data-testid="product-description"
        >
          {product.description}
        </p>
      )}
    </div>
  )
}

export default ProductInfo
