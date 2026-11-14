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
  const todosLosMetodos = await listCartPaymentMethods(cart.region?.id ?? "")

  // Mientras no esté integrado el pago real (Openpay de BBVA) solo se ofrece
  // el pago simulado de Medusa: crea el pedido sin cobrar. Para volver a
  // mostrar Stripe u otro proveedor: NEXT_PUBLIC_PAGOS_REALES=true.
  const paymentMethods =
    process.env.NEXT_PUBLIC_PAGOS_REALES === "true"
      ? todosLosMetodos
      : (todosLosMetodos ?? []).filter((m) => !m.id.startsWith("pp_stripe"))

  if (!shippingMethods || !paymentMethods) {
    return null
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
