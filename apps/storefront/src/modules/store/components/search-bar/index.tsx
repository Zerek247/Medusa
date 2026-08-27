// Buscador del catálogo (Fase 6) -- filtra por el parámetro "q" en la URL,
// que paginated-products.tsx ya reenvía a /store/products.
"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { MagnifyingGlassMini } from "@medusajs/icons"

const SearchBar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [valor, setValor] = useState(searchParams.get("q") || "")

  const buscar = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (valor.trim()) {
      params.set("q", valor.trim())
    } else {
      params.delete("q")
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <form onSubmit={buscar} className="relative w-full small:max-w-xs">
      <input
        type="search"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="Buscar por nombre..."
        className="w-full border border-ui-border-base rounded-rounded py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-ui-border-interactive"
        data-testid="search-input"
      />
      <button
        type="submit"
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ui-fg-subtle"
        aria-label="Buscar"
      >
        <MagnifyingGlassMini />
      </button>
    </form>
  )
}

export default SearchBar
