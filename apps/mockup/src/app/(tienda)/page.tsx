import Link from "next/link";
import TarjetaProducto from "@/components/tarjeta-producto";
import { categorias, productos, UMBRAL_ENVIO_GRATIS, formatoMXN } from "@/lib/datos";
import { puntosLogo, ANCHO_LOGO, ALTO_LOGO } from "@/lib/puntos-logo";

// Un degradado distinto por categoría -- jugar con los colores de la
// marca en vez de tarjetas planas.
const ESTILO_CATEGORIA = [
  { fondo: "from-biobackup-navy to-biobackup-blue", texto: "text-white", sub: "text-white/70" },
  { fondo: "from-biobackup-blue to-biobackup-teal", texto: "text-white", sub: "text-white/75" },
  { fondo: "from-biobackup-teal to-biobackup-green", texto: "text-slate-900", sub: "text-slate-900/70" },
  { fondo: "from-biobackup-slate to-biobackup-skyLight", texto: "text-slate-900", sub: "text-slate-900/70" },
];

const BENEFICIOS = [
  {
    titulo: "Disponibilidad real",
    texto: "Lo que ves en existencia está sincronizado con nuestro inventario.",
    color: "from-biobackup-navy to-biobackup-blue",
    icono: "M20.25 7.5l-8.25-4.5L3.75 7.5m16.5 0l-8.25 4.5m8.25-4.5v9l-8.25 4.5m0-9L3.75 7.5m8.25 4.5v9M3.75 7.5v9l8.25 4.5",
  },
  {
    titulo: "Envío rastreado",
    texto: "Guía y estatus de cada pedido, de la bodega a tu hospital.",
    color: "from-biobackup-blue to-biobackup-teal",
    icono: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25h-5.322c-.55 0-.988.394-1.152.913l-2.632 6.25c-.11.263-.164.549-.164.837v.75c0 .621.504 1.125 1.125 1.125H2.25",
  },
  {
    titulo: "Factura CFDI 4.0",
    texto: "Captura tus datos fiscales al pagar y listo, sin trámites después.",
    color: "from-biobackup-teal to-biobackup-green",
    icono: "M9 12h6m-6 3.75h6M6 4.5h8.379a1.5 1.5 0 011.06.44l2.622 2.62a1.5 1.5 0 01.44 1.061V19.5a1.5 1.5 0 01-1.5 1.5H6a1.5 1.5 0 01-1.5-1.5V6A1.5 1.5 0 016 4.5z",
  },
];

function Titulo({ children, enlace }: { children: React.ReactNode; enlace?: { href: string; texto: string } }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <span className="mb-2 block h-1.5 w-12 rounded-full bg-gradient-to-r from-biobackup-navy via-biobackup-blue to-biobackup-teal" />
        <h2 className="text-2xl font-extrabold tracking-tight text-biobackup-ink sm:text-3xl">
          {children}
        </h2>
      </div>
      {enlace && (
        <Link
          href={enlace.href}
          className="inline-flex min-h-[44px] shrink-0 items-center rounded-full bg-biobackup-blue/10 px-4 py-2 text-sm font-semibold text-biobackup-blue transition hover:bg-biobackup-blue hover:text-white"
        >
          {enlace.texto}
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const destacados = productos.slice(0, 4);

  return (
    <div className="pb-4">
      {/* ---------- Héroe ---------- */}
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
              <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="white" opacity={0.35 + (i % 5) * 0.12} />
            ))}
          </svg>

          <div className="relative px-6 py-14 sm:px-12 sm:py-20 lg:py-24">
            <p className="reveal inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur" style={{ ["--d" as string]: 0 }}>
              <span className="h-2 w-2 rounded-full bg-biobackup-green" />
              Equipo médico + consumibles
            </p>
            <h1 className="reveal mt-5 max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl" style={{ ["--d" as string]: 1 }}>
              Lo que tu hospital necesita,{" "}
              <span className="bg-gradient-to-r from-biobackup-skyLight to-biobackup-green bg-clip-text text-transparent">
                sin vueltas.
              </span>
            </h1>
            <p className="reveal mt-5 max-w-xl text-base text-white/85 sm:text-lg" style={{ ["--d" as string]: 2 }}>
              Equipo, diagnóstico y consumibles con disponibilidad real y
              envío rastreado a todo México.
            </p>
            <div className="reveal mt-8 flex flex-wrap gap-3" style={{ ["--d" as string]: 3 }}>
              <Link
                href="/tienda"
                className="rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#035088] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Ver catálogo
              </Link>
              <Link
                href="/promociones"
                className="rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                Ver promociones
              </Link>
            </div>

            <div className="reveal mt-10 flex flex-wrap gap-2.5" style={{ ["--d" as string]: 4 }}>
              {[
                `Envío gratis desde ${formatoMXN(UMBRAL_ENVIO_GRATIS)}`,
                "Factura CFDI 4.0",
                "Envío rastreado",
              ].map((t) => (
                <span key={t} className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Categorías ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <div className="reveal" style={{ ["--d" as string]: 5 }}>
          <Titulo>Explora por categoría</Titulo>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categorias.map((c, i) => {
            const e = ESTILO_CATEGORIA[i % ESTILO_CATEGORIA.length];
            return (
              <Link
                key={c.slug}
                href={`/tienda/${c.slug}`}
                className={`reveal group relative flex h-40 flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br ${e.fondo} p-5 shadow-lg transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl sm:h-44`}
                style={{ ["--d" as string]: 6 + i }}
              >
                <span className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/20 transition duration-500 group-hover:scale-125" />
                <span className="pointer-events-none absolute right-6 top-10 h-10 w-10 rounded-full bg-white/15 transition duration-500 group-hover:translate-x-2" />
                <span className={`relative text-base font-extrabold leading-tight ${e.texto}`}>
                  {c.nombre}
                </span>
                <span className={`relative mt-1 text-xs font-semibold ${e.sub}`}>
                  Ver productos →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------- Más solicitados ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <div className="reveal" style={{ ["--d" as string]: 8 }}>
          <Titulo enlace={{ href: "/tienda", texto: "Ver todo" }}>Más solicitados</Titulo>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {destacados.map((p, i) => (
            <div key={p.slug} className="reveal" style={{ ["--d" as string]: 9 + i }}>
              <TarjetaProducto p={p} />
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Beneficios ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {BENEFICIOS.map((b, i) => (
            <div
              key={b.titulo}
              className="reveal flex items-start gap-4 rounded-3xl border border-white/70 bg-surface/80 p-5 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur dark:border-white/10"
              style={{ ["--d" as string]: 13 + i }}
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${b.color} text-white shadow-md`}>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={b.icono} />
                </svg>
              </span>
              <div>
                <p className="text-sm font-extrabold text-biobackup-ink">{b.titulo}</p>
                <p className="mt-1 text-sm leading-relaxed text-biobackup-ink/65">{b.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
