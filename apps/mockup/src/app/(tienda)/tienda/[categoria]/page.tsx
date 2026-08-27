import { notFound } from "next/navigation";
import Catalogo from "@/components/catalogo";
import { categorias, nombreCategoria, productosPorCategoria } from "@/lib/datos";

export function generateStaticParams() {
  return categorias.map((c) => ({ categoria: c.slug }));
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const existe = categorias.some((c) => c.slug === categoria);
  if (!existe) return notFound();

  const lista = productosPorCategoria(categoria);

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <h1 className="text-2xl font-bold text-biobackup-ink">
          {nombreCategoria(categoria)}
        </h1>
      </div>
      <Catalogo productos={lista} categoriaActiva={categoria} />
    </div>
  );
}
