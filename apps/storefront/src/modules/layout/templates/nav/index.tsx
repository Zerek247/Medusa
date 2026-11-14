import { Suspense } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import Header from "@modules/layout/components/header"

// Pastilla del carrito mientras llega el dato real (mismo aspecto que el
// botón definitivo, para que no "salte" al cargar).
function CarritoPlaceholder() {
  return (
    <LocalizedClientLink
      className="flex h-11 items-center gap-1.5 rounded-full bg-biobackup-navy px-3 text-sm font-semibold text-white sm:px-4"
      href="/cart"
      data-testid="nav-cart-link"
    >
      <span className="hidden sm:inline">Carrito</span>
    </LocalizedClientLink>
  )
}

export default function Nav() {
  return (
    <Header
      cartSlot={
        <Suspense fallback={<CarritoPlaceholder />}>
          <CartButton />
        </Suspense>
      }
    />
  )
}
