import { notFound } from "next/navigation"

import RefinementList from "@modules/store/components/refinement-list"
import CategoryPills from "@modules/store/components/category-pills"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { listCategories } from "@lib/data/categories"
import { haySesion } from "@lib/data/sesion"

export default async function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const todasLasCategorias = await listCategories()
  const sesion = await haySesion()

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  return (
    <div
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
      data-testid="category-container"
    >
      <span className="mb-2 block h-1.5 w-12 rounded-full bg-gradient-to-r from-biobackup-navy via-biobackup-blue to-biobackup-teal" />
      <div className="flex flex-wrap items-baseline gap-x-3 text-3xl font-extrabold tracking-tight text-biobackup-ink sm:text-4xl">
        {parents.map((parent) => (
          <span key={parent.id} className="text-biobackup-ink/50">
            <LocalizedClientLink
              className="hover:text-biobackup-blue"
              href={`/categories/${parent.handle}`}
              data-testid="sort-by-link"
            >
              {parent.name}
            </LocalizedClientLink>{" "}
            /
          </span>
        ))}
        <h1 data-testid="category-page-title">{category.name}</h1>
      </div>
      {category.description && (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-biobackup-ink/65">
          {category.description}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <CategoryPills
          categories={todasLasCategorias || []}
          activeHandle={category.handle}
        />
        <RefinementList
          sortBy={sort}
          data-testid="sort-by-container"
          hideOptionsPicker
          conPrecios={sesion}
        />
      </div>

      {category.category_children && category.category_children.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {category.category_children.map((c) => (
            <LocalizedClientLink
              key={c.id}
              href={`/categories/${c.handle}`}
              className="inline-flex min-h-[44px] items-center rounded-full border border-biobackup-navy/20 px-3.5 py-1.5 text-sm font-medium text-biobackup-ink transition hover:border-biobackup-blue"
            >
              {c.name}
            </LocalizedClientLink>
          ))}
        </div>
      )}

      {/* Sin <Suspense> a propósito -- mismo motivo que en
          store/templates/index.tsx: el fallback se queda atascado en este
          entorno. CategoryTemplate ya es async. */}
      <div className="mt-6">
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          categoryId={category.id}
          countryCode={countryCode}
          optionValueIds={optionValueIds}
        />
      </div>
    </div>
  )
}
