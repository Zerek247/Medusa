// Genera las posiciones finales de los "puntitos" que imitan el patrón
// de doble hélice / reloj de arena del logo de BioBackup -- no son las
// coordenadas exactas del archivo original (no hay forma práctica de
// trazarlas a mano con precisión de píxel), es una aproximación
// matemática pensada para la animación de carga (logo-loader.tsx).
// Si el trazo no se parece lo suficiente al logo real, este es el único
// lugar que hay que retocar (los parámetros de abajo).

export type PuntoLogo = {
  x: number;
  y: number;
  r: number;
  color: string;
  retrasoMs: number;
};

function round3(n: number) {
  return Math.round(n * 1000) / 1000;
}

const NAVY: [number, number, number] = [3, 80, 136]; // #035088
const BLUE: [number, number, number] = [0, 143, 205]; // #008FCD
const TEAL: [number, number, number] = [52, 190, 190]; // #34BEBE

function mezclarColor(u: number): string {
  // navy -> blue en la primera mitad, blue -> teal en la segunda
  const [c1, c2, t] =
    u < 0.5 ? [NAVY, BLUE, u / 0.5] : [BLUE, TEAL, (u - 0.5) / 0.5];
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
  return `rgb(${r},${g},${b})`;
}

// Una "hebra" -- del brazo abierto de arriba, cruzando el centro, hasta
// el rizo cerrado de abajo. mirror=-1 dibuja la hebra izquierda,
// mirror=1 la derecha.
function generarHebra(
  puntos: number,
  mirror: 1 | -1,
  centerX: number,
  centerY: number
): PuntoLogo[] {
  const arr: PuntoLogo[] = [];
  const H = 230; // alto del patrón de puntos
  const spread = 118; // qué tan abiertos empiezan los brazos arriba
  const drift = 66; // qué tanto se recorre el rizo hacia su lado
  const turns = 1.35; // vueltas que da el rizo al final

  for (let i = 0; i < puntos; i++) {
    const u = i / (puntos - 1); // 0 = arriba, 1 = punta del rizo
    // el giro se acelera hacia el final (rizo apretado), casi no gira
    // arriba (brazo abierto y recto)
    const angulo = Math.pow(u, 2.3) * turns * Math.PI * 2;
    const decaimiento = 1 - 0.82 * Math.pow(u, 1.6); // 1 arriba -> 0.18 abajo

    // Redondeado a 3 decimales: Math.cos/Math.pow pueden diferir en el
    // último dígito entre el render del servidor (Node) y el del
    // navegador -- sin este redondeo, React marca un "hydration
    // mismatch" en cada punto porque el string SSR y el valor del
    // cliente no coinciden carácter por carácter.
    const x = round3(
      centerX +
        mirror * (spread * decaimiento * Math.cos(angulo) - drift * u * u)
    );
    const y = round3(centerY - H / 2 + u * H);

    const r = round3(6.4 - u * 3.6); // puntos más chicos hacia el rizo
    arr.push({
      x,
      y,
      r: Math.max(r, 1.6),
      color: mezclarColor(u),
      retrasoMs: 0, // se asigna después, mezclando ambas hebras
    });
  }
  return arr;
}

export function generarPuntosLogo(
  centerX = 170,
  centerY = 150,
  porHebra = 24
): PuntoLogo[] {
  const izquierda = generarHebra(porHebra, -1, centerX, centerY);
  const derecha = generarHebra(porHebra, 1, centerX, centerY);
  const todos = [...izquierda, ...derecha];

  // Retraso escalonado para que el "flujo" se vea como que entra en
  // orden (de arriba/afuera hacia el centro y el rizo), no todo de golpe.
  todos.forEach((p, i) => {
    const u = i % porHebra;
    p.retrasoMs = Math.round((u / (porHebra - 1)) * 500);
  });

  return todos;
}
