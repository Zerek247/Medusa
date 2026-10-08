import { clienteDemo, formatoMXN, pedidosDemo } from "@/lib/datos";
import CuentaNav from "@/components/cuenta-nav";

export default function PedidosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-biobackup-ink">
        Hola, {clienteDemo.nombre.split(" ")[0]}
      </h1>

      <div className="mt-6">
        <CuentaNav />
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-biobackup-ink">
          Mis pedidos
        </h2>
        <div className="mt-3 space-y-3">
          {pedidosDemo.map((p) => (
            <div
              key={p.folio}
              className="rounded-xl border border-biobackup-navy/10 bg-surface p-4"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-biobackup-ink">
                  {p.folio}
                </span>
                <span className="text-biobackup-ink/50">{p.fecha}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-biobackup-teal">
                {p.estatus}
              </p>
              <ul className="mt-2 space-y-0.5 text-xs text-biobackup-ink/60">
                {p.items.map((it, i) => (
                  <li key={i}>
                    {it.cantidad}× {it.nombre}
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex items-center justify-between border-t border-biobackup-navy/10 pt-2 text-sm">
                <span className="text-biobackup-ink/50">
                  {p.guia ? `Guía ${p.guia}` : "Sin guía todavía"}
                </span>
                <span className="font-bold text-biobackup-navy">
                  {formatoMXN(p.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
