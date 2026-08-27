// Todavía no hay fotos reales de producto (ver nota en lib/datos.ts) --
// mientras llegan, este componente dibuja un marcador visual con la
// paleta de la marca en vez de dejar una caja gris vacía o un ícono
// genérico de "imagen rota".
export default function ImagenProducto({
  nombre,
  className = "",
}: {
  nombre: string;
  className?: string;
}) {
  const inicial = nombre.trim().charAt(0).toUpperCase();

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-biobackup-gradient ${className}`}
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-25"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const r = 70 + (i % 3) * 12;
          const cx = 100 + Math.cos(angle) * r;
          const cy = 100 + Math.sin(angle) * r;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={i % 4 === 0 ? 4 : 2.5}
              fill="white"
            />
          );
        })}
      </svg>
      <span className="relative font-sans text-4xl font-bold text-white/90">
        {inicial}
      </span>
    </div>
  );
}
