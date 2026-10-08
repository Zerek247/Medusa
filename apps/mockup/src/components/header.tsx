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
        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-5 sm:py-2.5">
          {/* Logo sin fondo: dos versiones del mismo PNG transparente. La de
              modo noche tiene el azul marino aclarado para que "Bio" y los
              puntos oscuros se lean sobre el fondo oscuro. */}
          <Link href="/" className="flex min-h-[44px] shrink-0 items-center" aria-label="BioBackup — Equipo médico + consumibles">
            <Image
              src="/logo/biobackup-horizontal.png"
              alt="BioBackup — Equipo médico + consumibles"
              width={200}
              height={78}
              className="h-8 w-auto dark:hidden min-[360px]:h-9 min-[400px]:h-10 sm:h-12"
              priority
            />
            <Image
              src="/logo/biobackup-horizontal-oscuro.png"
              alt=""
              aria-hidden="true"
              width={200}
              height={78}
              className="hidden h-8 w-auto min-[360px]:h-9 min-[400px]:h-10 dark:block sm:h-12"
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

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <Link
              href="/rastreo"
              className="hidden rounded-full px-3 py-2 text-sm font-semibold text-biobackup-ink/75 transition hover:bg-biobackup-blue/10 hover:text-biobackup-blue xl:block"
            >
              Rastrear pedido
            </Link>
            <Link
              href="/cuenta"
              className="hidden min-h-[44px] items-center rounded-full px-3 py-2 text-sm font-semibold text-biobackup-ink/75 transition hover:bg-biobackup-blue/10 hover:text-biobackup-blue sm:inline-flex"
            >
              Mi cuenta
            </Link>
            <Link
              href="/carrito"
              className="relative flex h-11 items-center gap-1.5 rounded-full bg-biobackup-navy px-3 text-sm font-semibold text-white sm:px-4"
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
              className="flex h-11 w-11 items-center justify-center rounded-full text-biobackup-ink lg:hidden"
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
                  className="rounded-xl px-3 py-3 hover:bg-biobackup-blue/10"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/rastreo" onClick={() => setMenuAbierto(false)} className="rounded-xl px-3 py-3 hover:bg-biobackup-blue/10">
                Rastrear pedido
              </Link>
              <Link href="/cuenta" onClick={() => setMenuAbierto(false)} className="rounded-xl px-3 py-3 hover:bg-biobackup-blue/10">
                Mi cuenta
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
