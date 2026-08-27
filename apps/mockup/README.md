# BioBackup — Maqueta visual

**Esto NO es el proyecto real.** Es una réplica visual, sin backend, sin
base de datos, sin pagos reales — pensada solo para mostrarle a un
cliente cómo se vería el sistema completo (tienda + panel de admin) antes
de tenerlo desplegado de verdad.

El proyecto real vive en [`apps/backend`](../backend) (Medusa v2) y
[`apps/storefront`](../storefront) (Next.js). Esta carpeta es
independiente y no depende de ninguna de las dos.

## Cómo está armada

Todos los datos (productos, categorías, órdenes, la bitácora de Bind,
los pedidos del cliente demo) están escritos a mano en
[`src/lib/datos.ts`](src/lib/datos.ts) — no hay ninguna llamada a un
servidor. El carrito usa `localStorage` del navegador nada más. El
checkout, la sincronización con Bind y las cotizaciones de Skydropx están
**simuladas** con un `setTimeout` para que se sienta real al mostrarla.

- `src/app/(tienda)/` — la tienda: home, catálogo, producto, carrito,
  checkout, confirmación, cuenta/pedidos, rastreo.
- `src/app/panel/` — el panel de administración: login, productos,
  órdenes, y las 3 pantallas del "panel de operación" (sync con Bind,
  cola de fallidos, falta peso/dimensiones).

## Correr en local

```bash
pnpm install
pnpm --filter mockup dev
```

Abre `http://localhost:3100`.

## Desplegar en Vercel

1. En Vercel, "Add New Project" → importa este repo.
2. En "Root Directory", selecciona `apps/mockup` (importante -- si no,
   Vercel intenta construir el repo completo).
3. Framework se detecta solo como Next.js. No hace falta ninguna
   variable de entorno -- todo son datos fijos en el código.
4. Deploy. Es 100% gratis en el plan Hobby de Vercel (no hay backend, no
   hay base de datos, no hay costo de por medio).

## Cuando lleguen los datos/fotos reales del cliente

Edita [`src/lib/datos.ts`](src/lib/datos.ts) directamente -- los 8
productos, precios, categorías, etc. Las fotos: cuando existan, hay que
cambiar `src/components/imagen-producto.tsx` para que reciba una URL de
imagen en vez de dibujar el marcador con degradado.
