// Buscador del catálogo -- filtra por el parámetro "q" en la URL, que
// paginated-products.tsx reenvía a /store/products.
"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

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
    <form onSubmit={buscar} className="relative w-full sm:w-64" role="search">
      <button
        type="submit"
        className="absolute left-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-biobackup-ink/45"
        aria-label="Buscar"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
          />
        </svg>
      </button>
      <input
        type="search"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="Buscar producto..."
        className="w-full rounded-full border border-biobackup-navy/20 bg-surface py-2 pl-10 pr-3 text-sm outline-none transition focus:border-biobackup-blue"
        data-testid="search-input"
      />
    </form>
  )
}

export default SearchBar
