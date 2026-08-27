// Panel de operación (Fase 6): productos que el sync de Bind marcó con
// requiere_datos_envio (Fase 3, porque el ERP no trae peso/dimensiones para
// ellos) con un formulario para capturarlos. Sin estos datos, Skydropx no
// puede cotizar el envío del producto (Fase 4) -- solo "Envío por cotizar".
import { defineRouteConfig } from "@medusajs/admin-sdk";
// OJO: el ícono se llama "TruckFast" en @medusajs/icons -- no existe un
// export "Truck" a secas (por eso tronaba con "does not provide an
// export named 'Truck'").
import { TruckFast } from "@medusajs/icons";
import { Button, Container, Heading, Input, Label, Text, Toaster, toast } from "@medusajs/ui";
import { useEffect, useState } from "react";

type ProductoPendiente = {
  id: string;
  title: string;
  thumbnail: string | null;
  variant_id: string;
  sku: string;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
};

type Form = { weight_kg: string; length_cm: string; width_cm: string; height_cm: string };

const RequiereDatosEnvioPage = () => {
  const [productos, setProductos] = useState<ProductoPendiente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [formularios, setFormularios] = useState<Record<string, Form>>({});
  const [guardando, setGuardando] = useState<string | null>(null);

  const cargar = async () => {
    setCargando(true);
    const respuesta = await fetch("/admin/envio/requiere-datos", { credentials: "include" });
    const datos = await respuesta.json();
    setProductos(datos.productos || []);
    setCargando(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const actualizarCampo = (productId: string, campo: keyof Form, valor: string) => {
    setFormularios((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] || { weight_kg: "", length_cm: "", width_cm: "", height_cm: "" }), [campo]: valor },
    }));
  };

  const guardar = async (producto: ProductoPendiente) => {
    const form = formularios[producto.id];
    const valores = {
      variant_id: producto.variant_id,
      weight_kg: Number(form?.weight_kg),
      length_cm: Number(form?.length_cm),
      width_cm: Number(form?.width_cm),
      height_cm: Number(form?.height_cm),
    };
    if (!valores.weight_kg || !valores.length_cm || !valores.width_cm || !valores.height_cm) {
      toast.error("Faltan datos", { description: "Los 4 campos son obligatorios y deben ser mayores a 0." });
      return;
    }

    setGuardando(producto.id);
    try {
      const respuesta = await fetch(`/admin/envio/requiere-datos/${producto.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valores),
      });
      if (!respuesta.ok) {
        const err = await respuesta.json();
        throw new Error(err.error || "Error al guardar");
      }
      toast.success("Guardado", { description: `${producto.title} ya se puede cotizar con Skydropx.` });
      await cargar();
    } catch (error) {
      toast.error("No se pudo guardar", { description: (error as Error).message });
    } finally {
      setGuardando(null);
    }
  };

  return (
    <Container className="divide-y p-0">
      <Toaster />
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Falta peso/dimensiones</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Bind ERP no trae estos datos para estos productos -- captúralos para que Skydropx los pueda cotizar.
          </Text>
        </div>
        <Button variant="secondary" size="small" onClick={cargar} isLoading={cargando}>
          Actualizar
        </Button>
      </div>

      {!cargando && productos.length === 0 && (
        <div className="px-6 py-8 text-center">
          <Text className="text-ui-fg-subtle">Ningún producto pendiente -- todos tienen peso y dimensiones.</Text>
        </div>
      )}

      {productos.map((p) => {
        const form = formularios[p.id] || { weight_kg: "", length_cm: "", width_cm: "", height_cm: "" };
        return (
          <div key={p.id} className="px-6 py-4">
            <div className="flex items-center gap-3 mb-3">
              {p.thumbnail && (
                <img src={p.thumbnail} alt="" className="w-10 h-10 rounded object-cover" />
              )}
              <div>
                <Text weight="plus">{p.title}</Text>
                <Text size="small" className="text-ui-fg-subtle">
                  SKU {p.sku}
                </Text>
              </div>
            </div>
            <div className="grid grid-cols-2 small:grid-cols-5 gap-3 items-end">
              <div>
                <Label size="small">Peso (kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.weight_kg}
                  onChange={(e) => actualizarCampo(p.id, "weight_kg", e.target.value)}
                />
              </div>
              <div>
                <Label size="small">Largo (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.length_cm}
                  onChange={(e) => actualizarCampo(p.id, "length_cm", e.target.value)}
                />
              </div>
              <div>
                <Label size="small">Ancho (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.width_cm}
                  onChange={(e) => actualizarCampo(p.id, "width_cm", e.target.value)}
                />
              </div>
              <div>
                <Label size="small">Alto (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.height_cm}
                  onChange={(e) => actualizarCampo(p.id, "height_cm", e.target.value)}
                />
              </div>
              <Button size="small" isLoading={guardando === p.id} onClick={() => guardar(p)}>
                Guardar
              </Button>
            </div>
          </div>
        );
      })}
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Falta peso/dimensiones",
  icon: TruckFast,
});

export default RequiereDatosEnvioPage;
