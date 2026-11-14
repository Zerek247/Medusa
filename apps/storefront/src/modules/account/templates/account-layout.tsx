import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1 px-4 py-8 sm:px-6" data-testid="account-page">
      <div className="mx-auto flex h-full max-w-5xl flex-1 flex-col rounded-3xl border border-white/70 bg-surface/80 shadow-[0_8px_30px_-14px_rgba(3,80,136,0.3)] backdrop-blur dark:border-white/10 px-5 sm:px-8">
        <div className="grid grid-cols-1  small:grid-cols-[240px_1fr] py-8">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="flex-1">{children}</div>
        </div>
        <div className="flex flex-col small:flex-row items-end justify-between small:border-t border-biobackup-navy/10 py-8 gap-8">
          <div>
            <h3 className="text-xl-semi mb-4">¿Tienes dudas?</h3>
            <span className="txt-medium">
              Encuentra respuestas en nuestras preguntas frecuentes.
            </span>
          </div>
          <div>
            <UnderlineLink href="/faq">
              Preguntas frecuentes
            </UnderlineLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
