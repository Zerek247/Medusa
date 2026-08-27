// Panel de operación (Fase 6): tareas de la cola post-pago (Fase 5) que
// agotaron sus reintentos, con botón para reintentarlas. Consume los
// endpoints de src/api/admin/post-pago/fallidos/.
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ExclamationCircle } from "@medusajs/icons";
import { Badge, Button, Container, Heading, Text, Toaster, toast } from "@medusajs/ui";
import { useEffect, useState } from "react";

type TareaFallida = {
  job_id: string;
  tarea: string;
  order_id: string;
  intentos_hechos: number;
  fallo_en: string | null;
  error: string;
  error_completo: string;
  bitacora: string[];
};

const NOMBRES_TAREA: Record<string, string> = {
  registrar_venta_en_bind: "Registrar venta en Bind",
  timbrar_cfdi: "Timbrar CFDI",
  generar_guia_envio: "Generar guía de envío",
  enviar_correo: "Enviar correo",
};

const PostPagoFallidosPage = () => {
  const [tareas, setTareas] = useState<TareaFallida[]>([]);
  const [cargando, setCargando] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [reintentando, setReintentando] = useState<string | null>(null);

  const cargar = async () => {
    setCargando(true);
    const respuesta = await fetch("/admin/post-pago/fallidos", { credentials: "include" });
    const datos = await respuesta.json();
    setTareas(datos.tareas || []);
    setCargando(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const reintentar = async (jobId: string) => {
    setReintentando(jobId);
    try {
      const respuesta = await fetch(`/admin/post-pago/fallidos/${encodeURIComponent(jobId)}/reintentar`, {
        method: "POST",
        credentials: "include",
      });
      if (!respuesta.ok) {
        const err = await respuesta.json();
        throw new Error(err.error || "Error al reintentar");
      }
      toast.success("Reencolada", { description: "La tarea se reintentará en unos segundos." });
      await cargar();
    } catch (error) {
      toast.error("No se pudo reintentar", { description: (error as Error).message });
    } finally {
      setReintentando(null);
    }
  };

  return (
    <Container className="divide-y p-0">
      <Toaster />
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Cola de fallidos</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Tareas post-pago (registrar venta, timbrar CFDI, generar guía, enviar correo) que agotaron sus 3 reintentos.
          </Text>
        </div>
        <Button variant="secondary" size="small" onClick={cargar} isLoading={cargando}>
          Actualizar
        </Button>
      </div>

      {!cargando && tareas.length === 0 && (
        <div className="px-6 py-8 text-center">
          <Text className="text-ui-fg-subtle">No hay tareas en la cola de fallidos ahora mismo.</Text>
        </div>
      )}

      {tareas.map((t) => (
        <div key={t.job_id} className="px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <ExclamationCircle className="text-ui-fg-error mt-1" />
              <div>
                <div className="flex items-center gap-2">
                  <Text weight="plus">{NOMBRES_TAREA[t.tarea] || t.tarea}</Text>
                  <Badge color="red" size="2xsmall">
                    {t.intentos_hechos} intento(s)
                  </Badge>
                </div>
                <Text size="small" className="text-ui-fg-subtle">
                  Orden {t.order_id} -- falló {t.fallo_en ? new Date(t.fallo_en).toLocaleString("es-MX") : ""}
                </Text>
                <Text size="small" className="text-ui-fg-error mt-1">
                  {t.error}
                </Text>
                <button
                  className="text-ui-fg-interactive text-xs mt-1"
                  onClick={() => setExpandido(expandido === t.job_id ? null : t.job_id)}
                >
                  {expandido === t.job_id ? "Ocultar detalle" : "Ver error completo y bitácora"}
                </button>
                {expandido === t.job_id && (
                  <pre className="mt-2 p-3 bg-ui-bg-subtle rounded text-xs overflow-x-auto whitespace-pre-wrap">
                    {t.bitacora.join("\n")}
                    {"\n\n"}
                    {t.error_completo}
                  </pre>
                )}
              </div>
            </div>
            <Button
              size="small"
              variant="secondary"
              isLoading={reintentando === t.job_id}
              onClick={() => reintentar(t.job_id)}
            >
              Reintentar
            </Button>
          </div>
        </div>
      ))}
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Cola de fallidos",
  icon: ExclamationCircle,
});

export default PostPagoFallidosPage;
