import type { Metadata } from "next";
import { Montserrat, Montserrat_Alternates } from "next/font/google";
import "./globals.css";
import { CarritoProvider } from "@/lib/carrito-context";
import LogoLoader from "@/components/logo-loader";

// Toda la página usa la familia Montserrat (tipografía del manual de marca):
// Montserrat normal/cursiva en todos sus pesos para el texto, y la variante
// Montserrat Alternates para los títulos (h1/h2, ver globals.css).
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
  display: "swap",
});

const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-montserrat-alt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BioBackup — Equipo médico + consumibles",
  description:
    "Maqueta visual de la tienda y el panel de administración de BioBackup.",
  icons: { icon: "/logo/biobackup-icono.png" },
};

// Se ejecuta ANTES de que React pinte nada: si la persona había elegido
// modo noche, lo aplica de una vez para que no se vea un destello blanco.
const SCRIPT_TEMA = `try{if(localStorage.getItem('biobackup-tema')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${montserrat.variable} ${montserratAlternates.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="min-h-screen bg-surface font-sans antialiased">
        <LogoLoader />
        <CarritoProvider>{children}</CarritoProvider>
      </body>
    </html>
  );
}
