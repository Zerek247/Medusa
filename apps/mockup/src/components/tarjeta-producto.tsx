import Link from "next/link";
import ImagenProducto from "./imagen-producto";
import { formatoMXN, nombreCategoria, Producto } from "@/lib/datos";

export default function TarjetaProducto({ p }: { p: Producto }) {
  return (
    <Link
      href={`/producto/${p.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-surface p-2.5 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.35)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_44px_-16px_rgba(0,143,205,0.55)] dark:border-white/10"
    >
      <div className="relative overflow-hidden rounded-2xl">
        <ImagenProducto
          nombre={p.nombre}
          slug={p.slug}
          className="aspect-square transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-semibold text-biobackup-blue backdrop-blur">
          {nombreCategoria(p.categoria)}
        </span>
        {p.existencia <= 3 && (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-950">
            Últimas {p.existencia}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-3">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-biobackup-ink">
          {p.nombre}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-gradient text-lg font-extrabold">
            {formatoMXN(p.precio)}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-biobackup-blue/10 text-biobackup-blue transition group-hover:bg-biobackup-blue group-hover:text-white">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
