import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-biobackup-navy/10 bg-biobackup-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-sm font-bold text-biobackup-navy">BioBackup</p>
          <p className="mt-2 text-sm text-biobackup-ink/70">
            Equipo médico y consumibles para consultorio y hospital.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-biobackup-ink">Ayuda</p>
          <ul className="mt-2 space-y-1.5 text-sm text-biobackup-ink/70">
            <li>
              <Link href="/rastreo" className="hover:text-biobackup-blue">
                Rastrear un pedido
              </Link>
            </li>
            <li>
              <Link href="/cuenta" className="hover:text-biobackup-blue">
                Mi cuenta
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-biobackup-ink">Contacto</p>
          <ul className="mt-2 space-y-1.5 text-sm text-biobackup-ink/70">
            <li>ventas@biobackup.mx</li>
            <li>Ciudad de México</li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 border-t border-biobackup-navy/10 px-4 py-4 text-center text-xs text-biobackup-ink/50 sm:px-6">
        {/* Acceso rápido al panel de admin para la demo -- así no hay que
            escribir /panel/login a mano frente al cliente. */}
        <Link
          href="/panel/productos"
          className="rounded-full border border-biobackup-navy/20 px-4 py-1.5 text-xs font-semibold text-biobackup-navy transition hover:border-biobackup-blue hover:text-biobackup-blue"
        >
          Panel de administración →
        </Link>
        <span>Propuesta visual — no es un sitio en producción.</span>
      </div>
    </footer>
  );
}
