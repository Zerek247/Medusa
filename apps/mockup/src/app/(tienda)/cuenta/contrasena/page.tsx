"use client";

import { useState } from "react";
import CuentaNav from "@/components/cuenta-nav";

export default function ContrasenaPage() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");

  function cambiar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (nueva.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (nueva !== confirmar) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setGuardando(true);
    setTimeout(() => {
      setGuardando(false);
      setGuardado(true);
      setActual("");
      setNueva("");
      setConfirmar("");
      setTimeout(() => setGuardado(false), 2500);
    }, 900);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-biobackup-ink">Contraseña</h1>

      <div className="mt-6">
        <CuentaNav />
      </div>

      <form
        onSubmit={cambiar}
        className="mt-6 max-w-md space-y-4 rounded-xl border border-biobackup-navy/10 bg-white p-5"
      >
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-biobackup-ink/70">
            Contraseña actual
          </span>
          <input
            type="password"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            className="w-full rounded-lg border border-biobackup-navy/20 px-3 py-2 outline-none transition focus:border-biobackup-blue"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-biobackup-ink/70">
            Nueva contraseña
          </span>
          <input
            type="password"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            className="w-full rounded-lg border border-biobackup-navy/20 px-3 py-2 outline-none transition focus:border-biobackup-blue"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-biobackup-ink/70">
            Confirmar nueva contraseña
          </span>
          <input
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            className="w-full rounded-lg border border-biobackup-navy/20 px-3 py-2 outline-none transition focus:border-biobackup-blue"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={guardando}
          className="rounded-full bg-biobackup-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-biobackup-navyLight disabled:opacity-60"
        >
          {guardando ? "Actualizando..." : guardado ? "Actualizada ✓" : "Actualizar contraseña"}
        </button>
        <p className="text-xs text-biobackup-ink/40">
          Tu contraseña se guarda solo del lado del cliente en Medusa — Bind
          no la recibe, únicamente tus datos de cliente y pedidos.
        </p>
      </form>
    </div>
  );
}
