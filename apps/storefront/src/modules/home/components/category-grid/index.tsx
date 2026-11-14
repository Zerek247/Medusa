// Grid de categorías del inicio -- el catálogo se organiza por Categories
// de Medusa (ver crear-categorias.ts en el backend), con un degradado
// distinto por categoría para jugar con los colores de la marca.
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionTitle from "@modules/home/components/section-title"

const ESTILO_CATEGORIA = [
  { fondo: "from-biobackup-navy to-biobackup-blue", texto: "text-white", sub: "text-white/70" },
  { fondo: "from-biobackup-blue to-biobackup-teal", texto: "text-white", sub: "text-white/75" },
  { fondo: "from-biobackup-teal to-biobackup-green", texto: "text-slate-900", sub: "text-slate-900/70" },
  { fondo: "from-biobackup-slate to-biobackup-skyLight", texto: "text-slate-900", sub: "text-slate-900/70" },
]

const CategoryGrid = ({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) => {
  const principales = categories.filter((c) => !c.parent_category)

  if (principales.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
      <div className="reveal" style={{ ["--d" as string]: 5 }}>
        <SectionTitle>Explora por categoría</SectionTitle>
      </div>
      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {principales.map((c, i) => {
          const e = ESTILO_CATEGORIA[i % ESTILO_CATEGORIA.length]
          return (
            <LocalizedClientLink
              key={c.id}
              href={`/categories/${c.handle}`}
              className={`reveal group relative flex h-40 flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br ${e.fondo} p-5 shadow-lg transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl sm:h-44`}
              style={{ ["--d" as string]: 6 + i }}
            >
              <span className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/20 transition duration-500 group-hover:scale-125" />
              <span className="pointer-events-none absolute right-6 top-10 h-10 w-10 rounded-full bg-white/15 transition duration-500 group-hover:translate-x-2" />
              <span
                className={`relative text-base font-extrabold leading-tight ${e.texto}`}
              >
                {c.name}
              </span>
              <span className={`relative mt-1 text-xs font-semibold ${e.sub}`}>
                Ver productos →
              </span>
            </LocalizedClientLink>
          )
        })}
      </div>
    </section>
  )
}

export default CategoryGrid
