// Datos semilla en memoria para el mock de Bind ERP.
// Se reinician cada vez que se reinicia el contenedor -- correcto para un
// mock: quieres arrancar siempre en un estado predecible al probar.
"use strict";

// 60 productos de equipo médico repartidos en 8 categorías típicas de un
// distribuidor mexicano. peso_kg/largo_cm/ancho_cm/alto_cm se dejan como
// `null` a propósito en el 30% de los productos (ver postProcesarDimensiones
// más abajo) -- imita el problema real de datos incompletos en el ERP: el
// código que consuma este catálogo (para cotizar envíos con Skydropx, por
// ejemplo) tiene que decidir qué hacer cuando no hay peso/dimensiones.

const catalogoBase = [
  // --- Oxímetros de pulso ---
  { sku: "OXIM-001", nombre: "Oxímetro de pulso digital básico", descripcion: "Medición de SpO2 y frecuencia cardiaca, pantalla LED de un dígito.", precio: 219.0, existencia: 140, unidad: "pieza", peso_kg: 0.06, largo_cm: 6, ancho_cm: 3.2, alto_cm: 3.3 },
  { sku: "OXIM-002", nombre: "Oxímetro de pulso con alarma configurable", descripcion: "Alarmas de SpO2 y pulso configurables, pantalla a color.", precio: 385.0, existencia: 80, unidad: "pieza", peso_kg: 0.07, largo_cm: 6.2, ancho_cm: 3.4, alto_cm: 3.5 },
  { sku: "OXIM-003", nombre: "Oxímetro de pulso pediátrico", descripcion: "Sensor de dedo tamaño reducido para pacientes pediátricos.", precio: 410.0, existencia: 35, unidad: "pieza", peso_kg: 0.05, largo_cm: 5.5, ancho_cm: 3, alto_cm: 3 },
  { sku: "OXIM-004", nombre: "Oxímetro de pulso pantalla OLED", descripcion: "Pantalla OLED de alto contraste, apagado automático.", precio: 349.0, existencia: 60, unidad: "pieza", peso_kg: 0.06, largo_cm: 6, ancho_cm: 3.2, alto_cm: 3.3 },
  { sku: "OXIM-005", nombre: "Oxímetro de pulso con Bluetooth", descripcion: "Sincroniza lecturas con app móvil vía Bluetooth 5.0.", precio: 620.0, existencia: 25, unidad: "pieza", peso_kg: 0.08, largo_cm: 6.3, ancho_cm: 3.5, alto_cm: 3.6 },
  { sku: "OXIM-006", nombre: "Oxímetro de mesa con sensor de clip", descripcion: "Para uso en consultorio, sensor de clip con cable de 1m.", precio: 890.0, existencia: 15, unidad: "pieza", peso_kg: 0.35, largo_cm: 12, ancho_cm: 9, alto_cm: 5 },
  { sku: "OXIM-007", nombre: "Oxímetro de pulso resistente al agua", descripcion: "Certificación IPX4, ideal para uso en campo.", precio: 455.0, existencia: 40, unidad: "pieza", peso_kg: 0.075, largo_cm: 6.2, ancho_cm: 3.4, alto_cm: 3.5 },
  { sku: "OXIM-008", nombre: "Oxímetro de pulso profesional con impresora", descripcion: "Incluye mini impresora térmica integrada para reportes.", precio: 1450.0, existencia: 8, unidad: "pieza", peso_kg: 0.6, largo_cm: 15, ancho_cm: 10, alto_cm: 6 },

  // --- Estetoscopios ---
  { sku: "ESTE-001", nombre: "Estetoscopio de una campana, adulto", descripcion: "Auscultación general, tubo de PVC de 56cm.", precio: 165.0, existencia: 200, unidad: "pieza", peso_kg: 0.12, largo_cm: 70, ancho_cm: 12, alto_cm: 4 },
  { sku: "ESTE-002", nombre: "Estetoscopio de doble campana, cardiología", descripcion: "Diafragma y campana para auscultación cardiaca de precisión.", precio: 480.0, existencia: 90, unidad: "pieza", peso_kg: 0.16, largo_cm: 71, ancho_cm: 12, alto_cm: 4 },
  { sku: "ESTE-003", nombre: "Estetoscopio pediátrico", descripcion: "Campana de diámetro reducido para pacientes pediátricos.", precio: 350.0, existencia: 55, unidad: "pieza", peso_kg: 0.1, largo_cm: 65, ancho_cm: 10, alto_cm: 3.5 },
  { sku: "ESTE-004", nombre: "Estetoscopio electrónico digital", descripcion: "Amplificación electrónica y cancelación de ruido ambiental.", precio: 2100.0, existencia: 12, unidad: "pieza", peso_kg: 0.2, largo_cm: 72, ancho_cm: 13, alto_cm: 5 },
  { sku: "ESTE-005", nombre: "Estetoscopio premium doble tubo", descripcion: "Doble tubo independiente, mejor calidad de sonido.", precio: 1850.0, existencia: 18, unidad: "pieza", peso_kg: 0.18, largo_cm: 71, ancho_cm: 12, alto_cm: 4 },
  { sku: "ESTE-006", nombre: "Estetoscopio desechable de un solo uso", descripcion: "Para aislamiento o control de infecciones, caja de 10.", precio: 220.0, existencia: 300, unidad: "caja", peso_kg: 0.5, largo_cm: 30, ancho_cm: 20, alto_cm: 8 },
  { sku: "ESTE-007", nombre: "Estetoscopio veterinario", descripcion: "Campana de mayor diámetro para uso en animales.", precio: 395.0, existencia: 20, unidad: "pieza", peso_kg: 0.14, largo_cm: 70, ancho_cm: 12, alto_cm: 4 },
  { sku: "ESTE-008", nombre: "Estetoscopio con auriculares intercambiables", descripcion: "Incluye 3 pares de olivas de silicón en distintas tallas.", precio: 310.0, existencia: 45, unidad: "pieza", peso_kg: 0.13, largo_cm: 70, ancho_cm: 12, alto_cm: 4 },

  // --- Baterías médicas ---
  { sku: "BAT-001", nombre: "Batería recargable para monitor de signos vitales", descripcion: "Li-Ion 11.1V 4400mAh, compatible con monitores de mesa.", precio: 890.0, existencia: 22, unidad: "pieza", peso_kg: 0.4, largo_cm: 9, ancho_cm: 6, alto_cm: 3 },
  { sku: "BAT-002", nombre: "Batería de respaldo para bomba de infusión", descripcion: "Autonomía de hasta 6 horas en uso continuo.", precio: 750.0, existencia: 18, unidad: "pieza", peso_kg: 0.35, largo_cm: 8, ancho_cm: 5, alto_cm: 3 },
  { sku: "BAT-003", nombre: "Batería de litio para desfibrilador portátil", descripcion: "Certificada para uso médico, vida útil de 4 años.", precio: 1950.0, existencia: 6, unidad: "pieza", peso_kg: 0.55, largo_cm: 11, ancho_cm: 7, alto_cm: 4 },
  { sku: "BAT-004", nombre: "Paquete de baterías AA para glucómetro", descripcion: "Paquete de 4 pilas alcalinas AA.", precio: 95.0, existencia: 500, unidad: "paquete", peso_kg: 0.1, largo_cm: 6, ancho_cm: 5, alto_cm: 3 },
  { sku: "BAT-005", nombre: "Batería sellada de plomo-ácido 12V", descripcion: "Para camillas eléctricas y sillas de ruedas motorizadas.", precio: 1100.0, existencia: 10, unidad: "pieza", peso_kg: 3.8, largo_cm: 15, ancho_cm: 9.5, alto_cm: 10 },
  { sku: "BAT-006", nombre: "Batería recargable para nebulizador portátil", descripcion: "USB-C, hasta 3 horas de nebulización continua.", precio: 420.0, existencia: 30, unidad: "pieza", peso_kg: 0.15, largo_cm: 7, ancho_cm: 4, alto_cm: 2.5 },

  // --- Electrodos ---
  { sku: "ELEC-001", nombre: "Electrodos desechables para ECG", descripcion: "Caja de 50 electrodos de gel adhesivo, adulto.", precio: 180.0, existencia: 250, unidad: "caja", peso_kg: 0.3, largo_cm: 15, ancho_cm: 10, alto_cm: 6 },
  { sku: "ELEC-002", nombre: "Electrodos de gel para TENS", descripcion: "Paquete de 4 electrodos reutilizables 5x5cm.", precio: 95.0, existencia: 180, unidad: "paquete", peso_kg: 0.05, largo_cm: 10, ancho_cm: 8, alto_cm: 1 },
  { sku: "ELEC-003", nombre: "Electrodos pediátricos para ECG", descripcion: "Caja de 30, adhesivo hipoalergénico.", precio: 210.0, existencia: 90, unidad: "caja", peso_kg: 0.2, largo_cm: 12, ancho_cm: 8, alto_cm: 5 },
  { sku: "ELEC-004", nombre: "Electrodos de desfibrilación adulto", descripcion: "Par de electrodos multifunción para DEA.", precio: 420.0, existencia: 40, unidad: "par", peso_kg: 0.25, largo_cm: 20, ancho_cm: 15, alto_cm: 3 },
  { sku: "ELEC-005", nombre: "Electrodos de desfibrilación pediátrico", descripcion: "Par de electrodos multifunción tamaño reducido para DEA.", precio: 450.0, existencia: 25, unidad: "par", peso_kg: 0.2, largo_cm: 18, ancho_cm: 13, alto_cm: 3 },
  { sku: "ELEC-006", nombre: "Electrodos de superficie para electroestimulación", descripcion: "Caja de 20, distintos tamaños incluidos.", precio: 260.0, existencia: 70, unidad: "caja", peso_kg: 0.22, largo_cm: 14, ancho_cm: 10, alto_cm: 5 },
  { sku: "ELEC-007", nombre: "Electrodos multifunción para monitor de paciente", descripcion: "Compatibles con la mayoría de monitores de signos vitales.", precio: 300.0, existencia: 55, unidad: "caja", peso_kg: 0.28, largo_cm: 15, ancho_cm: 10, alto_cm: 6 },
  { sku: "ELEC-008", nombre: "Electrodos de referencia para EEG", descripcion: "Electrodos de disco de plata/cloruro de plata, caja de 10.", precio: 380.0, existencia: 15, unidad: "caja", peso_kg: 0.15, largo_cm: 10, ancho_cm: 8, alto_cm: 4 },

  // --- Tiras reactivas ---
  { sku: "TIRA-001", nombre: "Tiras reactivas para glucómetro, caja de 50", descripcion: "Compatibles con glucómetros de uso general.", precio: 260.0, existencia: 300, unidad: "caja", peso_kg: 0.08, largo_cm: 8, ancho_cm: 5, alto_cm: 3 },
  { sku: "TIRA-002", nombre: "Tiras reactivas para glucómetro, caja de 100", descripcion: "Presentación económica de mayor volumen.", precio: 480.0, existencia: 180, unidad: "caja", peso_kg: 0.15, largo_cm: 9, ancho_cm: 6, alto_cm: 4 },
  { sku: "TIRA-003", nombre: "Tiras reactivas de orina multiparamétricas", descripcion: "10 parámetros, caja de 100 tiras.", precio: 320.0, existencia: 120, unidad: "caja", peso_kg: 0.1, largo_cm: 8, ancho_cm: 5, alto_cm: 3.5 },
  { sku: "TIRA-004", nombre: "Tiras reactivas para colesterol", descripcion: "Caja de 25 tiras, requiere equipo compatible.", precio: 410.0, existencia: 60, unidad: "caja", peso_kg: 0.06, largo_cm: 7, ancho_cm: 4, alto_cm: 2.5 },
  { sku: "TIRA-005", nombre: "Tiras reactivas para cetonas en sangre", descripcion: "Caja de 10 tiras.", precio: 380.0, existencia: 45, unidad: "caja", peso_kg: 0.05, largo_cm: 7, ancho_cm: 4, alto_cm: 2 },
  { sku: "TIRA-006", nombre: "Tiras reactivas para embarazo, prueba rápida", descripcion: "Caja de 20 pruebas, resultado en 3 minutos.", precio: 195.0, existencia: 150, unidad: "caja", peso_kg: 0.1, largo_cm: 10, ancho_cm: 7, alto_cm: 4 },
  { sku: "TIRA-007", nombre: "Tiras reactivas para ácido úrico", descripcion: "Caja de 25 tiras.", precio: 350.0, existencia: 40, unidad: "caja", peso_kg: 0.06, largo_cm: 7, ancho_cm: 4, alto_cm: 2.5 },
  { sku: "TIRA-008", nombre: "Tiras reactivas para hemoglobina", descripcion: "Caja de 25 tiras, requiere equipo compatible.", precio: 520.0, existencia: 20, unidad: "caja", peso_kg: 0.06, largo_cm: 7, ancho_cm: 4, alto_cm: 2.5 },

  // --- Básculas ---
  { sku: "BASC-001", nombre: "Báscula digital de piso para consultorio", descripcion: "Capacidad 200kg, pantalla LCD grande.", precio: 1250.0, existencia: 25, unidad: "pieza", peso_kg: 6.5, largo_cm: 32, ancho_cm: 32, alto_cm: 6 },
  { sku: "BASC-002", nombre: "Báscula pediátrica para bebés", descripcion: "Capacidad 20kg, precisión de 10g.", precio: 1650.0, existencia: 10, unidad: "pieza", peso_kg: 3.2, largo_cm: 60, ancho_cm: 35, alto_cm: 12 },
  { sku: "BASC-003", nombre: "Báscula de bioimpedancia con altímetro", descripcion: "Mide grasa corporal, agua e IMC además del peso.", precio: 4200.0, existencia: 5, unidad: "pieza", peso_kg: 12.0, largo_cm: 40, ancho_cm: 40, alto_cm: 190 },
  { sku: "BASC-004", nombre: "Báscula de silla para pacientes con movilidad reducida", descripcion: "Capacidad 250kg, ruedas para traslado.", precio: 3800.0, existencia: 4, unidad: "pieza", peso_kg: 22.0, largo_cm: 90, ancho_cm: 60, alto_cm: 95 },
  { sku: "BASC-005", nombre: "Báscula portátil de viaje para nutriólogos", descripcion: "Plegable, capacidad 180kg, cabe en un maletín.", precio: 950.0, existencia: 18, unidad: "pieza", peso_kg: 1.8, largo_cm: 28, ancho_cm: 28, alto_cm: 3 },
  { sku: "BASC-006", nombre: "Báscula mecánica de columna con estadímetro", descripcion: "Sin batería, capacidad 160kg, incluye tallímetro.", precio: 3200.0, existencia: 7, unidad: "pieza", peso_kg: 18.0, largo_cm: 55, ancho_cm: 50, alto_cm: 200 },
  { sku: "BASC-007", nombre: "Báscula digital para camilla/cama", descripcion: "Se integra a camillas, capacidad 300kg.", precio: 5200.0, existencia: 3, unidad: "pieza", peso_kg: 9.5, largo_cm: 45, ancho_cm: 35, alto_cm: 15 },
  { sku: "BASC-008", nombre: "Báscula de precisión para farmacia", descripcion: "Precisión de 1g, capacidad 5kg, para dosificación.", precio: 1450.0, existencia: 12, unidad: "pieza", peso_kg: 2.1, largo_cm: 22, ancho_cm: 18, alto_cm: 8 },

  // --- Nebulizadores ---
  { sku: "NEBUL-001", nombre: "Nebulizador de compresora de mesa", descripcion: "Uso doméstico/consultorio, incluye kit de mascarillas.", precio: 890.0, existencia: 35, unidad: "pieza", peso_kg: 1.4, largo_cm: 22, ancho_cm: 16, alto_cm: 14 },
  { sku: "NEBUL-002", nombre: "Nebulizador portátil a pilas", descripcion: "Ideal para viaje, funciona con 4 pilas AA.", precio: 650.0, existencia: 40, unidad: "pieza", peso_kg: 0.3, largo_cm: 14, ancho_cm: 8, alto_cm: 6 },
  { sku: "NEBUL-003", nombre: "Nebulizador ultrasónico silencioso", descripcion: "Operación silenciosa, ideal para uso nocturno o pediátrico.", precio: 1350.0, existencia: 15, unidad: "pieza", peso_kg: 0.9, largo_cm: 18, ancho_cm: 14, alto_cm: 10 },
  { sku: "NEBUL-004", nombre: "Nebulizador pediátrico con mascarilla de animalito", descripcion: "Diseño amigable para niños, reduce ansiedad al uso.", precio: 950.0, existencia: 20, unidad: "pieza", peso_kg: 1.3, largo_cm: 22, ancho_cm: 16, alto_cm: 14 },
  { sku: "NEBUL-005", nombre: "Nebulizador de malla vibratoria", descripcion: "Tecnología de malla, partícula fina, bajo consumo.", precio: 2100.0, existencia: 8, unidad: "pieza", peso_kg: 0.15, largo_cm: 12, ancho_cm: 5, alto_cm: 4 },
  { sku: "NEBUL-006", nombre: "Nebulizador de uso hospitalario de alto flujo", descripcion: "Para uso continuo en consultorio u hospital.", precio: 1850.0, existencia: 6, unidad: "pieza", peso_kg: 2.2, largo_cm: 28, ancho_cm: 20, alto_cm: 18 },
  { sku: "NEBUL-007", nombre: "Kit de accesorios para nebulizador", descripcion: "Mascarilla adulto, mascarilla pediátrica, boquilla y manguera de repuesto.", precio: 280.0, existencia: 60, unidad: "kit", peso_kg: 0.2, largo_cm: 20, ancho_cm: 15, alto_cm: 5 },

  // --- Tanques de oxígeno ---
  { sku: "TANQ-001", nombre: "Tanque de oxígeno tipo D, 425 L", descripcion: "Incluye válvula tipo yugo, uso portátil/emergencia.", precio: 2100.0, existencia: 12, unidad: "pieza", peso_kg: 4.5, largo_cm: 15, ancho_cm: 15, alto_cm: 51 },
  { sku: "TANQ-002", nombre: "Tanque de oxígeno tipo E, 682 L", descripcion: "Incluye manómetro y válvula reguladora.", precio: 2650.0, existencia: 9, unidad: "pieza", peso_kg: 6.8, largo_cm: 15, ancho_cm: 15, alto_cm: 65 },
  { sku: "TANQ-003", nombre: "Tanque de oxígeno portátil tipo M6", descripcion: "Compacto, ideal para traslado de pacientes.", precio: 1650.0, existencia: 15, unidad: "pieza", peso_kg: 2.9, largo_cm: 11, ancho_cm: 11, alto_cm: 40 },
  { sku: "TANQ-004", nombre: "Regulador de flujo para tanque de oxígeno", descripcion: "Regulador de 0-15 LPM, rosca CGA-870.", precio: 780.0, existencia: 28, unidad: "pieza", peso_kg: 0.6, largo_cm: 14, ancho_cm: 10, alto_cm: 8 },
  { sku: "TANQ-005", nombre: "Carro porta-tanque de oxígeno con ruedas", descripcion: "Compatible con tanques tipo D y E, base con ruedas.", precio: 1200.0, existencia: 10, unidad: "pieza", peso_kg: 5.5, largo_cm: 40, ancho_cm: 35, alto_cm: 70 },
  { sku: "TANQ-006", nombre: "Concentrador de oxígeno portátil 5L", descripcion: "Batería recargable, hasta 5 litros por minuto.", precio: 5800.0, existencia: 6, unidad: "pieza", peso_kg: 8.2, largo_cm: 32, ancho_cm: 24, alto_cm: 18 },
  { sku: "TANQ-007", nombre: "Concentrador de oxígeno estacionario 10L", descripcion: "Para uso domiciliario continuo, doble salida.", precio: 6500.0, existencia: 4, unidad: "pieza", peso_kg: 24.0, largo_cm: 45, ancho_cm: 35, alto_cm: 60 },
];

// Agregamos id consecutivo y activo=true por defecto (con 2 productos
// discontinuados a propósito, para que el catálogo se vea como el de un
// ERP real que ya lleva tiempo en uso).
const catalogo = catalogoBase.map((producto, index) => ({
  id: index + 1,
  ...producto,
  activo: true,
}));
catalogo[50].activo = false; // NEBUL-005 descontinuado
catalogo[57].activo = false; // TANQ-005 descontinuado

// El 30% de los productos (18 de 60) se queda SIN peso ni dimensiones, a
// propósito -- imita datos incompletos de un ERP real. Elegimos posiciones
// fijas (no aleatorias en cada arranque) para que el mock sea reproducible:
// siempre son los mismos productos, así puedes escribir pruebas contra
// SKUs específicos.
function postProcesarDimensiones(productos) {
  productos.forEach((producto, index) => {
    // 3 de cada 10 posiciones (índice % 10 en {2, 5, 8}) => exactamente 30%
    if (index % 10 === 2 || index % 10 === 5 || index % 10 === 8) {
      producto.peso_kg = null;
      producto.largo_cm = null;
      producto.ancho_cm = null;
      producto.alto_cm = null;
    }
  });
  return productos;
}
postProcesarDimensiones(catalogo);

// Ventas registradas vía POST /api/ventas, indexadas por folio.
const ventas = new Map();
let folioConsecutivo = 100000;

function siguienteFolio() {
  folioConsecutivo += 1;
  const anio = new Date().getFullYear();
  return `BIND-${anio}-${folioConsecutivo}`;
}

module.exports = { catalogo, ventas, siguienteFolio };
