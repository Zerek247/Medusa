// PRUEBA EN SECO del catálogo de Bind. SOLO LEE: pide datos a Bind (GET) y
// consulta Medusa, pero NO crea, actualiza ni borra nada en ninguno de los
// dos. Sirve para ver cuántos productos entrarían antes de sincronizar.
//
// Uso:
//   npx medusa exec ./src/scripts/bind-prueba-en-seco.ts
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { obtenerCatalogoBind, obtenerCategoriasBind } from "../lib/bind-sync/bind-client";

export default async function bindPruebaEnSeco({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const [productos, categorias] = await Promise.all([
    obtenerCatalogoBind(logger),
    obtenerCategoriasBind(logger),
  ]);

  const conExistencia = productos.filter((p) => p.existencia > 0);

  // SKUs repetidos (dos productos de Bind con el mismo código chocarían en Medusa)
  const conteoSku = new Map<string, number>();
  for (const p of productos) conteoSku.set(p.sku, (conteoSku.get(p.sku) || 0) + 1);
  const repetidos = [...conteoSku.entries()].filter(([, n]) => n > 1);

  // Cuáles ya existen en Medusa
  const existentes = new Set<string>();
  const skus = productos.map((p) => p.sku);
  for (let i = 0; i < skus.length; i += 500) {
    const { data } = await query.graph({
      entity: "product_variant",
      fields: ["sku"],
      filters: { sku: skus.slice(i, i + 500) },
    });
    for (const v of data) if (v.sku) existentes.add(v.sku);
  }

  // Categorías que realmente haría falta crear (las de los productos con
  // existencia, más sus padres)
  const porId = new Map(categorias.map((c) => [c.id, c]));
  const necesarias = new Set<string>();
  let sinCategoria = 0;
  for (const p of conExistencia) {
    if (!p.categoria_bind_id || !porId.has(p.categoria_bind_id)) {
      sinCategoria += 1;
      continue;
    }
    let actual = porId.get(p.categoria_bind_id);
    while (actual) {
      necesarias.add(actual.id);
      actual = actual.padre_id ? porId.get(actual.padre_id) : undefined;
    }
  }

  // Productos con existencia por categoría raíz
  const porRaiz = new Map<string, number>();
  for (const p of conExistencia) {
    let c = p.categoria_bind_id ? porId.get(p.categoria_bind_id) : undefined;
    while (c?.padre_id) c = porId.get(c.padre_id);
    const nombre = c?.nombre || "(sin categoría)";
    porRaiz.set(nombre, (porRaiz.get(nombre) || 0) + 1);
  }

  const lineas = [
    "",
    "===== PRUEBA EN SECO (no se escribió nada) =====",
    `Productos en Bind: ${productos.length}`,
    `  con existencia > 0 (los que se publicarían): ${conExistencia.length}`,
    `  con foto en Bind: ${productos.filter((p) => p.imagen_url).length}`,
    `  con peso capturado: ${productos.filter((p) => p.peso_kg).length}`,
    `Códigos repetidos en Bind: ${repetidos.length}${repetidos.length ? " -> " + repetidos.slice(0, 5).map(([s, n]) => `${s}(x${n})`).join(", ") : ""}`,
    `Ya existen en Medusa (por código): ${existentes.size}`,
    `  se CREARÍAN: ${conExistencia.filter((p) => !existentes.has(p.sku)).length}`,
    `  se ACTUALIZARÍAN (existencia): ${conExistencia.filter((p) => existentes.has(p.sku)).length}`,
    `Categorías en Bind: ${categorias.length} (${categorias.filter((c) => !c.padre_id).length} raíz)`,
    `  categorías que se crearían (las usadas): ${necesarias.size}`,
    `  productos con existencia SIN categoría: ${sinCategoria}`,
    "Productos con existencia por categoría raíz:",
    ...[...porRaiz.entries()].sort((a, b) => b[1] - a[1]).map(([n, c]) => `  ${String(c).padStart(4)}  ${n}`),
    "Ejemplos (primeros 8 con existencia):",
    ...conExistencia.slice(0, 8).map((p) => `  [${p.sku}] ${p.nombre} -- existencia ${p.existencia}`),
    "================================================",
  ];
  console.log(lineas.join("\n"));
}
