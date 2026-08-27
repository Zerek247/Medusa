export default function ListasPreciosPanel() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-black/80">Price Lists</h1>
      <div className="mt-6 rounded-lg border border-dashed border-black/10 bg-white p-10 text-center">
        <p className="text-sm font-medium text-black/60">
          Todavía no hay listas de precios
        </p>
        <p className="mt-1 text-sm text-black/40">
          Útil para dar precios distintos por cliente o por volumen (ej.
          hospitales vs. consultorios).
        </p>
      </div>
    </div>
  );
}
