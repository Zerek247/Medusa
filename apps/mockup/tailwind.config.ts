import type { Config } from "tailwindcss";

// Paleta sacada directamente de los archivos reales del logo (muestreo
// de píxeles de assets/logo/biobackup-*.jpeg -- no son valores a ojo):
// navy #005484 y blue #0090CC son los dos colores dominantes del
// wordmark, teal #4CB79B es el de "Equipo médico + consumibles" y los
// puntos claros. Si el logo cambia, volver a muestrear en vez de ajustar
// esto a mano.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        biobackup: {
          navy: "#005484",
          navyLight: "#0E6FA5",
          blue: "#0090CC",
          blueLight: "#4FB6E0",
          teal: "#3FA98A",
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
          "linear-gradient(135deg, #005484 0%, #0090CC 55%, #3FA98A 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
