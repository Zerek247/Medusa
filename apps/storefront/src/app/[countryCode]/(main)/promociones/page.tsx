import { Metadata } from "next"

import { imagenGenerica, UMBRAL_ENVIO_GRATIS, formatoMXN } from "@lib/tienda"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Promociones | BioBackup",
  description: "Ofertas y beneficios vigentes de BioBackup.",
}

// Contenido de las promociones. Por ahora es texto fijo; más adelante el
// cliente podrá subir su propia imagen y editar cada promoción desde el
// panel de administración.
const PROMOCIONES = [
  {
    titulo: `Envío gratis desde ${formatoMXN(UMBRAL_ENVIO_GRATIS)}`,
    descripcion:
      "En todo el catálogo, sin código promocional -- se aplica solo al llegar al monto en tu carrito.",
    imagen: "promo-envio",
  },
  {
    titulo: "Equipo de diagnóstico",
    descripcion:
      "Monitores, desfibriladores y kits de exploración con disponibilidad inmediata.",
    imagen: "promo-diagnostico",
  },
  {
    titulo: "Oxigenoterapia para consultorio",
    descripcion:
      "Concentradores y ventiladores portátiles, con envío calculado a tu código postal.",
    imagen: "promo-oxigeno",
  },
]

export default function PromocionesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <span className="mb-2 block h-1.5 w-12 rounded-full bg-gradient-to-r from-biobackup-navy via-biobackup-blue to-biobackup-teal" />
      <h1 className="text-3xl font-extrabold tracking-tight text-biobackup-ink sm:text-4xl">
        Promociones
      </h1>
      <p className="mt-2 max-w-xl text-sm text-biobackup-ink/60">
        Ofertas y beneficios vigentes para tu hospital o consultorio.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PROMOCIONES.map((promo) => (
          <div
            key={promo.imagen}
            className="overflow-hidden rounded-3xl border border-white/70 bg-surface shadow-[0_8px_30px_-14px_rgba(3,80,136,0.35)] dark:border-white/10"
          >
            <div className="relative aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagenGenerica(promo.imagen)}
                alt={promo.titulo}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-biobackup-navy/70 via-biobackup-navy/0 to-transparent" />
              <p className="absolute bottom-3 left-4 right-4 text-lg font-bold text-white">
                {promo.titulo}
              </p>
            </div>
            <div className="p-4">
              <p className="text-sm text-biobackup-ink/65">{promo.descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <LocalizedClientLink
          href="/store"
          className="inline-flex min-h-[44px] items-center rounded-full bg-biobackup-navy px-7 py-3 text-sm font-bold text-white"
        >
          Ver catálogo
        </LocalizedClientLink>
      </div>
    </div>
  )
}
