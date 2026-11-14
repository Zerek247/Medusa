import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Encabezado de sección con la barrita de colores de la marca y, opcional,
// un enlace "Ver todo" a la derecha.
export default function SectionTitle({
  children,
  enlace,
}: {
  children: React.ReactNode
  enlace?: { href: string; texto: string }
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <span className="mb-2 block h-1.5 w-12 rounded-full bg-gradient-to-r from-biobackup-navy via-biobackup-blue to-biobackup-teal" />
        <h2 className="text-2xl font-extrabold tracking-tight text-biobackup-ink sm:text-3xl">
          {children}
        </h2>
      </div>
      {enlace && (
        <LocalizedClientLink
          href={enlace.href}
          className="inline-flex min-h-[44px] shrink-0 items-center rounded-full bg-biobackup-blue/10 px-4 py-2 text-sm font-semibold text-biobackup-blue transition hover:bg-biobackup-blue hover:text-white"
        >
          {enlace.texto}
        </LocalizedClientLink>
      )}
    </div>
  )
}
