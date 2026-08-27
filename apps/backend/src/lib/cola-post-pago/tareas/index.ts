import type { Job } from "bullmq";
import { MedusaContainer } from "@medusajs/framework/types";
import { TAREAS, NombreTarea } from "../cola";
import { tareaRegistrarVentaBind } from "./registrar-venta-bind";
import { tareaTimbrarCfdi } from "./timbrar-cfdi";
import { tareaGenerarGuiaEnvio } from "./generar-guia-envio";
import { tareaEnviarCorreo } from "./enviar-correo";

type ManejadorTarea = (container: MedusaContainer, orderId: string, job: Job) => Promise<void>;

export const MANEJADORES: Record<NombreTarea, ManejadorTarea> = {
  [TAREAS.REGISTRAR_VENTA_BIND]: tareaRegistrarVentaBind,
  [TAREAS.TIMBRAR_CFDI]: tareaTimbrarCfdi,
  [TAREAS.GENERAR_GUIA_ENVIO]: tareaGenerarGuiaEnvio,
  [TAREAS.ENVIAR_CORREO]: tareaEnviarCorreo,
};
