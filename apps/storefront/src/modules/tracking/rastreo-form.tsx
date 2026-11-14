"use client"

import { rastrearPedido } from "@lib/data/tracking"
import { Heading, Text } from "@modules/common/components/ui"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

const RastreoForm = () => {
  const [state, formAction, isPending] = useActionState(rastrearPedido, {
    resultado: null,
    error: null,
  })

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <span className="mb-2 block h-1.5 w-12 rounded-full bg-gradient-to-r from-biobackup-navy via-biobackup-blue to-biobackup-teal" />
      <Heading level="h1" className="mb-2 text-3xl font-extrabold tracking-tight text-biobackup-ink">
        Rastrea tu pedido
      </Heading>
      <Text className="text-ui-fg-subtle mb-8">
        Captura tu número de pedido (el que aparece en tu correo de confirmación) y el
        correo con el que compraste.
      </Text>

      <form action={formAction} className="flex flex-col gap-4 p-5 rounded-3xl border border-white/70 bg-surface/80 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur dark:border-white/10 sm:p-6">
        <Input label="Número de pedido" name="numero" required data-testid="rastreo-numero-input" />
        <Input label="Correo" name="email" type="email" required data-testid="rastreo-email-input" />
        <button
          type="submit"
          disabled={isPending}
          className="min-h-[44px] w-full rounded-full bg-biobackup-navy px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
          data-testid="rastreo-submit-button"
        >
          {isPending ? "Buscando..." : "Buscar pedido"}
        </button>
      </form>

      {state.error && (
        <Text className="text-ui-fg-error mt-6" data-testid="rastreo-error">
          {state.error}
        </Text>
      )}

      {state.resultado && (
        <div className="mt-10 p-6 rounded-3xl border border-white/70 bg-surface/80 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur dark:border-white/10" data-testid="rastreo-resultado">
          <div className="flex items-center justify-between mb-4">
            <Text className="txt-large-plus">Pedido #{state.resultado.numero}</Text>
            <Text className="text-ui-fg-subtle txt-small">
              {new Date(state.resultado.fecha).toLocaleDateString("es-MX")}
            </Text>
          </div>
          <Text className="txt-medium-plus text-ui-fg-base mb-1">Estatus</Text>
          <Text className="text-ui-fg-subtle mb-4">{state.resultado.estatus}</Text>

          {state.resultado.metodo_envio && (
            <>
              <Text className="txt-medium-plus text-ui-fg-base mb-1">Método de envío</Text>
              <Text className="text-ui-fg-subtle mb-4">{state.resultado.metodo_envio}</Text>
            </>
          )}

          {state.resultado.guia && (
            <>
              <Text className="txt-medium-plus text-ui-fg-base mb-1">Guía</Text>
              <Text className="text-ui-fg-subtle mb-4">
                {state.resultado.guia.numero} --{" "}
                <a
                  href={state.resultado.guia.url_rastreo}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                >
                  Rastrear con la paquetería
                </a>
              </Text>
            </>
          )}

          <Text className="txt-medium-plus text-ui-fg-base mb-1">Artículos</Text>
          <ul className="text-ui-fg-subtle">
            {state.resultado.articulos.map((a, i) => (
              <li key={i}>
                {a.cantidad}x {a.titulo}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default RastreoForm
