"use client";

import { useState } from "react";
import { productosSinDatosEnvio } from "@/lib/datos";

export default function RequiereDatosEnvioPanel() {
  const [pendientes, setPendientes] = useState(
    productosSinDatosEnvio.map((p) => p.slug)
  );
  const [guardando, setGuardando] = useState<string | null>(null);

  function guardar(slug: string) {
    setGuardando(slug);
    setTimeout(() => {
      setPendientes((prev) => prev.filter((s) => s !== slug));
      setGuardando(null);
    }, 900);
  }

  const productos = productosSinDatosEnvio.filter((p) =>
    pendientes.includes(p.slug)
  );

  return (
    <div>
      <h1 className="text-xl font-semibold text-black/80">
        Falta peso/dimensiones
      </h1>
      <p className="mt-1 text-sm text-black/45">
        Bind ERP no trae estos datos para estos productos — captúralos para
        que Skydropx los pueda cotizar.
      </p>

      {productos.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-black/10 bg-white p-8 text-center text-sm text-black/40">
          Todos los productos tienen peso y dimensiones capturados.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {productos.map((p) => (
            <div
              key={p.slug}
              className="rounded-lg border border-black/[0.06] bg-white p-4"
            >
              <p className="text-sm font-semibold text-black/80">
                {p.nombre}
              </p>
              <p className="text-xs text-black/45">SKU {p.sku}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <CampoNumero etiqueta="Peso (kg)" />
                <CampoNumero etiqueta="Largo (cm)" />
                <CampoNumero etiqueta="Ancho (cm)" />
                <CampoNumero etiqueta="Alto (cm)" />
              </div>
              <button
                onClick={() => guardar(p.slug)}
                disabled={guardando === p.slug}
                className="mt-3 min-h-[44px] rounded-lg bg-biobackup-navy px-4 py-2 text-xs font-semibold text-white transition hover:bg-biobackup-navyLight disabled:opacity-60"
              >
                {guardando === p.slug ? "Guardando..." : "Guardar"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CampoNumero({ etiqueta }: { etiqueta: string }) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block text-black/45">{etiqueta}</span>
      <input
        type="number"
        step="0.1"
        className="w-full min-h-[44px] rounded-md border border-black/10 px-2 py-1.5 text-sm outline-none transition focus:border-biobackup-blue"
      />
    </label>
  );
}
