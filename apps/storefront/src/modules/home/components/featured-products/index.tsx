import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import SectionTitle from "@modules/home/components/section-title"
import ProductPreview from "@modules/products/components/product-preview"

// "Más solicitados": por ahora los 4 productos más recientes del catálogo
// (que viene de Bind). Cuando haya datos de ventas reales, aquí se puede
// ordenar por popularidad.
export default async function FeaturedProducts({
  region,
}: {
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: { limit: 4 },
  })

  if (!products?.length) return null

  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
      <div className="reveal" style={{ ["--d" as string]: 8 }}>
        <SectionTitle enlace={{ href: "/store", texto: "Ver todo" }}>
          Más solicitados
        </SectionTitle>
      </div>
      <ul className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((p, i) => (
          <li
            key={p.id}
            className="reveal"
            style={{ ["--d" as string]: 9 + i }}
          >
            <ProductPreview product={p} region={region} />
          </li>
        ))}
      </ul>
    </section>
  )
}
