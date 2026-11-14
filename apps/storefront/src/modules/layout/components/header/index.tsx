"use client"

import Image from "next/image"
import { useParams, usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ThemeToggle from "@modules/layout/components/theme-toggle"

const NAV_PRINCIPAL = [
  { href: "/store", label: "Catálogo" },
  { href: "/promociones", label: "Promociones" },
  { href: "/sobre-nosotros", label: "Sobre nosotros" },
  { href: "/contacto", label: "Contacto" },
  { href: "/faq", label: "FAQ" },
]

// `cartSlot` es el botón del carrito (componente de servidor que consulta
// el carrito de Medusa); se pasa como prop para poder mantener este
// encabezado como componente de cliente (menú móvil, ruta activa).
export default function Header({ cartSlot }: { cartSlot: ReactNode }) {
  const pathname = usePathname()
  const { countryCode } = useParams()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const esActivo = (href: string) => {
    const completo = `/${countryCode}${href}`
    return pathname === completo || pathname.startsWith(completo + "/")
  }

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-surface/75 shadow-[0_12px_40px_-16px_rgba(3,80,136,0.45)] backdrop-blur-xl dark:border-white/10">
        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-5 sm:py-2.5">
          {/* Logo sin fondo: dos versiones del mismo PNG transparente. La de
              modo noche tiene el azul marino aclarado para que "Bio" y los
              puntos oscuros se lean sobre el fondo oscuro. */}
          <LocalizedClientLink
            href="/"
            className="flex min-h-[44px] shrink-0 items-center"
            aria-label="BioBackup — Equipo médico + consumibles"
            data-testid="nav-store-link"
          >
            <Image
              src="/logo/biobackup-horizontal.png"
              alt="BioBackup — Equipo médico + consumibles"
              width={200}
              height={78}
              className="h-8 w-auto dark:hidden min-[360px]:h-9 min-[400px]:h-10 sm:h-12"
              priority
              unoptimized
            />
            <Image
              src="/logo/biobackup-horizontal-oscuro.png"
              alt=""
              aria-hidden="true"
              width={200}
              height={78}
              className="hidden h-8 w-auto min-[360px]:h-9 min-[400px]:h-10 dark:block sm:h-12"
              priority
              unoptimized
            />
          </LocalizedClientLink>

          <nav className="hidden items-center gap-1 text-sm font-semibold lg:flex">
            {NAV_PRINCIPAL.map((item) => (
              <LocalizedClientLink
                key={item.href}
                href={item.href}
                data-testid={`nav-link-${item.href.slice(1)}`}
                className={`rounded-full px-3.5 py-2 transition ${
                  esActivo(item.href)
                    ? "bg-biobackup-blue/15 text-biobackup-blue"
                    : "text-biobackup-ink/75 hover:bg-biobackup-blue/10 hover:text-biobackup-blue"
                }`}
              >
                {item.label}
              </LocalizedClientLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <LocalizedClientLink
              href="/rastreo"
              data-testid="nav-tracking-link"
              className="hidden min-h-[44px] items-center rounded-full px-3 py-2 text-sm font-semibold text-biobackup-ink/75 transition hover:bg-biobackup-blue/10 hover:text-biobackup-blue xl:inline-flex"
            >
              Rastrear pedido
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/account"
              data-testid="nav-account-link"
              className="hidden min-h-[44px] items-center rounded-full px-3 py-2 text-sm font-semibold text-biobackup-ink/75 transition hover:bg-biobackup-blue/10 hover:text-biobackup-blue sm:inline-flex"
            >
              Mi cuenta
            </LocalizedClientLink>
            {cartSlot}
            <ThemeToggle />
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full text-biobackup-ink lg:hidden"
              onClick={() => setMenuAbierto((v) => !v)}
              aria-label="Abrir menú"
              aria-expanded={menuAbierto}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                />
              </svg>
            </button>
          </div>
        </div>

        {menuAbierto && (
          <div className="border-t border-biobackup-navy/10 px-4 py-3 lg:hidden">
            <nav className="flex flex-col gap-1 text-sm font-semibold text-biobackup-ink">
              {[
                ...NAV_PRINCIPAL,
                { href: "/rastreo", label: "Rastrear pedido" },
                { href: "/account", label: "Mi cuenta" },
              ].map((item) => (
                <LocalizedClientLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuAbierto(false)}
                  className="rounded-xl px-3 py-3 hover:bg-biobackup-blue/10"
                >
                  {item.label}
                </LocalizedClientLink>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
