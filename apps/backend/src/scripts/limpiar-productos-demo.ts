// Borra los productos y categorías DE MUESTRA que trae el seed inicial del
// starter de Medusa (camisetas, pants, sudaderas...) -- Fase 6 pide
// explícitamente "sin plantillas genéricas de tienda de ropa", y mientras
// sigan en la base contaminan los filtros del catálogo (aparecen tallas y
// colores de ropa en "Options" del buscador) y las categorías (Shirts,
// Pants, Sweatshirts, Merch mezcladas con las reales).
//
// Identifica lo "de muestra" por AUSENCIA de metadata.bind_id -- todo
// producto real de este catálogo viene de Bind ERP (Fase 3) y siempre trae
// ese campo; nada más en este proyecto crea productos.
//
// Uso:
//   npx medusa exec ./src/scripts/limpiar-productos-demo.ts
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { deleteProductsWorkflow, deleteProductCategoriesWorkflow } from "@medusajs/medusa/core-flows";

export default async function limpiarProductosDemo({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: productos } = await query.graph({
    entity: "product",
    fields: ["id", "title", "metadata"],
  });

  const demo = (productos as any[]).filter((p) => p.metadata?.bind_id == null);

  if (demo.length > 0) {
    await deleteProductsWorkflow(container).run({
      input: { ids: demo.map((p) => p.id) },
    });
    logger.info(`Borrados ${demo.length} producto(s) de muestra: ${demo.map((p) => p.title).join(", ")}`);
  } else {
    logger.info("No había productos de muestra que borrar.");
  }

  // Categorías que se quedaron sin ningún producto después del borrado de
  // arriba (las de muestra: Shirts/Pants/Sweatshirts/Merch) -- no se borra
  // ninguna categoría a ciegas, solo las que quedan vacías.
  const { data: categorias } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "products.id"],
  });
  const vacias = (categorias as any[]).filter((c) => !c.products || c.products.length === 0);

  if (vacias.length > 0) {
    // OJO: a diferencia de deleteProductsWorkflow ({ids: [...]}), este
    // workflow toma el arreglo de ids DIRECTO como input, sin envolver.
    await deleteProductCategoriesWorkflow(container).run({
      input: vacias.map((c) => c.id),
    });
    logger.info(`Borradas ${vacias.length} categoría(s) vacía(s): ${vacias.map((c) => c.name).join(", ")}`);
  } else {
    logger.info("No había categorías vacías que borrar.");
  }
}
