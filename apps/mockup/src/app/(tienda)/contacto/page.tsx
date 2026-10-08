"use client";

import { useState, type FormEvent } from "react";

// Datos de contacto tomados de la Presentación Institucional del cliente.
const CONTACTO = [
  {
    etiqueta: "Teléfono",
    valor: "55 5833 0938",
    href: "tel:+525558330938",
    color: "from-biobackup-navy to-biobackup-blue",
    icono: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
  },
  {
    etiqueta: "WhatsApp",
    valor: "614 314 3157",
    href: "https://wa.me/526143143157",
    color: "from-emerald-500 to-biobackup-green",
    icono: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 1.6.5 3.09 1.36 4.35L3.75 20.25l4.2-.93A9.77 9.77 0 0012 20.25z",
  },
  {
    etiqueta: "Correo electrónico",
    valor: "Ventas@biobackup.mx",
    href: "mailto:Ventas@biobackup.mx",
    color: "from-biobackup-blue to-biobackup-teal",
    icono: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
  },
  {
    etiqueta: "Facebook e Instagram",
    valor: "BioBackup",
    href: undefined,
    color: "from-biobackup-teal to-biobackup-green",
    icono: "M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z",
  },
];

export default function ContactoPage() {
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
    }, 900);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <span className="mb-2 block h-1.5 w-12 rounded-full bg-gradient-to-r from-biobackup-navy via-biobackup-blue to-biobackup-teal" />
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-biobackup-blue">
        Contacto
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-biobackup-ink sm:text-4xl">
        Hablemos
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-biobackup-ink/65">
        Escríbenos o llámanos: con gusto te asesoramos sobre productos,
        pedidos institucionales o licitaciones.
      </p>

      <div className="mt-9 grid gap-6 md:grid-cols-5">
        <div className="space-y-3 md:col-span-2">
          {CONTACTO.map((c) => {
            const contenido = (
              <>
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${c.color} text-white shadow-md`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={c.icono} />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-biobackup-ink/50">
                    {c.etiqueta}
                  </span>
                  <span className="block truncate text-sm font-extrabold text-biobackup-ink">
                    {c.valor}
                  </span>
                </span>
              </>
            );
            const clases =
              "flex items-center gap-4 rounded-3xl border border-white/70 bg-surface/80 p-4 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur transition dark:border-white/10";
            return c.href ? (
              <a
                key={c.etiqueta}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={`${clases} hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-16px_rgba(0,143,205,0.5)]`}
              >
                {contenido}
              </a>
            ) : (
              <div key={c.etiqueta} className={clases}>
                {contenido}
              </div>
            );
          })}
        </div>

        <div className="md:col-span-3">
          {enviado ? (
            <div className="flex h-full min-h-[18rem] flex-col items-center justify-center gap-2 rounded-3xl border border-white/70 bg-surface/80 p-8 text-center shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur dark:border-white/10">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-biobackup-teal/15 text-biobackup-teal">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <p className="text-lg font-extrabold text-biobackup-ink">¡Gracias!</p>
              <p className="text-sm text-biobackup-ink/65">Te respondemos pronto.</p>
            </div>
          ) : (
            <form
              onSubmit={enviar}
              className="space-y-4 rounded-3xl border border-white/70 bg-surface/80 p-6 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur dark:border-white/10"
            >
              <Campo etiqueta="Nombre" />
              <Campo etiqueta="Correo" type="email" />
              <label className="block text-sm">
                <span className="mb-1 block font-semibold text-biobackup-ink/70">
                  Mensaje
                </span>
                <textarea
                  rows={4}
                  required
                  className="w-full rounded-2xl border border-biobackup-navy/20 px-3.5 py-2.5 outline-none transition focus:border-biobackup-blue"
                />
              </label>
              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-full bg-biobackup-navy py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {enviando ? "Enviando..." : "Enviar mensaje"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Campo({ etiqueta, type = "text" }: { etiqueta: string; type?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-biobackup-ink/70">{etiqueta}</span>
      <input
        type={type}
        required
        className="w-full rounded-2xl border border-biobackup-navy/20 px-3.5 py-2.5 outline-none transition focus:border-biobackup-blue"
      />
    </label>
  );
}
