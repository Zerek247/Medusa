"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { puntosLogo, ANCHO_LOGO, ALTO_LOGO } from "@/lib/puntos-logo";

// Duraciones de cada tramo. Ajustar aquí si se sigue viendo
// muy rápido/lento -- todo lo demás (los "momentos" de abajo) se calcula
// solo a partir de estos números.
// Pantalla de carga CORTA a propósito: apenas termina de armarse el logo
// se va y abre la página (total ~1.4s). El tiempo de espera de los
// elementos de la página (.reveal en globals.css) está calculado para
// empezar justo cuando esto se desvanece.
const MAX_RETRASO_MS = 330; // debe coincidir con MAX_RETRASO_MS del script de extracción
const DURACION_VUELO_MS = 520; // cuánto tarda CADA punto en llegar a su lugar
const DURACION_TEXTO_MS = 300;
const PAUSA_LOGO_ARMADO_MS = 220; // un respiro con el logo ya completo
const DURACION_SALIDA_MS = 300;

const T_TODOS_LLEGARON = MAX_RETRASO_MS + DURACION_VUELO_MS;
// el texto entra mientras llegan los últimos puntos (no después)
const T_TEXTO = T_TODOS_LLEGARON - 250;
const T_EMPIEZA_SALIDA = T_TODOS_LLEGARON + PAUSA_LOGO_ARMADO_MS;
const T_DESMONTA = T_EMPIEZA_SALIDA + DURACION_SALIDA_MS;

const CENTRO_X = ANCHO_LOGO / 2;
const CENTRO_Y = ALTO_LOGO / 2;

export default function LogoLoader() {
  const pathname = usePathname();
  const primeraVezRef = useRef(true);
  const [visible, setVisible] = useState(true);
  // "entrada" es independiente de "fase": arranca en false (puntos en su
  // posición de arranque, invisibles) y pasa a true casi de inmediato
  // (un frame después) -- ESE cambio es lo que dispara la transición CSS
  // de vuelo. "fase" solo decide cuándo se ve el texto y cuándo empieza
  // a desvanecerse todo. Antes ambas cosas dependían de "fase" y los
  // puntos se quedaban invisibles mientras volaban -- por eso no se
  // alcanzaba a ver nada hasta que ya estaba todo armado de golpe.
  const [entrada, setEntrada] = useState(false);
  const [fase, setFase] = useState<"animando" | "texto" | "saliendo">("animando");

  const puntosConInicio = useMemo(
    () =>
      puntosLogo.map((p) => {
        const dx = p.x - CENTRO_X;
        const dy = p.y - CENTRO_Y;
        const factor = 2.4;
        return {
          ...p,
          startX: Math.round((CENTRO_X + dx * factor) * 100) / 100,
          startY: Math.round((CENTRO_Y + dy * factor) * 100) / 100,
        };
      }),
    []
  );

  useEffect(() => {
    if (primeraVezRef.current) {
      primeraVezRef.current = false;
    } else {
      setVisible(true);
      setFase("animando");
      setEntrada(false);
    }

    // Un respiro: hay que dejar que el navegador pinte los puntos en su
    // posición de ARRANQUE primero, para que luego tenga de dónde "venir"
    // cuando cambiamos a la posición final -- si se dispara en el mismo
    // render, no hay nada que animar. Usamos setTimeout (no
    // requestAnimationFrame) a propósito: rAF solo se ejecuta cuando el
    // navegador está componiendo fotogramas activamente, y una pestaña
    // en segundo plano (o, como pasó probando esto, un panel de
    // navegador automatizado no visible) puede no componer nunca --
    // dejando la animación de entrada congelada para siempre. setTimeout
    // no depende de eso.
    const t0 = setTimeout(() => setEntrada(true), 20);

    const t1 = setTimeout(() => setFase("texto"), T_TEXTO);
    const t2 = setTimeout(() => setFase("saliendo"), T_EMPIEZA_SALIDA);
    const t3 = setTimeout(() => setVisible(false), T_DESMONTA);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-surface transition-opacity ${
        fase === "saliendo" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{
        transitionDuration: `${fase === "saliendo" ? DURACION_SALIDA_MS : 300}ms`,
      }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center">
        <svg
          viewBox={`0 0 ${ANCHO_LOGO} ${ALTO_LOGO}`}
          width={ANCHO_LOGO * 0.62}
          height={ALTO_LOGO * 0.62}
          className="overflow-visible"
        >
          {puntosConInicio.map((p, i) => (
            <circle
              key={i}
              cx={entrada ? p.x : p.startX}
              cy={entrada ? p.y : p.startY}
              r={entrada ? p.r : 1}
              fill={p.color}
              opacity={entrada ? 1 : 0}
              style={{
                transition: `cx ${DURACION_VUELO_MS}ms cubic-bezier(.2,.7,.3,1), cy ${DURACION_VUELO_MS}ms cubic-bezier(.2,.7,.3,1), r ${DURACION_VUELO_MS}ms ease-out, opacity 380ms ease-out`,
                transitionDelay: `${p.delayMs}ms`,
              }}
            />
          ))}
        </svg>

        <div
          className="mt-2 flex items-baseline gap-0.5 text-2xl font-bold"
          style={{
            opacity: fase === "animando" ? 0 : 1,
            transform: fase === "animando" ? "translateY(8px)" : "translateY(0)",
            transition: `opacity ${DURACION_TEXTO_MS}ms ease-out, transform ${DURACION_TEXTO_MS}ms ease-out`,
          }}
        >
          <span className="text-biobackup-navy dark:text-biobackup-skyLight">Bio</span>
          <span className="text-biobackup-blue">Backup</span>
        </div>
      </div>
    </div>
  );
}
