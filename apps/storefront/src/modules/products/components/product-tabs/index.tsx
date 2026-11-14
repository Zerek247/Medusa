// Pestañas de la ficha de producto -- especificaciones técnicas reales del
// equipo (SKU, peso, dimensiones, categoría) y envío/facturación del
// negocio. Mismo diseño que la demo.
"use client"

import { HttpTypes } from "@medusajs/types"
import { useState } from "react"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

type Tab = "specs" | "envio"

const ProductTabs = ({ product }: ProductTabsProps) => {
  const [tab, setTab] = useState<Tab>("specs")

  const clasePestana = (activa: boolean) =>
    `min-h-[44px] pb-2 text-sm font-semibold ${
      activa
        ? "border-b-2 border-biobackup-navy text-biobackup-navy"
        : "text-biobackup-ink/50"
    }`

  return (
    <div className="w-full">
      <div className="flex gap-6 border-b border-biobackup-navy/10" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "specs"}
          onClick={() => setTab("specs")}
          className={clasePestana(tab === "specs")}
        >
          Especificaciones técnicas
        </button>
        <button
          role="tab"
          aria-selected={tab === "envio"}
          onClick={() => setTab("envio")}
          className={clasePestana(tab === "envio")}
        >
          Envío y facturación
        </button>
      </div>

      {tab === "specs" ? (
        <EspecificacionesTab product={product} />
      ) : (
        <EnvioFacturacionTab />
      )}
    </div>
  )
}

const EspecificacionesTab = ({ product }: ProductTabsProps) => {
  const variante = product.variants?.[0]
  const requiereRevision = Boolean(
    (product.metadata as any)?.requiere_datos_envio
  )

  const filas: Array<[string, string]> = [
    ["SKU", variante?.sku || "--"],
    ["Peso", variante?.weight ? `${variante.weight} kg` : "Pendiente de captura"],
    [
      "Dimensiones",
      variante?.length && variante?.width && variante?.height
        ? `${variante.length} × ${variante.width} × ${variante.height} cm`
        : "Pendiente de captura",
    ],
    ["Categoría", product.categories?.[0]?.name || "--"],
  ]

  return (
    <div className="text-sm">
      <table className="mt-4 w-full">
        <tbody>
          {filas.map(([label, valor]) => (
            <tr
              key={label}
              className="border-b border-biobackup-navy/5 last:border-0"
            >
              <td className="py-2 pr-4 text-biobackup-ink/50">{label}</td>
              <td className="py-2 font-medium text-biobackup-ink">{valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {requiereRevision && (
        <p className="mt-4 text-xs text-biobackup-ink/60">
          El costo de envío de este producto se cotiza a mano -- verás la opción
          &quot;Envío por cotizar&quot; en tu compra.
        </p>
      )}
    </div>
  )
}

const EnvioFacturacionTab = () => {
  return (
    <div className="mt-4 space-y-2 text-sm text-biobackup-ink/70">
      <p>
        Se factura con CFDI 4.0 — captura tus datos fiscales (RFC, régimen, uso
        de CFDI) durante el pago.
      </p>
      <p>
        Envío calculado en tiempo real según tu código postal; puedes elegir
        paquetería y velocidad en el checkout.
      </p>
    </div>
  )
}

export default ProductTabs
