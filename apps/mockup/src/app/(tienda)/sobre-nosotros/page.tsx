export default function SobreNosotrosPage() {
  return (
    <div>
      <section className="bg-biobackup-gradient">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Sobre BioBackup
          </h1>
          <p className="mt-3 text-white/85">
            Equipo médico y consumibles, pensados para el ritmo real de un
            consultorio.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="space-y-5 text-[15px] leading-relaxed text-biobackup-ink/80">
          <p>
            BioBackup nace para resolver un problema muy concreto: conseguir
            equipo médico confiable, con disponibilidad real y sin vueltas,
            es más difícil de lo que debería. Trabajamos directamente con
            proveedores certificados para que lo que ves en el catálogo sea
            lo que realmente tenemos en existencia.
          </p>
          <p>
            Atendemos tanto compras individuales de consultorio como pedidos
            institucionales de hospitales y clínicas, con la misma atención
            a los tiempos de entrega y la facturación correcta desde la
            primera vez.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Valor titulo="Disponibilidad real" texto="Lo que ves en existencia es lo que hay -- sincronizado con nuestro inventario." />
          <Valor titulo="Envío rastreado" texto="Cada pedido con guía y estatus visible, de principio a fin." />
          <Valor titulo="Facturación correcta" texto="CFDI 4.0 desde la primera compra, sin trámites después." />
        </div>
      </section>
    </div>
  );
}

function Valor({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="rounded-xl border border-biobackup-navy/10 bg-white p-5">
      <p className="text-sm font-semibold text-biobackup-navy">{titulo}</p>
      <p className="mt-1.5 text-sm text-biobackup-ink/60">{texto}</p>
    </div>
  );
}
