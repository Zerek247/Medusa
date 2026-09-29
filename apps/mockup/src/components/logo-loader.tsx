"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { generarPuntosLogo } from "@/lib/puntos-logo";

const ANCHO = 340;
const ALTO = 260;
const CENTRO_X = 170;
const CENTRO_Y = 130;

// Cuánto dura la animación completa (entrada de puntos + texto + salida)
// antes de que el overlay se quite solo y se vea la página de verdad.
const DURACION_TOTAL_MS = 1500;

export default function LogoLoader() {
  const pathname = usePathname();
  const primeraVezRef = useRef(true);
  const [visible, setVisible] = useState(true);
  const [fase, setFase] = useState<"puntos" | "texto" | "saliendo">("puntos");

  const puntos = useMemo(() => generarPuntosLogo(CENTRO_X, CENTRO_Y, 24), []);

  // Posición de arranque de cada punto: más afuera, en la misma
  // dirección respecto al centro que su posición final -- así "fluyen"
  // hacia adentro en vez de aparecer de la nada.
  const puntosConInicio = useMemo(
    () =>
      puntos.map((p) => {
        const dx = p.x - CENTRO_X;
        const dy = p.y - CENTRO_Y;
        const factor = 2.6;
        // Redondeado por la misma razón que en puntos-logo.ts: evita un
        // "hydration mismatch" por diferencias de punto flotante entre
        // el render del servidor y el del navegador.
        return {
          ...p,
          startX: Math.round((CENTRO_X + dx * factor) * 1000) / 1000,
          startY: Math.round((CENTRO_Y + dy * factor) * 1000) / 1000,
        };
      }),
    [puntos]
  );

  useEffect(() => {
    // No relanzar la animación en el montaje inicial Y en el primer
    // cambio de ruta a la vez -- el montaje ya la dispara.
    if (primeraVezRef.current) {
      primeraVezRef.current = false;
    } else {
      setVisible(true);
      setFase("puntos");
    }

    const t1 = setTimeout(() => setFase("texto"), 900);
    const t2 = setTimeout(() => setFase("saliendo"), 1150);
    const t3 = setTimeout(() => setVisible(false), DURACION_TOTAL_MS);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white transition-opacity duration-300 ${
        fase === "saliendo" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center">
        <svg
          viewBox={`0 0 ${ANCHO} ${ALTO}`}
          width={170}
          height={130}
          className="overflow-visible"
        >
          {puntosConInicio.map((p, i) => (
            <circle
              key={i}
              cx={fase === "puntos" ? p.startX : p.x}
              cy={fase === "puntos" ? p.startY : p.y}
              r={fase === "puntos" ? 1.2 : p.r}
              fill={p.color}
              opacity={fase === "puntos" ? 0 : 1}
              style={{
                transition:
                  "cx 700ms cubic-bezier(.2,.7,.3,1), cy 700ms cubic-bezier(.2,.7,.3,1), r 500ms ease-out, opacity 400ms ease-out",
                transitionDelay: `${p.retrasoMs}ms`,
              }}
            />
          ))}
        </svg>

        <div
          className="mt-1 flex items-baseline gap-0.5 text-2xl font-bold transition-all duration-500"
          style={{
            opacity: fase === "puntos" ? 0 : 1,
            transform: fase === "puntos" ? "translateY(6px)" : "translateY(0)",
          }}
        >
          <span className="text-biobackup-navy">Bio</span>
          <span className="text-biobackup-blue">Backup</span>
        </div>
      </div>
    </div>
  );
}
