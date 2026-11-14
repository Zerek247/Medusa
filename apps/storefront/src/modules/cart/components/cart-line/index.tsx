"use client"

import { deleteLineItem, updateLineItem } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import LineItemOptions from "@modules/common/components/line-item-options"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

const BOTON_CANTIDAD =
  "flex h-10 w-10 items-center justify-center rounded-full border border-biobackup-navy/20 text-biobackup-ink transition hover:border-biobackup-blue disabled:cursor-not-allowed disabled:opacity-40"

// Renglón del carrito (página /cart): en celular se apila -- nombre arriba;
// cantidad, total y quitar abajo -- y en pantalla ancha va en una sola fila.
const CartLine = ({
  item,
  currencyCode,
}: {
  item: HttpTypes.StoreCartLineItem
  currencyCode: string
}) => {
  const [updating, setUpdating] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Si se conoce la existencia (y no se permite pedido pendiente), el tope es
  // lo que hay. El carrito no siempre trae ese dato: sin él, no se limita.
  const existencia = item.variant?.inventory_quantity
  const maxQuantity =
    item.variant?.manage_inventory &&
    !item.variant?.allow_backorder &&
    typeof existencia === "number"
      ? Math.max(1, existencia)
      : 99

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({ lineId: item.id, quantity })
      .catch((err) => setError(err.message))
      .finally(() => setUpdating(false))
  }

  const remove = async () => {
    setRemoving(true)
    await deleteLineItem(item.id).catch(() => setRemoving(false))
  }

  const total = item.total ?? 0
  const originalTotal = item.original_total ?? 0
  const conDescuento = total < originalTotal

  return (
    <div
      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4"
      data-testid="product-row"
    >
      <div className="flex min-w-0 items-center gap-3 sm:flex-1">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className="block w-16 shrink-0"
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
            seed={item.product_handle}
          />
        </LocalizedClientLink>
        <div className="min-w-0">
          <p
            className="text-sm font-medium text-biobackup-ink"
            data-testid="product-title"
          >
            {item.product_title}
          </p>
          {item.variant_title && item.variant_title !== item.product_title && (
            <LineItemOptions variant={item.variant} data-testid="product-variant" />
          )}
          <p className="text-sm text-biobackup-ink/50">
            {convertToLocale({
              amount: item.unit_price,
              currency_code: currencyCode,
            })}{" "}
            c/u
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => changeQuantity(item.quantity - 1)}
            disabled={updating || item.quantity <= 1}
            aria-label="Disminuir cantidad"
            className={BOTON_CANTIDAD}
          >
            −
          </button>
          <span
            className="w-8 text-center text-sm"
            data-testid="product-quantity"
          >
            {item.quantity}
          </span>
          <button
            onClick={() => changeQuantity(item.quantity + 1)}
            disabled={updating || item.quantity >= maxQuantity}
            aria-label="Aumentar cantidad"
            className={BOTON_CANTIDAD}
          >
            +
          </button>
        </div>

        <p className="min-w-0 text-right text-sm font-semibold text-biobackup-ink sm:w-28">
          {conDescuento && (
            <span className="block text-xs font-normal text-biobackup-ink/45 line-through">
              {convertToLocale({
                amount: originalTotal,
                currency_code: currencyCode,
              })}
            </span>
          )}
          <span data-testid="product-price">
            {convertToLocale({ amount: total, currency_code: currencyCode })}
          </span>
        </p>

        <button
          onClick={remove}
          disabled={removing}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-biobackup-ink/40 transition hover:text-red-600 disabled:opacity-40"
          aria-label="Quitar"
          data-testid="product-delete-button"
        >
          ✕
        </button>
      </div>
      <ErrorMessage error={error} data-testid="product-error-message" />
    </div>
  )
}

export default CartLine
