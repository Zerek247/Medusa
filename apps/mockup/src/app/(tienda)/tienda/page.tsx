import Catalogo from "@/components/catalogo";
import { productos } from "@/lib/datos";

export default function TiendaPage() {
  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <h1 className="text-2xl font-bold text-biobackup-ink">Catálogo</h1>
      </div>
      <Catalogo productos={productos} />
    </div>
  );
}
