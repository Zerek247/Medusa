// Subconjunto de los catálogos del SAT (Fase 6) usados en el checkout para
// capturar datos fiscales mexicanos. Son catálogos oficiales completos de
// decenas de entradas -- aquí solo se listan los regímenes/usos de CFDI más
// comunes para una compra de equipo médico (consultorio particular,
// persona física con actividad profesional, empresa). Si se necesita el
// catálogo completo algún día, esto es lo único que habría que ampliar.
export const REGIMENES_FISCALES = [
  { codigo: "601", label: "601 -- General de Ley Personas Morales" },
  { codigo: "603", label: "603 -- Personas Morales con Fines no Lucrativos" },
  { codigo: "605", label: "605 -- Sueldos y Salarios" },
  { codigo: "606", label: "606 -- Arrendamiento" },
  { codigo: "608", label: "608 -- Demás ingresos" },
  { codigo: "612", label: "612 -- Personas Físicas con Actividad Empresarial y Profesional" },
  { codigo: "616", label: "616 -- Sin obligaciones fiscales" },
  { codigo: "621", label: "621 -- Incorporación Fiscal" },
  { codigo: "626", label: "626 -- Régimen Simplificado de Confianza (RESICO)" },
]

export const USOS_CFDI = [
  { codigo: "G01", label: "G01 -- Adquisición de mercancías" },
  { codigo: "G03", label: "G03 -- Gastos en general" },
  { codigo: "P01", label: "P01 -- Por definir" },
  { codigo: "S01", label: "S01 -- Sin efectos fiscales" },
]

// Patrón laxo de RFC (persona física 13 caracteres, persona moral 12) --
// solo para dar retroalimentación inmediata en el formulario, no reemplaza
// la validación real del SAT (que este prototipo no hace, ver el
// comentario en el mock del PAC).
export const PATRON_RFC = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i
