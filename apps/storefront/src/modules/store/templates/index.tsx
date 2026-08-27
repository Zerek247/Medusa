import { OptionValueIds } from "@lib/util/product-option-filters"
import { listCategories } from "@lib/data/categories"
import RefinementList from "@modules/store/components/refinement-list"
import SearchBar from "@modules/store/components/search-bar"
import CategoryPills from "@modules/store/components/category-pills"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  optionValueIds,
  q,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  q?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const categories = await listCategories()

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      {/* hideOptionsPicker: nuestro catálogo no tiene variantes por
          talla/color (cada producto usa una sola opción "Default") -- el
          filtro de opciones es ruido de la plantilla de ropa del starter,
          no algo que aplique aquí. */}
      <RefinementList sortBy={sort} hideOptionsPicker />
      <div className="w-full">
        <div className="mb-4 flex flex-col small:flex-row small:items-center small:justify-between gap-4">
          <h1 className="text-2xl-semi" data-testid="store-page-title">
            Catálogo
          </h1>
          <SearchBar />
        </div>
        <CategoryPills categories={categories || []} />
        {/* Sin <Suspense> a propósito -- ver el mismo hallazgo (Fase 4) en
            products/templates/index.tsx: en este entorno (Next.js 15.5.21 +
            Turbopack, dev) un <Suspense> aquí deja el fallback (los
            renglones vacíos de SkeletonProductGrid) permanentemente en su
            lugar mientras el contenido real termina apareciendo FUERA de
            <main>, después del footer. StoreTemplate ya es un Server
            Component async -- await directo, sin boundary de streaming. */}
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          countryCode={countryCode}
          optionValueIds={optionValueIds}
          q={q}
        />
      </div>
    </div>
  )
}

export default StoreTemplate
