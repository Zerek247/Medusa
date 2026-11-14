import { UMBRAL_ENVIO_GRATIS, formatoMXN } from "@lib/tienda"

// Barra de avance hacia el envío gratis (pedidos mayores a
// UMBRAL_ENVIO_GRATIS). `subtotal` va en la moneda de la tienda (MXN).
export default function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const faltante = UMBRAL_ENVIO_GRATIS - subtotal
  const envioGratis = faltante <= 0
  const progreso = Math.min(
    100,
    Math.round((subtotal / UMBRAL_ENVIO_GRATIS) * 100)
  )

  return (
    <div
      className="rounded-2xl border border-biobackup-navy/10 bg-surface p-4"
      data-testid="free-shipping-bar"
    >
      {envioGratis ? (
        <p className="flex items-center gap-2 text-sm font-medium text-biobackup-navy">
          <svg
            className="h-4 w-4 shrink-0 text-biobackup-green"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
          Tu pedido ya tiene envío gratis
        </p>
      ) : (
        <p className="text-sm text-biobackup-ink/70">
          Te faltan{" "}
          <span className="font-semibold text-biobackup-navy">
            {formatoMXN(faltante)}
          </span>{" "}
          para envío gratis
        </p>
      )}
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-biobackup-navy/10">
        <div
          className="h-full rounded-full bg-biobackup-green transition-all"
          style={{ width: `${progreso}%` }}
        />
      </div>
    </div>
  )
}
