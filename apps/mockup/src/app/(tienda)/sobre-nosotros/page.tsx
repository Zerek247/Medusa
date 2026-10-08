import Link from "next/link";

// Contenido condensado de la "Presentación Institucional" de BioBackup
// (PDF del cliente). Solo lo más importante, en bloques cortos.

const CIFRAS = [
  { valor: "2020", texto: "inicio de operaciones" },
  { valor: "4", texto: "países con presencia comercial" },
  { valor: "4", texto: "ediciones en Medical Expo" },
  { valor: "2", texto: "premios en Medical Expo 2026" },
];

const HISTORIA = [
  {
    cuando: "Marzo 2020",
    titulo: "Arrancamos",
    texto: "Atendemos directo a hospitales y clínicas del sector público y privado.",
  },
  {
    cuando: "Pandemia",
    titulo: "Nos adaptamos",
    texto: "Evolucionamos el modelo para atender a distribuidores especializados.",
  },
  {
    cuando: "Expansión",
    titulo: "Cruzamos fronteras",
    texto: "Nuestros productos llegan a Rumania, Chile y El Salvador.",
  },
  {
    cuando: "Hoy",
    titulo: "Nueva etapa",
    texto: "Volvemos al cliente final, con licitaciones y trato directo, sin dejar atrás a nuestros distribuidores.",
  },
];

const VALORES = [
  "Compromiso",
  "Integridad",
  "Calidad",
  "Servicio",
  "Innovación",
  "Trabajo en equipo",
];

const SOLUCIONES = [
  "Dispositivos médicos",
  "Equipo hospitalario",
  "Electrocirugía y accesorios",
  "Carros de emergencia",
  "Instrumental médico",
  "Consumibles hospitalarios",
];

const CLIENTES = [
  "Hospitales públicos y privados",
  "Clínicas y consultorios",
  "Distribuidores especializados",
  "Instituciones de gobierno",
];

const DIFERENCIALES = [
  "Atención personalizada",
  "Asesoría técnica especializada",
  "Envíos a todo México",
  "Disponibilidad inmediata",
  "Participación en licitaciones",
  "Seguimiento postventa",
];

function Seccion({
  etiqueta,
  titulo,
  children,
}: {
  etiqueta: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
      <span className="mb-2 block h-1.5 w-12 rounded-full bg-gradient-to-r from-biobackup-navy via-biobackup-blue to-biobackup-teal" />
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-biobackup-blue">
        {etiqueta}
      </p>
      <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-biobackup-ink sm:text-3xl">
        {titulo}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((t) => (
        <span
          key={t}
          className="rounded-full border border-biobackup-blue/25 bg-surface/80 px-4 py-2 text-sm font-semibold text-biobackup-ink shadow-sm backdrop-blur"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

export default function SobreNosotrosPage() {
  return (
    <div className="pb-4">
      {/* ---------- Encabezado ---------- */}
      <section className="mx-auto mt-4 max-w-6xl px-3 sm:px-5">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-biobackup-navy via-[#0a6aa8] to-biobackup-teal px-6 py-14 text-center shadow-[0_30px_70px_-28px_rgba(3,80,136,0.7)] sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 animate-flotar-lento rounded-full bg-biobackup-skyLight/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 right-10 h-72 w-72 animate-flotar-lento-2 rounded-full bg-biobackup-green/35 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-biobackup-skyLight">
              Sobre BioBackup
            </p>
            <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-5xl">
              Vivimos para respaldarte
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base italic text-white/85">
              Respaldando la salud con soluciones confiables, innovación y compromiso.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Quiénes somos + cifras ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-5 lg:items-center">
          <div className="lg:col-span-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-biobackup-blue">
              Quiénes somos
            </p>
            <p className="mt-3 text-lg font-medium leading-relaxed text-biobackup-ink sm:text-xl">
              Somos una empresa mexicana especializada en la comercialización
              y distribución de dispositivos médicos, equipo hospitalario,
              instrumental, accesorios e insumos para el sector salud.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-biobackup-ink/70">
              Nuestro compromiso: soluciones confiables que mejoren la
              atención médica, con productos de alta calidad, asesoría
              especializada y un servicio cercano y eficiente.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:col-span-2">
            {CIFRAS.map((c) => (
              <div
                key={c.texto}
                className="rounded-3xl border border-white/70 bg-surface/80 p-5 text-center shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur dark:border-white/10"
              >
                <p className="text-gradient text-4xl font-extrabold">{c.valor}</p>
                <p className="mt-1 text-xs font-semibold leading-snug text-biobackup-ink/65">
                  {c.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Historia ---------- */}
      <Seccion etiqueta="Nuestra historia" titulo="De 2020 a hoy">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HISTORIA.map((h, i) => (
            <div
              key={h.cuando}
              className="relative overflow-hidden rounded-3xl border border-white/70 bg-surface/80 p-5 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur dark:border-white/10"
            >
              <span className="absolute -right-3 -top-5 text-7xl font-extrabold text-biobackup-blue/10">
                {i + 1}
              </span>
              <p className="relative text-xs font-bold uppercase tracking-wider text-biobackup-teal">
                {h.cuando}
              </p>
              <p className="relative mt-1 text-base font-extrabold text-biobackup-ink">
                {h.titulo}
              </p>
              <p className="relative mt-2 text-sm leading-relaxed text-biobackup-ink/65">
                {h.texto}
              </p>
            </div>
          ))}
        </div>
      </Seccion>

      {/* ---------- Logros ---------- */}
      <Seccion etiqueta="Logros y reconocimientos" titulo="Presencia en los eventos más importantes">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-gradient-to-br from-biobackup-navy to-biobackup-blue p-6 text-white shadow-lg md:col-span-1">
            <p className="text-xs font-bold uppercase tracking-wider text-biobackup-skyLight">
              Medical Expo Guadalajara 2026
            </p>
            <p className="mt-2 text-xl font-extrabold leading-snug">
              Ganadores de dos preseas
            </p>
            <ul className="mt-3 space-y-1.5 text-sm font-semibold text-white/90">
              <li>★ Liderazgo Empresarial</li>
              <li>★ Mejor Stand</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/70 bg-surface/80 p-6 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur dark:border-white/10">
            <p className="text-xs font-bold uppercase tracking-wider text-biobackup-blue">
              Medical Expo
            </p>
            <p className="mt-2 text-lg font-extrabold text-biobackup-ink">
              Expositores 2023, 2024, 2025 y 2026
            </p>
            <p className="mt-2 text-sm text-biobackup-ink/65">
              Guadalajara y Ciudad de México.
            </p>
          </div>
          <div className="rounded-3xl border border-white/70 bg-surface/80 p-6 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur dark:border-white/10">
            <p className="text-xs font-bold uppercase tracking-wider text-biobackup-blue">
              Arab Health · enero 2025
            </p>
            <p className="mt-2 text-lg font-extrabold text-biobackup-ink">
              Dubái, Emiratos Árabes Unidos
            </p>
            <p className="mt-2 text-sm text-biobackup-ink/65">
              Uno de los eventos más importantes del mundo en dispositivos médicos.
            </p>
          </div>
        </div>
      </Seccion>

      {/* ---------- Misión y visión ---------- */}
      <Seccion etiqueta="Hacia dónde vamos" titulo="Misión y visión">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/70 bg-surface/80 p-6 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur dark:border-white/10">
            <p className="text-sm font-extrabold uppercase tracking-wider text-biobackup-blue">
              Misión
            </p>
            <p className="mt-3 text-sm leading-relaxed text-biobackup-ink/75">
              Proporcionar soluciones integrales para el sector salud con
              dispositivos médicos, equipo hospitalario e insumos de alta
              calidad, respaldados por un servicio profesional y atención
              personalizada.
            </p>
          </div>
          <div className="rounded-3xl border border-white/70 bg-surface/80 p-6 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur dark:border-white/10">
            <p className="text-sm font-extrabold uppercase tracking-wider text-biobackup-teal">
              Visión
            </p>
            <p className="mt-3 text-sm leading-relaxed text-biobackup-ink/75">
              Ser una empresa líder en la comercialización y distribución de
              dispositivos médicos en México, con presencia nacional e
              internacional y relaciones comerciales duraderas.
            </p>
          </div>
        </div>
        <div className="mt-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-biobackup-ink/50">
            Nuestros valores
          </p>
          <Chips items={VALORES} />
        </div>
      </Seccion>

      {/* ---------- Soluciones y clientes ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/70 bg-surface/80 p-6 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur dark:border-white/10">
            <h2 className="text-xl font-extrabold text-biobackup-ink">
              Nuestras soluciones
            </h2>
            <div className="mt-4">
              <Chips items={SOLUCIONES} />
            </div>
          </div>
          <div className="rounded-3xl border border-white/70 bg-surface/80 p-6 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur dark:border-white/10">
            <h2 className="text-xl font-extrabold text-biobackup-ink">
              Nuestros clientes
            </h2>
            <div className="mt-4">
              <Chips items={CLIENTES} />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Por qué BioBackup ---------- */}
      <Seccion etiqueta="¿Por qué BioBackup?" titulo="Un aliado estratégico en calidad, innovación y servicio">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DIFERENCIALES.map((d) => (
            <div
              key={d}
              className="flex items-center gap-3 rounded-2xl border border-white/70 bg-surface/80 px-4 py-3.5 text-sm font-semibold text-biobackup-ink shadow-sm backdrop-blur dark:border-white/10"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-biobackup-blue to-biobackup-teal text-white">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              {d}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-r from-biobackup-navy via-biobackup-blue to-biobackup-teal p-8 text-center text-white shadow-lg">
          <p className="text-xl font-extrabold">¿Hablamos?</p>
          <p className="max-w-md text-sm text-white/85">
            Cuéntanos qué necesita tu hospital, clínica o consultorio.
          </p>
          <Link
            href="/contacto"
            className="mt-1 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#035088] transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Ir a contacto
          </Link>
        </div>
      </Seccion>
    </div>
  );
}
