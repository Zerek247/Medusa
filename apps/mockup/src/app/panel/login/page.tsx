"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPanelPage() {
  const router = useRouter();
  const [entrando, setEntrando] = useState(false);

  function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEntrando(true);
    setTimeout(() => router.push("/panel/productos"), 700);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
      <div className="w-full max-w-[320px]">
        <div className="flex flex-col items-center">
          <Image
            src="/logo/biobackup-vertical.png"
            alt="BioBackup"
            width={90}
            height={110}
            className="h-20 w-auto"
          />
          <h1 className="mt-4 text-lg font-semibold text-black/80">
            Panel de administración
          </h1>
          <p className="mt-1 text-center text-sm text-black/45">
            Inicia sesión para continuar
          </p>
        </div>

        <form onSubmit={entrar} className="mt-6 space-y-3">
          <input
            type="email"
            defaultValue="admin@biobackup.mx"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-biobackup-blue"
            placeholder="Email"
          />
          <input
            type="password"
            defaultValue="••••••••"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-biobackup-blue"
            placeholder="Contraseña"
          />
          <button
            type="submit"
            disabled={entrando}
            className="w-full rounded-lg bg-biobackup-navy py-2.5 text-sm font-semibold text-white transition hover:bg-biobackup-navyLight disabled:opacity-60"
          >
            {entrando ? "Entrando..." : "Continuar"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-black/30">
          Maqueta visual — cualquier dato entra.
        </p>
      </div>
    </div>
  );
}
