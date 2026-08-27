// Banner de modo demo (Fase 6B) -- discreto pero permanente en TODAS las
// pantallas (por eso vive en el layout raíz, fuera de [countryCode], que
// envuelve tanto las páginas normales como el checkout). Server Component
// puro: no necesita interactividad, solo leer la variable de entorno.
const DemoBanner = () => {
  if (process.env.NEXT_PUBLIC_MODO_DEMO !== "true") return null

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 text-amber-900 text-center py-1.5 px-4 text-xs">
      Prototipo de demostración -- datos de prueba, no procesa pagos reales
    </div>
  )
}

export default DemoBanner
