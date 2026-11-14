import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-biobackup-navy/10 bg-surface p-4">
      <div>
        <h2 className="text-sm font-extrabold text-biobackup-ink">
          ¿Ya tienes una cuenta?
        </h2>
        <p className="mt-0.5 text-sm text-biobackup-ink/60">
          Inicia sesión para ver tus direcciones y pedidos.
        </p>
      </div>
      <LocalizedClientLink
        href="/account"
        className="inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-biobackup-navy/20 px-5 py-2 text-sm font-semibold text-biobackup-navy transition hover:border-biobackup-blue hover:text-biobackup-blue"
        data-testid="sign-in-button"
      >
        Iniciar sesión
      </LocalizedClientLink>
    </div>
  )
}

export default SignInPrompt
