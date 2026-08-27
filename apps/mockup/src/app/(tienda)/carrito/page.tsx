"use client";

import Link from "next/link";
import { useCarrito } from "@/lib/carrito-context";
import { formatoMXN } from "@/lib/datos";

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-biobackup-ink">Carrito</h1>

      <div className="mt-6 divide-y divide-biobackup-navy/10 rounded-xl border border-biobackup-navy/10">
        {lineas.map((l) => (
          <div key={l.slug} className="flex items-center gap-4 p-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-biobackup-ink">
                {l.nombre}
              </p>
              <p className="text-sm text-biobackup-ink/50">
                {formatoMXN(l.precio)} c/u
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => cambiarCantidad(l.slug, l.cantidad - 1)}
                className="h-7 w-7 rounded-full border border-biobackup-navy/20 text-biobackup-ink hover:border-biobackup-blue"
              >
                −
              </button>
              <span className="w-6 text-center text-sm">{l.cantidad}</span>
              <button
                onClick={() => cambiarCantidad(l.slug, l.cantidad + 1)}
                className="h-7 w-7 rounded-full border border-biobackup-navy/20 text-biobackup-ink hover:border-biobackup-blue"
              >
                +
              </button>
            </div>
            <p className="w-24 text-right text-sm font-semibold text-biobackup-ink">
              {formatoMXN(l.precio * l.cantidad)}
            </p>
            <button
              onClick={() => quitar(l.slug)}
              className="text-biobackup-ink/40 hover:text-red-600"
              aria-label="Quitar"
            >
              ✕
            </button>
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
