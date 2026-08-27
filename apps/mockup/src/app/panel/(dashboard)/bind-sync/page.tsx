"use client";

import { useState } from "react";
import { bitacoraBind as bitacoraInicial } from "@/lib/datos";

export default function BindSyncPanel() {
  const [bitacora, setBitacora] = useState(bitacoraInicial);
  const [sincronizando, setSincronizando] = useState(false);

  function sincronizarAhora() {
    setSincronizando(true);
    setTimeout(() => {
      setBitacora((prev) => [
        {
          fecha: new Date().toLocaleString("es-MX", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
          origen: "Manual",
          productos: 60,
          creados: 0,
          actualizados: 60,
          fallidos: 0,
          requierenEnvio: 3,
        },
        ...prev,
      ]);
      setSincronizando(false);
    }, 1500);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-black/80">
            Sincronizaciones con Bind ERP
          </h1>
          <p className="mt-1 text-sm text-black/45">
            Las últimas corridas (programadas cada 15 min, o disparadas a mano).
          </p>
        </div>
        <button
          onClick={sincronizarAhora}
          disabled={sincronizando}
          className="rounded-lg bg-biobackup-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-biobackup-navyLight disabled:opacity-60"
        >
          {sincronizando ? "Sincronizando..." : "Sincronizar ahora"}
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-black/[0.06] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] text-left text-xs font-medium uppercase tracking-wide text-black/40">
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Origen</th>
              <th className="px-4 py-3">Productos</th>
              <th className="px-4 py-3">Creados</th>
              <th className="px-4 py-3">Actualizados</th>
              <th className="px-4 py-3">Fallidos</th>
              <th className="px-4 py-3">Requieren envío</th>
            </tr>
          </thead>
          <tbody>
            {bitacora.map((c, i) => (
              <tr key={i} className="border-b border-black/[0.04] last:border-0">
                <td className="px-4 py-3 text-black/70">{c.fecha}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.origen === "Manual"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.origen}
                  </span>
                </td>
                <td className="px-4 py-3 text-black/70">{c.productos}</td>
                <td className="px-4 py-3 text-black/70">{c.creados}</td>
                <td className="px-4 py-3 text-black/70">{c.actualizados}</td>
                <td className="px-4 py-3">
                  {c.fallidos > 0 ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      {c.fallidos}
                    </span>
                  ) : (
                    <span className="text-black/40">0</span>
                  )}
                </td>
                <td className="px-4 py-3 text-black/70">{c.requierenEnvio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
