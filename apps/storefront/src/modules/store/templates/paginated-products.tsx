import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { OptionValueIds } from "@lib/util/product-option-filters"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
  q?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  optionValueIds,
  q,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  optionValueIds?: OptionValueIds
  q?: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  // Búsqueda (Fase 6): Medusa acepta "q" en /store/products y busca en
  // título/descripción con LIKE aunque no haya un motor de búsqueda
  // dedicado (MeiliSearch/Algolia) configurado -- suficiente para un
  // catálogo de decenas de productos, no hace falta más infraestructura.
  if (q) {
    queryParams["q"] = q
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
    optionValueIds,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <>
      <p className="text-sm text-biobackup-ink/60">
        {count} producto{count !== 1 && "s"}
      </p>
      <ul
        className="mt-4 grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        data-testid="products-list"
      >
        {products.map((p, i) => {
          return (
            <li
              key={p.id}
              className="reveal-rapido"
              style={{ ["--d" as string]: i % 8 }}
            >
              <ProductPreview product={p} region={region} />
            </li>
          )
        })}
        {products.length === 0 && (
          <li className="col-span-full py-12 text-center text-sm text-biobackup-ink/50">
            No encontramos productos que coincidan con tu búsqueda.
          </li>
        )}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
