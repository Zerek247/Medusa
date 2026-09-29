"use client";

import { useState } from "react";

export default function ContactoPage() {
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
    }, 900);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-bold text-biobackup-ink sm:text-3xl">
        Contacto
      </h1>
      <p className="mt-2 text-sm text-biobackup-ink/60">
        ¿Tienes dudas sobre un producto, un pedido institucional, o algo que
        no encontraste en el catálogo? Escríbenos.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-biobackup-navy/10 bg-white p-5 text-sm text-biobackup-ink/70">
          <div>
            <p className="font-semibold text-biobackup-ink">Correo</p>
            <p>ventas@biobackup.mx</p>
          </div>
          <div>
            <p className="font-semibold text-biobackup-ink">Teléfono</p>
            <p>55 1234 5678</p>
          </div>
          <div>
            <p className="font-semibold text-biobackup-ink">Ubicación</p>
            <p>Ciudad de México</p>
          </div>
          <div>
            <p className="font-semibold text-biobackup-ink">Horario</p>
            <p>Lunes a viernes, 9:00 a 18:00</p>
          </div>
        </div>

        {enviado ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-biobackup-navy/10 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-biobackup-navy">
              ¡Gracias! Te respondemos pronto.
            </p>
          </div>
        ) : (
          <form onSubmit={enviar} className="space-y-3 rounded-xl border border-biobackup-navy/10 bg-white p-5">
            <Campo etiqueta="Nombre" />
            <Campo etiqueta="Correo" type="email" />
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-biobackup-ink/70">
                Mensaje
              </span>
              <textarea
                rows={4}
                required
                className="w-full rounded-lg border border-biobackup-navy/20 px-3 py-2 outline-none transition focus:border-biobackup-blue"
              />
            </label>
            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-full bg-biobackup-navy py-2.5 text-sm font-semibold text-white transition hover:bg-biobackup-navyLight disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Enviar mensaje"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Campo({ etiqueta, type = "text" }: { etiqueta: string; type?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-biobackup-ink/70">{etiqueta}</span>
      <input
        type={type}
        required
        className="w-full rounded-lg border border-biobackup-navy/20 px-3 py-2 outline-none transition focus:border-biobackup-blue"
      />
    </label>
  );
}
