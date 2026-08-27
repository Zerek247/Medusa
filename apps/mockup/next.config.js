/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sin backend, sin dominios externos que optimizar -- todas las
  // "fotos" son SVG generados localmente.
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
