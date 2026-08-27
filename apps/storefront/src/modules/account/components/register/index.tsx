"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  // Fase 6B: en modo demo no se permite crear cuentas nuevas (evita que
  // alguien en la junta deje datos personales reales en un prototipo) --
  // se deja precargada una sola cuenta demo para mostrar el historial de
  // pedidos.
  if (process.env.NEXT_PUBLIC_MODO_DEMO === "true") {
    return (
      <div className="max-w-sm flex flex-col items-center" data-testid="register-page-demo-disabled">
        <h1 className="text-large-semi mb-4">Registro deshabilitado en la demo</h1>
        <p className="text-center text-base-regular text-ui-fg-subtle mb-6">
          Este es un prototipo de demostración -- usa la cuenta precargada para ver el
          historial de pedidos.
        </p>
        <div className="w-full bg-ui-bg-subtle border border-ui-border-base rounded-rounded p-4 text-center mb-6">
          <p className="txt-small-plus">demo@biobackup.mx</p>
          <p className="txt-small text-ui-fg-subtle">demo1234</p>
        </div>
        <button onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)} className="underline">
          Ir a iniciar sesión
        </button>
      </div>
    )
  }

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi mb-6">
        Crea tu cuenta en BioBackup
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        Guarda tus direcciones y consulta tu historial de pedidos.
      </p>
      {message?.state === "verification_required" && (
        <div
          className="w-full mb-4 text-center text-base-regular text-ui-fg-base bg-ui-bg-subtle border border-ui-border-base rounded-rounded p-4"
          data-testid="register-verification-message"
        >
          We sent a verification link to <strong>{message.email}</strong>.
          Please check your inbox to verify your email, then sign in.
        </div>
      )}
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="register-error"
        />
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          Crear cuenta
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        ¿Ya tienes cuenta?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Inicia sesión
        </button>
        .
      </span>
    </div>
  )
}

export default Register
