// GET /admin/envio/requiere-datos -- productos marcados por el sync de
// Bind (Fase 3) con metadata.requiere_datos_envio=true, para que el equipo
// de operación les capture peso/dimensiones a mano desde el panel (Fase 6).
// Mientras un producto siga en esta lista, Skydropx no puede cotizarlo
// (Fase 4) -- solo queda disponible "Envío por cotizar" para él.
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: productos } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "thumbnail",
      "metadata",
      "variants.id",
      "variants.sku",
      "variants.weight",
      "variants.length",
      "variants.width",
      "variants.height",
    ],
    filters: {
      // OJO: el filtro de query.graph sobre JSON metadata no soporta
      // booleanos anidados de forma confiable en esta versión -- filtramos
      // por SKU-nada, traemos todo y filtramos en memoria. El catálogo es
      // de decenas de productos, no miles; el costo es insignificante.
    },
  });

  const pendientes = (productos as any[]).filter((p) => p.metadata?.requiere_datos_envio === true);

  res.json({
    productos: pendientes.map((p) => ({
      id: p.id,
      title: p.title,
      thumbnail: p.thumbnail,
      variant_id: p.variants?.[0]?.id,
      sku: p.variants?.[0]?.sku,
      weight: p.variants?.[0]?.weight,
      length: p.variants?.[0]?.length,
      width: p.variants?.[0]?.width,
      height: p.variants?.[0]?.height,
    })),
    count: pendientes.length,
  });
}
