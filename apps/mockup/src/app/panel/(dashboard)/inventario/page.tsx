import { productos } from "@/lib/datos";

export default function InventarioPanel() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black/80">Inventory</h1>
        <span className="text-sm text-black/40">{productos.length} artículos</span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-black/[0.06] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] text-left text-xs font-medium uppercase tracking-wide text-black/40">
              <th className="px-4 py-3">Artículo</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Ubicación</th>
              <th className="px-4 py-3">Reservado</th>
              <th className="px-4 py-3">Disponible</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.slug} className="border-b border-black/[0.04] last:border-0">
                <td className="px-4 py-3 font-medium text-black/80">{p.nombre}</td>
                <td className="px-4 py-3 text-black/50">{p.sku}</td>
                <td className="px-4 py-3 text-black/60">Bodega CDMX</td>
                <td className="px-4 py-3 text-black/50">0</td>
                <td className="px-4 py-3 font-medium text-black/80">
                  {p.existencia}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
