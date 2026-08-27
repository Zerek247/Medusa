// Cuenta demo precargada (Fase 6B, MODO_DEMO): demo@biobackup.mx /
// demo1234, con 2 pedidos ya en su historial -- para poder mostrar la
// pantalla de "mis pedidos" en la junta sin tener que comprar en vivo dos
// veces primero. Idempotente: si la cuenta ya existe, no la duplica; si ya
// tiene 2+ pedidos, no crea más.
//
// La creación del cliente pasa por los endpoints HTTP públicos de registro
// (igual que lo haría el storefront) en vez de las piezas internas del
// módulo de auth -- son un contrato estable y ya usado en este proyecto
// (mismo criterio que los clientes de Bind/Skydropx/CFDI: hablarle a la
// API, no a las tripas del servicio). Los pedidos sí se crean con el
// workflow interno porque no existe un endpoint público para "crear una
// orden ya pagada" (con razón: eso normalmente pasa por checkout de
// verdad).
//
// Uso:
//   npx medusa exec ./src/scripts/crear-cuenta-demo.ts
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createOrderWorkflow } from "@medusajs/medusa/core-flows";

const EMAIL_DEMO = "demo@biobackup.mx";
const PASSWORD_DEMO = "demo1234";
const BACKEND_URL = "http://localhost:9000";

export default async function crearCuentaDemo({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  // 1) Publishable key (la necesita /store/customers) -- tomamos cualquiera
  // que ya exista, mismo criterio que mostrar-publishable-key.ts.
  const { data: apiKeys } = await query.graph({
    entity: "api_key",
    fields: ["token"],
    filters: { type: "publishable" },
  });
  const publishableKey = apiKeys[0]?.token;
  if (!publishableKey) {
    throw new Error("No hay ninguna publishable key -- corre el seed inicial primero.");
  }

  // 2) Cliente demo: si ya existe, lo reusamos.
  const { data: clientesExistentes } = await query.graph({
    entity: "customer",
    fields: ["id", "email"],
    filters: { email: EMAIL_DEMO },
  });

  let customerId = clientesExistentes[0]?.id;

  if (!customerId) {
    logger.info(`Registrando cliente demo (${EMAIL_DEMO})...`);
    const registro = await fetch(`${BACKEND_URL}/auth/customer/emailpass/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL_DEMO, password: PASSWORD_DEMO }),
    });
    if (!registro.ok) {
      throw new Error(`Falló el registro de auth: ${registro.status} ${await registro.text()}`);
    }
    const { token } = await registro.json();

    const creado = await fetch(`${BACKEND_URL}/store/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-publishable-api-key": publishableKey,
      },
      body: JSON.stringify({
        email: EMAIL_DEMO,
        first_name: "Cuenta",
        last_name: "Demo",
      }),
    });
    if (!creado.ok) {
      throw new Error(`Falló la creación del cliente: ${creado.status} ${await creado.text()}`);
    }
    const { customer } = await creado.json();
    customerId = customer.id;
    logger.info(`Cliente demo creado: ${customerId}`);
  } else {
    logger.info("El cliente demo ya existía, lo reuso.");
  }

  // 3) Pedidos: si ya tiene 2 o más, no se crean de más.
  const { data: pedidosExistentes } = await query.graph({
    entity: "order",
    fields: ["id"],
    filters: { customer_id: customerId },
  });

  if (pedidosExistentes.length >= 2) {
    logger.info(`El cliente demo ya tiene ${pedidosExistentes.length} pedido(s), no se crean más.`);
    return;
  }

  const { data: regiones } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  });
  const region = regiones.find((r: any) => r.name === "México") || regiones[0];

  const { data: canales } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
    pagination: { take: 1 },
  });

  // Dos productos reales del catálogo (los primeros con precio fijado en
  // mxn), para que el pedido demo se vea con datos de verdad, no genéricos.
  const { data: productos } = await query.graph({
    entity: "product",
    fields: ["id", "title", "variants.id", "variants.sku", "variants.prices.amount", "variants.prices.currency_code"],
    filters: { title: ["Oxímetro de pulso digital básico", "Tanque de oxígeno tipo D, 425 L"] },
  });

  const direccion = {
    first_name: "Cuenta",
    last_name: "Demo",
    address_1: "Av. Insurgentes Sur 1000",
    city: "Ciudad de México",
    province: "CDMX",
    postal_code: "03100",
    country_code: "mx",
    phone: "5555555555",
  };

  const faltan = 2 - pedidosExistentes.length;
  for (let i = 0; i < faltan; i++) {
    const producto = productos[i % productos.length] as any;
    const variante = producto?.variants?.[0];
    const precio = variante?.prices?.find((p: any) => p.currency_code === region.currency_code)?.amount || 500;

    const { result: orden } = await createOrderWorkflow(container).run({
      input: {
        region_id: region.id,
        sales_channel_id: canales[0]?.id,
        customer_id: customerId,
        email: EMAIL_DEMO,
        currency_code: region.currency_code,
        status: "completed",
        items: [
          {
            variant_id: variante?.id,
            quantity: 1,
            title: producto?.title || "Producto demo",
            unit_price: precio,
          },
        ],
        shipping_address: direccion,
        billing_address: direccion,
        transactions: [
          {
            amount: precio,
            currency_code: region.currency_code,
            reference: "order",
            reference_id: "demo",
          },
        ],
      },
    });
    logger.info(`Pedido demo creado: #${orden.display_id} (${producto?.title}).`);
  }
}
