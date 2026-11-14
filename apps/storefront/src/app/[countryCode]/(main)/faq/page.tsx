"use client"

import { useState } from "react"

// Texto editable aquí por ahora; más adelante puede administrarse desde
// el panel de Medusa.
const PREGUNTAS = [
  {
    pregunta: "¿Cuánto tarda en llegar mi pedido?",
    respuesta:
      "Depende de la paquetería elegida: de 1-2 días hábiles con envío Express, o 3-5 días hábiles con envío Terrestre estándar. Para equipo grande que requiere cotización aparte, te contactamos con el tiempo estimado antes de confirmar el envío.",
  },
  {
    pregunta: "¿A partir de qué monto el envío es gratis?",
    respuesta:
      "En pedidos mayores a $3,000 MXN el envío no tiene costo, sin importar la paquetería elegida.",
  },
  {
    pregunta: "¿Emiten factura?",
    respuesta:
      "Sí, todas las compras se facturan con CFDI 4.0. Captura tus datos fiscales (RFC, razón social, régimen fiscal y uso de CFDI) durante el checkout.",
  },
  {
    pregunta: "¿Puedo rastrear mi pedido sin crear una cuenta?",
    respuesta:
      'Sí -- usa la sección "Rastrear pedido" con tu número de pedido y el correo con el que compraste.',
  },
  {
    pregunta: "¿Tienen garantía los equipos?",
    respuesta:
      "Todos los equipos cuentan con garantía del fabricante. El periodo exacto varía por producto y se indica en su ficha.",
  },
  {
    pregunta: "¿Venden a hospitales y clínicas, no solo consultorios?",
    respuesta:
      "Sí, atendemos tanto compras individuales de consultorio como pedidos institucionales de hospitales y clínicas.",
  },
]

export default function FaqPage() {
  const [abierta, setAbierta] = useState<number | null>(0)

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <span className="mb-2 block h-1.5 w-12 rounded-full bg-gradient-to-r from-biobackup-navy via-biobackup-blue to-biobackup-teal" />
      <h1 className="text-3xl font-extrabold tracking-tight text-biobackup-ink sm:text-4xl">
        Preguntas frecuentes
      </h1>

      <div className="mt-8 divide-y divide-biobackup-navy/10 overflow-hidden rounded-3xl border border-white/70 bg-surface/80 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur dark:border-white/10">
        {PREGUNTAS.map((item, i) => {
          const abiertaAhora = abierta === i
          return (
            <div key={item.pregunta}>
              <button
                onClick={() => setAbierta(abiertaAhora ? null : i)}
                aria-expanded={abiertaAhora}
                className="flex min-h-[44px] w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold text-biobackup-ink">
                  {item.pregunta}
                </span>
                <span
                  className={`shrink-0 text-xl leading-none text-biobackup-blue transition-transform ${
                    abiertaAhora ? "rotate-45" : ""
                  }`}
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
          )
        })}
      </div>
    </div>
  )
}
