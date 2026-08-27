export default function PromocionesPanel() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-black/80">Promotions</h1>
      <div className="mt-6 rounded-lg border border-dashed border-black/10 bg-white p-10 text-center">
        <p className="text-sm font-medium text-black/60">
          Todavía no hay promociones configuradas
        </p>
        <p className="mt-1 text-sm text-black/40">
          Aquí se crean códigos de descuento y promociones automáticas.
        </p>
      </div>
    </div>
  );
}
