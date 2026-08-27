import Link from "next/link";
import ImagenProducto from "@/components/imagen-producto";
import { categorias, productos } from "@/lib/datos";

export default function Home() {
  const destacados = productos.slice(0, 4);

  return (
    <div>
      <section className="bg-biobackup-gradient">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-sm font-semibold uppercase tracking-wide text-biobackup-tealLight">
            Equipo médico + consumibles
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold text-white sm:text-5xl">
            Lo que tu consultorio necesita, sin vueltas.
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
            Equipo, diagnóstico y consumibles con disponibilidad real y
            envío rastreado a todo México.
          </p>
          <Link
            href="/tienda"
            className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-biobackup-navy transition hover:bg-biobackup-paper"
          >
            Ver catálogo
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-xl font-bold text-biobackup-ink">
          Categorías
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categorias.map((c) => (
            <Link
              key={c.slug}
              href={`/tienda/${c.slug}`}
              className="group flex h-28 flex-col justify-end rounded-xl border border-biobackup-navy/10 bg-biobackup-paper p-4 transition hover:border-biobackup-blue hover:shadow-sm"
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
              className="group overflow-hidden rounded-xl border border-biobackup-navy/10 transition hover:shadow-md"
            >
              <ImagenProducto nombre={p.nombre} className="aspect-square" />
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium text-biobackup-ink">
                  {p.nombre}
                </p>
                <p className="mt-1 text-sm font-bold text-biobackup-navy">
                  {p.precio.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
