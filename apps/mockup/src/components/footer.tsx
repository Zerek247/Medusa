import Link from "next/link";

const COLUMNAS = [
  {
    titulo: "Tienda",
    enlaces: [
      { href: "/tienda", texto: "Catálogo" },
      { href: "/promociones", texto: "Promociones" },
      { href: "/sobre-nosotros", texto: "Sobre nosotros" },
      { href: "/faq", texto: "Preguntas frecuentes" },
    ],
  },
  {
    titulo: "Ayuda",
    enlaces: [
      { href: "/rastreo", texto: "Rastrear un pedido" },
      { href: "/cuenta", texto: "Mi cuenta" },
      { href: "/contacto", texto: "Contacto" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mx-3 mt-20 sm:mx-5">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#04365c] via-biobackup-navy to-[#0a6f9c] text-white shadow-[0_30px_70px_-30px_rgba(3,80,136,0.8)]">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-biobackup-teal/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-10 h-64 w-64 rounded-full bg-biobackup-blue/30 blur-3xl" />

        <div className="relative grid gap-10 px-7 py-12 sm:px-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <p className="text-xl font-extrabold">
              Bio<span className="text-biobackup-skyLight">Backup</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Equipo médico y consumibles para hospitales y consultorios.
            </p>
          </div>

          {COLUMNAS.map((col) => (
            <div key={col.titulo}>
              <p className="text-sm font-bold uppercase tracking-wider text-biobackup-skyLight">
                {col.titulo}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-white/75">
                {col.enlaces.map((e) => (
                  <li key={e.href}>
                    <Link href={e.href} className="transition hover:text-white hover:underline">
                      {e.texto}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-biobackup-skyLight">
              Contacto
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li>
                <a href="mailto:Ventas@biobackup.mx" className="transition hover:text-white hover:underline">
                  Ventas@biobackup.mx
                </a>
              </li>
              <li>
                <a href="tel:+525558330938" className="transition hover:text-white hover:underline">
                  55 5833 0938
                </a>
              </li>
              <li>
                <a href="https://wa.me/526143143157" target="_blank" rel="noopener noreferrer" className="transition hover:text-white hover:underline">
                  WhatsApp 614 314 3157
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-3 border-t border-white/15 px-6 py-5 text-center text-xs text-white/60">
          {/* Acceso rápido al panel de admin para la demo -- así no hay que
              escribir /panel/login a mano frente al cliente. */}
          <Link
            href="/panel/productos"
            className="inline-flex min-h-[44px] items-center rounded-full border border-white/30 bg-white/10 px-5 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-white/20"
          >
            Panel de administración →
          </Link>
          <span>Propuesta visual — no es un sitio en producción.</span>
        </div>
      </div>
    </footer>
  );
}
