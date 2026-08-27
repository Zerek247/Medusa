"use client";

import Link from "next/link";
import { useState } from "react";
import ImagenProducto from "./imagen-producto";
import { formatoMXN, Producto } from "@/lib/datos";
import { useCarrito } from "@/lib/carrito-context";

export default function FichaProducto({
  producto,
  nombreCategoria,
}: {
  producto: Producto;
  nombreCategoria: string;
}) {
  const { agregar } = useCarrito();
  const [agregado, setAgregado] = useState(false);
  const [tab, setTab] = useState<"specs" | "envio">("specs");

  function alAgregar() {
    agregar(producto);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1800);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-sm text-biobackup-ink/50">
        <Link href="/tienda" className="hover:text-biobackup-blue">
          Catálogo
        </Link>{" "}
        / {nombreCategoria}
      </p>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="grid grid-cols-4 gap-2 md:grid-cols-1">
          <ImagenProducto
            nombre={producto.nombre}
            className="col-span-4 aspect-square rounded-xl md:col-span-1"
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-biobackup-ink">
            {producto.nombre}
          </h1>
          <p className="mt-1 text-xs text-biobackup-ink/50">
            SKU {producto.sku}
          </p>
          <p className="mt-4 text-3xl font-bold text-biobackup-navy">
            {formatoMXN(producto.precio)}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-biobackup-ink/80">
            {producto.descripcionLarga}
          </p>

          <div className="mt-4">
            {producto.existencia > 3 ? (
              <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                En existencia ({producto.existencia} disponibles)
              </p>
            ) : producto.existencia > 0 ? (
              <p className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Últimas {producto.existencia} piezas
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-sm font-medium text-red-600">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Sin existencia
              </p>
            )}
          </div>

          <button
            onClick={alAgregar}
            disabled={producto.existencia === 0}
            className="mt-6 w-full rounded-full bg-biobackup-navy py-3 text-sm font-semibold text-white transition hover:bg-biobackup-navyLight disabled:cursor-not-allowed disabled:bg-biobackup-ink/20 sm:w-auto sm:px-8"
          >
            {agregado ? "Agregado ✓" : "Agregar al carrito"}
          </button>

          <div className="mt-10 border-t border-biobackup-navy/10 pt-6">
            <div className="flex gap-6 border-b border-biobackup-navy/10">
              <button
                onClick={() => setTab("specs")}
                className={`pb-2 text-sm font-semibold ${
                  tab === "specs"
                    ? "border-b-2 border-biobackup-navy text-biobackup-navy"
                    : "text-biobackup-ink/50"
                }`}
              >
                Especificaciones técnicas
              </button>
              <button
                onClick={() => setTab("envio")}
                className={`pb-2 text-sm font-semibold ${
                  tab === "envio"
                    ? "border-b-2 border-biobackup-navy text-biobackup-navy"
                    : "text-biobackup-ink/50"
                }`}
              >
                Envío y facturación
              </button>
            </div>

            {tab === "specs" ? (
              <table className="mt-4 w-full text-sm">
                <tbody>
                  <Fila etiqueta="SKU" valor={producto.sku} />
                  <Fila etiqueta="Peso" valor={`${producto.pesoKg} kg`} />
                  <Fila
                    etiqueta="Dimensiones"
                    valor={`${producto.largoCm} × ${producto.anchoCm} × ${producto.altoCm} cm`}
                  />
                  <Fila etiqueta="Categoría" valor={nombreCategoria} />
                </tbody>
              </table>
            ) : (
              <div className="mt-4 space-y-2 text-sm text-biobackup-ink/70">
                <p>
                  Se factura con CFDI 4.0 — captura tus datos fiscales
                  (RFC, régimen, uso de CFDI) durante el pago.
                </p>
                <p>
                  Envío calculado en tiempo real según tu código postal;
                  puedes elegir paquetería y velocidad en el checkout.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <tr className="border-b border-biobackup-navy/5 last:border-0">
      <td className="py-2 pr-4 text-biobackup-ink/50">{etiqueta}</td>
      <td className="py-2 font-medium text-biobackup-ink">{valor}</td>
    </tr>
  );
}
