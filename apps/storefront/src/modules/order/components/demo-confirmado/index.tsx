"use client"

// Confirmación SIMULADA de pedido (Fase 6B, modo demo) -- lee el resumen
// que payment-button/index.tsx guardó en sessionStorage antes de navegar
// aquí. Nunca se creó una orden real ni se llamó a Stripe; esto es
// puramente presentacional para el recorrido de la demo.
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button, Heading, Text } from "@modules/common/components/ui"
import { CheckCircleSolid } from "@medusajs/icons"
import { useEffect, useState } from "react"

type PedidoDemo = {
  numero: number
  fecha: string
  email: string
  total: number
  currency_code: string
  shipping_address: { first_name?: string; last_name?: string; address_1?: string; city?: string } | null
  items: Array<{ titulo: string; cantidad: number; total: number }>
}

const DemoConfirmado = () => {
  const [pedido, setPedido] = useState<PedidoDemo | null>(null)

  useEffect(() => {
    const guardado = sessionStorage.getItem("biobackup_pedido_demo")
    if (guardado) setPedido(JSON.parse(guardado))
  }, [])

  if (!pedido) {
    return (
      <div className="content-container py-16 text-center">
        <Text className="text-ui-fg-subtle">
          No hay un pedido de demostración reciente.{" "}
          <LocalizedClientLink href="/store" className="underline">
            Vuelve al catálogo
          </LocalizedClientLink>
          .
        </Text>
      </div>
    )
  }

  return (
    <div className="content-container py-16 max-w-lg">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircleSolid className="text-ui-fg-interactive" />
        <Heading level="h1" className="text-2xl-semi">
          ¡Gracias por tu compra!
        </Heading>
      </div>
      <Text className="text-ui-fg-subtle mb-8">
        Confirmamos tu pedido #{pedido.numero}. Te enviamos los detalles a{" "}
        {pedido.email}.
      </Text>

      <div className="border border-ui-border-base rounded-rounded p-6">
        {pedido.shipping_address && (
          <>
            <Text className="txt-medium-plus text-ui-fg-base mb-1">Enviar a</Text>
            <Text className="text-ui-fg-subtle mb-4">
              {pedido.shipping_address.first_name} {pedido.shipping_address.last_name}
              <br />
              {pedido.shipping_address.address_1}, {pedido.shipping_address.city}
            </Text>
          </>
        )}
        <Text className="txt-medium-plus text-ui-fg-base mb-1">Artículos</Text>
        <ul className="text-ui-fg-subtle mb-4">
          {pedido.items.map((i, idx) => (
            <li key={idx}>
              {i.cantidad}x {i.titulo}
            </li>
          ))}
        </ul>
        <Text className="txt-large-plus text-ui-fg-base">
          Total: {pedido.total?.toFixed(2)} {pedido.currency_code?.toUpperCase()}
        </Text>
      </div>

      <LocalizedClientLink href="/account/orders">
        <Button className="mt-8">Ver historial de pedidos</Button>
      </LocalizedClientLink>
    </div>
  )
}

export default DemoConfirmado
