// Pastillas de categoría en el catálogo -- enlazan a /categories/[handle],
// que ya filtra productos por categoría (Medusa lo trae de fábrica).
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const BASE =
  "inline-flex min-h-[44px] items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition"
const ACTIVA = "border-biobackup-navy bg-biobackup-navy text-white"
const INACTIVA =
  "border-biobackup-navy/20 text-biobackup-ink hover:border-biobackup-blue"

const CategoryPills = ({
  categories,
  activeHandle,
}: {
  categories: HttpTypes.StoreProductCategory[]
  activeHandle?: string
}) => {
  const principales = categories.filter((c) => !c.parent_category)
  if (principales.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2" data-testid="category-pills">
      <LocalizedClientLink
        href="/store"
        className={`${BASE} ${!activeHandle ? ACTIVA : INACTIVA}`}
      >
        Todos
      </LocalizedClientLink>
      {principales.map((c) => (
        <LocalizedClientLink
          key={c.id}
          href={`/categories/${c.handle}`}
          className={`${BASE} ${activeHandle === c.handle ? ACTIVA : INACTIVA}`}
        >
          {c.name}
        </LocalizedClientLink>
      ))}
    </div>
  )
}

export default CategoryPills
