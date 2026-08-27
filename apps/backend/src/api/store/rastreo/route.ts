// GET /store/rastreo?numero=<order_display_id>&email=<email> -- rastreo de
// pedido PÚBLICO (Fase 6), sin necesitar cuenta ni sesión. A propósito NO
// usamos GET /store/orders/:id con el ID real de la orden (un ULID) como
// única llave -- aunque ese endpoint YA es de acceso libre en Medusa (así
// funciona la pantalla de confirmación para compradores invitados), un
// número de pedido corto (el display_id, ej. "3") es mucho más cómodo de
// escribir a mano en un formulario de rastreo... pero también mucho más
// fácil de ADIVINAR. Por eso aquí exigimos también el correo del pedido y
// lo comparamos del lado del servidor antes de devolver nada -- no basta
// con adivinar un número de orden consecutivo para ver los datos de otra
// persona.
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const numero = req.query.numero as string | undefined;
  const email = (req.query.email as string | undefined)?.trim().toLowerCase();

  if (!numero || !email) {
    res.status(400).json({ error: "Faltan los parámetros numero y email." });
    return;
  }

  const displayId = parseInt(numero, 10);
  if (!Number.isInteger(displayId)) {
    res.status(400).json({ error: "numero debe ser el número de pedido (solo dígitos)." });
    return;
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data: ordenes } = await query.graph({
    entity: "order",
    // OJO: "items.quantity" como campo explícito suelto se queda en
    // silencio fuera del resultado en esta versión de query.graph -- sin
    // error, simplemente no viene. "items.*" trae todo el renglón ya
    // resuelto. Mismo hallazgo que en las tareas de la cola post-pago
    // (Fase 5). payment_status/fulfillment_status, en cambio, NO se piden
    // explícitos -- son campos calculados que vienen por default en la
    // entidad "order" y pedirlos por nombre (con o sin "+") los saca del
    // resultado en vez de traerlos.
    fields: [
      "id",
      "display_id",
      "email",
      "status",
      "created_at",
      "metadata",
      "items.*",
      "shipping_methods.name",
    ],
    filters: { display_id: displayId },
  });

  const orden = (ordenes as any[])[0];

  // Mismo mensaje genérico tanto si el pedido no existe como si el correo
  // no coincide -- no le damos a un atacante la pista de "el número existe
  // pero el correo está mal" (eso le confirmaría números de pedido válidos
  // uno por uno).
  if (!orden || orden.email?.trim().toLowerCase() !== email) {
    res.status(404).json({ error: "No encontramos un pedido con ese número y correo." });
    return;
  }

  const metadata = orden.metadata || {};
  const tieneGuia = Boolean(metadata.guia_envio_numero);
  const requiereRevision = Boolean(metadata.requiere_revision_manual);

  // Un estatus en lenguaje llano para el comprador -- más útil que exponer
  // el status interno crudo de la orden. El orden de los "if" importa: la
  // guía manda si ya existe, sin importar si en algún momento se marcó
  // requiere_revision_manual (por ejemplo, si un asesor ya cotizó y generó
  // el envío a mano fuera de Skydropx y alguien actualizó la guía).
  let estatusLegible: string;
  if (tieneGuia) {
    estatusLegible = "Enviado";
  } else if (requiereRevision) {
    estatusLegible = "En revisión -- un asesor está confirmando el costo de tu envío";
  } else {
    estatusLegible = "Preparando tu pedido";
  }

  res.json({
    pedido: {
      numero: orden.display_id,
      fecha: orden.created_at,
      estatus: estatusLegible,
      metodo_envio: orden.shipping_methods?.[0]?.name ?? null,
      guia: tieneGuia
        ? { numero: metadata.guia_envio_numero, url_rastreo: metadata.guia_envio_rastreo }
        : null,
      articulos: (orden.items || []).map((i: any) => ({ titulo: i.title, cantidad: i.quantity })),
    },
  });
}
