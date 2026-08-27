import { Metadata } from "next"
import DemoConfirmado from "@modules/order/components/demo-confirmado"

export const metadata: Metadata = {
  title: "Pedido confirmado (demo) | BioBackup",
}

export default function PedidoDemoConfirmadoPage() {
  return <DemoConfirmado />
}
