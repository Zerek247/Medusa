import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const categoria = product.categories?.[0]

  return (
    <>
      <div
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
        data-testid="product-container"
      >
        <p className="text-sm text-biobackup-ink/50">
          <LocalizedClientLink href="/store" className="hover:text-biobackup-blue">
            Catálogo
          </LocalizedClientLink>
          {categoria && (
            <>
              {" "}
              /{" "}
              <LocalizedClientLink
                href={`/categories/${categoria.handle}`}
                className="hover:text-biobackup-blue"
              >
                {categoria.name}
              </LocalizedClientLink>
            </>
          )}
        </p>

        <div className="mt-4 grid gap-8 rounded-[2rem] border border-white/70 bg-surface/80 p-4 shadow-[0_20px_60px_-28px_rgba(3,80,136,0.5)] backdrop-blur dark:border-white/10 sm:p-7 md:grid-cols-2">
          <ImageGallery images={images} seed={product.handle} />

          <div className="flex flex-col gap-y-6">
            <ProductInfo product={product} />
            {/*
              OJO: se quitó el <Suspense><ProductActionsWrapper/></Suspense>
              original del starter. En este entorno (Next.js 15.5.21 +
              Turbopack, dev mode) ese boundary de Suspense se queda
              atascado y el contenido real nunca reemplaza al fallback --
              el botón de "Agregar al carrito" queda permanentemente inerte
              aunque el HTML se vea bien. `product` (con precios ya
              calculados para la región) llega completo desde la página, así
              que usamos ProductActions directo, sin el segundo fetch/Suspense.
            */}
            <ProductActions product={product} region={region} />
            <div className="border-t border-biobackup-navy/10 pt-6">
              <ProductTabs product={product} />
            </div>
          </div>
        </div>
      </div>
      <div
        className="mx-auto max-w-6xl px-4 pb-4 pt-8 sm:px-6"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
