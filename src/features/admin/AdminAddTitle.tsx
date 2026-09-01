import { useState, type FormEvent } from 'react'
import type { Movie } from '../../domain/movie.ts'
import { useAddCatalogMovie } from '../../query/overrides/useOverrides.ts'

type AdminAddTitleProps = {
  onAdded: (movie: Movie) => void
}

export function AdminAddTitle({ onAdded }: AdminAddTitleProps) {
  const add = useAddCatalogMovie()
  const [value, setValue] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = value.trim()
    if (!input) return
    try {
      const movie = await add.mutateAsync(input)
      setValue('')
      onAdded(movie)
    } catch {
      // shown via add.error
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-2">
      <label className="block">
        <span className="mb-1 block text-[11px] tracking-[0.16em] uppercase text-brand/55">
          Add from IMDb
        </span>
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="https://www.imdb.com/title/tt1234567/"
          className="w-full border border-brand/40 bg-ink px-3 py-2 text-sm text-brand outline-none placeholder:text-brand/40 focus:border-brand"
        />
      </label>
      <button
        type="submit"
        disabled={add.isPending || !value.trim()}
        className="w-full border border-brand bg-brand px-3 py-1.5 text-[11px] tracking-[0.16em] uppercase text-ink disabled:opacity-40"
      >
        {add.isPending ? 'Adding...' : 'Add to catalog'}
      </button>
      {add.error ? (
        <p className="text-xs text-red-300">{add.error.message}</p>
      ) : null}
    </form>
  )
}
