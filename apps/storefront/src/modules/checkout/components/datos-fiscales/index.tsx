// Datos fiscales mexicanos para el CFDI (Fase 6) -- independiente de la
// dirección de envío/facturación (esas son un domicilio, esto es la
// identidad fiscal del comprador ante el SAT). Van SIEMPRE, sin importar si
// "misma dirección de facturación" está marcado, porque no tienen relación
// con eso. Se guardan en cart.metadata.datos_fiscales (ver setAddresses en
// lib/data/cart.ts) -- Medusa no tiene un campo nativo para RFC/régimen
// fiscal/uso de CFDI, así que igual que con otros datos propios del
// negocio en este proyecto (bind_id, guia_envio_numero, etc.), se guardan
// como metadata.
import { HttpTypes } from "@medusajs/types"
import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import { Heading, Text } from "@modules/common/components/ui"
import { REGIMENES_FISCALES, USOS_CFDI, PATRON_RFC } from "@lib/constants-fiscales"
import { useState } from "react"

const DatosFiscales = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  const datosGuardados = (cart?.metadata as any)?.datos_fiscales || {}

  const [rfc, setRfc] = useState<string>(datosGuardados.rfc || "")
  const rfcValido = rfc === "" || PATRON_RFC.test(rfc)

  return (
    <div className="pt-8">
      <Heading level="h2" className="text-3xl-regular gap-x-4 pb-2">
        Datos fiscales (para tu factura)
      </Heading>
      <Text className="text-ui-fg-subtle txt-small mb-4">
        Opcional -- déjalos en blanco si no necesitas factura y solo quieres tu comprobante de compra.
      </Text>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="RFC"
          name="datos_fiscales.rfc"
          value={rfc}
          onChange={(e) => setRfc(e.target.value.toUpperCase())}
          maxLength={13}
          data-testid="rfc-input"
        />
        <Input
          label="Razón social / Nombre"
          name="datos_fiscales.razon_social"
          defaultValue={datosGuardados.razon_social || ""}
          data-testid="razon-social-input"
        />
        <NativeSelect
          name="datos_fiscales.regimen_fiscal"
          defaultValue={datosGuardados.regimen_fiscal || ""}
          placeholder="Régimen fiscal"
          data-testid="regimen-fiscal-select"
        >
          {REGIMENES_FISCALES.map((r) => (
            <option key={r.codigo} value={r.codigo}>
              {r.label}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          name="datos_fiscales.uso_cfdi"
          defaultValue={datosGuardados.uso_cfdi || ""}
          placeholder="Uso de CFDI"
          data-testid="uso-cfdi-select"
        >
          {USOS_CFDI.map((u) => (
            <option key={u.codigo} value={u.codigo}>
              {u.label}
            </option>
          ))}
        </NativeSelect>
        <Input
          label="Código postal fiscal"
          name="datos_fiscales.cp_fiscal"
          defaultValue={datosGuardados.cp_fiscal || ""}
          maxLength={5}
          data-testid="cp-fiscal-input"
        />
      </div>
      {!rfcValido && (
        <Text className="text-ui-fg-error txt-small mt-2">
          El RFC no tiene un formato válido (revisa mayúsculas y longitud).
        </Text>
      )}
    </div>
  )
}

export default DatosFiscales
