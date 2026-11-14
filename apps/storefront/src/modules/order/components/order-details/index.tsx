import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const ESTATUS_ENVIO: Record<string, string> = {
  not_fulfilled: "Sin enviar",
  partially_fulfilled: "Parcialmente preparado",
  fulfilled: "Preparado",
  partially_shipped: "Parcialmente enviado",
  shipped: "Enviado",
  partially_delivered: "Parcialmente entregado",
  delivered: "Entregado",
  canceled: "Cancelado",
}

const ESTATUS_PAGO: Record<string, string> = {
  not_paid: "Sin pagar",
  awaiting: "En espera",
  authorized: "Autorizado",
  partially_authorized: "Parcialmente autorizado",
  captured: "Pagado",
  partially_captured: "Parcialmente pagado",
  partially_refunded: "Parcialmente reembolsado",
  refunded: "Reembolsado",
  canceled: "Cancelado",
  requires_action: "Requiere acción",
}

const traducir = (mapa: Record<string, string>, valor: string) => {
  if (mapa[valor]) return mapa[valor]
  const formateado = valor.split("_").join(" ")
  return formateado.slice(0, 1).toUpperCase() + formateado.slice(1)
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  return (
    <div>
      <Text>
        Enviamos el detalle de tu pedido a{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>
      <Text className="mt-2">
        Fecha del pedido:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toLocaleDateString("es-MX", {
            dateStyle: "long",
          })}
        </span>
      </Text>
      <Text className="mt-2 text-ui-fg-interactive">
        Número de pedido: <span data-testid="order-id">{order.display_id}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              Estatus del pedido:{" "}
              <span className="text-ui-fg-subtle " data-testid="order-status">
                {traducir(ESTATUS_ENVIO, order.fulfillment_status)}
              </span>
            </Text>
            <Text>
              Estatus del pago:{" "}
              <span
                className="text-ui-fg-subtle "
                data-testid="order-payment-status"
              >
                {traducir(ESTATUS_PAGO, order.payment_status)}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
