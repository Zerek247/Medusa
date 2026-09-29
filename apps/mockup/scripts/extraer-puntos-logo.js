// Genera src/lib/puntos-logo.ts a partir del logo real
// (assets/logo/biobackup-vertical.jpeg): detecta cada puntito por color
// (flood fill sobre los píxeles que no son fondo blanco), agrupa cada
// grupo de píxeles conectados en un "blob", y calcula su centro / radio /
// color promedio. Si el archivo del logo cambia, vuelve a correr esto
// desde la raíz del repo:
//
//   node apps/mockup/scripts/extraer-puntos-logo.js
//
const path = require("path");
const fs = require("fs");
const sharp = require(
  path.join(__dirname, "..", "..", "..", "node_modules", ".pnpm", "sharp@0.34.5", "node_modules", "sharp")
);

const RAIZ = path.join(__dirname, "..", "..", "..");
const RUTA_LOGO = path.join(RAIZ, "assets", "logo", "biobackup-vertical.jpeg");
const RUTA_SALIDA = path.join(__dirname, "..", "src", "lib", "puntos-logo.ts");

// Del alto total de la imagen, el texto "BioBackup" empieza como al 76%
// hacia abajo -- recortamos ahí para no confundir letras con puntos.
const ALTO_UTIL_FRACCION = 0.76;
const MAX_RETRASO_MS = 550; // debe coincidir con MAX_RETRASO_MS en logo-loader.tsx

async function main() {
  const { data, info } = await sharp(RUTA_LOGO).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const altoUtil = Math.floor(height * ALTO_UTIL_FRACCION);

  function esFondo(r, g, b) {
    return r > 232 && g > 232 && b > 232;
  }

  const visitado = new Uint8Array(width * altoUtil);
  const esColor = new Uint8Array(width * altoUtil);
  for (let y = 0; y < altoUtil; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      esColor[y * width + x] = esFondo(data[idx], data[idx + 1], data[idx + 2]) ? 0 : 1;
    }
  }

  const blobs = [];
  const stackX = new Int32Array(width * altoUtil);
  const stackY = new Int32Array(width * altoUtil);

  for (let y = 0; y < altoUtil; y++) {
    for (let x = 0; x < width; x++) {
      const p0 = y * width + x;
      if (!esColor[p0] || visitado[p0]) continue;

      let sp = 0;
      stackX[sp] = x;
      stackY[sp] = y;
      sp++;
      visitado[p0] = 1;
      let sumX = 0, sumY = 0, count = 0, sumR = 0, sumG = 0, sumB = 0;

      while (sp > 0) {
        sp--;
        const cx = stackX[sp], cy = stackY[sp];
        const cp = cy * width + cx;
        const idx = cp * channels;
        sumX += cx;
        sumY += cy;
        count++;
        sumR += data[idx];
        sumG += data[idx + 1];
        sumB += data[idx + 2];

        const vecinos = [
          [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1],
          [cx + 1, cy + 1], [cx - 1, cy - 1], [cx + 1, cy - 1], [cx - 1, cy + 1],
        ];
        for (const [nx, ny] of vecinos) {
          if (nx < 0 || nx >= width || ny < 0 || ny >= altoUtil) continue;
          const np = ny * width + nx;
          if (esColor[np] && !visitado[np]) {
            visitado[np] = 1;
            stackX[sp] = nx;
            stackY[sp] = ny;
            sp++;
          }
        }
      }

      if (count < 4) continue; // ruido de anti-aliasing suelto
      blobs.push({
        x: sumX / count,
        y: sumY / count,
        r: Math.sqrt(count / Math.PI),
        color: [Math.round(sumR / count), Math.round(sumG / count), Math.round(sumB / count)],
      });
    }
  }

  const minY = Math.min(...blobs.map((b) => b.y));
  const maxY = Math.max(...blobs.map((b) => b.y));

  const puntos = blobs.map((b) => {
    const u = (b.y - minY) / (maxY - minY);
    return {
      x: Math.round(b.x * 100) / 100,
      y: Math.round(b.y * 100) / 100,
      r: Math.round(Math.max(b.r, 1.4) * 100) / 100,
      color: `rgb(${b.color[0]},${b.color[1]},${b.color[2]})`,
      delayMs: Math.round(u * MAX_RETRASO_MS),
    };
  });

  const ts = `// Posiciones EXACTAS de los puntos del logo real, extraídas del propio
// archivo (assets/logo/biobackup-vertical.jpeg) con detección de blobs
// por color -- no son una aproximación matemática, son las coordenadas
// reales de cada punto del logo. Generado con
// apps/mockup/scripts/extraer-puntos-logo.js -- si el logo cambia, corre
// ese script de nuevo en vez de editar esto a mano.
export type PuntoLogo = {
  x: number;
  y: number;
  r: number;
  color: string;
  delayMs: number;
};

export const ANCHO_LOGO = ${width};
export const ALTO_LOGO = ${altoUtil};

export const puntosLogo: PuntoLogo[] = ${JSON.stringify(puntos, null, 2)};
`;

  fs.writeFileSync(RUTA_SALIDA, ts);
  console.log(`Escritos ${puntos.length} puntos a ${RUTA_SALIDA}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
