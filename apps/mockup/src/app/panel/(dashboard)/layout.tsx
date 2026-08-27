import Image from "next/image";
import Link from "next/link";

const NAV = [
  { href: "/panel/productos", label: "Productos" },
  { href: "/panel/ordenes", label: "Órdenes" },
];

const NAV_OPERACION = [
  { href: "/panel/bind-sync", label: "Sync con Bind" },
  { href: "/panel/post-pago-fallidos", label: "Cola de fallidos" },
  { href: "/panel/requiere-datos-envio", label: "Falta peso/dimensiones" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <aside className="hidden w-60 shrink-0 border-r border-black/[0.06] bg-white sm:block">
        <div className="flex items-center gap-2 border-b border-black/[0.06] px-5 py-4">
          <Image
            src="/logo/biobackup-horizontal.png"
            alt="BioBackup"
            width={120}
            height={36}
            className="h-7 w-auto"
          />
        </div>
        <nav className="px-3 py-4">
          <p className="px-2 text-xs font-semibold uppercase tracking-wide text-black/35">
            Catálogo
          </p>
          <ul className="mt-1 space-y-0.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-2.5 py-1.5 text-sm text-black/70 hover:bg-black/[0.04]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-5 px-2 text-xs font-semibold uppercase tracking-wide text-black/35">
            Panel de operación
          </p>
          <ul className="mt-1 space-y-0.5">
            {NAV_OPERACION.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-2.5 py-1.5 text-sm text-black/70 hover:bg-black/[0.04]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-black/[0.06] bg-white px-5 py-3">
          <Link href="/panel/productos" className="text-sm font-semibold text-black/70 sm:hidden">
            BioBackup — Panel
          </Link>
          <span className="hidden text-sm text-black/40 sm:inline">
            Panel de administración
          </span>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-biobackup-navy text-xs font-bold text-white">
              A
            </div>
            <span className="text-sm text-black/60">admin@biobackup.mx</span>
          </div>
        </header>
        <main className="p-5">{children}</main>
      </div>
    </div>
  );
}
