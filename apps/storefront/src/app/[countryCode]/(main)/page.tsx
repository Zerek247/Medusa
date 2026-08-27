import { Metadata } from "next"

import CategoryGrid from "@modules/home/components/category-grid"
import Hero from "@modules/home/components/hero"
import { listCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "BioBackup -- Equipo médico",
  description:
    "Equipo médico y de diagnóstico para consultorio: oximetría, terapia respiratoria, básculas clínicas y más.",
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
    <>
      <Hero />
      <CategoryGrid categories={categories || []} />
    </>
  )
}
