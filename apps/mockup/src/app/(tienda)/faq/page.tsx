"use client";

import { useState } from "react";
import { preguntasFrecuentes } from "@/lib/datos";

export default function FaqPage() {
  const [abierta, setAbierta] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-bold text-biobackup-ink sm:text-3xl">
        Preguntas frecuentes
      </h1>

      <div className="mt-8 divide-y divide-biobackup-navy/10 rounded-xl border border-biobackup-navy/10 bg-white">
        {preguntasFrecuentes.map((item, i) => {
          const abiertaAhora = abierta === i;
          return (
            <div key={i}>
              <button
                onClick={() => setAbierta(abiertaAhora ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-biobackup-ink">
                  {item.pregunta}
                </span>
                <span
                  className={`shrink-0 text-biobackup-navy transition-transform ${abiertaAhora ? "rotate-45" : ""}`}
                >
                  +
                </span>
              </button>
              {abiertaAhora && (
                <p className="px-5 pb-4 text-sm leading-relaxed text-biobackup-ink/65">
                  {item.respuesta}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
