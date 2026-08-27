"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ImagenProducto from "./imagen-producto";
import { categorias, formatoMXN, Producto } from "@/lib/datos";

export default function Catalogo({
  productos,
  categoriaActiva,
}: {
  productos: Producto[];
  categoriaActiva?: string;
}) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q)
    );
  }, [productos, busqueda]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/tienda"
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              !categoriaActiva
                ? "border-biobackup-navy bg-biobackup-navy text-white"
                : "border-biobackup-navy/20 text-biobackup-ink hover:border-biobackup-blue"
            }`}
          >
            Todos
          </Link>
          {categorias.map((c) => (
            <Link
              key={c.slug}
              href={`/tienda/${c.slug}`}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                categoriaActiva === c.slug
                  ? "border-biobackup-navy bg-biobackup-navy text-white"
                  : "border-biobackup-navy/20 text-biobackup-ink hover:border-biobackup-blue"
              }`}
            >
              {c.nombre}
            </Link>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-biobackup-ink/40"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
            />
          </svg>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full rounded-full border border-biobackup-navy/20 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-biobackup-blue"
          />
        </div>
      </div>

      <p className="mt-4 text-sm text-biobackup-ink/60">
        {filtrados.length} producto{filtrados.length !== 1 && "s"}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtrados.map((p) => (
          <Link
            key={p.slug}
            href={`/producto/${p.slug}`}
            className="group overflow-hidden rounded-xl border border-biobackup-navy/10 transition hover:shadow-md"
          >
            <ImagenProducto nombre={p.nombre} className="aspect-square" />
            <div className="p-3">
              <p className="line-clamp-2 text-sm font-medium text-biobackup-ink">
                {p.nombre}
              </p>
              <p className="mt-1 text-sm font-bold text-biobackup-navy">
                {formatoMXN(p.precio)}
              </p>
              {p.existencia <= 3 && (
                <p className="mt-0.5 text-xs font-medium text-amber-600">
                  Últimas {p.existencia} piezas
                </p>
              )}
            </div>
          </Link>
        ))}
        {filtrados.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-biobackup-ink/50">
            No encontramos productos que coincidan con "{busqueda}".
          </p>
        )}
      </div>
    </div>
  );
}
