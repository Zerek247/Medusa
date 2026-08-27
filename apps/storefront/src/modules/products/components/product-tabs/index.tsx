// Pestañas de la ficha de producto (Fase 6) -- especificaciones técnicas
// reales del equipo (SKU, peso, dimensiones) en vez de Material/Country of
// origin/Type (vacíos siempre para nuestro catálogo, son campos pensados
// para ropa), y envío/facturación reales del negocio en vez del texto de
// "easy returns, no questions asked" del starter (no aplica a equipo
// médico ni es una política que este negocio haya definido).
"use client"

import { HttpTypes } from "@medusajs/types"
import Accordion from "./accordion"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Especificaciones técnicas",
      component: <EspecificacionesTab product={product} />,
    },
    {
      label: "Envío y facturación",
      component: <EnvioFacturacionTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const EspecificacionesTab = ({ product }: ProductTabsProps) => {
  const variante = product.variants?.[0]
  const requiereRevision = Boolean((product.metadata as any)?.requiere_datos_envio)

  const filas: Array<[string, string]> = [
    ["SKU", variante?.sku || "--"],
    ["Peso", variante?.weight ? `${variante.weight} kg` : "Pendiente de captura"],
    [
      "Dimensiones (L x A x A)",
      variante?.length && variante?.width && variante?.height
        ? `${variante.length} x ${variante.width} x ${variante.height} cm`
        : "Pendiente de captura",
    ],
  ]

  return (
    <div className="text-small-regular py-8">
      <table className="w-full">
        <tbody>
          {filas.map(([label, valor]) => (
            <tr key={label} className="border-b border-ui-border-base last:border-0">
              <td className="py-2 pr-4 font-semibold w-1/3">{label}</td>
              <td className="py-2 text-ui-fg-subtle">{valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {requiereRevision && (
        <p className="text-ui-fg-subtle mt-4 txt-small">
          El costo de envío de este producto se cotiza a mano -- verás la opción
          &quot;Envío por cotizar&quot; en tu compra.
        </p>
      )}
    </div>
  )
}

const EnvioFacturacionTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-6">
        <div>
          <span className="font-semibold">Envío a todo México</span>
          <p className="max-w-sm text-ui-fg-subtle">
            Cotizamos en tiempo real con distintas paqueterías al capturar tu código
            postal en el checkout. Recibes número de guía y liga de rastreo por correo.
          </p>
        </div>
        <div>
          <span className="font-semibold">Factura (CFDI)</span>
          <p className="max-w-sm text-ui-fg-subtle">
            Captura tus datos fiscales en el checkout si necesitas factura -- si no,
            recibes tu comprobante de compra de todas formas.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
