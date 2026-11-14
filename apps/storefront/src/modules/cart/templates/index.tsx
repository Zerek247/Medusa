import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6" data-testid="cart-container">
      {cart?.items?.length ? (
        <>
          <span className="mb-2 block h-1.5 w-12 rounded-full bg-gradient-to-r from-biobackup-navy via-biobackup-blue to-biobackup-teal" />
          <h1 className="text-3xl font-extrabold tracking-tight text-biobackup-ink">
            Carrito
          </h1>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
            <div className="flex flex-col gap-y-4">
              {!customer && <SignInPrompt />}
              <ItemsTemplate cart={cart} />
            </div>
            {cart.region && (
              <div className="rounded-3xl border border-white/70 bg-surface/80 p-5 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur dark:border-white/10 lg:sticky lg:top-28">
                <Summary cart={cart} />
              </div>
            )}
          </div>
        </>
      ) : (
        <EmptyCartMessage />
      )}
    </div>
  )
}

export default CartTemplate
