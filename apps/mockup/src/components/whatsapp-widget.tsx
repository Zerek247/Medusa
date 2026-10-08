"use client";

import { useEffect, useRef, useState } from "react";
import { contactosWhatsapp } from "@/lib/contactos-whatsapp";

const COLOR_AVATAR: Record<string, string> = {
  navy: "bg-biobackup-navy",
  blue: "bg-biobackup-blue",
  teal: "bg-biobackup-teal",
};

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function WhatsappWidget() {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function alClicFuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    if (abierto) document.addEventListener("mousedown", alClicFuera);
    return () => document.removeEventListener("mousedown", alClicFuera);
  }, [abierto]);

  return (
    <div ref={ref} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {abierto && (
        <div className="w-[320px] max-w-[calc(100vw-2.5rem)] origin-bottom-right animate-[whatsapp-pop_.18s_ease-out] overflow-hidden rounded-2xl border border-black/5 bg-surface shadow-2xl">
          <div className="bg-gradient-to-br from-biobackup-navy to-biobackup-teal px-4 py-4">
            <p className="text-sm font-semibold text-white">
              Escríbenos por WhatsApp
            </p>
            <p className="mt-0.5 text-xs text-white/75">
              Normalmente respondemos en unos minutos
            </p>
          </div>

          <div className="max-h-[320px] divide-y divide-black/5 overflow-y-auto">
            {contactosWhatsapp.map((c) => (
              <a
                key={c.numero}
                href={`https://wa.me/${c.numero}?text=${encodeURIComponent(
                  "Hola, vengo del sitio de BioBackup y quisiera más información."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-biobackup-paper"
              >
                <div className="relative shrink-0">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${COLOR_AVATAR[c.color]}`}
                  >
                    {iniciales(c.nombre)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-biobackup-ink">
                    {c.nombre}
                  </p>
                  <p className="truncate text-xs text-biobackup-ink/50">
                    {c.area}
                  </p>
                </div>
                <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.52 3.48A11.86 11.86 0 0012.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L0 24l6.4-1.68a11.83 11.83 0 005.64 1.44h.01c6.54 0 11.85-5.3 11.85-11.84 0-3.16-1.23-6.13-3.38-8.44zM12.05 21.5h-.01a9.7 9.7 0 01-4.95-1.36l-.35-.21-3.68.96.98-3.58-.23-.37a9.66 9.66 0 01-1.48-5.1c0-5.35 4.37-9.7 9.73-9.7a9.66 9.66 0 016.87 2.85 9.6 9.6 0 012.85 6.86c0 5.35-4.37 9.65-9.73 9.65zm5.33-7.24c-.29-.15-1.72-.85-1.99-.94-.27-.1-.46-.15-.66.14-.2.29-.75.94-.92 1.13-.17.2-.34.22-.63.07-.29-.14-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.6-2-.17-.29-.02-.44.13-.59.13-.13.29-.34.43-.5.14-.17.19-.29.29-.48.1-.2.05-.37-.02-.51-.07-.15-.66-1.6-.91-2.18-.24-.58-.48-.5-.66-.5h-.56c-.2 0-.51.07-.78.36-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.19 3.02c.15.2 2.06 3.15 5 4.41.7.3 1.24.48 1.67.62.7.22 1.34.19 1.84.12.56-.08 1.72-.7 1.97-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.2-.55-.34z" />
                </svg>
              </a>
            ))}
          </div>

          <div className="border-t border-black/5 px-4 py-2 text-center text-[11px] text-biobackup-ink/40">
            Contactos simulados — maqueta visual
          </div>
        </div>
      )}

      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? "Cerrar WhatsApp" : "Abrir WhatsApp"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:scale-105 hover:bg-emerald-600 active:scale-95"
      >
        {abierto ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.52 3.48A11.86 11.86 0 0012.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L0 24l6.4-1.68a11.83 11.83 0 005.64 1.44h.01c6.54 0 11.85-5.3 11.85-11.84 0-3.16-1.23-6.13-3.38-8.44zM12.05 21.5h-.01a9.7 9.7 0 01-4.95-1.36l-.35-.21-3.68.96.98-3.58-.23-.37a9.66 9.66 0 01-1.48-5.1c0-5.35 4.37-9.7 9.73-9.7a9.66 9.66 0 016.87 2.85 9.6 9.6 0 012.85 6.86c0 5.35-4.37 9.65-9.73 9.65zm5.33-7.24c-.29-.15-1.72-.85-1.99-.94-.27-.1-.46-.15-.66.14-.2.29-.75.94-.92 1.13-.17.2-.34.22-.63.07-.29-.14-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.6-2-.17-.29-.02-.44.13-.59.13-.13.29-.34.43-.5.14-.17.19-.29.29-.48.1-.2.05-.37-.02-.51-.07-.15-.66-1.6-.91-2.18-.24-.58-.48-.5-.66-.5h-.56c-.2 0-.51.07-.78.36-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.19 3.02c.15.2 2.06 3.15 5 4.41.7.3 1.24.48 1.67.62.7.22 1.34.19 1.84.12.56-.08 1.72-.7 1.97-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.2-.55-.34z" />
          </svg>
        )}
      </button>
    </div>
  );
}
