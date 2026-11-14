const BENEFICIOS = [
  {
    titulo: "Disponibilidad real",
    texto: "Lo que ves en existencia está sincronizado con nuestro inventario.",
    color: "from-biobackup-navy to-biobackup-blue",
    icono:
      "M20.25 7.5l-8.25-4.5L3.75 7.5m16.5 0l-8.25 4.5m8.25-4.5v9l-8.25 4.5m0-9L3.75 7.5m8.25 4.5v9M3.75 7.5v9l8.25 4.5",
  },
  {
    titulo: "Envío rastreado",
    texto: "Guía y estatus de cada pedido, de la bodega a tu hospital.",
    color: "from-biobackup-blue to-biobackup-teal",
    icono:
      "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25h-5.322c-.55 0-.988.394-1.152.913l-2.632 6.25c-.11.263-.164.549-.164.837v.75c0 .621.504 1.125 1.125 1.125H2.25",
  },
  {
    titulo: "Factura CFDI 4.0",
    texto: "Captura tus datos fiscales al pagar y listo, sin trámites después.",
    color: "from-biobackup-teal to-biobackup-green",
    icono:
      "M9 12h6m-6 3.75h6M6 4.5h8.379a1.5 1.5 0 011.06.44l2.622 2.62a1.5 1.5 0 01.44 1.061V19.5a1.5 1.5 0 01-1.5 1.5H6a1.5 1.5 0 01-1.5-1.5V6A1.5 1.5 0 016 4.5z",
  },
]

export default function Benefits() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
      <div className="grid gap-4 md:grid-cols-3">
        {BENEFICIOS.map((b, i) => (
          <div
            key={b.titulo}
            className="reveal flex items-start gap-4 rounded-3xl border border-white/70 bg-surface/80 p-5 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur dark:border-white/10"
            style={{ ["--d" as string]: 13 + i }}
          >
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${b.color} text-white shadow-md`}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={b.icono} />
              </svg>
            </span>
            <div>
              <p className="text-sm font-extrabold text-biobackup-ink">
                {b.titulo}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-biobackup-ink/65">
                {b.texto}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
