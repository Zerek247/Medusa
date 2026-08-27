// POST /admin/envio/requiere-datos/:productId -- guarda el peso/dimensiones
// capturados a mano desde el panel (Fase 6) y apaga la bandera
// requiere_datos_envio. A partir de la próxima cotización, Skydropx ya
// puede calcular el envío de este producto con datos reales.
//
// Body: { variant_id, weight_kg, length_cm, width_cm, height_cm }
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateProductVariantsWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows";

interface Body {
  variant_id?: string;
  weight_kg?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
}

export async function POST(req: MedusaRequest<Body>, res: MedusaResponse) {
  const { productId } = req.params;
  const { variant_id, weight_kg, length_cm, width_cm, height_cm } = req.body || {};

  if (!variant_id || !weight_kg || !length_cm || !width_cm || !height_cm) {
    res.status(400).json({
      error: "Faltan variant_id, weight_kg, length_cm, width_cm y/o height_cm (los cuatro son obligatorios y deben ser mayores a 0).",
    });
    return;
  }

  await updateProductVariantsWorkflow(req.scope).run({
    input: {
      product_variants: [
        {
          id: variant_id,
          weight: weight_kg,
          length: length_cm,
          width: width_cm,
          height: height_cm,
        },
      ],
    },
  });

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data: productos } = await query.graph({
    entity: "product",
    fields: ["id", "metadata"],
    filters: { id: productId },
  });
  const metadataActual = productos[0]?.metadata || {};

  await updateProductsWorkflow(req.scope).run({
    input: {
      products: [
        {
          id: productId,
          metadata: { ...metadataActual, requiere_datos_envio: false },
        },
      ],
    },
  });

  res.json({ mensaje: "Peso y dimensiones guardados. El producto ya se puede cotizar con Skydropx." });
}
