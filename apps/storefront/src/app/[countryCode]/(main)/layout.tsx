import { Metadata } from "next"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import WhatsappWidget from "@modules/layout/components/whatsapp-widget"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  const customer = await retrieveCustomer()
  const cart = await retrieveCart()
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions()

    shippingOptions = shipping_options
  }

  return (
    <div className="tienda-root fondo-tienda relative min-h-screen">
      {/* Esferas de color decorativas -- solo ambiente, no reciben clics. */}
      <div
        className="pointer-events-none absolute inset-0 -z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -left-24 top-24 h-80 w-80 animate-flotar-lento rounded-full bg-biobackup-skyLight/50 blur-3xl dark:bg-biobackup-blue/25" />
        <div className="absolute -right-20 top-[38rem] h-96 w-96 animate-flotar-lento-2 rounded-full bg-biobackup-green/30 blur-3xl dark:bg-biobackup-teal/20" />
        <div className="absolute -left-32 top-[90rem] h-96 w-96 animate-flotar-lento-2 rounded-full bg-biobackup-blue/20 blur-3xl dark:bg-biobackup-navy/40" />
      </div>

      <div className="relative z-10">
        <Nav />
        {customer && cart && (
          <CartMismatchBanner customer={customer} cart={cart} />
        )}

        {cart && (
          <FreeShippingPriceNudge
            variant="popup"
            cart={cart}
            shippingOptions={shippingOptions}
          />
        )}
        <main>{props.children}</main>
        <Footer />
        <WhatsappWidget />
      </div>
    </div>
  )
}
