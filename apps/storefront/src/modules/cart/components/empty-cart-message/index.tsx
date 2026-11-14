import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EmptyCartMessage = () => {
  return (
    <div
      className="mx-auto max-w-2xl py-16 text-center"
      data-testid="empty-cart-message"
    >
      <h1 className="text-2xl font-bold text-biobackup-ink">
        Tu carrito está vacío
      </h1>
      <p className="mt-3 text-sm text-biobackup-ink/65">
        Explora el catálogo y agrega lo que tu hospital necesita.
      </p>
      <LocalizedClientLink
        href="/store"
        className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-biobackup-navy px-6 py-3 text-sm font-semibold text-white"
      >
        Ir al catálogo
      </LocalizedClientLink>
    </div>
  )
}

export default EmptyCartMessage
