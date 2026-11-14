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
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
      data-testid="category-container"
    >
      <span className="mb-2 block h-1.5 w-12 rounded-full bg-gradient-to-r from-biobackup-navy via-biobackup-blue to-biobackup-teal" />
      <h1
        className="text-3xl font-extrabold tracking-tight text-biobackup-ink sm:text-4xl"
        data-testid="store-page-title"
      >
        Catálogo
      </h1>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <CategoryPills categories={categories || []} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar />
          {/* hideOptionsPicker: nuestro catálogo no tiene variantes por
              talla/color (cada producto usa una sola opción "Default"). */}
          <RefinementList sortBy={sort} hideOptionsPicker />
        </div>
      </div>

      {/* Sin <Suspense> a propósito -- en este entorno (Next.js 15.5.21 +
          Turbopack, dev) un <Suspense> aquí deja el fallback atascado y el
          contenido real aparece fuera de <main>. StoreTemplate ya es un
          Server Component async -- await directo, sin boundary. */}
      <div className="mt-6">
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
