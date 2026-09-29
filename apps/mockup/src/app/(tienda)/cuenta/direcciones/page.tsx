"use client";

import { useState } from "react";
import { clienteDemo } from "@/lib/datos";
import CuentaNav from "@/components/cuenta-nav";

export default function DireccionesPage() {
  const [direcciones, setDirecciones] = useState(clienteDemo.direcciones);
  const [formAbierto, setFormAbierto] = useState(false);
  const [nueva, setNueva] = useState({
    etiqueta: "",
    calle: "",
    colonia: "",
    cp: "",
    ciudad: "",
    estado: "",
  });

  function agregar(e: React.FormEvent) {
    e.preventDefault();
    if (!nueva.etiqueta || !nueva.calle) return;
    setDirecciones((prev) => [...prev, nueva]);
    setNueva({ etiqueta: "", calle: "", colonia: "", cp: "", ciudad: "", estado: "" });
    setFormAbierto(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-biobackup-ink">Mis direcciones</h1>

      <div className="mt-6">
        <CuentaNav />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {direcciones.map((d, i) => (
          <div
            key={i}
            className="rounded-xl border border-biobackup-navy/10 bg-white p-4 text-sm text-biobackup-ink/70"
          >
            <p className="font-semibold text-biobackup-ink">{d.etiqueta}</p>
            <p>{d.calle}</p>
            <p>
              {d.colonia}, {d.cp}
            </p>
            <p>
              {d.ciudad}, {d.estado}
            </p>
          </div>
        ))}
      </div>

      {formAbierto ? (
        <form
          onSubmit={agregar}
          className="mt-4 max-w-md space-y-3 rounded-xl border border-biobackup-navy/10 bg-white p-5"
        >
          <CampoDireccion etiqueta="Nombre de la dirección (ej. Consultorio)" valor={nueva.etiqueta} onCambio={(v) => setNueva((n) => ({ ...n, etiqueta: v }))} />
          <CampoDireccion etiqueta="Calle y número" valor={nueva.calle} onCambio={(v) => setNueva((n) => ({ ...n, calle: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <CampoDireccion etiqueta="Colonia" valor={nueva.colonia} onCambio={(v) => setNueva((n) => ({ ...n, colonia: v }))} />
            <CampoDireccion etiqueta="Código postal" valor={nueva.cp} onCambio={(v) => setNueva((n) => ({ ...n, cp: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <CampoDireccion etiqueta="Ciudad" valor={nueva.ciudad} onCambio={(v) => setNueva((n) => ({ ...n, ciudad: v }))} />
            <CampoDireccion etiqueta="Estado" valor={nueva.estado} onCambio={(v) => setNueva((n) => ({ ...n, estado: v }))} />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-full bg-biobackup-navy px-5 py-2 text-sm font-semibold text-white hover:bg-biobackup-navyLight"
            >
              Guardar dirección
            </button>
            <button
              type="button"
              onClick={() => setFormAbierto(false)}
              className="rounded-full px-5 py-2 text-sm font-semibold text-biobackup-ink/60 hover:text-biobackup-ink"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setFormAbierto(true)}
          className="mt-4 rounded-full border border-biobackup-navy/20 px-5 py-2 text-sm font-semibold text-biobackup-navy transition hover:border-biobackup-blue hover:text-biobackup-blue"
        >
          + Agregar dirección
        </button>
      )}
    </div>
  );
}

function CampoDireccion({
  etiqueta,
  valor,
  onCambio,
}: {
  etiqueta: string;
  valor: string;
  onCambio: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-biobackup-ink/70">{etiqueta}</span>
      <input
        type="text"
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        className="w-full rounded-lg border border-biobackup-navy/20 px-3 py-2 outline-none transition focus:border-biobackup-blue"
      />
    </label>
  );
}
