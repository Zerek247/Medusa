import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ThemeToggle from "@modules/layout/components/theme-toggle"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="tienda-root fondo-tienda relative min-h-screen w-full">
      <header className="px-3 pt-3 sm:px-5">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-3xl border border-white/60 bg-surface/75 px-3 py-2 shadow-[0_12px_40px_-16px_rgba(3,80,136,0.45)] backdrop-blur-xl dark:border-white/10 sm:px-5">
          <LocalizedClientLink
            href="/cart"
            className="flex min-h-[44px] flex-1 basis-0 items-center gap-x-2 text-sm font-semibold text-biobackup-ink/75 hover:text-biobackup-blue"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="hidden small:block">Volver al carrito</span>
            <span className="block small:hidden">Volver</span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="flex min-h-[44px] items-center"
            aria-label="BioBackup"
            data-testid="store-link"
          >
            <Image
              src="/logo/biobackup-horizontal.png"
              alt="BioBackup"
              width={200}
              height={78}
              className="h-9 w-auto dark:hidden sm:h-11"
              unoptimized
            />
            <Image
              src="/logo/biobackup-horizontal-oscuro.png"
              alt=""
              aria-hidden="true"
              width={200}
              height={78}
              className="hidden h-9 w-auto dark:block sm:h-11"
              unoptimized
            />
          </LocalizedClientLink>
          <div className="flex flex-1 basis-0 justify-end">
            <ThemeToggle />
          </div>
        </nav>
      </header>
      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
    </div>
  )
}
