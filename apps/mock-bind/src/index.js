// Mock local de la API REST de Bind ERP.
//
// Por qué existe: en fases posteriores el backend de Medusa va a sincronizar
// catálogo desde Bind ERP (pull periódico) y a empujarle cada venta. No
// tenemos acceso al Bind ERP real todavía, así que este servicio imita su
// contrato HTTP -- incluyendo sus partes "molestas" (rate limiting, fallas
// intermitentes, latencia, datos incompletos) para que el código de
// integración que escribamos ya esté probado contra esos casos, no solo
// contra el camino feliz.
"use strict";

const express = require("express");
const rateLimit = require("express-rate-limit");
const { catalogo, ventas, siguienteFolio } = require("./data");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4001;
const API_KEY = process.env.BIND_API_KEY || "bind-mock-key-local";
// Interruptor para el modo "el ERP a veces se cae": con esto en true, ~20%
// de las peticiones a /api/* responden 500 al azar. Apagado por defecto
// para no sorprender en el uso normal del mock; lo prendes cuando quieras
// probar la lógica de reintentos del lado de Medusa.
const SIMULATE_FAILURES = String(process.env.SIMULATE_FAILURES || "false").toLowerCase() === "true";

// /health queda FUERA de todo lo demás (auth, rate limit, fallas, latencia)
// a propósito: es lo que usaría un healthcheck de Docker, y esos no deben
// verse afectados por el comportamiento "realista" que simulamos para las
// rutas de negocio.
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "mock-bind", simulate_failures: SIMULATE_FAILURES });
});

const apiRouter = express.Router();

// 1) Autenticación por API key. Va primero para que una petición sin
// credenciales no consuma cupo del rate limit ni latencia simulada.
apiRouter.use((req, res, next) => {
  const apiKey = req.header("X-Api-Key");
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: "API key inválida o ausente (header X-Api-Key)" });
  }
  next();
});

// 2) Rate limiting: dos ventanas simultáneas, como suelen documentar los
// ERPs reales (un límite corto para ráfagas, uno largo para uso diario).
// Usamos dos instancias de express-rate-limit encadenadas -- cualquiera de
// las dos que se pase primero responde 429.
const limitadorCorto = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Límite de 150 peticiones cada 5 minutos excedido. Intenta más tarde." },
});
const limitadorDiario = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Límite de 5000 peticiones diarias excedido." },
});
apiRouter.use(limitadorCorto, limitadorDiario);

// 3) Latencia artificial: todo ERP real tiene ida y vuelta de red + tiempo
// de proceso. 200-800ms simula eso para que el código que llama a este
// mock no asuma respuestas instantáneas.
apiRouter.use((req, res, next) => {
  const demoraMs = 200 + Math.floor(Math.random() * 600);
  setTimeout(next, demoraMs);
});

// 4) Fallas aleatorias (solo si SIMULATE_FAILURES=true): ~20% de las
// peticiones truenan con 500 antes de llegar a la lógica de negocio.
apiRouter.use((req, res, next) => {
  if (SIMULATE_FAILURES && Math.random() < 0.2) {
    return res.status(500).json({ error: "Error interno simulado de Bind ERP (SIMULATE_FAILURES=true)" });
  }
  next();
});

// GET /api/productos?pagina=1&por_pagina=20 -> catálogo paginado
apiRouter.get("/productos", (req, res) => {
  const pagina = Math.max(1, parseInt(req.query.pagina, 10) || 1);
  const porPagina = Math.min(100, Math.max(1, parseInt(req.query.por_pagina, 10) || 20));

  const totalProductos = catalogo.length;
  const totalPaginas = Math.max(1, Math.ceil(totalProductos / porPagina));
  const inicio = (pagina - 1) * porPagina;
  const productos = catalogo.slice(inicio, inicio + porPagina);

  res.json({
    productos,
    paginacion: {
      pagina,
      por_pagina: porPagina,
      total_productos: totalProductos,
      total_paginas: totalPaginas,
    },
  });
});

// GET /api/productos/:id -> un producto por su id interno del ERP
apiRouter.get("/productos/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const producto = catalogo.find((p) => p.id === id);
  if (!producto) {
    return res.status(404).json({ error: `No existe un producto con id ${req.params.id}` });
  }
  res.json(producto);
});

// Claves de idempotencia -> folio ya generado para esa clave (Fase 5). Un
// ERP real casi nunca ofrece esto gratis, pero varios sí lo documentan
// (p. ej. Stripe, muchas pasarelas de pago) precisamente para el caso que
// nos importa aquí: si Medusa reintenta "registrar la venta" porque el
// intento anterior falló POR LA RED (nunca supimos si Bind sí la recibió),
// reenviar la MISMA clave debe devolver la venta que ya existe en vez de
// crear una segunda. Así la idempotencia no depende solo de que el llamador
// se acuerde de no repetir -- el propio servidor la garantiza.
const ventasPorIdempotencia = new Map(); // clave_idempotencia -> folio

// POST /api/ventas -> registra una venta y devuelve un folio.
// Body esperado:
// {
//   "cliente": { "nombre": "...", "email": "..." },   // opcional
//   "items": [{ "id": 1, "cantidad": 2 }],
//   "clave_idempotencia": "order_123:registrar_venta_en_bind"   // opcional
// }
apiRouter.post("/ventas", (req, res) => {
  const { cliente, items, clave_idempotencia } = req.body || {};

  if (clave_idempotencia && ventasPorIdempotencia.has(clave_idempotencia)) {
    const folioExistente = ventasPorIdempotencia.get(clave_idempotencia);
    // 200, no 201: no se creó nada nuevo, se devuelve lo que ya existía.
    return res.status(200).json(ventas.get(folioExistente));
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Falta items (arreglo no vacío de { id, cantidad })" });
  }

  // Validamos todo antes de tocar inventario, para no dejar descuentos a
  // medias si un item más adelante en la lista falla.
  const itemsResueltos = [];
  for (const item of items) {
    const producto = catalogo.find((p) => p.id === item.id);
    if (!producto) {
      return res.status(422).json({ error: `Producto desconocido en Bind ERP: id ${item.id}` });
    }
    if (!producto.activo) {
      return res.status(422).json({ error: `Producto descontinuado, no se puede vender: ${producto.sku}` });
    }
    if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
      return res.status(400).json({ error: `Cantidad inválida para ${producto.sku}` });
    }
    if (producto.existencia < item.cantidad) {
      return res.status(409).json({ error: `Sin existencia suficiente de ${producto.sku} (hay ${producto.existencia})` });
    }
    itemsResueltos.push({ producto, cantidad: item.cantidad });
  }

  let total = 0;
  const itemsVenta = itemsResueltos.map(({ producto, cantidad }) => {
    producto.existencia -= cantidad;
    const subtotal = Math.round(producto.precio * cantidad * 100) / 100;
    total += subtotal;
    return {
      id: producto.id,
      sku: producto.sku,
      nombre: producto.nombre,
      cantidad,
      precio_unitario: producto.precio,
      subtotal,
    };
  });

  const folio = siguienteFolio();
  const venta = {
    folio,
    cliente: cliente || null,
    items: itemsVenta,
    total: Math.round(total * 100) / 100,
    fecha: new Date().toISOString(),
    estatus: "recibida",
  };
  ventas.set(folio, venta);
  if (clave_idempotencia) {
    ventasPorIdempotencia.set(clave_idempotencia, folio);
  }

  res.status(201).json(venta);
});

// GET /api/ventas/:folio -> consulta una venta ya registrada
apiRouter.get("/ventas/:folio", (req, res) => {
  const venta = ventas.get(req.params.folio);
  if (!venta) {
    return res.status(404).json({ error: `No existe una venta con folio ${req.params.folio}` });
  }
  res.json(venta);
});

app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`[mock-bind] escuchando en el puerto ${PORT} (SIMULATE_FAILURES=${SIMULATE_FAILURES})`);
});
