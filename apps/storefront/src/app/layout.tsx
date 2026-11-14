import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Montserrat, Montserrat_Alternates } from "next/font/google"
import "styles/globals.css"
import LogoLoader from "@modules/layout/components/logo-loader"

// Toda la página usa la familia Montserrat (tipografía del manual de marca):
// Montserrat normal/cursiva en todos sus pesos para el texto, y la variante
// Montserrat Alternates para los títulos (h1/h2, ver globals.css).
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
  display: "swap",
})

const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-montserrat-alt",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: "BioBackup — Equipo médico + consumibles",
  description:
    "Equipo médico y consumibles para hospitales, clínicas y consultorios.",
  icons: { icon: "/logo/biobackup-icono.png" },
}

// Se ejecuta ANTES de que React pinte nada: si la persona había elegido
// modo noche, lo aplica de una vez para que no se vea un destello blanco.
const SCRIPT_TEMA = `try{if(localStorage.getItem('biobackup-tema')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      data-mode="light"
      className={`${montserrat.variable} ${montserratAlternates.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="font-sans antialiased">
        <LogoLoader />
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
