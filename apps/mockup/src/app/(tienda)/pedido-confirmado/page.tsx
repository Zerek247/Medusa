"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatoMXN } from "@/lib/datos";

type Resumen = {
  folio: string;
  fecha: string;
  items: { nombre: string; cantidad: number; precio: number }[];
  total: number;
  paqueteria?: string;
};

export default function PedidoConfirmadoPage() {
  const [resumen, setResumen] = useState<Resumen | null>(null);

  useEffect(() => {
    try {
      const guardado = window.sessionStorage.getItem(
        "biobackup_maqueta_pedido"
      );
      if (guardado) setResumen(JSON.parse(guardado));
    } catch {
      // sin sessionStorage disponible, se muestra el estado genérico de abajo
    }
  }, []);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-biobackup-teal/15">
        <svg className="h-8 w-8 text-biobackup-teal" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <h1 className="mt-5 text-2xl font-bold text-biobackup-ink">
        ¡Pedido confirmado!
      </h1>
      <p className="mt-2 text-sm text-biobackup-ink/60">
        Simulación de confirmación — en el sitio real aquí llegaría también
        un correo con estos mismos datos.
      </p>

      {resumen && (
        <div className="mt-8 rounded-xl border border-biobackup-navy/10 p-5 text-left">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-biobackup-ink">
              Pedido {resumen.folio}
            </span>
            <span className="text-biobackup-ink/50">{resumen.fecha}</span>
          </div>
          <div className="mt-3 space-y-1.5 border-t border-biobackup-navy/10 pt-3 text-sm text-biobackup-ink/70">
            {resumen.items.map((i, idx) => (
              <div key={idx} className="flex justify-between">
                <span>
                  {i.nombre} × {i.cantidad}
                </span>
                <span>{formatoMXN(i.precio * i.cantidad)}</span>
              </div>
            ))}
          </div>
          {resumen.paqueteria && (
            <p className="mt-3 text-xs text-biobackup-ink/50">
              Envío: {resumen.paqueteria}
            </p>
          )}
          <div className="mt-3 flex justify-between border-t border-biobackup-navy/10 pt-3 text-base font-bold text-biobackup-navy">
            <span>Total</span>
            <span>{formatoMXN(resumen.total)}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/cuenta/pedidos"
          className="rounded-full bg-biobackup-navy px-6 py-3 text-sm font-semibold text-white hover:bg-biobackup-navyLight"
        >
          Ver mis pedidos
        </Link>
        <Link
          href="/tienda"
          className="rounded-full border border-biobackup-navy/20 px-6 py-3 text-sm font-semibold text-biobackup-ink hover:border-biobackup-blue"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
