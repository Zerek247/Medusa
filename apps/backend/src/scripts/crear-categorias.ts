// Crea categorías reales de equipo médico (Fase 6) y asigna cada producto ya
// sincronizado desde Bind ERP según el prefijo de su SKU. Idempotente: se
// puede correr varias veces sin duplicar categorías ni perder asignaciones
// manuales -- si un producto YA tiene alguna categoría asignada, no se toca
// (mismo criterio de "no pisar lo que ya se curó a mano" que sync-catalog.ts
// aplica a título/descripción/imágenes).
//
// Por qué por prefijo de SKU y no un campo nuevo en el mock de Bind: Bind
// ERP (real o mock) nunca mandó categorías -- son taxonomía DE LA TIENDA,
// no del ERP. Los prefijos (OXIM-, ESTE-, etc.) ya codifican una familia de
// producto razonable porque así se diseñó el catálogo semilla de Fase 2.
//
// Uso:
//   npx medusa exec ./src/scripts/crear-categorias.ts
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows";

const CATEGORIAS = [
  {
    name: "Oxigenoterapia",
    description: "Tanques, concentradores y accesorios para suministro de oxígeno.",
    prefijos: ["TANQ-"],
  },
  {
    name: "Terapia respiratoria",
    description: "Nebulizadores y sus accesorios para tratamientos respiratorios.",
    prefijos: ["NEBUL-"],
  },
  {
    name: "Diagnóstico y monitoreo",
    description: "Oximetría, auscultación y electrodos para monitoreo de signos vitales.",
    prefijos: ["OXIM-", "ESTE-", "ELEC-"],
  },
  {
    name: "Básculas y antropometría",
    description: "Básculas clínicas, pediátricas y de bioimpedancia.",
    prefijos: ["BASC-"],
  },
  {
    name: "Accesorios y consumibles",
    description: "Baterías, tiras reactivas y otros consumibles de uso frecuente.",
    prefijos: ["BAT-", "TIRA-"],
  },
];

export default async function crearCategorias({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const productModuleService = container.resolve(Modules.PRODUCT);

  // 1) Categorías: crear las que falten.
  const { data: categoriasExistentes } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  });
  const nombresExistentes = new Set(categoriasExistentes.map((c: any) => c.name));

  const nuevasCategorias = CATEGORIAS.filter((c) => !nombresExistentes.has(c.name));
  if (nuevasCategorias.length > 0) {
    await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: nuevasCategorias.map((c) => ({
          name: c.name,
          description: c.description,
          is_active: true,
        })),
      },
    });
    logger.info(`Creadas ${nuevasCategorias.length} categoría(s) nueva(s).`);
  } else {
    logger.info("Todas las categorías ya existían.");
  }

  const { data: categoriasActuales } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  });
  const idPorNombre = new Map(categoriasActuales.map((c: any) => [c.name, c.id]));

  // 2) Productos: asignar categoría por prefijo de SKU, SOLO si el producto
  // todavía no tiene ninguna categoría (para no pisar una reclasificación
  // manual hecha desde el admin).
  const { data: productos } = await query.graph({
    entity: "product",
    fields: ["id", "categories.id", "variants.sku"],
  });

  let asignados = 0;
  for (const producto of productos as any[]) {
    if (producto.categories && producto.categories.length > 0) continue;

    const sku = producto.variants?.[0]?.sku;
    if (!sku) continue;

    const categoria = CATEGORIAS.find((c) => c.prefijos.some((p) => sku.startsWith(p)));
    if (!categoria) continue;

    const categoryId = idPorNombre.get(categoria.name);
    if (!categoryId) continue;

    await productModuleService.updateProducts(producto.id, {
      category_ids: [categoryId],
    });
    asignados += 1;
  }

  logger.info(`Categorías asignadas a ${asignados} producto(s) (los que ya tenían categoría se dejaron intactos).`);
}
