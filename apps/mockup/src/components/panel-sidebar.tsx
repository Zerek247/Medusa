"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconOrders,
  IconDrafts,
  IconProducts,
  IconInventory,
  IconCustomers,
  IconPromotions,
  IconPriceLists,
  IconSync,
  IconFallidos,
  IconEnvio,
} from "./panel-icons";

const NAV = [
  { href: "/panel/ordenes", label: "Orders", icon: IconOrders },
  { href: "/panel/ordenes/borradores", label: "Drafts", icon: IconDrafts, sub: true },
  { href: "/panel/productos", label: "Products", icon: IconProducts },
  { href: "/panel/inventario", label: "Inventory", icon: IconInventory },
  { href: "/panel/clientes", label: "Customers", icon: IconCustomers },
  { href: "/panel/promociones", label: "Promotions", icon: IconPromotions },
  { href: "/panel/listas-precios", label: "Price Lists", icon: IconPriceLists },
  { href: "/panel/bind-sync", label: "Sync con Bind", icon: IconSync },
  { href: "/panel/post-pago-fallidos", label: "Cola de fallidos", icon: IconFallidos },
  { href: "/panel/requiere-datos-envio", label: "Falta peso/dimensiones", icon: IconEnvio },
];

export default function PanelSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-[#111113] sm:flex">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-biobackup-blue text-[11px] font-bold text-white">
            B
          </span>
          <span className="text-sm font-medium text-zinc-200">
            BioBackup
          </span>
        </div>
        <button
          className="text-zinc-500 hover:text-zinc-300"
          aria-label="Más opciones"
        >
          •••
        </button>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-xs text-zinc-500">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
          <span className="flex-1">Search</span>
          <span className="rounded border border-white/10 px-1 text-[10px]">⌘K</span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 pb-4">
        {NAV.map((item) => {
          const activo = pathname === item.href;
          const Icono = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-sm transition ${
                item.sub ? "ml-[26px] py-1 text-[13px]" : ""
              } ${
                activo
                  ? "bg-white/[0.08] font-medium text-white"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
              }`}
            >
              {!item.sub && <Icono className="h-[18px] w-[18px] shrink-0" />}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
