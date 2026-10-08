import type { Config } from "tailwindcss";

// Paleta OFICIAL de la marca, tal cual la compartió el cliente (manual de
// marca -- "Colores principales" y "Colores secundarios"). Si la marca
// cambia su paleta, este es el único lugar que hay que actualizar.
//
// surface / paper / ink NO son colores fijos: leen variables CSS
// (--c-surface, --c-paper, --c-ink, definidas en globals.css) que cambian
// con el modo noche. Por eso el modo oscuro de la tienda casi no necesita
// clases "dark:" regadas por todos lados.
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        biobackup: {
          // --- Principales (del manual de marca) ---
          navy: "#035088", // Principal 1
          blue: "#008FCD", // Principal 2
          teal: "#34BEBE", // Principal 3
          // --- Secundarios (del manual de marca) ---
          green: "#5FC5A8",
          slate: "#8BB3C7",
          skyLight: "#A2DCF0",
          // --- Derivados (tintes para hover/fondos) ---
          navyLight: "#0E6FA5",
          blueLight: "#4FB6E0",
          tealLight: "#8FDDC9",
          ink: "rgb(var(--c-ink) / <alpha-value>)",
          paper: "rgb(var(--c-paper) / <alpha-value>)",
        },
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
        "3xl": "2.25rem",
      },
      fontFamily: {
        // Todo el sitio (tienda, panel, pantalla de carga) usa Montserrat.
        sans: [
          "var(--font-montserrat)",
          "Montserrat",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        // Variante de la misma familia, para títulos.
        display: [
          "var(--font-montserrat-alt)",
          "var(--font-montserrat)",
          "Montserrat",
          "sans-serif",
        ],
      },
      keyframes: {
        "flotar-lento": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(18px,-24px,0) scale(1.06)" },
        },
        "flotar-lento-2": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(-22px,18px,0) scale(1.08)" },
        },
        "subir-suave": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "brillo-barrido": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        "flotar-lento": "flotar-lento 14s ease-in-out infinite",
        "flotar-lento-2": "flotar-lento-2 18s ease-in-out infinite",
        "subir-suave": "subir-suave .7s cubic-bezier(.2,.7,.3,1) both",
        "brillo-barrido": "brillo-barrido 6s linear infinite",
      },
      backgroundImage: {
        "biobackup-gradient":
          "linear-gradient(135deg, #035088 0%, #008FCD 55%, #34BEBE 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
