import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)
  let paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

  if (!shippingMethods || !paymentMethods) {
    return null
  }

  // Fase 6B: en modo demo, Stripe ni siquiera se ofrece como opción --
  // así el paso de pago nunca carga el SDK de Stripe (ni sus llaves) y
  // "Continue to review" usa directo el proveedor manual/de sistema
  // (mismo camino que ManualTestPaymentButton, sin captura de tarjeta).
  // El botón final ("Confirmar pedido (demo)", en payment-button/index.tsx)
  // es el que se salta la llamada real a placeOrder().
  if (process.env.NEXT_PUBLIC_MODO_DEMO === "true") {
    paymentMethods = paymentMethods.filter((m) => !m.id.startsWith("pp_stripe"))
  }

  return (
    <div className="w-full grid grid-cols-1 gap-y-8">
      <Addresses cart={cart} customer={customer} />

      <Shipping cart={cart} availableShippingMethods={shippingMethods} />

      <Payment cart={cart} availablePaymentMethods={paymentMethods} />

      <Review cart={cart} />
    </div>
  )
}
