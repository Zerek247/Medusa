// Mock local de un PAC (Proveedor Autorizado de Certificación) de CFDI.
//
// Por qué existe: facturar en México requiere timbrar cada CFDI con un PAC
// autorizado por el SAT (Finkok, Facturama, SW Sapien, etc.) -- no es algo
// que se pueda simular "de verdad" sin un certificado de sello digital
// (CSD) real del negocio, así que este mock se queda en simular el
// CONTRATO HTTP del timbrado: qué se manda, qué regresa un PAC real (UUID
// fiscal, fecha de timbrado, XML/PDF), y los estados de cancelación. Nunca
// genera un CFDI válido ante el SAT -- es solo para probar la integración.
"use strict";

const express = require("express");
const crypto = require("node:crypto");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4003;
const API_KEY = process.env.CFDI_API_KEY || "cfdi-mock-key-local";

const facturas = new Map();
// Mismo razonamiento que ventasPorIdempotencia en mock-bind (Fase 5): un
// reintento con la misma clave_idempotencia debe devolver el MISMO CFDI ya
// timbrado, nunca timbrar dos veces (fiscalmente, timbrar dos veces un
// mismo comprobante sería un problema real, no solo un dato duplicado).
const facturasPorIdempotencia = new Map(); // clave_idempotencia -> uuid

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "cfdi-mock" });
});

app.use("/api", (req, res, next) => {
  const apiKey = req.header("X-Api-Key");
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: "API key inválida o ausente (header X-Api-Key)" });
  }
  next();
});

// POST /api/timbrar
// Body: {
//   "orden_medusa_id": "order_123",
//   "emisor": { "rfc": "...", "nombre": "..." },
//   "receptor": { "rfc": "XAXX010101000", "nombre": "PUBLICO EN GENERAL" },
//   "conceptos": [{ "descripcion": "...", "cantidad": 1, "valor_unitario": 890.0 }],
//   "subtotal": 890.0, "iva": 142.4, "total": 1032.4
// }
app.post("/api/timbrar", (req, res) => {
  const { orden_medusa_id, emisor, receptor, conceptos, total, clave_idempotencia } = req.body || {};

  if (clave_idempotencia && facturasPorIdempotencia.has(clave_idempotencia)) {
    const uuidExistente = facturasPorIdempotencia.get(clave_idempotencia);
    return res.status(200).json(facturas.get(uuidExistente));
  }

  if (!orden_medusa_id || !emisor?.rfc || !receptor?.rfc || !Array.isArray(conceptos) || conceptos.length === 0) {
    return res.status(400).json({
      error: "Faltan orden_medusa_id, emisor.rfc, receptor.rfc y/o conceptos",
    });
  }

  const uuid = crypto.randomUUID();
  const fecha_timbrado = new Date().toISOString();

  const factura = {
    uuid,
    folio_fiscal: uuid,
    orden_medusa_id,
    emisor,
    receptor,
    conceptos,
    total: total ?? null,
    fecha_timbrado,
    estatus: "vigente",
    // Sello y XML simulados: strings con forma parecida a lo real, pero sin
    // validez fiscal alguna -- suficientes para probar que el flujo de
    // "guardar el comprobante en la orden" funciona.
    sello_digital_simulado: crypto.randomBytes(32).toString("base64"),
    xml_base64: Buffer.from(`<cfdi:Comprobante Total="${total ?? ""}" Folio="${uuid}" />`).toString("base64"),
  };
  facturas.set(uuid, factura);
  if (clave_idempotencia) {
    facturasPorIdempotencia.set(clave_idempotencia, uuid);
  }

  res.status(201).json(factura);
});

// GET /api/facturas/:uuid -> consulta de estatus
app.get("/api/facturas/:uuid", (req, res) => {
  const factura = facturas.get(req.params.uuid);
  if (!factura) {
    return res.status(404).json({ error: `No existe una factura con UUID ${req.params.uuid}` });
  }
  res.json(factura);
});

// POST /api/facturas/:uuid/cancelar
app.post("/api/facturas/:uuid/cancelar", (req, res) => {
  const factura = facturas.get(req.params.uuid);
  if (!factura) {
    return res.status(404).json({ error: `No existe una factura con UUID ${req.params.uuid}` });
  }
  if (factura.estatus === "cancelado") {
    return res.status(409).json({ error: "La factura ya estaba cancelada" });
  }
  factura.estatus = "cancelado";
  factura.fecha_cancelacion = new Date().toISOString();
  res.json(factura);
});

app.listen(PORT, () => {
  console.log(`[cfdi-mock] escuchando en el puerto ${PORT}`);
});
