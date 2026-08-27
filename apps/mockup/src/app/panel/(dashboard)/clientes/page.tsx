const CLIENTES = [
  { nombre: "María González Ramírez", email: "demo@biobackup.mx", pedidos: 2 },
  { nombre: "Hospital Ángeles del Pedregal, Compras", email: "compras@hangeles-ejemplo.mx", pedidos: 1 },
  { nombre: "Consultorio Dra. Fernanda Ruiz", email: "fernanda.ruiz@ejemplo.mx", pedidos: 1 },
];

export default function ClientesPanel() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black/80">Customers</h1>
        <span className="text-sm text-black/40">{CLIENTES.length} clientes</span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-black/[0.06] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] text-left text-xs font-medium uppercase tracking-wide text-black/40">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Pedidos</th>
            </tr>
          </thead>
          <tbody>
            {CLIENTES.map((c) => (
              <tr key={c.email} className="border-b border-black/[0.04] last:border-0">
                <td className="px-4 py-3 font-medium text-black/80">{c.nombre}</td>
                <td className="px-4 py-3 text-black/50">{c.email}</td>
                <td className="px-4 py-3 text-black/60">{c.pedidos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
