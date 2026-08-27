// Mock local de Skydropx (agregador de paqueterías), v2 -- reescrito en
// Fase 4 para calzar con la forma real que tiene la API de Skydropx: rutas
// bajo /api/v1/, cotización con varias paqueterías (DHL, FedEx, Estafeta,
// Paquetexpress) devolviendo un rate_id por cada una, y un POST /shipments
// que toma ese rate_id directamente (no un cotizacion_id genérico).
//
// Por qué existe: Medusa va a tener un Fulfillment Provider custom que le
// pide cotizaciones a este mock en tiempo real durante el checkout (cuando
// el comprador captura su código postal) y, al pagarse la orden, le pide
// que genere la guía. Mismo razonamiento que los demás mocks: mismo
// contrato HTTP que el servicio real, para que el código de integración no
// cambie el día que se conecte a Skydropx de verdad.
"use strict";

const express = require("express");
const crypto = require("node:crypto");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4002;
const API_TOKEN = process.env.SKYDROPX_API_TOKEN || "skydropx-mock-token-local";

// Tarifa base + costo por kg + costo por "km" de distancia entre códigos
// postales. dias_entrega es fijo por paquetería (más rápido = más caro),
// como en la realidad.
const PAQUETERIAS = [
  { carrier: "DHL", servicio: "Express", base: 150, por_kg: 40, por_km: 0.05, dias_entrega: 1 },
  { carrier: "FedEx", servicio: "Economy", base: 120, por_kg: 30, por_km: 0.04, dias_entrega: 2 },
  { carrier: "Estafeta", servicio: "Terrestre", base: 80, por_kg: 20, por_km: 0.03, dias_entrega: 4 },
  { carrier: "Paquetexpress", servicio: "Regional", base: 70, por_kg: 18, por_km: 0.025, dias_entrega: 5 },
];

// Cotizaciones (con sus tarifas) y envíos generados, en memoria.
const cotizaciones = new Map(); // quotation_id -> { tarifas, ... }
const tarifasPorId = new Map(); // rate_id -> { tarifa completa + quotation_id }
const envios = new Map();
// Mismo razonamiento que en mock-bind/mock-cfdi (Fase 5): un reintento con
// la misma clave_idempotencia debe devolver la MISMA guía, no generar una
// segunda (una guía real trae costo -- duplicarla sería literalmente pagar
// dos veces el envío).
const enviosPorIdempotencia = new Map(); // clave_idempotencia -> numero_guia

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "skydropx-mock" });
});

app.use("/api", (req, res, next) => {
  const auth = req.header("Authorization") || "";
  if (auth !== `Bearer ${API_TOKEN}`) {
    return res.status(401).json({ error: "Token inválido o ausente (header Authorization: Bearer ...)" });
  }
  next();
});

// Distancia sintética entre dos códigos postales mexicanos: no tenemos
// datos geográficos reales en un mock, así que aproximamos con la
// diferencia numérica entre CPs (funciona razonablemente bien como PROXY
// de "más lejos = número más distinto" para un mock -- no es precisión
// geográfica real, y está documentado como tal a propósito).
function distanciaKm(cpOrigen, cpDestino) {
  const diff = Math.abs(parseInt(cpOrigen, 10) - parseInt(cpDestino, 10));
  return Math.max(5, Math.round(diff / 10));
}

// POST /api/v1/quotations
// Body: { origen: { cp }, destino: { cp }, peso_kg, largo_cm, ancho_cm, alto_cm }
app.post("/api/v1/quotations", (req, res) => {
  const { origen, destino, peso_kg, largo_cm, ancho_cm, alto_cm } = req.body || {};

  if (!origen?.cp || !destino?.cp || !peso_kg) {
    return res.status(400).json({ error: "Faltan origen.cp, destino.cp y/o peso_kg" });
  }

  const km = distanciaKm(origen.cp, destino.cp);
  const quotation_id = crypto.randomUUID();

  const tarifas = PAQUETERIAS.map((p) => {
    const precio = Math.round((p.base + p.por_kg * peso_kg + p.por_km * km) * 100) / 100;
    const rate_id = crypto.randomUUID();
    const tarifa = {
      rate_id,
      carrier: p.carrier,
      servicio: p.servicio,
      precio,
      moneda: "MXN",
      dias_entrega: p.dias_entrega,
    };
    tarifasPorId.set(rate_id, { ...tarifa, quotation_id });
    return tarifa;
  });

  cotizaciones.set(quotation_id, {
    quotation_id,
    tarifas,
    origen,
    destino,
    paquete: { peso_kg, largo_cm, ancho_cm, alto_cm },
    creado: new Date().toISOString(),
    distancia_km: km,
  });

  res.status(201).json({ quotation_id, tarifas });
});

// GET /api/v1/quotations/:id -> las tarifas de una cotización ya hecha
app.get("/api/v1/quotations/:id", (req, res) => {
  const cotizacion = cotizaciones.get(req.params.id);
  if (!cotizacion) {
    return res.status(404).json({ error: `No existe la cotización ${req.params.id}` });
  }
  res.json(cotizacion);
});

// POST /api/v1/shipments
// Body: { rate_id, clave_idempotencia? }
app.post("/api/v1/shipments", (req, res) => {
  const { rate_id, clave_idempotencia } = req.body || {};

  if (clave_idempotencia && enviosPorIdempotencia.has(clave_idempotencia)) {
    const guiaExistente = enviosPorIdempotencia.get(clave_idempotencia);
    return res.status(200).json(envios.get(guiaExistente));
  }

  const tarifa = tarifasPorId.get(rate_id);

  if (!tarifa) {
    return res.status(404).json({ error: `rate_id desconocido o expirado: ${rate_id}` });
  }

  const numero_guia = `SKX${Math.floor(Math.random() * 900000 + 100000)}MX`;
  const envio = {
    numero_guia,
    rate_id,
    carrier: tarifa.carrier,
    servicio: tarifa.servicio,
    precio: tarifa.precio,
    dias_entrega: tarifa.dias_entrega,
    url_rastreo: `http://localhost:4002/rastreo/${numero_guia}`,
    // No generamos un PDF real: un data URI de texto plano es suficiente
    // para probar que el flujo "descarga la etiqueta" funciona end-to-end.
    url_etiqueta: `data:text/plain;base64,${Buffer.from(`Etiqueta simulada - guia ${numero_guia}`).toString("base64")}`,
    estatus: "generado",
    creado: new Date().toISOString(),
  };
  envios.set(numero_guia, envio);
  if (clave_idempotencia) {
    enviosPorIdempotencia.set(clave_idempotencia, numero_guia);
  }

  res.status(201).json(envio);
});

// GET /api/v1/shipments/:numero_guia -> consulta de estatus (para tracking)
app.get("/api/v1/shipments/:numero_guia", (req, res) => {
  const envio = envios.get(req.params.numero_guia);
  if (!envio) {
    return res.status(404).json({ error: `No existe el envío ${req.params.numero_guia}` });
  }
  res.json(envio);
});

app.listen(PORT, () => {
  console.log(`[skydropx-mock] escuchando en el puerto ${PORT}`);
});
