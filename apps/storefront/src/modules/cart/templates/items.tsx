import { HttpTypes } from "@medusajs/types"

import CartLine from "@modules/cart/components/cart-line"
import FreeShippingBar from "@modules/cart/components/free-shipping-bar"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items ?? []

  return (
    <div className="flex flex-col gap-y-4">
      <FreeShippingBar subtotal={cart?.item_subtotal ?? 0} />
      <div className="divide-y divide-biobackup-navy/10 overflow-hidden rounded-3xl border border-white/70 bg-surface/80 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur dark:border-white/10">
        {[...items]
          .sort((a, b) => ((a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1))
          .map((item) => (
            <CartLine
              key={item.id}
              item={item}
              currencyCode={cart?.currency_code ?? "mxn"}
            />
          ))}
      </div>
    </div>
  )
}

export default ItemsTemplate
