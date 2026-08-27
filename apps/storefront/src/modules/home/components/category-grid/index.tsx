// Grid de categorías en el inicio (Fase 6) -- reemplaza al bloque de
// "Featured products por colección" del starter, que dependía de
// Collections (no las usamos; nuestro catálogo se organiza por Categories,
// ver crear-categorias.ts en el backend).
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const CategoryGrid = ({ categories }: { categories: HttpTypes.StoreProductCategory[] }) => {
  const principales = categories.filter((c) => !c.parent_category)

  if (principales.length === 0) return null

  return (
    <div className="content-container py-16">
      <Heading level="h2" className="text-2xl-regular mb-6">
        Categorías
      </Heading>
      <div className="grid grid-cols-2 small:grid-cols-3 gap-4">
        {principales.map((c) => (
          <LocalizedClientLink
            key={c.id}
            href={`/categories/${c.handle}`}
            className="border border-ui-border-base rounded-rounded p-6 hover:border-ui-border-interactive hover:bg-ui-bg-subtle-hover transition-colors"
          >
            <Text className="txt-large-plus text-ui-fg-base">{c.name}</Text>
            {c.description && (
              <Text className="txt-small text-ui-fg-subtle mt-1">{c.description}</Text>
            )}
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}

export default CategoryGrid
