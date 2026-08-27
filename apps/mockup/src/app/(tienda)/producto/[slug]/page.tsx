import { notFound } from "next/navigation";
import { productoPorSlug, productos, nombreCategoria } from "@/lib/datos";
import FichaProducto from "@/components/ficha-producto";

export function generateStaticParams() {
  return productos.map((p) => ({ slug: p.slug }));
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const producto = productoPorSlug(slug);
  if (!producto) return notFound();

  return (
    <FichaProducto
      producto={producto}
      nombreCategoria={nombreCategoria(producto.categoria)}
    />
  );
}
