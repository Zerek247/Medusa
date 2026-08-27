import { Metadata } from "next"
import RastreoForm from "@modules/tracking/rastreo-form"

export const metadata: Metadata = {
  title: "Rastrea tu pedido | BioBackup",
  description: "Consulta el estatus y la guía de rastreo de tu pedido.",
}

export default function RastreoPage() {
  return <RastreoForm />
}
