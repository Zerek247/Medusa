"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { categorias } from "@/lib/datos";
import { useCarrito } from "@/lib/carrito-context";

export default function Header() {
  const { totalArticulos } = useCarrito();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="sticky top-[29px] z-40 border-b border-biobackup-navy/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logo/biobackup-horizontal.png"
            alt="BioBackup — Equipo médico + consumibles"
            width={180}
            height={56}
            className="h-10 w-auto sm:h-11"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-biobackup-ink md:flex">
          {categorias.map((c) => (
            <Link
              key={c.slug}
              href={`/tienda/${c.slug}`}
              className="transition hover:text-biobackup-blue"
            >
              {c.nombre}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/rastreo"
            className="hidden text-sm font-medium text-biobackup-ink transition hover:text-biobackup-blue sm:block"
          >
            Rastrear pedido
          </Link>
          <Link
            href="/cuenta"
            className="hidden text-sm font-medium text-biobackup-ink transition hover:text-biobackup-blue sm:block"
          >
            Mi cuenta
          </Link>
          <Link
            href="/carrito"
            className="relative flex items-center gap-1.5 rounded-full bg-biobackup-navy px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-biobackup-navyLight"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.936-4.744 2.394-7.264a.75.75 0 00-.735-.886H5.106M7.5 14.25L5.106 5.272M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
            Carrito
            {totalArticulos > 0 && (
              <span className="ml-0.5 rounded-full bg-biobackup-teal px-1.5 text-xs font-bold">
                {totalArticulos}
              </span>
            )}
          </Link>
          <button
            className="text-biobackup-ink md:hidden"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-label="Abrir menú"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          </button>
        </div>
      </div>

      {menuAbierto && (
        <div className="border-t border-biobackup-navy/10 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium text-biobackup-ink">
            {categorias.map((c) => (
              <Link
                key={c.slug}
                href={`/tienda/${c.slug}`}
                onClick={() => setMenuAbierto(false)}
              >
                {c.nombre}
              </Link>
            ))}
            <Link href="/rastreo" onClick={() => setMenuAbierto(false)}>
              Rastrear pedido
            </Link>
            <Link href="/cuenta" onClick={() => setMenuAbierto(false)}>
              Mi cuenta
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
