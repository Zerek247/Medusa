import Link from "next/link";
import PanelSidebar, { PanelNavMovil } from "@/components/panel-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <PanelSidebar />

      {/* min-w-0: sin esto, un hijo flex no se encoge por debajo del
          ancho natural de su contenido (aquí, la tabla) -- en vez de que
          la tabla haga scroll horizontal DENTRO de su propio contenedor
          (overflow-x-auto, ya puesto en cada tabla), empujaba TODA la
          página más ancha que la pantalla en el celular. */}
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-black/[0.06] bg-white px-5 py-3">
          <Link href="/panel/productos" className="flex min-h-[44px] items-center text-sm font-semibold text-black/70 sm:hidden">
            BioBackup — Panel
          </Link>
          <span className="hidden text-sm text-black/40 sm:inline">
            Panel de administración
          </span>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-biobackup-navy text-xs font-bold text-white">
              A
            </div>
            <span className="hidden text-sm text-black/60 min-[400px]:inline">admin@biobackup.mx</span>
          </div>
        </header>
        <PanelNavMovil />
        <main className="p-5">{children}</main>
      </div>
    </div>
  );
}
