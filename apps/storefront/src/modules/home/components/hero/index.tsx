// Hero de inicio (Fase 6): sobrio, sin fotografía de stock genérica ni
// mensaje de "starter template" -- lo único que trae el dtc-starter
// original y que no aplica a una tienda real de equipo médico.
import { Heading, Text, Button } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="w-full border-b border-ui-border-base bg-ui-bg-subtle">
      <div className="content-container py-20 small:py-28 flex flex-col items-start gap-4 max-w-2xl">
        <Heading level="h1" className="text-3xl small:text-4xl leading-tight text-ui-fg-base font-normal">
          Equipo médico y de diagnóstico para tu consultorio
        </Heading>
        <Text className="text-ui-fg-subtle text-base">
          Oximetría, terapia respiratoria, básculas clínicas y más -- con envío
          a todo México y guía de rastreo en cada pedido.
        </Text>
        <LocalizedClientLink href="/store">
          <Button size="large">Ver catálogo</Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Hero
