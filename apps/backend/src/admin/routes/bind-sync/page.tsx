// Panel de operación (Fase 6): bitácora de las últimas sincronizaciones con
// Bind ERP (Fase 3). Consume /admin/bind-sync/bitacora.
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ArrowPath } from "@medusajs/icons";
import { Badge, Container, Heading, Table, Text } from "@medusajs/ui";
import { useEffect, useState } from "react";

type Corrida = {
  disparado_por: "scheduled" | "manual";
  fecha: string;
  total_productos_bind: number;
  creados: number;
  actualizados: number;
  fallidos: number;
  errores: Array<{ sku: string; error: string }>;
  marcados_requiere_datos_envio: string[];
};

const BindSyncPage = () => {
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/admin/bind-sync/bitacora", { credentials: "include" })
      .then((r) => r.json())
      .then((datos) => setCorridas(datos.corridas || []))
      .finally(() => setCargando(false));
  }, []);

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Sincronizaciones con Bind ERP</Heading>
        <Text className="text-ui-fg-subtle" size="small">
          {/* OJO: nada de process.env aquí -- esto es código de NAVEGADOR
              (Vite, no Next.js), "process" ni siquiera existe en ese
              contexto. Referenciarlo tronaba la resolución de TODO el
              módulo de rutas del admin (los tres, no solo este archivo),
              dejando el panel en blanco -- costó encontrarlo porque el
              error de Vite apuntaba a "no se puede resolver el import",
              no al verdadero problema (una variable que no existe en el
              navegador). */}
          Las últimas {corridas.length} corridas (programadas según `BIND_SYNC_CRON` o disparadas a mano).
        </Text>
      </div>

      {!cargando && corridas.length === 0 && (
        <div className="px-6 py-8 text-center">
          <Text className="text-ui-fg-subtle">Todavía no hay ninguna sincronización registrada.</Text>
        </div>
      )}

      {corridas.length > 0 && (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Fecha</Table.HeaderCell>
              <Table.HeaderCell>Origen</Table.HeaderCell>
              <Table.HeaderCell>Productos</Table.HeaderCell>
              <Table.HeaderCell>Creados</Table.HeaderCell>
              <Table.HeaderCell>Actualizados</Table.HeaderCell>
              <Table.HeaderCell>Fallidos</Table.HeaderCell>
              <Table.HeaderCell>Requieren envío</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {corridas.map((c, i) => (
              <Table.Row key={i}>
                <Table.Cell>{new Date(c.fecha).toLocaleString("es-MX")}</Table.Cell>
                <Table.Cell>
                  <Badge size="2xsmall" color={c.disparado_por === "manual" ? "blue" : "grey"}>
                    {c.disparado_por === "manual" ? "Manual" : "Programada"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{c.total_productos_bind}</Table.Cell>
                <Table.Cell>{c.creados}</Table.Cell>
                <Table.Cell>{c.actualizados}</Table.Cell>
                <Table.Cell>
                  {c.fallidos > 0 ? (
                    <Badge size="2xsmall" color="red">
                      {c.fallidos}
                    </Badge>
                  ) : (
                    0
                  )}
                </Table.Cell>
                <Table.Cell>{c.marcados_requiere_datos_envio.length}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Sync con Bind",
  icon: ArrowPath,
});

export default BindSyncPage;
