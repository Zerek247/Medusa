"use client";

import { useState, type FormEvent, type ReactNode } from "react";

// Datos de contacto tomados de la Presentación Institucional del cliente.

const WHATSAPP_PATH =
  "M20.52 3.48A11.86 11.86 0 0012.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L0 24l6.4-1.68a11.83 11.83 0 005.64 1.44h.01c6.54 0 11.85-5.3 11.85-11.84 0-3.16-1.23-6.13-3.38-8.44zM12.05 21.5h-.01a9.7 9.7 0 01-4.95-1.36l-.35-.21-3.68.96.98-3.58-.23-.37a9.66 9.66 0 01-1.48-5.1c0-5.35 4.37-9.7 9.73-9.7a9.66 9.66 0 016.87 2.85 9.6 9.6 0 012.85 6.86c0 5.35-4.37 9.65-9.73 9.65zm5.33-7.24c-.29-.15-1.72-.85-1.99-.94-.27-.1-.46-.15-.66.14-.2.29-.75.94-.92 1.13-.17.2-.34.22-.63.07-.29-.14-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.6-2-.17-.29-.02-.44.13-.59.13-.13.29-.34.43-.5.14-.17.19-.29.29-.48.1-.2.05-.37-.02-.51-.07-.15-.66-1.6-.91-2.18-.24-.58-.48-.5-.66-.5h-.56c-.2 0-.51.07-.78.36-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.19 3.02c.15.2 2.06 3.15 5 4.41.7.3 1.24.48 1.67.62.7.22 1.34.19 1.84.12.56-.08 1.72-.7 1.97-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.2-.55-.34z";

// Logos de cada red, dibujados a mano (sin librería de íconos).
const ICONO_TELEFONO = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const ICONO_WHATSAPP = (
  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d={WHATSAPP_PATH} />
  </svg>
);

const ICONO_CORREO = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const ICONO_FACEBOOK = (
  <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
    <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.6V21h2.9z" />
  </svg>
);

const ICONO_INSTAGRAM = (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

type Dato = {
  etiqueta: string;
  valor: string;
  href?: string;
  fondo: string; // clases del cuadro del ícono
  icono: ReactNode;
};

const CONTACTO: Dato[] = [
  {
    etiqueta: "Teléfono",
    valor: "55 5833 0938",
    href: "tel:+525558330938",
    fondo: "bg-gradient-to-br from-biobackup-navy to-biobackup-blue",
    icono: ICONO_TELEFONO,
  },
  {
    etiqueta: "WhatsApp",
    valor: "614 314 3157",
    href: "https://wa.me/526143143157",
    fondo: "bg-[#25D366]",
    icono: ICONO_WHATSAPP,
  },
  {
    etiqueta: "Correo electrónico",
    valor: "Ventas@biobackup.mx",
    href: "mailto:Ventas@biobackup.mx",
    fondo: "bg-gradient-to-br from-biobackup-blue to-biobackup-teal",
    icono: ICONO_CORREO,
  },
];

const REDES: Dato[] = [
  {
    etiqueta: "Facebook",
    valor: "BioBackup",
    fondo: "bg-[#1877F2]",
    icono: ICONO_FACEBOOK,
  },
  {
    etiqueta: "Instagram",
    valor: "BioBackup",
    fondo: "bg-[linear-gradient(45deg,#FEDA75_0%,#FA7E1E_30%,#D62976_60%,#4F5BD5_100%)]",
    icono: ICONO_INSTAGRAM,
  },
];

const TARJETA =
  "rounded-3xl border border-white/70 bg-surface/80 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur transition dark:border-white/10";
const TARJETA_CLIC =
  "hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-16px_rgba(0,143,205,0.5)]";

function Cuadro({ fondo, children }: { fondo: string; children: ReactNode }) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ${fondo}`}
    >
      {children}
    </span>
  );
}

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
          {CONTACTO.map((c) => (
            <a
              key={c.etiqueta}
              href={c.href}
              target={c.href?.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`flex items-center gap-4 p-4 ${TARJETA} ${TARJETA_CLIC}`}
            >
              <Cuadro fondo={c.fondo}>{c.icono}</Cuadro>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-wider text-biobackup-ink/50">
                  {c.etiqueta}
                </span>
                <span className="block truncate text-sm font-extrabold text-biobackup-ink">
                  {c.valor}
                </span>
              </span>
            </a>
          ))}

          <div className="grid grid-cols-2 gap-3">
            {REDES.map((r) => (
              <div
                key={r.etiqueta}
                className={`flex flex-col items-start gap-3 p-4 ${TARJETA}`}
              >
                <Cuadro fondo={r.fondo}>{r.icono}</Cuadro>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-biobackup-ink/50">
                    {r.etiqueta}
                  </span>
                  <span className="block truncate text-sm font-extrabold text-biobackup-ink">
                    {r.valor}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-3">
          {enviado ? (
            <div className={`flex h-full min-h-[18rem] flex-col items-center justify-center gap-2 p-8 text-center ${TARJETA}`}>
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-biobackup-teal/15 text-biobackup-teal">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <p className="text-lg font-extrabold text-biobackup-ink">¡Gracias!</p>
              <p className="text-sm text-biobackup-ink/65">Te respondemos pronto.</p>
            </div>
          ) : (
            <form onSubmit={enviar} className={`space-y-4 p-6 ${TARJETA}`}>
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
