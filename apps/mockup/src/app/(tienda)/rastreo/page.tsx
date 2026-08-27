"use client";

import { useState } from "react";
import { pedidosDemo } from "@/lib/datos";

export default function RastreoPage() {
  const [folio, setFolio] = useState("");
  const [correo, setCorreo] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState<
    "inicial" | "encontrado" | "no-encontrado"
  >("inicial");

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    setBuscando(true);
    setTimeout(() => {
      const existe = pedidosDemo.some((p) => p.folio === folio.trim());
      setResultado(existe ? "encontrado" : "no-encontrado");
      setBuscando(false);
    }, 700);
  }

  const pedido = pedidosDemo.find((p) => p.folio === folio.trim());

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-biobackup-ink">
        Rastrear pedido
      </h1>
      <p className="mt-2 text-sm text-biobackup-ink/60">
        Prueba con el folio <strong>#1042</strong> y cualquier correo.
      </p>

      <form onSubmit={buscar} className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-biobackup-ink/70">
            Número de pedido
          </span>
          <input
            type="text"
            value={folio}
            onChange={(e) => setFolio(e.target.value)}
            placeholder="#1042"
            className="w-full rounded-lg border border-biobackup-navy/20 px-3 py-2 outline-none transition focus:border-biobackup-blue"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-biobackup-ink/70">
            Correo con el que compraste
          </span>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="w-full rounded-lg border border-biobackup-navy/20 px-3 py-2 outline-none transition focus:border-biobackup-blue"
          />
        </label>
        <button
          type="submit"
          disabled={buscando}
          className="w-full rounded-full bg-biobackup-navy py-3 text-sm font-semibold text-white transition hover:bg-biobackup-navyLight disabled:opacity-60"
        >
          {buscando ? "Buscando..." : "Rastrear"}
        </button>
      </form>

      {resultado === "no-encontrado" && (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          No encontramos un pedido con esos datos.
        </p>
      )}

      {resultado === "encontrado" && pedido && (
        <div className="mt-6 rounded-xl border border-biobackup-navy/10 p-5">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-biobackup-ink">
              {pedido.folio}
            </span>
            <span className="text-biobackup-ink/50">{pedido.fecha}</span>
          </div>
          <p className="mt-1 text-sm font-medium text-biobackup-teal">
            {pedido.estatus}
          </p>
          {pedido.guia && (
            <p className="mt-2 text-xs text-biobackup-ink/60">
              Guía de rastreo: {pedido.guia}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
