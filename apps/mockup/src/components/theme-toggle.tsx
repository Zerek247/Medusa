"use client";

import { useEffect, useState } from "react";

const LLAVE = "biobackup-tema";

export default function ThemeToggle() {
  const [oscuro, setOscuro] = useState(false);
  const [listo, setListo] = useState(false);

  // El script del <head> ya puso la clase "dark" si correspondía; aquí
  // solo leemos el estado real del <html> para que el botón coincida.
  useEffect(() => {
    setOscuro(document.documentElement.classList.contains("dark"));
    setListo(true);
  }, []);

  function alternar() {
    const siguiente = !oscuro;
    setOscuro(siguiente);
    document.documentElement.classList.toggle("dark", siguiente);
    try {
      window.localStorage.setItem(LLAVE, siguiente ? "dark" : "light");
    } catch {
      // sin localStorage (modo privado): el cambio sigue valiendo en esta visita
    }
  }

  return (
    <button
      onClick={alternar}
      aria-label={oscuro ? "Cambiar a modo normal" : "Cambiar a modo noche"}
      title={oscuro ? "Modo normal" : "Modo noche"}
      className="group relative flex h-11 w-14 shrink-0 items-center rounded-full border border-biobackup-navy/15 sm:w-[4.5rem] bg-gradient-to-r from-biobackup-skyLight/70 to-biobackup-teal/40 p-1 shadow-inner transition dark:from-biobackup-navy/60 dark:to-biobackup-blue/40 dark:border-white/15"
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full bg-surface text-biobackup-navy shadow-md transition-transform duration-300 ease-out dark:text-biobackup-skyLight ${
          listo && oscuro ? "translate-x-3 sm:translate-x-7" : "translate-x-0"
        }`}
      >
        {oscuro ? (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.64 13a1 1 0 00-1.05-.14 8.05 8.05 0 01-3.37.73A8.15 8.15 0 019.08 5.49a8.59 8.59 0 01.25-2A1 1 0 008 2.36 10.14 10.14 0 1022 14.05a1 1 0 00-.36-1.05z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
          </svg>
        )}
      </span>
    </button>
  );
}
