# Prototipo local de e-commerce — Medusa v2 + Bind ERP + Skydropx + CFDI

Prototipo de arquitectura para una tienda de equipo médico en México. Corre
100% local con Docker. **No es producción**: no hay credenciales reales, no
hay datos de clientes reales, y los sistemas externos (Bind ERP, Skydropx,
un PAC de CFDI) están simulados con mocks locales porque todavía no hay
acceso a las cuentas reales.

## Arquitectura

```
apps/
├── backend/         Medusa v2 (API + panel de administración)
├── storefront/       Next.js (tienda pública, Next.js Starter oficial de Medusa)
├── mock-bind/        Simula la API REST de Bind ERP (catálogo + ventas)
├── mock-skydropx/    Simula el agregador de paqueterías Skydropx
└── mock-cfdi/        Simula un PAC de timbrado de CFDI

docker-compose.yml     Orquesta todo lo anterior + PostgreSQL 16 + Redis 7
```

Es un monorepo con **pnpm workspaces** (`pnpm-workspace.yaml`): cada carpeta
bajo `apps/` es un paquete independiente, pero comparten un solo
`pnpm install` en la raíz.

## Prerrequisitos

- **Docker Desktop** con soporte de contenedores funcionando (en Windows,
  eso implica WSL2 instalado y habilitado — `wsl --install` si no lo tienes).
- **Node.js** ≥ 20.19 (probado con v24 LTS).
- **pnpm** (se instala con `corepack enable` una vez que tienes Node, o con
  el instalador de <https://pnpm.io/installation>).

Verifica que los tres están listos antes de seguir:

```bash
docker --version && docker compose version
node --version
pnpm --version
```

## Levantar el proyecto desde cero

### 1. Variables de entorno

```bash
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
```

Los valores por defecto en `.env.example` ya funcionan tal cual para
desarrollo local — no son credenciales reales, son API keys de prueba para
que los contenedores se autentiquen entre sí. Cada variable está comentada
en su propio archivo `.env.example`.

### 2. Instalar dependencias del monorepo

```bash
corepack enable
pnpm install
```

(Genera `node_modules` en el host solo para que tu editor tenga
autocompletado/tipos. Dentro de Docker, cada contenedor instala sus propias
dependencias — ver la nota de `.dockerignore` más abajo si te interesa el
porqué.)

### 3. Levantar la infraestructura (Postgres + Redis)

```bash
docker compose up -d postgres redis
```

Espera a que ambos digan `healthy`:

```bash
docker compose ps
```

### 4. Construir y arrancar el backend de Medusa

```bash
docker compose up -d --build backend
```

La primera vez que arranca, Medusa **todavía no tiene esquema de base de
datos**. Corre las migraciones (esto también siembra datos base de tienda:
región, moneda, ubicación de inventario):

```bash
docker compose run --rm backend sh -c "cd apps/backend && npx medusa db:migrate"
```

### 5. Seed: crear el usuario admin

```bash
docker compose run --rm backend sh -c "cd apps/backend && npx medusa user -e admin@local.test -p medusa_dev_admin"
```

(`medusa user` es el mecanismo oficial de Medusa para esto — no hace falta
un script de seed aparte. Cambia el correo/password si quieres, son solo
para tu copia local.)

### 6. Levantar los mocks de sistemas externos

```bash
docker compose up -d --build mock-bind mock-skydropx mock-cfdi
```

### 6.5. Levantar el worker (sincronización con Bind ERP)

```bash
docker compose up -d --build worker
```

El worker es el mismo código del backend, corriendo en un contenedor aparte
en `WORKER_MODE=worker` (ver la explicación completa en `docker-compose.yml`
junto al servicio `worker`, y `apps/backend/src/lib/bind-sync/sync-catalog.ts`
para la lógica de sincronización). Trae el catálogo de `mock-bind` y
crea/actualiza productos en Medusa cada 15 minutos automáticamente
(configurable con `BIND_SYNC_CRON` en `apps/backend/.env`).

Para dispararla a mano en cualquier momento, sin esperar al cron:

```bash
docker compose exec worker sh -c "cd apps/backend && npx medusa exec ./src/scripts/sync-bind-catalog.ts"
```

La salida muestra cuántos productos se crearon, cuántos se actualizaron,
cuántos fallaron (y por qué) y cuáles quedaron marcados con
`requiere_datos_envio` por no traer peso/dimensiones desde Bind. Para
verificar ese mismo resumen sin desplazarte por el log completo:

```bash
docker compose exec backend sh -c "cd apps/backend && npx medusa exec ./src/scripts/verificar-fase3.ts"
```

### 7. Entrar al panel de administración

Abre **http://localhost:9000/panel** e inicia sesión con:

- Email: `admin@local.test`
- Password: `medusa_dev_admin`

### 8. Configurar envíos para México (Fase 4)

Crea la región México, habilita el proveedor Skydropx en la bodega y las
5 opciones de envío (4 cotizadas + la de respaldo). Es idempotente, se
puede correr varias veces sin duplicar nada:

```bash
docker compose exec backend sh -c "cd apps/backend && npx medusa exec ./src/scripts/setup-envio-mexico.ts"
```

### 9. Storefront

Copia sus variables de entorno (ya trae la publishable key de este repo;
si reconstruiste la base de datos desde cero, obtén la tuya con
`npx medusa exec ./src/scripts/mostrar-publishable-key.ts` dentro del
backend y actualiza `apps/storefront/.env`):

```bash
cp apps/storefront/.env.example apps/storefront/.env
```

```bash
docker compose up -d --build storefront
```

Abre **http://localhost:8000** — te redirige a `/mx` automáticamente
(región por defecto).

### 10. Stripe (Fase 5, modo de prueba)

Necesitas una cuenta gratuita de Stripe (no se cobra nada -- "modo de
prueba" es un sandbox completo de Stripe, separado de cualquier dinero
real) y el [Stripe CLI](https://docs.stripe.com/stripe-cli) para reenviar
los webhooks a tu máquina local (Stripe no le pega directo a `localhost`).

1. Crea una cuenta en <https://dashboard.stripe.com/register> (o usa una
   que ya tengas) y, en el dashboard, activa el toggle **"Test mode"**
   (arriba a la derecha) -- así todas las llaves que copies serán de
   prueba (`sk_test_...`/`pk_test_...`), nunca de producción.
2. En **Developers → API keys**, copia la **Secret key** (`sk_test_...`) a
   `apps/backend/.env` → `STRIPE_API_KEY`, y la **Publishable key**
   (`pk_test_...`) a `apps/storefront/.env` → `NEXT_PUBLIC_STRIPE_KEY`.
3. Instala el Stripe CLI y en una terminal aparte (queda corriendo):
   ```bash
   stripe login
   stripe listen --forward-to localhost:9000/hooks/payment/stripe_stripe
   ```
   Imprime un `whsec_...` -- cópialo a `apps/backend/.env` →
   `STRIPE_WEBHOOK_SECRET`.
4. Reinicia backend, worker y storefront para que tomen las llaves nuevas:
   ```bash
   docker compose up -d --force-recreate backend worker storefront
   ```
5. Enlaza Stripe a la región México (agrega `pp_stripe_stripe` sin quitar
   el proveedor manual -- ver el comentario en el script):
   ```bash
   docker compose exec backend sh -c "cd apps/backend && npx medusa exec ./src/scripts/setup-envio-mexico.ts"
   ```

En el checkout usa una [tarjeta de prueba de Stripe](https://docs.stripe.com/testing#cards),
por ejemplo `4242 4242 4242 4242`, cualquier fecha futura, cualquier CVC.

## Comandos de verificación

Todo levantado y saludable:

```bash
docker compose ps
```

Backend:

```bash
curl -s http://localhost:9000/health
```

Mock de Bind ERP — health, rechazo sin API key, catálogo paginado:

```bash
curl -s http://localhost:4001/health
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4001/api/productos   # 401 esperado
curl -s -H "X-Api-Key: bind-mock-key-local" "http://localhost:4001/api/productos?pagina=1&por_pagina=5"
```

Mock de Skydropx / CFDI:

```bash
curl -s http://localhost:4002/health
curl -s http://localhost:4003/health
```

Storefront + checkout con cotización real (Fase 4) — en tu navegador:

1. Abre **http://localhost:8000/mx/products/tanque-de-oxígeno-tipo-d-425-l**
   (o cualquier producto), agrega al carrito y ve al checkout. Deberías
   ver 4 opciones de envío con precio real (DHL/FedEx/Estafeta/Paquetexpress)
   más "Envío por cotizar" en $0.
2. Prueba el caso crítico con un producto SIN peso/dimensiones, por ejemplo
   **http://localhost:8000/mx/products/oxímetro-de-pulso-pediátrico**: las
   4 opciones de Skydropx deben verse deshabilitadas (con "-" en vez de
   precio) y solo "Envío por cotizar" es seleccionable.
3. Completa una orden con "Envío por cotizar" y confirma en
   **http://localhost:9000/panel/orders** que la orden se creó; el
   subscriber `envio-manual.ts` le agrega `metadata.requiere_revision_manual: true`
   (visible en la sección Metadata del detalle de la orden en el admin).

Pagos + cola post-pago (Fase 5) — con las llaves de Stripe ya puestas
(ver sección "10. Stripe" arriba):

1. Compra con la tarjeta de prueba `4242 4242 4242 4242`. La confirmación
   debe aparecer casi de inmediato (la orden se crea sin esperar a
   Bind/CFDI/Skydropx/correo).
2. `docker compose logs -f worker` — deberías ver las 4 tareas
   procesándose por separado (`registrar_venta_en_bind`, `timbrar_cfdi`,
   `generar_guia_envio`, `enviar_correo`), cada una con su propio
   `Intento 1/4 ... completada`.
3. Prende el modo de fallas y repite una compra. Edita
   `SIMULATE_FAILURES=true` en el `.env` de la raíz, luego:
   ```bash
   docker compose up -d --force-recreate mock-bind
   ```
   En los logs del worker deberías ver `registrar_venta_en_bind` fallar,
   reintentarse (30s después) y terminar pasando.
4. Apaga Bind por completo y repite:
   ```bash
   docker compose stop mock-bind
   ```
   Espera ~13 minutos (30s+2min+10min) y corre
   `ver-cola-fallidos.ts` (comando en la sección de arriba) — la tarea debe
   aparecer con el error completo. Confirma que la orden se sigue viendo
   normal en `http://localhost:9000/panel/orders`. No olvides
   `docker compose up -d mock-bind` y devolver `SIMULATE_FAILURES=false` al
   terminar.

Ver logs de un servicio en vivo:

```bash
docker compose logs -f backend
```

## Apagar / limpiar

```bash
docker compose down          # detiene todo, conserva los datos (volúmenes)
docker compose down -v       # detiene todo Y borra Postgres/Redis -- empiezas de cero
```

## Worker: sincronización con Bind ERP (Fase 3)

- **Dónde vive el código**: `apps/backend/src/lib/bind-sync/` (cliente HTTP
  hacia Bind + lógica de sync), `apps/backend/src/jobs/sync-bind-catalog.ts`
  (dispara cada `BIND_SYNC_CRON`), `apps/backend/src/scripts/sync-bind-catalog.ts`
  (disparo manual).
- **Política de campos**: Bind manda precio y existencia, siempre. Nunca se
  tocan título, descripción, imágenes, categorías ni peso/dimensiones de un
  producto que ya existe en Medusa — esos se consideran editados por la
  tienda una vez creado el producto. El detalle completo está comentado al
  inicio de `sync-catalog.ts`.
- **Por qué el worker es un contenedor aparte y no vive dentro del backend**:
  ver el bloque de comentarios sobre el servicio `worker` en
  `docker-compose.yml` — resumen: es el patrón oficial de Medusa v2
  (server/worker mode) para que los scheduled jobs corran exactamente una
  vez sin importar a cuántas réplicas escales el backend HTTP, y para que
  una sincronización lenta o fallida no afecte el panel de admin ni el
  checkout.

## Envíos con Skydropx + storefront (Fase 4)

- **Mock** (`apps/mock-skydropx/`): `POST /api/v1/quotations` (cotiza 4
  paqueterías -- DHL, FedEx, Estafeta, Paquetexpress -- variando precio por
  peso y una distancia sintética entre códigos postales), `GET
  /api/v1/quotations/:id`, `POST /api/v1/shipments` (genera guía a partir
  de un `rate_id`).
- **Proveedor de envíos custom** (`apps/backend/src/modules/skydropx-fulfillment/`):
  un `AbstractFulfillmentProviderService` que cotiza en vivo contra el
  mock. Registra 4 "fulfillment options" (una por paquetería) en
  `medusa-config.ts` junto al proveedor `manual` de Medusa.
- **Caso crítico (peso/dimensiones faltantes)**: si algún artículo del
  carrito no tiene peso o dimensiones, `calculatePrice` lanza un error a
  propósito -- eso hace que esa opción de envío no se pueda seleccionar.
  Queda disponible únicamente la opción de respaldo **"Envío por
  cotizar"** (proveedor manual, precio $0, sin cálculo). No hace falta un
  mensaje especial en el frontend: el nombre de la opción ES el mensaje.
  Un subscriber (`apps/backend/src/subscribers/envio-manual.ts`) marca la
  orden con `metadata.requiere_revision_manual = true` cuando el
  comprador termina usando esa opción de respaldo.
- **Setup de tienda** (`apps/backend/src/scripts/setup-envio-mexico.ts`):
  crea la región México (moneda `mxn`, país `mx`), habilita el proveedor
  Skydropx en la bodega existente, y crea las 5 opciones de envío.
  Idempotente.
- **Storefront**: Next.js Starter oficial de Medusa
  (`medusajs/dtc-starter`), instalado tal cual salvo tres ajustes:
  1. `apps/storefront/src/lib/config.ts` y `middleware.ts`: variable
     `MEDUSA_BACKEND_URL_INTERNAL` -- el navegador y el contenedor del
     storefront necesitan URLs distintas para llegar al backend
     (`localhost:9000` vs `backend:9000`).
  2. `products/[handle]/page.tsx`: el `handle` de la ruta llega
     *doblemente sin decodificar* en este entorno (Next.js 15.5.21 +
     Turbopack) para handles con acentos -- se decodifica a mano con
     `decodeURIComponent`. También se desactivó `generateStaticParams`:
     Turbopack en `next dev` pre-renderiza esas páginas UNA vez al
     arrancar y sirve esa versión congelada para siempre, lo cual rompe
     el catálogo sincronizado cada 15 min de la Fase 3.
  3. `templates/index.tsx`: se quitó el `<Suspense><ProductActionsWrapper/></Suspense>`
     que trae el starter para el botón de "Agregar al carrito" -- en este
     entorno ese boundary de Suspense nunca resuelve (el fallback,
     `disabled`, se queda para siempre), dejando el botón inerte. Se
     reemplazó por `<ProductActions>` directo con los datos que ya trae
     la página. Los tres ajustes están comentados en el código donde
     ocurren.

## Pagos con Stripe + cola post-pago (Fase 5)

### Por qué la firma del webhook es indispensable

`POST /hooks/payment/stripe_stripe` es una URL **pública** -- cualquiera
puede mandarle un JSON con forma de "pago aprobado". Sin verificar que la
petición de verdad viene de Stripe, bastaría con adivinar el formato del
body para que Medusa capturara un pago y colocara una orden **que nadie
pagó de verdad**. Stripe firma cada webhook con una clave que solo Stripe y
tu backend conocen (`STRIPE_WEBHOOK_SECRET`, el `whsec_...`) -- el proveedor
`@medusajs/medusa/payment-stripe` valida esa firma automáticamente antes
de aceptar el evento (usa el SDK de Stripe internamente en
`getWebhookActionAndData`), así que una petición sin la firma correcta se
rechaza antes de tocar nada. Sin esto, el webhook de pagos sería la puerta
de entrada más fácil de todo el sistema para crear órdenes fraudulentas.

### La cola: qué pasa en cuanto el pago se aprueba

1. El comprador confirma el pago (con Stripe Elements en el checkout, o vía
   el webhook si el método de pago lo confirma de forma asíncrona). Medusa
   completa el carrito y crea la orden -- esto SÍ pasa en línea, es rápido
   (consultas a la base de datos propia, nada de red hacia fuera).
2. `src/subscribers/encolar-post-pago.ts` reacciona a `order.placed` y
   solo hace un `Queue.add()` por cada una de las 4 tareas -- no llama a
   Bind, no timbra, no pide guía, no manda correo. Esto es la parte
   importante: la confirmación que ve el comprador NUNCA espera a un
   sistema externo lento o caído.
3. `src/lib/cola-post-pago/procesador.ts` -- un `Worker` de BullMQ que
   corre SOLO en el contenedor `worker` (arrancado por el scheduled job
   `src/jobs/arrancar-cola-post-pago.ts` -- ver el comentario ahí sobre por
   qué es un scheduled job y no el loader de un módulo custom) -- va
   sacando las tareas de la cola y las procesa, cada una con:
   - **Reintentos con espera creciente**: 30s, 2min, 10min
     (`POST_PAGO_BACKOFF_MS`), vía un `backoffStrategy` custom de BullMQ.
   - **Idempotencia en dos capas**: (a) una marca en Redis
     (`idempotencia.ts`) para que un reintento ni siquiera vuelva a llamar
     al servicio externo si ya sabemos que la tarea terminó bien; (b) una
     `clave_idempotencia` que viaja a cada mock (Bind/CFDI/Skydropx) y que
     ELLOS MISMOS respetan -- si la reciben dos veces, devuelven el mismo
     folio/UUID/guía en vez de crear uno nuevo. La capa (b) es la que de
     verdad protege contra duplicar la venta o timbrar dos veces aunque el
     proceso de Medusa truene justo después de la llamada externa.
   - **Cola de fallidos visible**: si se agotan los 3 reintentos, BullMQ
     deja la tarea en su estado "failed" (no se borra --
     `removeOnFail:false`) con el error completo y una bitácora de cada
     intento (`job.log(...)`). Se ve con:
     ```bash
     docker compose exec backend sh -c "cd apps/backend && npx medusa exec ./src/scripts/ver-cola-fallidos.ts"
     ```
   - **Bitácora**: cada intento queda registrado tanto en los logs del
     contenedor `worker` (`docker compose logs -f worker`) como en el
     `job.log()` de BullMQ (incluido en la salida del script de arriba).
4. Las 4 tareas (`src/lib/cola-post-pago/tareas/`):
   - `registrar_venta_en_bind`: le avisa a Bind ERP qué se vendió (usa
     `product.metadata.bind_id`, agregado por el sync de Fase 3 -- por eso
     `sync-catalog.ts` ahora también guarda ese campo).
   - `timbrar_cfdi`: timbra el CFDI con el PAC mockeado.
   - `generar_guia_envio`: le pide la guía a Skydropx usando el
     `skydropx_rate_id` que quedó guardado en el método de envío elegido
     al pagar. Si la orden usó "Envío por cotizar" (Fase 4, sin rate_id),
     esto NO es un error -- se completa sin llamar a Skydropx, porque esa
     orden ya está marcada `requiere_revision_manual`.
   - `enviar_correo`: escribe el correo de confirmación como archivo de
     texto en `apps/backend/.medusa/correos-enviados/<order_id>.txt` (mock
     de correo -- `src/lib/mock-correo.ts`). Va DENTRO de `.medusa/` a
     propósito: `medusa develop` vigila todo el árbol del proyecto y
     reinicia el servidor completo ante cualquier archivo nuevo; `.medusa/`
     es una carpeta que el propio Medusa ya excluye de su watcher.
5. **Por qué concurrencia = 1** (`POST_PAGO_CONCURRENCIA`): las 4 tareas de
   una orden son independientes (ninguna espera a otra) pero SÍ comparten
   un recurso -- `order.metadata`, donde cada una guarda su resultado
   (folio de Bind, UUID de CFDI, número de guía). Medusa no ofrece un
   update parcial de metadata (siempre reemplaza el campo completo), así
   que dos tareas terminando al mismo tiempo podrían pisarse la escritura
   una a la otra ("lost update"). `resultado-en-orden.ts` protege cada
   escritura con un candado corto en Redis, pero el diseño más simple para
   un prototipo local es procesar de a una -- cada tarea sigue teniendo su
   propio reintento/bitácora/cola de fallidos, solo que en fila. Ver el
   comentario completo en `procesador.ts`.

### Verificado en este entorno (sin checkout de Stripe real)

Con `SIMULATE_FAILURES=true` en el `.env` de la raíz, encolando las 4
tareas de una orden ya colocada:

```
Intento 1/4 de "registrar_venta_en_bind" ...
FALLÓ el intento 1/4: Bind ERP respondió 500 al registrar la venta: {"error":"Error interno simulado de Bind ERP (SIMULATE_FAILURES=true)"}
Intento 2/4 de "registrar_venta_en_bind" ...
Bind ERP respondió: folio BIND-2026-100001, total $410.
"registrar_venta_en_bind" completada.
```

Con `mock-bind` completamente apagado (`docker compose stop mock-bind`),
la misma tarea agota sus 4 intentos (`fetch failed` en los 4) y cae en la
cola de fallidos -- **la orden se conserva intacta**
(`payment_status: "authorized"`, la orden sigue existiendo con todos sus
datos). Pendiente: repetir esta misma prueba con una compra real de
principio a fin usando una tarjeta de prueba de Stripe (requiere que
completes la sección "10. Stripe" de arriba con tus propias llaves de
prueba).

## Documentación de cada mock

- [`apps/mock-bind/`](apps/mock-bind) — API REST de Bind ERP: catálogo
  paginado, registro/consulta de ventas, autenticación por API key, rate
  limiting (150 req/5min, 5000/día → 429), modo de fallas configurable
  (`SIMULATE_FAILURES=true` → ~20% de 500s) y latencia artificial de
  200-800ms. Ver el comentario al inicio de `src/index.js` para el porqué
  de cada comportamiento.
- [`apps/mock-skydropx/`](apps/mock-skydropx) — cotización de envío (4
  paqueterías) + generación de guía.
- `apps/mock-cfdi/` — timbrado, consulta y cancelación simulados de CFDI.
- Los tres aceptan un `clave_idempotencia` opcional (Fase 5) en
  `POST /ventas`, `POST /timbrar` y `POST /shipments` respectivamente: si
  la reciben dos veces, devuelven el MISMO resultado (folio/UUID/guía) en
  vez de crear uno nuevo -- así un reintento de la cola post-pago nunca
  duplica nada, aunque el proceso de Medusa se haya caído justo después de
  la llamada anterior.
- `apps/backend/src/lib/mock-correo.ts` — no es un servicio HTTP aparte
  (no hay contrato de red real que simular): escribe el "correo" como
  archivo de texto en `apps/backend/.medusa/correos-enviados/`.

## Tienda y panel de operación (Fase 6)

**Storefront** (`apps/storefront/`), marca "BioBackup":
- **Catálogo**: filtro por categoría (pastillas en `/store` y en cada
  `/categories/[handle]`) + búsqueda por texto (`?q=`, usa el parámetro `q`
  nativo de `/store/products`, sin motor de búsqueda aparte -- suficiente
  para un catálogo de decenas de productos).
- **Categorías reales**: `apps/backend/src/scripts/crear-categorias.ts`
  crea 5 categorías (Oxigenoterapia, Terapia respiratoria, Diagnóstico y
  monitoreo, Básculas y antropometría, Accesorios y consumibles) y
  clasifica los 60 productos de Bind por prefijo de SKU. Idempotente,
  nunca reclasifica un producto que ya tenga categoría (para no pisar una
  reclasificación manual).
- **Ficha de producto**: pestaña "Especificaciones técnicas" (SKU, peso,
  dimensiones -- con aviso si están pendientes de captura) e indicador de
  disponibilidad junto al precio, no solo en el texto del botón.
- **Checkout con datos fiscales mexicanos**: RFC, razón social, régimen
  fiscal (subconjunto del catálogo del SAT) y uso de CFDI, además de la
  dirección de envío separada de la de facturación (ya existía desde Fase
  4/5). Se capturan en `checkout/components/datos-fiscales/` y se guardan
  en `cart.metadata.datos_fiscales` -- Medusa no tiene campos nativos para
  esto, mismo criterio que `bind_id`/`guia_envio_numero` en el resto del
  proyecto. `timbrar_cfdi` (Fase 5) los usa si están presentes; si el
  comprador no los llenó, cae de vuelta al RFC genérico de "público en
  general".
- **Cuenta**: el starter ya traía historial de pedidos y varias
  direcciones guardadas (`account/components/address-book`) -- no hubo que
  construirlos, solo traducir/rebrandear.
- **Rastreo de pedido** (`/rastreo`, sin necesitar cuenta): pide número de
  pedido + correo, los valida del lado del servidor
  (`GET /store/rastreo`) antes de mostrar nada -- un número de pedido
  corto (consecutivo) es fácil de adivinar, por eso el correo es
  obligatorio y se compara en el backend, no solo en el formulario.

**Panel de operación** (extensiones del admin, `apps/backend/src/admin/routes/`):
- **Cola de fallidos** (`/panel/post-pago-fallidos`): las tareas de Fase 5
  que agotaron reintentos, con botón "Reintentar" (`job.retry()` con
  `resetAttemptsMade: true` -- si alguien le da al botón es porque ya
  arregló la causa, merece 3 reintentos nuevos, no los que ya gastó antes
  de la corrección).
- **Falta peso/dimensiones** (`/panel/requiere-datos-envio`): productos con
  `metadata.requiere_datos_envio` (Fase 3) y un formulario para
  capturarlos -- al guardar, apaga la bandera y Skydropx ya puede
  cotizarlos.
- **Sync con Bind** (`/panel/bind-sync`): bitácora de las últimas 20
  corridas (`apps/backend/src/lib/bind-sync/bitacora.ts`, guardada en
  Redis) -- antes solo se veía en `docker compose logs worker`.

Los tres pegan a rutas nuevas bajo `apps/backend/src/api/admin/` y
`apps/backend/src/api/store/rastreo/`.

### Bug de Next.js/Turbopack encontrado en esta fase: `loading.tsx`

Además de los tres ya documentados en Fase 4 (decodificación de acentos,
`generateStaticParams` congelado, un `<Suspense>` que no resuelve), esta
fase encontró una CUARTA variante del mismo problema de fondo: cualquier
ruta con un `loading.tsx` junto a su `page.tsx` -- que Next.js envuelve
automáticamente en un `<Suspense>` implícito -- terminaba con el contenido
real renderizado FUERA de `<main>` (como un `<div>` huérfano después del
`<footer>`), mientras adentro de `<main>` quedaba una tabla/lista vacía
para siempre. Pasaba en `/cart`, `/account` y `/order/[id]/confirmed`.
Se diagnosticó inspeccionando el DOM directamente (`document.body.children`
mostraba un `<div>` de más al final) y se corrigió borrando los cuatro
`loading.tsx` del proyecto -- sin ellos, Next.js ya no crea ese boundary
implícito, y el contenido se queda donde debe.

### Bug encontrado en esta fase: el panel de admin se quedaba en blanco

Al agregar las 3 rutas custom de arriba, el dashboard de admin completo
(no solo esas 3 páginas) se quedó en pantalla blanca, con este error en
`docker compose logs backend`:

```
Failed to resolve import "/apps/backend/src/admin/routes/bind-sync/page.tsx"
from "virtual:medusa/routes". Does the file exist?
```

Se investigó a fondo leyendo el código fuente instalado de
`@medusajs/admin-vite-plugin` y de Vite mismo, hasta encontrar la causa
real: `@medusajs/admin-bundler` configura el `base` de Vite igual al
`admin.path` de `medusa-config.ts`, que por default es `"/app"`
(`dist/index.js: "base: options.path"`). Vite le quita ese prefijo a
cualquier import que empiece igual (`stripBase`) -- y nuestro contenedor
de Docker monta el repo completo en, también, `/app` (`.:/app` en
`docker-compose.yml`). Con los dos coincidiendo, Vite le recortaba el
`/app` a las rutas absolutas de archivo que Medusa genera para las rutas
custom del admin (`/app/apps/backend/src/admin/routes/bind-sync/page.tsx`
→ `/apps/backend/src/admin/routes/bind-sync/page.tsx`, que no existe) --
rompiendo el módulo virtual completo del admin, no solo las 3 rutas
nuevas. No es un bug de Vite ni de Medusa en general, sino un choque de
nombres específico de haber elegido `/app` como punto de montaje. Se
corrigió cambiando `admin.path` a `"/panel"` en `medusa-config.ts` (ver
el comentario ahí) -- el panel ahora vive en `http://localhost:9000/panel`.

## Modo demo (Fase 6B)

`NEXT_PUBLIC_MODO_DEMO=true` en `apps/storefront/.env` activa:
- Banner permanente ("Prototipo de demostración...") en TODAS las
  pantallas -- vive en `app/layout.tsx` (la raíz de verdad, fuera de
  `[countryCode]`), así también se ve en el checkout, que tiene su propio
  layout.
- Checkout que llega hasta la pantalla de pago y muestra una confirmación
  SIMULADA: Stripe ni siquiera se ofrece como opción de pago
  (`checkout-form/index.tsx` filtra `pp_stripe_*` de
  `availablePaymentMethods`), y el botón final
  (`payment-button/index.tsx`, `DemoPaymentButton`) nunca llama a
  `placeOrder()` -- guarda un resumen del carrito en `sessionStorage` y
  navega a `/pedido-demo-confirmado`, una pantalla que lo lee y lo muestra
  como si fuera la confirmación real. No se crea ninguna orden de verdad.
- Registro de cuentas nuevas deshabilitado
  (`account/components/register/index.tsx`) -- en su lugar se muestran las
  credenciales de la cuenta demo precargada.
- Pie de página con "Propuesta visual -- no es un sitio en producción".

### Cuenta y datos de demostración

```bash
docker compose exec backend sh -c "cd apps/backend && npx medusa exec ./src/seed/seed-demo.ts"
docker compose exec backend sh -c "cd apps/backend && npx medusa exec ./src/scripts/crear-cuenta-demo.ts"
```

- `apps/backend/src/seed/productos-demo.jsonc` -- 8 productos con datos
  realistas (**editar este archivo con los productos reales cuando
  lleguen** -- nombre, descripción, precio, existencia, categoría,
  peso/dimensiones; `imagen` queda en `null` hasta tener las fotos).
  `seed-demo.ts` lee este archivo, es idempotente por SKU, y NUNCA lo toca
  el sync de Bind (sus SKUs `DEMO-` no existen en Bind).
- `crear-cuenta-demo.ts` crea `demo@biobackup.mx` / `demo1234` con 2
  pedidos ya en su historial (usa `createOrderWorkflow` -- no hay endpoint
  público para "crear una orden ya pagada", con razón: normalmente eso
  pasa por un checkout de verdad).

### Recorrido de presentación, verificado en viewport de celular (375×812)

`inicio → categoría → ficha de producto → agregar al carrito → checkout
(datos fiscales + envío) → confirmación → historial de pedidos` -- las
correcciones de Fase 6 (branding, `loading.tsx`, filtro de opciones
Size/Color) se probaron explícitamente en este viewport antes que
cualquier ajuste de escritorio, por pedido explícito de esta fase.

## Desplegar en Railway (Fase 6B)

**Aviso importante**: a diferencia del resto de este proyecto (todo
verificado en vivo contra contenedores reales), esta sección se armó con
la documentación pública de Railway/Medusa v2 -- no hay una cuenta de
Railway disponible en este entorno para probarlo de punta a punta.
Verifica el primer despliegue con calma y avísame si algún paso no calza
exactamente así para ajustarlo.

Tres servicios en un mismo proyecto de Railway: Postgres, Redis, y el
backend (el storefront puede ir en un segundo proyecto/servicio, o
quedarse corriendo local si solo vas a mostrar el backend+admin).

### 1. Postgres y Redis

Desde el dashboard de Railway: **New → Database → PostgreSQL**, y
**New → Database → Redis**. Railway genera `DATABASE_URL`/`REDIS_URL`
automáticamente y los expone como variables de referencia
(`${{Postgres.DATABASE_URL}}`, `${{Redis.REDIS_URL}}`) para los demás
servicios del mismo proyecto -- no hay que copiarlas a mano.

### 2. Backend

**New → GitHub Repo** (este repo). En **Settings** del servicio:
- **Root Directory**: la raíz del repo (necesita ver `pnpm-workspace.yaml`
  para resolver el monorepo).
- **Build Command**:
  ```bash
  pnpm install --frozen-lockfile && pnpm --filter backend build && cd apps/backend/.medusa/server && npm install --omit=dev
  ```
- **Start Command** (migraciones + scripts de setup + arranque -- TODOS
  idempotentes, seguros de correr en cada deploy, no solo "la primera
  vez"):
  ```bash
  cd apps/backend/.medusa/server && npx medusa db:migrate && npx medusa exec ./src/scripts/setup-envio-mexico.ts && npx medusa exec ./src/scripts/crear-categorias.ts && npx medusa exec ./src/seed/seed-demo.ts && npx medusa exec ./src/scripts/crear-cuenta-demo.ts && npx medusa start
  ```
  (Quita `crear-cuenta-demo.ts`/`seed-demo.ts` de esta línea si el
  despliegue NO es la variante demo.)
- **Healthcheck path**: `/health`.

Variables de entorno a capturar en el panel de Railway (Settings →
Variables):

| Variable | Valor |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `DATABASE_SSL` | `true` -- el Postgres administrado de Railway lo exige (a diferencia del de Docker local) |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` |
| `CI` | `true` -- mismo motivo que en `docker-compose.yml` local: sin terminal interactiva, `pnpm install` puede truncarse pidiendo confirmación que nadie puede darle |
| `JWT_SECRET` | genera uno propio (`openssl rand -hex 32`) -- nunca `supersecret` en producción |
| `COOKIE_SECRET` | igual, uno propio |
| `STORE_CORS` | URL pública del storefront en Railway |
| `ADMIN_CORS` | URL pública del backend en Railway (`.../app`) |
| `AUTH_CORS` | la unión de las dos anteriores |
| `WORKER_MODE` | `shared` (un solo servicio de backend en Railway -- no vale la pena separar server/worker en dos servicios de Railway para una demo) |
| `BIND_BASE_URL`, `BIND_API_KEY` | URL pública del servicio mock-bind en Railway + la misma key |
| `SKYDROPX_BASE_URL`, `SKYDROPX_API_TOKEN` | igual, para mock-skydropx |
| `CFDI_BASE_URL`, `CFDI_API_KEY` | igual, para mock-cfdi |
| `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` | tus llaves de PRUEBA de Stripe (si el despliegue no es demo -- en modo demo no hace falta ninguna) |
| `MEDUSA_ADMIN_ONBOARDING_TYPE` | `default` |

Los tres mocks (`apps/mock-bind`, `apps/mock-skydropx`, `apps/mock-cfdi`)
se despliegan igual: un servicio de Railway por cada uno, **Root
Directory** apuntando a su carpeta, sin build command especial (Nixpacks
detecta `package.json` solo). Dale a cada uno una URL pública y captura
esas URLs en las variables del backend de arriba.

### 3. Storefront

Nuevo servicio, **Root Directory** = raíz del repo también:
- **Build Command**: `pnpm install --frozen-lockfile && pnpm --filter storefront build`
- **Start Command**: `pnpm --filter storefront start` (su `package.json` ya
  usa `next start -p ${PORT:-8000}` -- respeta el puerto que le asigne
  Railway automáticamente, no hace falta pasarlo a mano).

Variables:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | URL pública del backend en Railway |
| `MEDUSA_BACKEND_URL_INTERNAL` | igual (Railway no da networking privado por defecto entre servicios sin configurarlo aparte -- usa la URL pública en ambas si no lo configuras) |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | corre `mostrar-publishable-key.ts` contra el backend ya desplegado |
| `NEXT_PUBLIC_DEFAULT_REGION` | `mx` |
| `NEXT_PUBLIC_BASE_URL` | URL pública del storefront mismo |
| `NEXT_PUBLIC_STRIPE_KEY` | tu llave pública de prueba (vacío si es modo demo) |
| `NEXT_PUBLIC_MODO_DEMO` | `true` para la demo |

### Orden recomendado (evita el problema del huevo y la gallina con CORS)

`STORE_CORS`/`ADMIN_CORS` del backend necesitan la URL del storefront, pero
Railway no te da esa URL hasta que el servicio del storefront exista. Sigue
este orden:

1. Crea Postgres, Redis y los 3 mocks primero -- sus URLs no dependen de nada más.
2. Crea el backend con `STORE_CORS`/`ADMIN_CORS` apuntando a un valor
   cualquiera de momento (ej. `http://localhost:8000`) -- lo vas a corregir
   en el paso 4. Despliega y confirma que arranca.
3. Crea el storefront apuntando `NEXT_PUBLIC_MEDUSA_BACKEND_URL` a la URL
   real del backend (ya la tienes del paso 2). Despliega y copia la URL
   pública que Railway le asigna.
4. Regresa al backend, actualiza `STORE_CORS`/`ADMIN_CORS`/`AUTH_CORS` con
   la URL real del storefront, y vuelve a desplegarlo (un simple redeploy,
   no hace falta tocar código).

### 4. Primer arranque

1. Espera a que el backend termine su deploy (revisa el log: debe
   terminar en "Server is ready").
2. Crea el usuario admin una sola vez (no está en el Start Command a
   propósito -- correrlo en cada deploy reventaría al ya existir):
   ```bash
   railway run --service backend npx medusa user -e tu@correo.com -p "una-contraseña-fuerte"
   ```
3. Confirma `https://tu-backend.up.railway.app/app` (admin) y
   `https://tu-storefront.up.railway.app/mx` (storefront) cargan.
4. Recorre el flujo de presentación completo desde tu celular (criterio de
   aceptación de esta fase).

## Notas de seguridad

- `.env` está en `.gitignore` en la raíz y dentro de cada app — nunca se
  versiona. Solo se versionan los `.env.example`.
- Todas las API keys/tokens de este repo son de prueba, hardcodeadas como
  valores por defecto a propósito. El día que se conecte a un sistema real,
  esos valores se reemplazan sin tocar el código de integración.
