// Todavía no hay fotos reales de producto (ver nota en lib/datos.ts). El
// cliente pidió explícitamente meter imágenes genéricas de internet
// mientras tanto -- usamos Picsum (picsum.photos), sembrado con el slug
// del producto para que cada uno muestre SIEMPRE la misma foto (no una
// aleatoria distinta en cada carga). Es un <img> normal, no next/image,
// porque son URLs externas y unoptimized:true ya cubre la necesidad real
// (no hay que darle de alta el dominio en next.config.js).
export default function ImagenProducto({
  nombre,
  slug,
  className = "",
}: {
  nombre: string;
  slug: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-biobackup-paper ${className}`}>
      <img
        src={`https://picsum.photos/seed/biobackup-${slug}/600/600`}
        alt={nombre}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-biobackup-navy/15 via-transparent to-transparent" />
    </div>
  );
}
