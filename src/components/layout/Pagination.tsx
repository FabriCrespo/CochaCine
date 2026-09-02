type PaginationProps = {
  page: number
  totalPages: number
  from: number
  to: number
  total: number
  onPage: (page: number) => void
  tone?: 'dark' | 'paper'
}

export function Pagination({
  page,
  totalPages,
  from,
  to,
  total,
  onPage,
  tone = 'dark',
}: PaginationProps) {
  if (total === 0 || totalPages <= 1) return null

  const quiet = tone === 'paper' ? 'text-ink/35 hover:text-ink' : 'text-muted hover:text-ivory'
  const label = tone === 'paper' ? 'text-ink/50' : 'text-ivory/50'
  const disabled = 'cursor-default opacity-30 hover:text-inherit'

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 py-3 text-[11px] tracking-[0.16em] uppercase"
    >
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className={`${quiet} ${page <= 1 ? disabled : ''}`}
      >
        Previous
      </button>
      <p className={label}>
        {from}–{to}
        <span className="opacity-60"> of {total}</span>
      </p>
      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        className={`${quiet} ${page >= totalPages ? disabled : ''}`}
      >
        Next
      </button>
    </nav>
  )
}
