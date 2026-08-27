import { formatoMXN, ordenesAdmin } from "@/lib/datos";

const COLOR_PAGO: Record<string, string> = {
  Autorizado: "bg-blue-100 text-blue-700",
  Capturado: "bg-emerald-100 text-emerald-700",
};

const COLOR_ENVIO: Record<string, string> = {
  "En tránsito": "bg-blue-100 text-blue-700",
  "No preparado": "bg-gray-100 text-gray-600",
  Entregado: "bg-emerald-100 text-emerald-700",
};

export default function OrdenesPanel() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black/80">Órdenes</h1>
        <span className="text-sm text-black/40">{ordenesAdmin.length} órdenes</span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-black/[0.06] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] text-left text-xs font-medium uppercase tracking-wide text-black/40">
              <th className="px-4 py-3">Orden</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Pago</th>
              <th className="px-4 py-3">Envío</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {ordenesAdmin.map((o) => (
              <tr key={o.id} className="border-b border-black/[0.04] last:border-0">
                <td className="px-4 py-3 font-medium text-black/80">{o.id}</td>
                <td className="px-4 py-3 text-black/50">{o.fecha}</td>
                <td className="px-4 py-3 text-black/70">{o.cliente}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLOR_PAGO[o.pago] ?? "bg-gray-100 text-gray-600"}`}>
                    {o.pago}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLOR_ENVIO[o.envio] ?? "bg-gray-100 text-gray-600"}`}>
                    {o.envio}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-black/80">
                  {formatoMXN(o.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
