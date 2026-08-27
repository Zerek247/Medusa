import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import DemoBanner from "@modules/layout/components/demo-banner"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="es" data-mode="light">
      <body>
        {/* Fuera de [countryCode] a propósito: así aparece en TODAS las
            pantallas, incluido el checkout, que tiene su propio layout. */}
        <DemoBanner />
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
