import Link from "next/link";
import ImagenProducto from "@/components/imagen-producto";
import { categorias, productos, UMBRAL_ENVIO_GRATIS, formatoMXN } from "@/lib/datos";

export default function Home() {
  const destacados = productos.slice(0, 4);

  return (
    <div>
      {/* Hero -- en el sistema real esta imagen de fondo y el texto son
          editables desde el panel (el cliente pidió poder subir su propia
          imagen y cambiar el texto sin depender de un desarrollador). */}
      <section className="relative overflow-hidden">
        <img
          src="https://picsum.photos/seed/biobackup-hero/1600/900"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-biobackup-navy/92 via-biobackup-navy/80 to-biobackup-teal/70" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-sm font-semibold uppercase tracking-wide text-biobackup-skyLight">
            Equipo médico + consumibles
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold text-white sm:text-5xl">
            Lo que tu consultorio necesita, sin vueltas.
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
            Equipo, diagnóstico y consumibles con disponibilidad real y
            envío rastreado a todo México.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/tienda"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-biobackup-navy transition hover:bg-biobackup-paper"
            >
              Ver catálogo
            </Link>
            <Link
              href="/promociones"
              className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Ver promociones
            </Link>
          </div>
        </div>
      </section>

      <div className="bg-biobackup-navy py-2.5 text-center text-sm font-medium text-white">
        Envío gratis en pedidos mayores a {formatoMXN(UMBRAL_ENVIO_GRATIS)}
      </div>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-xl font-bold text-biobackup-ink">
          Categorías
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categorias.map((c) => (
            <Link
              key={c.slug}
              href={`/tienda/${c.slug}`}
              className="group flex h-28 flex-col justify-end rounded-xl border border-biobackup-navy/10 bg-white p-4 shadow-sm transition hover:border-biobackup-blue hover:shadow-md"
            >
              <span className="text-sm font-semibold text-biobackup-ink group-hover:text-biobackup-blue">
                {c.nombre}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-biobackup-ink">
            Más solicitados
          </h2>
          <Link
            href="/tienda"
            className="text-sm font-semibold text-biobackup-blue hover:underline"
          >
            Ver todo
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {destacados.map((p) => (
            <Link
              key={p.slug}
              href={`/producto/${p.slug}`}
              className="group overflow-hidden rounded-xl border border-biobackup-navy/10 bg-white shadow-sm transition hover:shadow-md"
            >
              <ImagenProducto nombre={p.nombre} slug={p.slug} className="aspect-square" />
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium text-biobackup-ink">
                  {p.nombre}
                </p>
                <p className="mt-1 text-sm font-bold text-biobackup-navy">
                  {formatoMXN(p.precio)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
