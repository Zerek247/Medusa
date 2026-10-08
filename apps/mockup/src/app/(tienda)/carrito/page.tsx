"use client";

import Link from "next/link";
import { useCarrito } from "@/lib/carrito-context";
import { formatoMXN, UMBRAL_ENVIO_GRATIS } from "@/lib/datos";

export default function CarritoPage() {
  const { lineas, cambiarCantidad, quitar, total } = useCarrito();

  if (lineas.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-biobackup-ink">
          Tu carrito está vacío
        </h1>
        <Link
          href="/tienda"
          className="mt-6 inline-block rounded-full bg-biobackup-navy px-6 py-3 text-sm font-semibold text-white hover:bg-biobackup-navyLight"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  const faltante = UMBRAL_ENVIO_GRATIS - total;
  const envioGratis = faltante <= 0;
  const progreso = Math.min(100, Math.round((total / UMBRAL_ENVIO_GRATIS) * 100));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-biobackup-ink">Carrito</h1>

      <div className="mt-4 rounded-xl border border-biobackup-navy/10 bg-surface p-4">
        {envioGratis ? (
          <p className="flex items-center gap-2 text-sm font-medium text-biobackup-navy">
            <svg className="h-4 w-4 shrink-0 text-biobackup-green" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
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

      <div className="mt-6 divide-y divide-biobackup-navy/10 rounded-xl border border-biobackup-navy/10 bg-surface">
        {lineas.map((l) => (
          <div
            key={l.slug}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="min-w-0 sm:flex-1">
              <p className="text-sm font-medium text-biobackup-ink">
                {l.nombre}
              </p>
              <p className="text-sm text-biobackup-ink/50">
                {formatoMXN(l.precio)} c/u
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => cambiarCantidad(l.slug, l.cantidad - 1)}
                  aria-label="Disminuir cantidad"
                  className="h-10 w-10 rounded-full border border-biobackup-navy/20 text-biobackup-ink hover:border-biobackup-blue"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{l.cantidad}</span>
                <button
                  onClick={() => cambiarCantidad(l.slug, l.cantidad + 1)}
                  aria-label="Aumentar cantidad"
                  className="h-10 w-10 rounded-full border border-biobackup-navy/20 text-biobackup-ink hover:border-biobackup-blue"
                >
                  +
                </button>
              </div>
              <p className="min-w-0 text-right text-sm font-semibold text-biobackup-ink sm:w-24">
                {formatoMXN(l.precio * l.cantidad)}
              </p>
              <button
                onClick={() => quitar(l.slug)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-biobackup-ink/40 hover:text-red-600"
                aria-label="Quitar"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-biobackup-ink/60">Subtotal</p>
        <p className="text-xl font-bold text-biobackup-navy">
          {formatoMXN(total)}
        </p>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block w-full rounded-full bg-biobackup-navy py-3 text-center text-sm font-semibold text-white hover:bg-biobackup-navyLight"
      >
        Continuar al pago
      </Link>
    </div>
  );
}
