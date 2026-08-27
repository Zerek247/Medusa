"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCarrito } from "@/lib/carrito-context";
import { formatoMXN } from "@/lib/datos";
import { REGIMENES_FISCALES, USOS_CFDI } from "@/lib/constantes-fiscales";

type Paso = "direccion" | "fiscal" | "envio" | "pago";

const PAQUETERIAS_FALSAS = [
  { id: "terrestre", nombre: "Skydropx — Terrestre estándar", dias: "3-5 días hábiles", precio: 189 },
  { id: "express", nombre: "Skydropx — Express", dias: "1-2 días hábiles", precio: 349 },
  { id: "cotizar", nombre: "Envío por cotizar (objetos grandes)", dias: "A confirmar", precio: 0 },
];

export default function CheckoutPage() {
  const { lineas, total, vaciar, listo } = useCarrito();
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>("direccion");
  const [cotizando, setCotizando] = useState(false);
  const [paqueteria, setPaqueteria] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  const [direccion, setDireccion] = useState({
    nombre: "",
    calle: "",
    colonia: "",
    cp: "",
    ciudad: "",
    estado: "",
  });
  const [mismaDireccionFiscal, setMismaDireccionFiscal] = useState(true);
  const [fiscal, setFiscal] = useState({
    rfc: "",
    razonSocial: "",
    regimen: "601",
    usoCfdi: "G03",
    cpFiscal: "",
  });

  useEffect(() => {
    if (listo && lineas.length === 0 && !procesando) {
      router.replace("/carrito");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listo]);

  useEffect(() => {
    if (paso === "envio" && !paqueteria) {
      setCotizando(true);
      const t = setTimeout(() => setCotizando(false), 1300);
      return () => clearTimeout(t);
    }
  }, [paso, paqueteria]);

  const costoEnvio =
    PAQUETERIAS_FALSAS.find((p) => p.id === paqueteria)?.precio ?? 0;

  function confirmarPago() {
    setProcesando(true);
    setTimeout(() => {
      const resumen = {
        folio: "#" + Math.floor(1050 + Math.random() * 900),
        fecha: new Date().toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        items: lineas,
        total: total + costoEnvio,
        direccion,
        paqueteria: PAQUETERIAS_FALSAS.find((p) => p.id === paqueteria)?.nombre,
      };
      try {
        window.sessionStorage.setItem(
          "biobackup_maqueta_pedido",
          JSON.stringify(resumen)
        );
      } catch {
        // si sessionStorage falla, la pantalla de confirmación cae a un
        // resumen genérico -- no es crítico para una maqueta
      }
      vaciar();
      router.push("/pedido-confirmado");
    }, 1600);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-biobackup-ink">Checkout</h1>

      <div className="mt-4 flex gap-4 text-xs font-medium text-biobackup-ink/40">
        {(["direccion", "fiscal", "envio", "pago"] as Paso[]).map((p, i) => (
          <span
            key={p}
            className={
              paso === p
                ? "text-biobackup-navy"
                : i < (["direccion", "fiscal", "envio", "pago"] as Paso[]).indexOf(paso)
                ? "text-biobackup-teal"
                : ""
            }
          >
            {i + 1}. {{ direccion: "Envío", fiscal: "Facturación", envio: "Paquetería", pago: "Pago" }[p]}
          </span>
        ))}
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          {paso === "direccion" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-biobackup-ink">
                Dirección de envío
              </h2>
              <Campo etiqueta="Nombre completo" valor={direccion.nombre} onCambio={(v) => setDireccion((d) => ({ ...d, nombre: v }))} />
              <Campo etiqueta="Calle y número" valor={direccion.calle} onCambio={(v) => setDireccion((d) => ({ ...d, calle: v }))} />
              <div className="grid grid-cols-2 gap-4">
                <Campo etiqueta="Colonia" valor={direccion.colonia} onCambio={(v) => setDireccion((d) => ({ ...d, colonia: v }))} />
                <Campo etiqueta="Código postal" valor={direccion.cp} onCambio={(v) => setDireccion((d) => ({ ...d, cp: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Campo etiqueta="Ciudad" valor={direccion.ciudad} onCambio={(v) => setDireccion((d) => ({ ...d, ciudad: v }))} />
                <Campo etiqueta="Estado" valor={direccion.estado} onCambio={(v) => setDireccion((d) => ({ ...d, estado: v }))} />
              </div>
              <BotonSiguiente onClick={() => setPaso("fiscal")} />
            </div>
          )}

          {paso === "fiscal" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-biobackup-ink">
                Datos fiscales (CFDI)
              </h2>
              <label className="flex items-center gap-2 text-sm text-biobackup-ink/70">
                <input
                  type="checkbox"
                  checked={mismaDireccionFiscal}
                  onChange={(e) => setMismaDireccionFiscal(e.target.checked)}
                  className="h-4 w-4 rounded border-biobackup-navy/30"
                />
                Usar la misma dirección de envío para la factura
              </label>
              <Campo etiqueta="RFC" valor={fiscal.rfc} onCambio={(v) => setFiscal((f) => ({ ...f, rfc: v.toUpperCase() }))} placeholder="XAXX010101000" />
              <Campo etiqueta="Razón social" valor={fiscal.razonSocial} onCambio={(v) => setFiscal((f) => ({ ...f, razonSocial: v }))} />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  etiqueta="Régimen fiscal"
                  valor={fiscal.regimen}
                  opciones={REGIMENES_FISCALES}
                  onCambio={(v) => setFiscal((f) => ({ ...f, regimen: v }))}
                />
                <Select
                  etiqueta="Uso de CFDI"
                  valor={fiscal.usoCfdi}
                  opciones={USOS_CFDI}
                  onCambio={(v) => setFiscal((f) => ({ ...f, usoCfdi: v }))}
                />
              </div>
              {!mismaDireccionFiscal && (
                <Campo etiqueta="Código postal fiscal" valor={fiscal.cpFiscal} onCambio={(v) => setFiscal((f) => ({ ...f, cpFiscal: v }))} />
              )}
              <BotonSiguiente onClick={() => setPaso("envio")} />
            </div>
          )}

          {paso === "envio" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-biobackup-ink">
                Paquetería
              </h2>
              {cotizando ? (
                <div className="flex items-center gap-3 rounded-lg border border-biobackup-navy/10 bg-biobackup-paper p-4 text-sm text-biobackup-ink/60">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-biobackup-blue border-t-transparent" />
                  Cotizando con Skydropx según tu código postal...
                </div>
              ) : (
                <div className="space-y-2">
                  {PAQUETERIAS_FALSAS.map((p) => (
                    <label
                      key={p.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 text-sm transition ${
                        paqueteria === p.id
                          ? "border-biobackup-navy bg-biobackup-paper"
                          : "border-biobackup-navy/10 hover:border-biobackup-blue"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paqueteria"
                          checked={paqueteria === p.id}
                          onChange={() => setPaqueteria(p.id)}
                          className="h-4 w-4"
                        />
                        <span>
                          <span className="block font-medium text-biobackup-ink">
                            {p.nombre}
                          </span>
                          <span className="block text-xs text-biobackup-ink/50">
                            {p.dias}
                          </span>
                        </span>
                      </span>
                      <span className="font-semibold text-biobackup-ink">
                        {p.precio === 0 ? "Por cotizar" : formatoMXN(p.precio)}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <BotonSiguiente
                onClick={() => setPaso("pago")}
                deshabilitado={!paqueteria || cotizando}
              />
            </div>
          )}

          {paso === "pago" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-biobackup-ink">Pago</h2>
              <div className="rounded-lg border border-dashed border-biobackup-navy/20 p-4 text-sm text-biobackup-ink/60">
                Esta maqueta no procesa pagos reales — el botón de abajo
                solo simula una confirmación, como pasaría con una tarjeta
                de prueba en el sistema real.
              </div>
              <div className="rounded-lg border border-biobackup-navy/10 p-4">
                <p className="text-sm font-medium text-biobackup-ink">
                  Tarjeta terminada en 4242
                </p>
                <p className="text-xs text-biobackup-ink/40">Vence 12/28</p>
              </div>
              <button
                onClick={confirmarPago}
                disabled={procesando}
                className="w-full rounded-full bg-biobackup-navy py-3 text-sm font-semibold text-white transition hover:bg-biobackup-navyLight disabled:opacity-60"
              >
                {procesando ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Procesando pago...
                  </span>
                ) : (
                  `Pagar ${formatoMXN(total + costoEnvio)}`
                )}
              </button>
            </div>
          )}
        </div>

        <aside className="h-fit rounded-xl border border-biobackup-navy/10 p-5">
          <h3 className="text-sm font-semibold text-biobackup-ink">
            Resumen
          </h3>
          <div className="mt-3 space-y-2 text-sm">
            {lineas.map((l) => (
              <div key={l.slug} className="flex justify-between text-biobackup-ink/70">
                <span>
                  {l.nombre} × {l.cantidad}
                </span>
                <span>{formatoMXN(l.precio * l.cantidad)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 border-t border-biobackup-navy/10 pt-3 text-sm">
            <div className="flex justify-between text-biobackup-ink/60">
              <span>Subtotal</span>
              <span>{formatoMXN(total)}</span>
            </div>
            <div className="flex justify-between text-biobackup-ink/60">
              <span>Envío</span>
              <span>{paqueteria ? formatoMXN(costoEnvio) : "—"}</span>
            </div>
            <div className="flex justify-between pt-1 text-base font-bold text-biobackup-navy">
              <span>Total</span>
              <span>{formatoMXN(total + costoEnvio)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Campo({
  etiqueta,
  valor,
  onCambio,
  placeholder,
}: {
  etiqueta: string;
  valor: string;
  onCambio: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-biobackup-ink/70">
        {etiqueta}
      </span>
      <input
        type="text"
        value={valor}
        placeholder={placeholder}
        onChange={(e) => onCambio(e.target.value)}
        className="w-full rounded-lg border border-biobackup-navy/20 px-3 py-2 outline-none transition focus:border-biobackup-blue"
      />
    </label>
  );
}

function Select({
  etiqueta,
  valor,
  opciones,
  onCambio,
}: {
  etiqueta: string;
  valor: string;
  opciones: { value: string; label: string }[];
  onCambio: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-biobackup-ink/70">
        {etiqueta}
      </span>
      <select
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        className="w-full rounded-lg border border-biobackup-navy/20 bg-white px-3 py-2 outline-none transition focus:border-biobackup-blue"
      >
        {opciones.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function BotonSiguiente({
  onClick,
  deshabilitado,
}: {
  onClick: () => void;
  deshabilitado?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={deshabilitado}
      className="rounded-full bg-biobackup-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-biobackup-navyLight disabled:opacity-50"
    >
      Continuar
    </button>
  );
}
