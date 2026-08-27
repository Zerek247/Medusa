"use client";

import { useState } from "react";
import { colaFallidos as listaInicial } from "@/lib/datos";

export default function ColaFallidosPanel() {
  const [lista, setLista] = useState(listaInicial);
  const [reintentando, setReintentando] = useState<string | null>(null);

  function reintentar(orden: string) {
    setReintentando(orden);
    setTimeout(() => {
      setLista((prev) => prev.filter((t) => t.orden !== orden));
      setReintentando(null);
    }, 1200);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-black/80">Cola de fallidos</h1>
      <p className="mt-1 text-sm text-black/45">
        Tareas post-pago (registrar venta, timbrar CFDI, generar guía, enviar
        correo) que agotaron sus 3 reintentos.
      </p>

      {lista.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-black/10 bg-white p-8 text-center text-sm text-black/40">
          No hay tareas fallidas pendientes.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {lista.map((t) => (
            <div
              key={t.orden}
              className="rounded-lg border border-black/[0.06] bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-black/80">
                  {t.tarea}
                </p>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  {t.intentos} intento(s)
                </span>
              </div>
              <p className="mt-1 text-xs text-black/45">
                Orden {t.orden} — falló {t.fecha}
              </p>
              <p className="mt-2 rounded-md bg-black/[0.03] p-2 font-mono text-xs text-black/60">
                {t.error}
              </p>
              <button
                onClick={() => reintentar(t.orden)}
                disabled={reintentando === t.orden}
                className="mt-3 rounded-lg bg-biobackup-navy px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-biobackup-navyLight disabled:opacity-60"
              >
                {reintentando === t.orden ? "Reintentando..." : "Reintentar"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
