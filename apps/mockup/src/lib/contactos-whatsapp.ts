// MAQUETA: contactos de WhatsApp simulados -- números de ejemplo, no
// reales. En el sistema real esto vendría configurado desde el panel de
// administración (a quién se enruta cada chat, horarios, etc).
export type ContactoWhatsapp = {
  nombre: string;
  area: string;
  horario: string;
  numero: string; // formato wa.me, sin '+' ni espacios
  color: "navy" | "blue" | "teal";
};

export const contactosWhatsapp: ContactoWhatsapp[] = [
  {
    nombre: "Renata Cordero",
    area: "Ventas — consultorio",
    horario: "L-V 9:00-18:00",
    numero: "525500000001",
    color: "navy",
  },
  {
    nombre: "Diego Salazar",
    area: "Ventas — hospitales y clínicas",
    horario: "L-V 9:00-18:00",
    numero: "525500000002",
    color: "blue",
  },
  {
    nombre: "Karla Ibarra",
    area: "Soporte y garantías",
    horario: "L-S 9:00-15:00",
    numero: "525500000003",
    color: "teal",
  },
];
