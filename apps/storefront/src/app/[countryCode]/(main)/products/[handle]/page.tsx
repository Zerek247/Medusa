import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

// El `generateStaticParams` original del starter se desactivó a propósito.
// En este entorno (Next.js 15.5.21 + Turbopack, `next dev`) hace que
// Turbopack pre-renderice cada página de producto UNA sola vez al arrancar
// el servidor y sirva SIEMPRE esa versión congelada -- sin volver a
// ejecutar la página, sin importar cuántas veces cambie el precio o la
// existencia en Medusa. Eso rompe justo lo que este prototipo necesita
// demostrar: el catálogo se sincroniza cada 15 minutos desde Bind ERP
// (Fase 3), así que las páginas de producto tienen que reflejar datos
// frescos en cada visita, no una foto fija del arranque del contenedor.

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images?.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images!.map((i) => [i.id, true]))
  return product.images?.filter((i) => imageIdsMap.has(i.id)) ?? null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  // Turbopack (Next.js 15.5.21) no está decodificando este segmento de ruta
  // dinámica -- params.handle llega TODAVÍA percent-encoded (el string
  // literal "tanque-de-ox%C3%ADgeno...", no "tanque-de-oxígeno...") para
  // handles con acentos/ñ. decodeURIComponent es un no-op inofensivo si
  // algún día Next.js empieza a decodificarlo correctamente.
  const handle = decodeURIComponent(params.handle)
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | BioBackup`,
    description: product.description || `${product.title}`,
    openGraph: {
      title: `${product.title} | BioBackup`,
      description: product.description || `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  // Ver el comentario de generateMetadata sobre por qué se decodifica a mano.
  const handle = decodeURIComponent(params.handle)
  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  const images = getImagesForVariant(pricedProduct, selectedVariantId)

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
      images={images ?? []}
    />
  )
}
