import { Metadata } from "next"

import Benefits from "@modules/home/components/benefits"
import CategoryGrid from "@modules/home/components/category-grid"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "BioBackup — Equipo médico + consumibles",
  description:
    "Equipo médico, diagnóstico y consumibles para hospitales, clínicas y consultorios, con envío a todo México.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)
  const categories = await listCategories()

  if (!region) {
    return null
  }

  return (
    <div className="pb-4">
      <Hero />
      <CategoryGrid categories={categories || []} />
      <FeaturedProducts region={region} />
      <Benefits />
    </div>
  )
}
