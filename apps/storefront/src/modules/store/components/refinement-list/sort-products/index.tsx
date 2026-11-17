"use client"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: string) => void
  // Sin sesión no se ven precios, así que tampoco se ordena por precio.
  conPrecios?: boolean
  "data-testid"?: string
}

const sortOptions = [
  { value: "created_at", label: "Más recientes" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
  conPrecios = true,
}: SortProductsProps) => {
  const opciones = conPrecios
    ? sortOptions
    : sortOptions.filter((o) => !o.value.startsWith("price"))
  return (
    <label className="flex items-center gap-2 text-sm" data-testid={dataTestId}>
      <span className="font-semibold text-biobackup-ink/60">Ordenar</span>
      <select
        value={sortBy}
        onChange={(e) => setQueryParams("sortBy", e.target.value as SortOptions)}
        className="min-h-[44px] rounded-full border border-biobackup-navy/20 bg-surface px-4 py-2 text-sm font-medium text-biobackup-ink outline-none transition focus:border-biobackup-blue"
      >
        {opciones.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default SortProducts
