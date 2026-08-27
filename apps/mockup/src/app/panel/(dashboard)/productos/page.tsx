import { formatoMXN, nombreCategoria, productos } from "@/lib/datos";

export default function ProductosPanel() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black/80">Productos</h1>
        <span className="text-sm text-black/40">{productos.length} productos</span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-black/[0.06] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] text-left text-xs font-medium uppercase tracking-wide text-black/40">
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Existencia</th>
              <th className="px-4 py-3">Precio</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.slug} className="border-b border-black/[0.04] last:border-0">
                <td className="px-4 py-3 font-medium text-black/80">{p.nombre}</td>
                <td className="px-4 py-3 text-black/50">{p.sku}</td>
                <td className="px-4 py-3 text-black/60">
                  {nombreCategoria(p.categoria)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.existencia <= 3
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {p.existencia} en stock
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-black/80">
                  {formatoMXN(p.precio)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
