// Proveedor de envíos custom que cotiza en tiempo real contra el mock de
// Skydropx. Un producto (Fulfillment Option) por cada paquetería que
// devuelve el mock, para que en el checkout aparezcan como opciones
// separadas con su propio precio y días de entrega.
//
// CASO CRÍTICO (pedido explícito del negocio): si algún artículo del
// carrito no tiene peso o dimensiones capturados, NO se cotiza -- en vez
// de eso, calculatePrice truena a propósito. Eso hace que Medusa no pueda
// resolver el precio de estas opciones "Skydropx" y no las muestre; lo
// único que le queda al comprador es la opción de envío manual "Envío por
// cotizar" (configurada aparte, con el proveedor "manual" de Medusa, sin
// necesidad de calcular nada). No hace falta un mensaje especial en el
// frontend: el NOMBRE de esa opción de respaldo ya ES el mensaje.
import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils";
import { Logger } from "@medusajs/framework/types";
import { cotizar, crearEnvio, TarifaSkydropx } from "./skydropx-client";

type InjectedDependencies = {
  logger: Logger;
};

// Código postal de origen: la bodega/negocio. Configurable porque en la
// vida real dependería de dónde esté ubicado el almacén que surte.
const CP_ORIGEN = process.env.SKYDROPX_CP_ORIGEN || "01000"; // CDMX por defecto

// Un fulfillment option por paquetería. El "id" es lo que amarra la
// opción de envío (creada en el admin) con qué tarifa de la cotización de
// Skydropx le corresponde.
const OPCIONES = [
  { id: "skydropx-dhl", name: "DHL Express (Skydropx)", carrier: "DHL" },
  { id: "skydropx-fedex", name: "FedEx Economy (Skydropx)", carrier: "FedEx" },
  { id: "skydropx-estafeta", name: "Estafeta Terrestre (Skydropx)", carrier: "Estafeta" },
  { id: "skydropx-paquetexpress", name: "Paquetexpress Regional (Skydropx)", carrier: "Paquetexpress" },
];

class SkydropxFulfillmentProviderService extends AbstractFulfillmentProviderService {
  static identifier = "skydropx";

  protected logger_: Logger;

  constructor({ logger }: InjectedDependencies) {
    super();
    this.logger_ = logger;
  }

  async getFulfillmentOptions() {
    return OPCIONES.map((o) => ({ id: o.id, name: o.name, is_return: false }));
  }

  async validateOption(): Promise<boolean> {
    return true;
  }

  async canCalculate(): Promise<boolean> {
    // La validación real (¿el carrito tiene peso/dimensiones completos?)
    // pasa en calculatePrice, donde sí tenemos acceso al carrito. Aquí
    // siempre decimos "sí se puede intentar calcular".
    return true;
  }

  // Reúne del carrito: peso total y las dimensiones del artículo más
  // grande (aproximación razonable para un mock: en la realidad Skydropx
  // tiene su propia lógica de empaquetado multi-caja). Si CUALQUIER
  // artículo no tiene peso o alguna dimensión, lanza un error a propósito
  // -- ese es el "no intentes cotizar" que pidió el negocio.
  private medirCarrito(context: Record<string, unknown>) {
    const items = (context as any)?.items as
      | Array<{ quantity: number; variant?: { weight?: number | null; length?: number | null; width?: number | null; height?: number | null } }>
      | undefined;

    if (!items || items.length === 0) {
      throw new Error("El carrito no tiene artículos para cotizar envío.");
    }

    let pesoTotal = 0;
    let largoMax = 0;
    let anchoMax = 0;
    let altoMax = 0;

    for (const item of items) {
      const v = item.variant;
      if (!v || v.weight == null || v.length == null || v.width == null || v.height == null) {
        throw new Error(
          "Al menos un producto del carrito no tiene peso o dimensiones capturados -- no se puede cotizar con Skydropx."
        );
      }
      pesoTotal += v.weight * item.quantity;
      largoMax = Math.max(largoMax, v.length);
      anchoMax = Math.max(anchoMax, v.width);
      altoMax = Math.max(altoMax, v.height);
    }

    return { pesoTotal, largoMax, anchoMax, altoMax };
  }

  private obtenerCpDestino(context: Record<string, unknown>): string {
    const direccion =
      (context as any)?.shipping_address ||
      (context as any)?.shippingAddress ||
      (context as any)?.data?.shipping_address;
    const cp = direccion?.postal_code || direccion?.postalCode;
    if (!cp) {
      throw new Error("No hay código postal de envío en el carrito todavía.");
    }
    return cp;
  }

  async calculatePrice(
    optionData: Record<string, unknown>,
    _data: Record<string, unknown>,
    context: Record<string, unknown>
  ) {
    const opcion = OPCIONES.find((o) => o.id === optionData.id);
    if (!opcion) {
      throw new Error(`Opción de envío desconocida: ${optionData.id}`);
    }

    const { pesoTotal, largoMax, anchoMax, altoMax } = this.medirCarrito(context);
    const cpDestino = this.obtenerCpDestino(context);

    const { tarifas } = await cotizar({
      cpOrigen: CP_ORIGEN,
      cpDestino,
      pesoKg: pesoTotal,
      largoCm: largoMax,
      anchoCm: anchoMax,
      altoCm: altoMax,
    });

    const tarifa = tarifas.find((t: TarifaSkydropx) => t.carrier === opcion.carrier);
    if (!tarifa) {
      throw new Error(`Skydropx no devolvió tarifa para ${opcion.carrier}`);
    }

    return {
      calculated_amount: tarifa.precio,
      is_calculated_price_tax_inclusive: false,
    };
  }

  // Se llama cuando el comprador REALMENTE elige esta opción (no solo al
  // listarlas) -- acá guardamos el rate_id de Skydropx para poder generar
  // la guía después, en createFulfillment, sin tener que volver a cotizar.
  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: Record<string, unknown>
  ) {
    const opcion = OPCIONES.find((o) => o.id === optionData.id);
    if (!opcion) {
      throw new Error(`Opción de envío desconocida: ${optionData.id}`);
    }

    const { pesoTotal, largoMax, anchoMax, altoMax } = this.medirCarrito(context);
    const cpDestino = this.obtenerCpDestino(context);

    const { tarifas } = await cotizar({
      cpOrigen: CP_ORIGEN,
      cpDestino,
      pesoKg: pesoTotal,
      largoCm: largoMax,
      anchoCm: anchoMax,
      altoCm: altoMax,
    });
    const tarifa = tarifas.find((t: TarifaSkydropx) => t.carrier === opcion.carrier);
    if (!tarifa) {
      throw new Error(`Skydropx no devolvió tarifa para ${opcion.carrier}`);
    }

    return { ...data, skydropx_rate_id: tarifa.rate_id, skydropx_carrier: opcion.carrier };
  }

  async createFulfillment(
    data: Record<string, unknown>
  ): Promise<{ data: Record<string, unknown>; labels?: Array<{ tracking_number: string; tracking_url: string; label_url: string }> }> {
    const rateId = data?.skydropx_rate_id as string | undefined;
    if (!rateId) {
      // No debería pasar si validateFulfillmentData corrió antes, pero si
      // pasa, es mejor fallar claro que generar un envío sin guía real.
      throw new Error("Falta skydropx_rate_id -- no se puede generar la guía de envío.");
    }

    const envio = await crearEnvio(rateId);
    this.logger_.info(`[skydropx-fulfillment] Guía generada: ${envio.numero_guia}`);

    return {
      data: { ...data, numero_guia: envio.numero_guia, url_rastreo: envio.url_rastreo },
      labels: [
        {
          tracking_number: envio.numero_guia,
          tracking_url: envio.url_rastreo,
          label_url: envio.url_etiqueta,
        },
      ],
    };
  }

  async createReturnFulfillment(fulfillment: Record<string, unknown>) {
    return { data: fulfillment };
  }

  async cancelFulfillment(): Promise<void> {
    // El mock no tiene endpoint de cancelación de envío; en Skydropx real
    // se llamaría a su API de cancelación aquí.
  }

  async getFulfillmentDocuments() {
    return [];
  }

  async getReturnDocuments() {
    return [];
  }

  async getShipmentDocuments() {
    return [];
  }

  async retrieveDocuments(): Promise<void> {}
}

export default SkydropxFulfillmentProviderService;
