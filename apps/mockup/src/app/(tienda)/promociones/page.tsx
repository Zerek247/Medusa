import { promociones } from "@/lib/datos";

export default function PromocionesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-bold text-biobackup-ink sm:text-3xl">
        Promociones
      </h1>
      <p className="mt-2 max-w-xl text-sm text-biobackup-ink/60">
        Esta sección la administra el equipo de BioBackup desde el panel --
        pueden subir su propia imagen y editar el texto de cada promoción
        en cualquier momento.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {promociones.map((promo, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-biobackup-navy/10 bg-white"
          >
            <div className="relative aspect-[4/3]">
              <img
                src={`https://picsum.photos/seed/biobackup-${promo.slugImagen}/700/525`}
                alt={promo.titulo}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-biobackup-navy/60 via-biobackup-navy/0 to-transparent" />
              <p className="absolute bottom-3 left-4 right-4 text-lg font-bold text-white">
                {promo.titulo}
              </p>
            </div>
            <div className="p-4">
              <p className="text-sm text-biobackup-ink/65">
                {promo.descripcion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
