import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { puntosLogo, ANCHO_LOGO, ALTO_LOGO } from "@lib/puntos-logo"
import { UMBRAL_ENVIO_GRATIS, formatoMXN } from "@lib/tienda"

const Hero = () => {
  return (
    <section className="mx-auto mt-4 max-w-6xl px-3 sm:px-5">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-biobackup-navy via-[#0a6aa8] to-biobackup-teal shadow-[0_30px_70px_-28px_rgba(3,80,136,0.7)]">
        {/* esferas de color */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 animate-flotar-lento rounded-full bg-biobackup-skyLight/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/3 h-80 w-80 animate-flotar-lento-2 rounded-full bg-biobackup-green/35 blur-3xl" />

        {/* patrón de puntos del logo, de adorno */}
        <svg
          viewBox={`0 0 ${ANCHO_LOGO} ${ALTO_LOGO}`}
          className="pointer-events-none absolute -right-10 top-1/2 hidden h-[135%] -translate-y-1/2 animate-flotar-lento-2 opacity-40 md:block"
          aria-hidden="true"
        >
          {puntosLogo.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={p.r}
              fill="white"
              opacity={0.35 + (i % 5) * 0.12}
            />
          ))}
        </svg>

        <div className="relative px-6 py-14 sm:px-12 sm:py-20 lg:py-24">
          <p
            className="reveal inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur"
            style={{ ["--d" as string]: 0 }}
          >
            <span className="h-2 w-2 rounded-full bg-biobackup-green" />
            Equipo médico + consumibles
          </p>
          <h1
            className="reveal mt-5 max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl"
            style={{ ["--d" as string]: 1 }}
          >
            Lo que tu hospital necesita,{" "}
            <span className="bg-gradient-to-r from-biobackup-skyLight to-biobackup-green bg-clip-text text-transparent">
              sin vueltas.
            </span>
          </h1>
          <p
            className="reveal mt-5 max-w-xl text-base text-white/85 sm:text-lg"
            style={{ ["--d" as string]: 2 }}
          >
            Equipo, diagnóstico y consumibles con disponibilidad real y envío
            rastreado a todo México.
          </p>
          <div
            className="reveal mt-8 flex flex-wrap gap-3"
            style={{ ["--d" as string]: 3 }}
          >
            <LocalizedClientLink
              href="/store"
              className="inline-flex min-h-[44px] items-center rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#035088] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Ver catálogo
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/promociones"
              className="inline-flex min-h-[44px] items-center rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              Ver promociones
            </LocalizedClientLink>
          </div>

          <div
            className="reveal mt-10 flex flex-wrap gap-2.5"
            style={{ ["--d" as string]: 4 }}
          >
            {[
              `Envío gratis desde ${formatoMXN(UMBRAL_ENVIO_GRATIS)}`,
              "Factura CFDI 4.0",
              "Envío rastreado",
            ].map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
