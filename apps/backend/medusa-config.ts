import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // Postgres local en Docker no habla SSL -- objeto vacío es "sin SSL",
    // y sin esto el driver intenta negociarlo igual y se cuelga hasta
    // hacer timeout (10s) en vez de fallar rápido o conectar. Un Postgres
    // administrado (Railway, etc., Fase 6B) normalmente SÍ lo exige --
    // por eso esto es un interruptor por variable de entorno y no algo
    // fijo: local se queda exactamente igual (DATABASE_SSL sin definir),
    // y en Railway basta con poner DATABASE_SSL=true. rejectUnauthorized
    // en false porque estos proveedores usan certificados que Node no
    // reconoce como firmados por una CA de confianza -- es el valor que
    // documenta el propio Railway para esto, no un descuido de seguridad
    // nuestro (la conexión sigue yendo cifrada, solo no se valida la
    // cadena de certificados).
    databaseDriverOptions:
      process.env.DATABASE_SSL === "true"
        ? { connection: { ssl: { rejectUnauthorized: false } } }
        : {},
    // Campo aparte de los módulos "cache-redis"/"event-bus-redis" de abajo:
    // esto es lo que usa el framework para su propio cache/sesión interno.
    redisUrl: process.env.REDIS_URL,
    // "server" | "worker" | "shared". El contenedor "backend" corre en
    // "server" (atiende HTTP, NO corre scheduled jobs/subscribers) y el
    // contenedor "worker" corre en "worker" (corre scheduled
    // jobs/subscribers, NO atiende HTTP pública). Ver el comentario grande
    // en docker-compose.yml sobre por qué separamos esto en dos contenedores.
    // Si no se define, Medusa usa "shared" (los dos en un mismo proceso) --
    // lo dejamos explícito para no depender del default.
    workerMode: (process.env.WORKER_MODE as "server" | "worker" | "shared") || "shared",
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  // Usamos Redis (contenedor "redis" de docker-compose) para el bus de eventos,
  // el cache y el motor de workflows, en vez de las versiones en memoria por
  // defecto. Esto es lo que hace posible, por ejemplo, que un subscriber que
  // reacciona a "order.placed" sobreviva a un reinicio del proceso y que en
  // fases futuras podamos correr varias instancias del backend compartiendo
  // el mismo estado de eventos/colas.
  modules: [
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      // OJO: en la 2.19.0 el propio módulo advierte que `redis.url` está
      // deprecado a favor de `redisUrl`, pero el loader real todavía
      // requiere `redis.url` (probamos `redisUrl` y el loader truena con
      // "Cannot destructure property 'url' of undefined"). Nos quedamos con
      // la forma que sí funciona; el warning es cosmético por ahora.
      options: {
        redis: {
          url: process.env.REDIS_URL,
        },
      },
    },
    // Proveedor de pago Stripe (Fase 5), en modo de PRUEBA (llaves sk_test_/
    // pk_test_ -- nunca reales, nunca dinero real). "capture: true" hace que
    // Stripe capture el pago automáticamente en cuanto se autoriza, en vez
    // de dejarlo solo "autorizado" esperando una captura manual aparte --
    // es el modo simple que corresponde a "una tienda en línea que cobra al
    // momento", no una que retiene el cargo para decidir después.
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              capture: true,
            },
          },
        ],
      },
    },
    // Módulo de fulfillment con DOS proveedores registrados (Fase 4):
    // "manual" (el que trae Medusa por defecto, sin cálculo -- lo usamos
    // para la opción de respaldo "Envío por cotizar") y nuestro "skydropx"
    // custom, que cotiza en vivo contra el mock. Sin este bloque, Medusa
    // solo tendría "manual" disponible.
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/fulfillment-manual",
            id: "manual",
          },
          {
            resolve: "./src/modules/skydropx-fulfillment",
            id: "skydropx",
          },
        ],
      },
    },
  ],
  // El dashboard de admin corre con su propio servidor Vite (HMR) dentro del
  // contenedor. Por defecto Vite abre el websocket de HMR en un puerto
  // aleatorio del contenedor que el navegador (fuera de Docker) no puede
  // alcanzar -> por eso la consola mostraba "WebSocket closed without
  // opened." Fijamos el puerto a 5173 (el mismo que exponemos en
  // docker-compose.yml) y hacemos que el server escuche en 0.0.0.0 en vez
  // de solo localhost-del-contenedor.
  admin: {
    // El contenedor worker no sirve el dashboard -- apagarlo ahí ahorra
    // recursos (no compila/sirve el bundle de Vite) y evita un servidor
    // HTTP de admin "fantasma" que nadie va a visitar.
    disable: process.env.ADMIN_DISABLED === "true",
    // "/panel" en vez del default "/app": el default de Medusa para
    // admin.path es literalmente "/app", y @medusajs/admin-bundler usa
    // ESE valor como "base" de Vite (dist/index.js: "base: options.path").
    // Vite le quita ese prefijo a cualquier import que empiece igual
    // (stripBase) -- y nuestro bind mount de Docker también vive en
    // "/app" (ver ".:/app" en docker-compose.yml). Con los dos en "/app",
    // Vite le recortaba el "/app" a las rutas ABSOLUTAS de archivo que el
    // propio admin-vite-plugin de Medusa genera para nuestras rutas
    // custom (src/admin/routes/*/page.tsx) -- ej. convertía
    // "/app/apps/backend/src/admin/routes/bind-sync/page.tsx" en
    // "/apps/backend/src/admin/routes/bind-sync/page.tsx" (sin el "/app"),
    // una ruta que no existe -> "Failed to resolve import ... Does the
    // file exist?" y panel en blanco, para TODO el admin (no solo estas
    // 3 rutas custom, porque rompía el módulo virtual completo). No es
    // nada específico de nuestro código ni un bug de Vite/Medusa en
    // general -- es choque de nombres específico de que elegimos "/app"
    // como bind mount. Cambiar el URL del panel a otra ruta que no
    // choque con ninguna carpeta real del contenedor arregla esto de raíz
    // (confirmado leyendo el código fuente instalado de Vite y de
    // @medusajs/admin-bundler). El panel ahora vive en :9000/panel en vez
    // de :9000/app.
    path: "/panel",
    vite: (config) => {
      return {
        server: {
          host: "0.0.0.0",
          allowedHosts: ["localhost", ".localhost", "127.0.0.1"],
          hmr: {
            port: 5173,
            clientPort: 5173,
          },
        },
      }
    },
  },
})
