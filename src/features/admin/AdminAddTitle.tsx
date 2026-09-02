import { useState, type FormEvent } from 'react'
import type { Movie } from '../../domain/movie.ts'
import { useAddCatalogMovie } from '../../query/overrides/useOverrides.ts'

type AdminAddTitleProps = {
  onAdded: (movie: Movie) => void
}

export function AdminAddTitle({ onAdded }: AdminAddTitleProps) {
  const add = useAddCatalogMovie()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = value.trim()
    if (!input) return
    try {
      const movie = await add.mutateAsync(input)
      setValue('')
      setOpen(false)
      onAdded(movie)
    } catch {
      // shown via add.error
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full py-3 text-left text-[11px] tracking-[0.18em] uppercase text-muted hover:text-ivory"
      >
        + Add a title
      </button>
    )
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3 border-t border-ivory/10 pt-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] tracking-[0.18em] uppercase text-muted">From IMDb or TMDB</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[11px] tracking-[0.14em] uppercase text-muted hover:text-ivory"
        >
          Close
        </button>
      </div>
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="tt1234567 or a title URL"
        className="w-full border-0 border-b border-ivory/20 bg-transparent py-2 font-serif text-sm text-ivory outline-none placeholder:text-ivory/30 focus:border-brand"
      />
      <button
        type="submit"
        disabled={add.isPending || !value.trim()}
        className="w-full bg-brand py-2 text-[11px] tracking-[0.18em] uppercase text-ink disabled:opacity-40"
      >
        {add.isPending ? 'Adding...' : 'Add to catalog'}
      </button>
      {add.error ? <p className="font-serif text-xs text-red-300">{add.error.message}</p> : null}
    </form>
  )
}
