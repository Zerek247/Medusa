"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CuentaPage() {
  const router = useRouter();
  const [entrando, setEntrando] = useState(false);

  function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEntrando(true);
    setTimeout(() => router.push("/cuenta/pedidos"), 700);
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-biobackup-ink">Mi cuenta</h1>
      <p className="mt-2 text-sm text-biobackup-ink/60">
        Cuenta de demostración precargada — cualquier dato entra.
      </p>

      <form onSubmit={entrar} className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-biobackup-ink/70">
            Correo
          </span>
          <input
            type="email"
            defaultValue="demo@biobackup.mx"
            className="w-full rounded-lg border border-biobackup-navy/20 px-3 py-2 outline-none transition focus:border-biobackup-blue"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-biobackup-ink/70">
            Contraseña
          </span>
          <input
            type="password"
            defaultValue="demo1234"
            className="w-full rounded-lg border border-biobackup-navy/20 px-3 py-2 outline-none transition focus:border-biobackup-blue"
          />
        </label>
        <button
          type="submit"
          disabled={entrando}
          className="w-full rounded-full bg-biobackup-navy py-3 text-sm font-semibold text-white transition hover:bg-biobackup-navyLight disabled:opacity-60"
        >
          {entrando ? "Entrando..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}
