"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCarrito } from "@/lib/carrito-context";
import ThemeToggle from "./theme-toggle";

const NAV_PRINCIPAL = [
  { href: "/tienda", label: "Catálogo" },
  { href: "/promociones", label: "Promociones" },
  { href: "/sobre-nosotros", label: "Sobre nosotros" },
  { href: "/contacto", label: "Contacto" },
  { href: "/faq", label: "FAQ" },
];

export default function Header() {
  const { totalArticulos } = useCarrito();
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-surface/75 shadow-[0_12px_40px_-16px_rgba(3,80,136,0.45)] backdrop-blur-xl dark:border-white/10">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
          <Link href="/" className="flex shrink-0 items-center rounded-2xl bg-white px-2.5 py-1 dark:bg-white">
            <Image
              src="/logo/biobackup-horizontal.jpeg"
              alt="BioBackup — Equipo médico + consumibles"
              width={180}
              height={56}
              className="h-9 w-auto sm:h-10"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-semibold lg:flex">
            {NAV_PRINCIPAL.map((item) => {
              const activo = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3.5 py-2 transition ${
                    activo
                      ? "bg-biobackup-blue/15 text-biobackup-blue"
                      : "text-biobackup-ink/75 hover:bg-biobackup-blue/10 hover:text-biobackup-blue"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/rastreo"
              className="hidden rounded-full px-3 py-2 text-sm font-semibold text-biobackup-ink/75 transition hover:bg-biobackup-blue/10 hover:text-biobackup-blue xl:block"
            >
              Rastrear pedido
            </Link>
            <Link
              href="/cuenta"
              className="hidden rounded-full px-3 py-2 text-sm font-semibold text-biobackup-ink/75 transition hover:bg-biobackup-blue/10 hover:text-biobackup-blue sm:block"
            >
              Mi cuenta
            </Link>
            <Link
              href="/carrito"
              className="relative flex items-center gap-1.5 rounded-full bg-biobackup-navy px-4 py-2.5 text-sm font-semibold text-white"
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
              <span className="hidden sm:inline">Carrito</span>
              {totalArticulos > 0 && (
                <span className="ml-0.5 rounded-full bg-biobackup-teal px-1.5 text-xs font-bold text-white">
                  {totalArticulos}
                </span>
              )}
            </Link>
            <ThemeToggle />
            <button
              className="rounded-full p-2 text-biobackup-ink lg:hidden"
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
          <div className="border-t border-biobackup-navy/10 px-4 py-3 lg:hidden">
            <nav className="flex flex-col gap-1 text-sm font-semibold text-biobackup-ink">
              {NAV_PRINCIPAL.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuAbierto(false)}
                  className="rounded-xl px-3 py-2.5 hover:bg-biobackup-blue/10"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/rastreo" onClick={() => setMenuAbierto(false)} className="rounded-xl px-3 py-2.5 hover:bg-biobackup-blue/10">
                Rastrear pedido
              </Link>
              <Link href="/cuenta" onClick={() => setMenuAbierto(false)} className="rounded-xl px-3 py-2.5 hover:bg-biobackup-blue/10">
                Mi cuenta
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
