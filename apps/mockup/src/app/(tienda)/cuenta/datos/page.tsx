"use client";

import { useState } from "react";
import { clienteDemo } from "@/lib/datos";
import CuentaNav from "@/components/cuenta-nav";

export default function DatosPage() {
  const [nombre, setNombre] = useState(clienteDemo.nombre);
  const [telefono, setTelefono] = useState("55 1234 5678");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setTimeout(() => {
      setGuardando(false);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2000);
    }, 700);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-biobackup-ink">Mis datos</h1>

      <div className="mt-6">
        <CuentaNav />
      </div>

      <form onSubmit={guardar} className="mt-6 max-w-md space-y-4 rounded-xl border border-biobackup-navy/10 bg-white p-5">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-biobackup-ink/70">
            Nombre completo
          </span>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-lg border border-biobackup-navy/20 px-3 py-2 outline-none transition focus:border-biobackup-blue"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-biobackup-ink/70">
            Correo
          </span>
          <input
            type="email"
            value={clienteDemo.email}
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-biobackup-navy/10 bg-biobackup-paper px-3 py-2 text-biobackup-ink/50"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-biobackup-ink/70">
            Teléfono
          </span>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full rounded-lg border border-biobackup-navy/20 px-3 py-2 outline-none transition focus:border-biobackup-blue"
          />
        </label>
        <button
          type="submit"
          disabled={guardando}
          className="rounded-full bg-biobackup-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-biobackup-navyLight disabled:opacity-60"
        >
          {guardando ? "Guardando..." : guardado ? "Guardado ✓" : "Guardar cambios"}
        </button>
        <p className="text-xs text-biobackup-ink/40">
          En el sistema real, estos cambios se sincronizan con tu registro
          de cliente en Bind ERP.
        </p>
      </form>
    </div>
  );
}
