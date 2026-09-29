import type { Config } from "tailwindcss";

// Paleta OFICIAL de la marca, tal cual la compartió el cliente (manual de
// marca -- "Colores principales" y "Colores secundarios"). Ya no son
// valores muestreados del logo -- si la marca cambia su paleta, este es
// el único lugar que hay que actualizar.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        biobackup: {
          // --- Principales (del manual de marca) ---
          navy: "#035088", // Principal 1
          blue: "#008FCD", // Principal 2
          teal: "#34BEBE", // Principal 3
          // --- Secundarios (del manual de marca) ---
          green: "#5FC5A8",
          slate: "#8BB3C7",
          skyLight: "#A2DCF0",
          // --- Derivados (no vienen del manual, solo tintes para
          // hover/fondos -- calculados a partir de los principales) ---
          navyLight: "#0E6FA5",
          blueLight: "#4FB6E0",
          tealLight: "#8FDDC9",
          ink: "#0F1E33",
          paper: "#F6FAFA",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "biobackup-gradient":
          "linear-gradient(135deg, #035088 0%, #008FCD 55%, #34BEBE 100%)",
        // Fondo de página: el cliente pidió explícitamente que NO fuera
        // todo blanco. Degradado suave con los colores secundarios (muy
        // aclarados) -- da ambiente sin competir con las fotos de
        // producto, que sí van sobre tarjetas blancas para que resalten.
        "biobackup-ambiente":
          "radial-gradient(ellipse 80% 60% at 15% 0%, rgba(162,220,240,0.35), transparent 60%), radial-gradient(ellipse 70% 50% at 100% 30%, rgba(95,197,168,0.25), transparent 55%), linear-gradient(180deg, #EAF5F8 0%, #F3F9FA 45%, #EAF3F6 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
