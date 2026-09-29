"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/cuenta/pedidos", label: "Mis pedidos" },
  { href: "/cuenta/datos", label: "Mis datos" },
  { href: "/cuenta/direcciones", label: "Direcciones" },
  { href: "/cuenta/contrasena", label: "Contraseña" },
];

export default function CuentaNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-biobackup-navy/10 pb-px">
      {ITEMS.map((item) => {
        const activo = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              activo
                ? "border-biobackup-navy text-biobackup-navy"
                : "border-transparent text-biobackup-ink/50 hover:text-biobackup-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
