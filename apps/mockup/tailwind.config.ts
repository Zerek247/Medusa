import type { Config } from "tailwindcss";

// Paleta basada en el logo de BioBackup (azul marino -> azul medio ->
// verde menta, el mismo degradado de los puntos del logo). Si cuando
// lleguen los archivos reales del logo los tonos exactos difieren un
// poco de esto, ajustar aquí nada más -- todo el sitio usa estas
// variables, no colores sueltos.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        biobackup: {
          navy: "#14345C",
          navyLight: "#1F4C87",
          blue: "#1C8FCB",
          blueLight: "#4FB2E0",
          teal: "#3FB79B",
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
          "linear-gradient(135deg, #14345C 0%, #1C8FCB 55%, #3FB79B 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
