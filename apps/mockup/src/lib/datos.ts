// MAQUETA -- todo lo de este archivo es INVENTADO y vive solo aquí. No hay
// backend, no hay base de datos: cada pantalla del sitio y del panel lee
// estos mismos arreglos. Si quieres cambiar un producto/precio/pedido de
// ejemplo, este es el único lugar que hay que tocar.
//
// El catálogo es el mismo que se preparó para la demo real
// (apps/backend/src/seed/productos-demo.jsonc) -- cuando lleguen las fotos
// y datos reales del cliente, reemplázalos aquí también para que la
// maqueta y la demo real digan lo mismo.

export type Producto = {
  slug: string;
  sku: string;
  nombre: string;
  descripcion: string;
  descripcionLarga: string;
  precio: number;
  existencia: number;
  categoria: string;
  pesoKg: number;
  largoCm: number;
  anchoCm: number;
  altoCm: number;
  requiereDatosEnvio: boolean;
};

export const categorias = [
  { slug: "diagnostico-y-monitoreo", nombre: "Diagnóstico y monitoreo" },
  { slug: "oxigenoterapia", nombre: "Oxigenoterapia" },
  { slug: "terapia-respiratoria", nombre: "Terapia respiratoria" },
  { slug: "basculas-y-antropometria", nombre: "Básculas y antropometría" },
];

export const productos: Producto[] = [
  {
    slug: "monitor-signos-vitales-portatil",
    sku: "DEMO-001",
    nombre: "Monitor de signos vitales portátil",
    descripcion:
      "Monitoreo de SpO2, frecuencia cardiaca y presión arterial no invasiva.",
    descripcionLarga:
      "Monitoreo de SpO2, frecuencia cardiaca y presión arterial no invasiva, pantalla a color de 8 pulgadas, batería de hasta 4 horas. Ideal para consultorio y traslado de pacientes.",
    precio: 18500,
    existencia: 6,
    categoria: "diagnostico-y-monitoreo",
    pesoKg: 2.8,
    largoCm: 30,
    anchoCm: 22,
    altoCm: 12,
    requiereDatosEnvio: false,
  },
  {
    slug: "desfibrilador-dea-automatico",
    sku: "DEMO-002",
    nombre: "Desfibrilador (DEA) automático externo",
    descripcion:
      "Guía de voz en español, análisis automático de ritmo cardiaco.",
    descripcionLarga:
      "Guía de voz en español, análisis automático de ritmo cardiaco, incluye electrodos adulto y estuche de transporte. Cumple con la normativa para uso en consultorio y espacios públicos.",
    precio: 32000,
    existencia: 3,
    categoria: "diagnostico-y-monitoreo",
    pesoKg: 3.1,
    largoCm: 29,
    anchoCm: 25,
    altoCm: 10,
    requiereDatosEnvio: false,
  },
  {
    slug: "concentrador-oxigeno-10l",
    sku: "DEMO-003",
    nombre: "Concentrador de oxígeno 10L de uso continuo",
    descripcion:
      "Para uso domiciliario, doble salida de flujo, humidificador incluido.",
    descripcionLarga:
      "Para uso domiciliario, doble salida de flujo, humidificador incluido, ruedas para traslado dentro del consultorio. Operación silenciosa, pensado para uso prolongado.",
    precio: 24500,
    existencia: 4,
    categoria: "oxigenoterapia",
    pesoKg: 23.5,
    largoCm: 40,
    anchoCm: 33,
    altoCm: 58,
    requiereDatosEnvio: true,
  },
  {
    slug: "ventilador-transporte-portatil",
    sku: "DEMO-004",
    nombre: "Ventilador de transporte portátil",
    descripcion:
      "Modos de ventilación asistida/controlada, batería interna de respaldo.",
    descripcionLarga:
      "Modos de ventilación asistida/controlada, batería interna de respaldo, pantalla táctil, ideal para traslado de pacientes entre áreas o instituciones.",
    precio: 68000,
    existencia: 2,
    categoria: "oxigenoterapia",
    pesoKg: 5.4,
    largoCm: 35,
    anchoCm: 28,
    altoCm: 18,
    requiereDatosEnvio: false,
  },
  {
    slug: "nebulizador-ultrasonico-hospitalario",
    sku: "DEMO-005",
    nombre: "Nebulizador ultrasónico de uso hospitalario",
    descripcion: "Partícula ultrafina, tanque de 500ml, temporizador programable.",
    descripcionLarga:
      "Partícula ultrafina, tanque de 500ml, temporizador programable, para uso continuo en consultorio. Diseño compacto y de fácil limpieza.",
    precio: 4200,
    existencia: 12,
    categoria: "terapia-respiratoria",
    pesoKg: 1.6,
    largoCm: 24,
    anchoCm: 18,
    altoCm: 16,
    requiereDatosEnvio: false,
  },
  {
    slug: "bascula-clinica-digital-estadimetro",
    sku: "DEMO-006",
    nombre: "Báscula clínica digital con estadímetro integrado",
    descripcion: "Capacidad 250kg, precisión de 100g, estadímetro hasta 200cm.",
    descripcionLarga:
      "Capacidad 250kg, precisión de 100g, estadímetro hasta 200cm, pantalla digital de fácil lectura. Estructura robusta para uso diario en consultorio.",
    precio: 9800,
    existencia: 5,
    categoria: "basculas-y-antropometria",
    pesoKg: 19,
    largoCm: 55,
    anchoCm: 50,
    altoCm: 195,
    requiereDatosEnvio: true,
  },
  {
    slug: "kit-diagnostico-otoscopio-oftalmoscopio",
    sku: "DEMO-007",
    nombre: "Kit de diagnóstico (otoscopio + oftalmoscopio)",
    descripcion: "Set completo con mango recargable y estuche rígido.",
    descripcionLarga:
      "Set completo con mango recargable, cabezales de otoscopio y oftalmoscopio, estuche rígido de transporte. Óptica de precisión para exploración clínica diaria.",
    precio: 6900,
    existencia: 8,
    categoria: "diagnostico-y-monitoreo",
    pesoKg: 0.9,
    largoCm: 25,
    anchoCm: 18,
    altoCm: 8,
    requiereDatosEnvio: false,
  },
  {
    slug: "silla-de-ruedas-plegable-aluminio",
    sku: "DEMO-008",
    nombre: "Silla de ruedas plegable de aluminio",
    descripcion: "Estructura de aluminio ligero, reposapiés desmontables.",
    descripcionLarga:
      "Estructura de aluminio ligero, reposapiés desmontables, frenos de seguridad, plegable para transporte y almacenamiento.",
    precio: 4500,
    existencia: 7,
    categoria: "basculas-y-antropometria",
    pesoKg: 14,
    largoCm: 105,
    anchoCm: 65,
    altoCm: 90,
    requiereDatosEnvio: true,
  },
];

export function formatoMXN(valor: number) {
  return valor.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  });
}

export function productoPorSlug(slug: string) {
  return productos.find((p) => p.slug === slug);
}

export function productosPorCategoria(categoriaSlug: string) {
  return productos.filter((p) => p.categoria === categoriaSlug);
}

export function nombreCategoria(slug: string) {
  return categorias.find((c) => c.slug === slug)?.nombre ?? slug;
}

// --- Cuenta demo precargada (para "Mi cuenta" -> historial) ---
export const clienteDemo = {
  nombre: "María González Ramírez",
  email: "demo@biobackup.mx",
  direcciones: [
    {
      etiqueta: "Consultorio",
      calle: "Av. Insurgentes Sur 1234, Piso 3",
      colonia: "Del Valle",
      cp: "03100",
      ciudad: "Ciudad de México",
      estado: "CDMX",
    },
    {
      etiqueta: "Bodega",
      calle: "Calz. de Tlalpan 890",
      colonia: "Portales",
      cp: "03300",
      ciudad: "Ciudad de México",
      estado: "CDMX",
    },
  ],
};

export type PedidoDemo = {
  folio: string;
  fecha: string;
  estatus: "Enviado" | "Preparando tu pedido" | "En revisión";
  total: number;
  items: { nombre: string; cantidad: number; precio: number }[];
  guia: string | null;
};

export const pedidosDemo: PedidoDemo[] = [
  {
    folio: "#1042",
    fecha: "18 ago 2026",
    estatus: "Enviado",
    total: 28700,
    items: [
      { nombre: "Monitor de signos vitales portátil", cantidad: 1, precio: 18500 },
      { nombre: "Kit de diagnóstico (otoscopio + oftalmoscopio)", cantidad: 1, precio: 6900 },
      { nombre: "Nebulizador ultrasónico de uso hospitalario", cantidad: 1, precio: 3300 },
    ],
    guia: "SKX-88213-MX",
  },
  {
    folio: "#1029",
    fecha: "02 ago 2026",
    estatus: "Enviado",
    total: 9800,
    items: [
      { nombre: "Báscula clínica digital con estadímetro integrado", cantidad: 1, precio: 9800 },
    ],
    guia: "SKX-87990-MX",
  },
];

// --- Datos del panel de administración ---
export const ordenesAdmin = [
  {
    id: "#1042",
    fecha: "18 ago 2026",
    cliente: "María González Ramírez",
    canal: "Tienda en línea",
    pago: "Autorizado",
    envio: "En tránsito",
    total: 28700,
  },
  {
    id: "#1041",
    fecha: "17 ago 2026",
    cliente: "Hospital Ángeles del Pedregal, Compras",
    canal: "Tienda en línea",
    pago: "Capturado",
    envio: "No preparado",
    total: 68000,
  },
  {
    id: "#1040",
    fecha: "15 ago 2026",
    cliente: "Consultorio Dra. Fernanda Ruiz",
    canal: "Tienda en línea",
    pago: "Capturado",
    envio: "Entregado",
    total: 13100,
  },
  {
    id: "#1029",
    fecha: "02 ago 2026",
    cliente: "María González Ramírez",
    canal: "Tienda en línea",
    pago: "Capturado",
    envio: "Entregado",
    total: 9800,
  },
];

export const bitacoraBind = [
  {
    fecha: "26 ago 2026, 09:15",
    origen: "Programada",
    productos: 60,
    creados: 0,
    actualizados: 60,
    fallidos: 0,
    requierenEnvio: 3,
  },
  {
    fecha: "25 ago 2026, 21:15",
    origen: "Programada",
    productos: 60,
    creados: 0,
    actualizados: 58,
    fallidos: 2,
    requierenEnvio: 3,
  },
  {
    fecha: "25 ago 2026, 09:00",
    origen: "Programada",
    productos: 60,
    creados: 1,
    actualizados: 59,
    fallidos: 0,
    requierenEnvio: 3,
  },
  {
    fecha: "24 ago 2026, 18:40",
    origen: "Manual",
    productos: 60,
    creados: 0,
    actualizados: 60,
    fallidos: 0,
    requierenEnvio: 3,
  },
];

export const colaFallidos = [
  {
    tarea: "Registrar venta en Bind",
    orden: "#1038",
    intentos: 4,
    fecha: "23 ago 2026, 19:02",
    error: "fetch failed: tiempo de espera agotado contactando a Bind ERP",
  },
  {
    tarea: "Generar guía de envío",
    orden: "#1035",
    intentos: 4,
    fecha: "22 ago 2026, 11:47",
    error:
      'Skydropx respondió 404: {"error":"rate_id desconocido o expirado"}',
  },
];

export const productosSinDatosEnvio = productos.filter(
  (p) => p.requiereDatosEnvio
);

// Regla de negocio del cliente: envío gratis en pedidos mayores a $3,000
// MXN (checkout y el banner del carrito la usan).
export const UMBRAL_ENVIO_GRATIS = 3000;

// --- Contenido de las páginas nuevas (Sobre nosotros / FAQ / Promociones) ---
// Todo texto de relleno, editable aquí -- en el sistema real esto sería
// administrable desde el panel (el cliente pidió poder subir su propia
// imagen del hero y editar el texto de las promociones).

export const preguntasFrecuentes = [
  {
    pregunta: "¿Cuánto tarda en llegar mi pedido?",
    respuesta:
      "Depende de la paquetería elegida en el checkout: de 1-2 días hábiles con envío Express, o 3-5 días hábiles con envío Terrestre estándar. Para equipo grande que requiere cotización aparte, te contactamos con el tiempo estimado antes de confirmar el envío.",
  },
  {
    pregunta: "¿A partir de qué monto el envío es gratis?",
    respuesta:
      "En pedidos mayores a $3,000 MXN el envío no tiene costo, sin importar la paquetería elegida.",
  },
  {
    pregunta: "¿Emiten factura?",
    respuesta:
      "Sí, todas las compras se facturan con CFDI 4.0. Captura tus datos fiscales (RFC, razón social, régimen fiscal y uso de CFDI) durante el checkout.",
  },
  {
    pregunta: "¿Puedo rastrear mi pedido sin crear una cuenta?",
    respuesta:
      'Sí -- usa la sección "Rastrear pedido" con tu número de pedido y el correo con el que compraste.',
  },
  {
    pregunta: "¿Tienen garantía los equipos?",
    respuesta:
      "Todos los equipos cuentan con garantía del fabricante. El periodo exacto varía por producto y se indica en su ficha.",
  },
  {
    pregunta: "¿Venden a hospitales y clínicas, no solo consultorios?",
    respuesta:
      "Sí, atendemos tanto compras individuales de consultorio como pedidos institucionales de hospitales y clínicas.",
  },
];

export const promociones = [
  {
    titulo: "Envío gratis desde $3,000",
    descripcion:
      "En todo el catálogo, sin código promocional -- se aplica solo al llegar al monto en tu carrito.",
    slugImagen: "promo-envio",
  },
  {
    titulo: "Equipo de diagnóstico",
    descripcion:
      "Monitores, desfibriladores y kits de exploración con disponibilidad inmediata.",
    slugImagen: "promo-diagnostico",
  },
  {
    titulo: "Oxigenoterapia para consultorio",
    descripcion:
      "Concentradores y ventiladores portátiles, con envío calculado a tu código postal.",
    slugImagen: "promo-oxigeno",
  },
];
