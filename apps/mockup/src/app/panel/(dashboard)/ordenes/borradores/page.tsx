export default function BorradoresPanel() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-black/80">Draft orders</h1>
      <div className="mt-6 rounded-lg border border-dashed border-black/10 bg-white p-10 text-center">
        <p className="text-sm font-medium text-black/60">
          No hay órdenes en borrador
        </p>
        <p className="mt-1 text-sm text-black/40">
          Los borradores se usan para crear una orden manualmente antes de
          confirmarla con el cliente.
        </p>
      </div>
    </div>
  );
}
