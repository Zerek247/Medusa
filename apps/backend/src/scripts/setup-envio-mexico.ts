// Configura la infraestructura de envíos para México (Fase 4). Idempotente:
// se puede correr varias veces sin duplicar nada. Sigue el mismo patrón
// que usa el propio seed inicial de Medusa
// (src/migration-scripts/initial-data-seed.ts) para crear región/zona de
// servicio/opciones de envío -- es la referencia más confiable porque ya
// sabemos que funciona en esta versión exacta.
//
// Uso:
//   npx medusa exec ./src/scripts/setup-envio-mexico.ts
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createRegionsWorkflow, createShippingOptionsWorkflow, updateRegionsWorkflow, updateStoresWorkflow } from "@medusajs/medusa/core-flows";

const PROVEEDOR_SKYDROPX = "skydropx_skydropx";
const PROVEEDOR_MANUAL = "manual_manual";

const OPCIONES_SKYDROPX = [
  { id: "skydropx-dhl", label: "DHL Express (Skydropx)", code: "skydropx-dhl" },
  { id: "skydropx-fedex", label: "FedEx Economy (Skydropx)", code: "skydropx-fedex" },
  { id: "skydropx-estafeta", label: "Estafeta Terrestre (Skydropx)", code: "skydropx-estafeta" },
  { id: "skydropx-paquetexpress", label: "Paquetexpress Regional (Skydropx)", code: "skydropx-paquetexpress" },
];

export default async function setupEnvioMexico({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);

  // 1) Moneda mxn en la tienda (por si este script corre antes que el
  // primer sync de Bind, que también la agrega).
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "supported_currencies.currency_code", "supported_currencies.is_default"],
  });
  const store = stores[0];
  if (!store.supported_currencies?.some((c: any) => c.currency_code === "mxn")) {
    logger.info('Agregando "mxn" a las monedas soportadas de la tienda...');
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          supported_currencies: [
            ...(store.supported_currencies || []).map((c: any) => ({
              currency_code: c.currency_code,
              is_default: c.is_default,
            })),
            { currency_code: "mxn", is_default: false },
          ],
        },
      },
    });
  }

  // 2) Región México (mxn, país mx). Si ya existe, la reusamos.
  const { data: regionesExistentes } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  });
  let region = regionesExistentes.find((r: any) => r.name === "México");
  if (!region) {
    logger.info("Creando región México...");
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "México",
            currency_code: "mxn",
            countries: ["mx"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    region = result[0];
  } else {
    logger.info("Región México ya existía, la reuso.");
  }

  // 2.1) Habilitamos Stripe (Fase 5) como proveedor de pago de la región,
  // SIN quitar "pp_system_default" -- OJO: `payment_providers` en
  // updateRegionsWorkflow es la lista COMPLETA deseada, no un "agrega
  // esto". Si mandáramos solo ["pp_stripe_stripe"], Medusa desligaría
  // pp_system_default de la región (lo confirma el propio step
  // setRegionsPaymentProvidersStep, que calcula un diff completo:
  // liga lo que falte, DESLIGA lo que sobre). Por eso siempre mandamos la
  // lista completa que queremos, no un delta -- correrlo varias veces con
  // la misma lista es un no-op (el diff sale vacío).
  await updateRegionsWorkflow(container).run({
    input: {
      selector: { id: region.id },
      update: { payment_providers: ["pp_system_default", "pp_stripe_stripe"] },
    },
  });
  logger.info('Proveedores de pago de la región México: ["pp_system_default", "pp_stripe_stripe"].');

  // 3) Reusamos la ubicación de inventario y el fulfillment_set que ya
  // existen (creados por el seed inicial) -- no hace falta una bodega
  // nueva, un mismo almacén puede servir a varias regiones.
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "fulfillment_sets.id", "fulfillment_sets.name", "fulfillment_sets.service_zones.id", "fulfillment_sets.service_zones.name"],
    pagination: { take: 1 },
  });
  const stockLocation = stockLocations[0];
  const fulfillmentSet = (stockLocation as any).fulfillment_sets?.[0];
  if (!fulfillmentSet) {
    throw new Error("La ubicación de inventario no tiene fulfillment_set -- corre las migraciones primero.");
  }

  // 4) Habilitamos el proveedor "skydropx" para esta ubicación (el seed
  // inicial solo habilitó "manual").
  const { data: proveedoresLigados } = await query.graph({
    entity: "location_fulfillment_provider",
    fields: ["fulfillment_provider_id"],
    filters: { stock_location_id: stockLocation.id },
  });
  const yaLigado = proveedoresLigados.some((p: any) => p.fulfillment_provider_id === PROVEEDOR_SKYDROPX);
  if (!yaLigado) {
    logger.info('Habilitando el proveedor "skydropx" para la ubicación de inventario...');
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: PROVEEDOR_SKYDROPX },
    });
  }

  // 5) Zona de servicio "México" dentro del fulfillment_set existente, si
  // no existe ya.
  let zonaMexico = (fulfillmentSet as any).service_zones?.find((z: any) => z.name === "México");
  if (!zonaMexico) {
    logger.info('Creando zona de servicio "México"...');
    zonaMexico = await fulfillmentModuleService.createServiceZones({
      fulfillment_set_id: fulfillmentSet.id,
      name: "México",
      geo_zones: [{ country_code: "mx", type: "country" }],
    });
  } else {
    logger.info('Zona de servicio "México" ya existía, la reuso.');
  }

  // 6) Perfil de envío por defecto (el mismo que usan todos los productos).
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
    pagination: { take: 1 },
  });
  const shippingProfileId = shippingProfiles[0].id;

  // 7) Opciones de envío: 4 calculadas (Skydropx, una por paquetería) +
  // 1 de respaldo ("Envío por cotizar", proveedor manual, precio 0 --
  // el nombre ES el mensaje para el caso de peso/dimensiones faltantes).
  const { data: opcionesExistentes } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name", "service_zone_id"],
    filters: { service_zone_id: zonaMexico.id },
  });
  const nombresExistentes = new Set(opcionesExistentes.map((o: any) => o.name));

  const nuevasOpciones: any[] = [];

  for (const opcion of OPCIONES_SKYDROPX) {
    if (nombresExistentes.has(opcion.label)) continue;
    nuevasOpciones.push({
      name: opcion.label,
      price_type: "calculated",
      provider_id: PROVEEDOR_SKYDROPX,
      service_zone_id: zonaMexico.id,
      shipping_profile_id: shippingProfileId,
      data: { id: opcion.id },
      type: { label: opcion.label, description: `Cotizado en vivo por Skydropx (${opcion.label}).`, code: opcion.code },
      rules: [
        { attribute: "enabled_in_store", value: "true", operator: "eq" },
        { attribute: "is_return", value: "false", operator: "eq" },
      ],
    });
  }

  if (!nombresExistentes.has("Envío por cotizar")) {
    nuevasOpciones.push({
      name: "Envío por cotizar",
      price_type: "flat",
      provider_id: PROVEEDOR_MANUAL,
      service_zone_id: zonaMexico.id,
      shipping_profile_id: shippingProfileId,
      type: {
        label: "Por cotizar",
        description: "Este pedido necesita que un asesor confirme el costo de envío a mano.",
        code: "por-cotizar",
      },
      prices: [{ region_id: region.id, amount: 0 }],
      rules: [
        { attribute: "enabled_in_store", value: "true", operator: "eq" },
        { attribute: "is_return", value: "false", operator: "eq" },
      ],
    });
  }

  if (nuevasOpciones.length > 0) {
    await createShippingOptionsWorkflow(container).run({ input: nuevasOpciones });
    logger.info(`Creadas ${nuevasOpciones.length} opciones de envío nuevas.`);
  } else {
    logger.info("Todas las opciones de envío ya existían.");
  }

  logger.info("setup-envio-mexico terminado.");
}
