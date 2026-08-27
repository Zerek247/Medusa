// Pastillas de categoría en el catálogo (Fase 6) -- enlazan a
// /categories/[handle], que ya filtra productos por categoría (Medusa lo
// trae de fábrica); esto solo las hace visibles/navegables desde el
// catálogo general en vez de tener que conocer la URL de memoria.
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

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
    <div className="flex flex-wrap gap-2 mb-6" data-testid="category-pills">
      <LocalizedClientLink
        href="/store"
        className={`px-3 py-1.5 rounded-full text-xs border ${
          !activeHandle
            ? "bg-ui-button-inverted text-white border-ui-button-inverted"
            : "border-ui-border-base text-ui-fg-subtle hover:border-ui-border-interactive"
        }`}
      >
        Todos
      </LocalizedClientLink>
      {principales.map((c) => (
        <LocalizedClientLink
          key={c.id}
          href={`/categories/${c.handle}`}
          className={`px-3 py-1.5 rounded-full text-xs border ${
            activeHandle === c.handle
              ? "bg-ui-button-inverted text-white border-ui-button-inverted"
              : "border-ui-border-base text-ui-fg-subtle hover:border-ui-border-interactive"
          }`}
        >
          {c.name}
        </LocalizedClientLink>
      ))}
    </div>
  )
}

export default CategoryPills
