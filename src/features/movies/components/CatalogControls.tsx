import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import type { Movie, MovieGenre } from '../../../domain/movie.ts'
import {
  CATALOG_SORT,
  CATALOG_SORT_LABELS,
  type CatalogSort,
} from '../../../api/tmdb/sort.ts'
import { suggestCatalogMovies } from '../../../lib/catalog.ts'
import { paths } from '../../../lib/paths.ts'
import { usePrefetchMovie } from '../../../query/movies/useMovie.ts'

type CatalogControlsProps = {
  query: string
  onQueryChange: (value: string) => void
  movies: Movie[]
  genres: MovieGenre[]
  selectedGenreIds: number[]
  onToggleGenre: (id: number) => void
  onClearGenres: () => void
  years: string[]
  selectedYear: string
  onYearChange: (value: string) => void
  filtersOpen: boolean
  onToggleFilters: () => void
  onCloseFilters: () => void
  sortBy: CatalogSort
  onSortByChange: (value: CatalogSort) => void
}

const fieldClass =
  'border-0 bg-ink-soft px-2.5 py-1.5 text-xs tracking-[0.14em] uppercase text-brand outline-none focus:ring-1 focus:ring-brand/50'

export function CatalogControls({
  query,
  onQueryChange,
  movies,
  genres,
  selectedGenreIds,
  onToggleGenre,
  onClearGenres,
  years,
  selectedYear,
  onYearChange,
  filtersOpen,
  onToggleFilters,
  onCloseFilters,
  sortBy,
  onSortByChange,
}: CatalogControlsProps) {
  const panelId = useId()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const prefetchMovie = usePrefetchMovie()
  const selectedCount = selectedGenreIds.length
  const [openSuggestions, setOpenSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [draft, setDraft] = useState(query)
  const draftRef = useRef(query)

  useEffect(() => {
    if (query === draftRef.current) return
    const extra = draftRef.current.slice(query.length)
    if (draftRef.current.startsWith(query) && extra.trim() === '') return
    draftRef.current = query
    setDraft(query)
  }, [query])

  const suggestions = useMemo(
    () => suggestCatalogMovies(movies, draft),
    [movies, draft],
  )

  const showSuggestions = openSuggestions && draft.trim().length > 0

  useEffect(() => {
    setActiveIndex(0)
  }, [draft])

  useEffect(() => {
    if (!filtersOpen) return

    function handlePointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onCloseFilters()
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onCloseFilters()
    }

    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [filtersOpen, onCloseFilters])

  useEffect(() => {
    if (!showSuggestions) return

    function handlePointer(event: MouseEvent) {
      if (!searchRef.current?.contains(event.target as Node)) {
        setOpenSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handlePointer)
    return () => document.removeEventListener('mousedown', handlePointer)
  }, [showSuggestions])

  function openMovie(id: number) {
    setOpenSuggestions(false)
    void navigate(paths.movie(id))
  }

  function handleSearchKey(event: KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) {
      if (event.key === 'Escape') setOpenSuggestions(false)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => (current + 1) % suggestions.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => (current - 1 + suggestions.length) % suggestions.length)
      return
    }

    if (event.key === 'Enter') {
      const chosen = suggestions[activeIndex]
      if (chosen) {
        event.preventDefault()
        openMovie(chosen.id)
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpenSuggestions(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-40 flex-1" ref={searchRef}>
        <label className="block">
          <span className="sr-only">Search movies</span>
          <input
            type="text"
            value={draft}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls={listId}
            aria-autocomplete="list"
            onChange={(event) => {
              const value = event.target.value
              draftRef.current = value
              setDraft(value)
              onQueryChange(value)
              setOpenSuggestions(true)
            }}
            onFocus={() => setOpenSuggestions(true)}
            onKeyDown={handleSearchKey}
            placeholder="Search..."
            className="w-full rounded-sm border-0 bg-ink-soft px-3 py-1.5 text-sm text-brand outline-none placeholder:text-brand/35 focus:ring-1 focus:ring-brand/50"
          />
        </label>

        {showSuggestions ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-50 mt-1 max-h-80 w-full overflow-auto border border-brand/25 bg-ink shadow-lg"
          >
            {suggestions.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-brand/50">No titles match.</li>
            ) : (
              suggestions.map((movie, index) => {
                const active = index === activeIndex
                return (
                  <li key={movie.id} role="option" aria-selected={active}>
                    <Link
                      to={paths.movie(movie.id)}
                      onMouseEnter={() => {
                        setActiveIndex(index)
                        prefetchMovie(movie.id)
                      }}
                      onFocus={() => setActiveIndex(index)}
                      onClick={() => setOpenSuggestions(false)}
                      className={
                        active
                          ? 'flex items-center gap-3 bg-brand/15 px-3 py-2'
                          : 'flex items-center gap-3 px-3 py-2 hover:bg-brand/10'
                      }
                    >
                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt=""
                          className="h-12 w-8 shrink-0 object-cover"
                        />
                      ) : (
                        <div className="h-12 w-8 shrink-0 bg-ink-soft" />
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-brand">{movie.title}</span>
                        <span className="text-xs text-brand/55">
                          {movie.releaseYear ?? '—'}
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })
            )}
          </ul>
        ) : null}
      </div>

      <div className="relative" ref={rootRef}>
        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-controls={panelId}
          onClick={onToggleFilters}
          className={fieldClass}
        >
          Genres
          {selectedCount > 0 ? ` (${selectedCount})` : ''}
        </button>

        {filtersOpen ? (
          <div
            id={panelId}
            className="absolute right-0 z-50 mt-2 w-72 border border-brand/30 bg-ink p-4 shadow-lg"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs tracking-[0.2em] uppercase text-brand/70">
                Categories
              </p>
              {selectedCount > 0 ? (
                <button
                  type="button"
                  onClick={onClearGenres}
                  className="text-xs tracking-wide text-brand/70 underline-offset-4 hover:underline"
                >
                  Clear
                </button>
              ) : null}
            </div>
            {genres.length === 0 ? (
              <p className="text-sm text-brand/50">No genres in this catalog yet.</p>
            ) : (
              <ul className="max-h-64 space-y-2 overflow-auto">
                {genres.map((genre) => {
                  const checked = selectedGenreIds.includes(genre.id)
                  return (
                    <li key={genre.id}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-brand">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleGenre(genre.id)}
                          className="accent-brand"
                        />
                        {genre.name}
                      </label>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      <select
        aria-label="Year"
        value={selectedYear}
        onChange={(event) => onYearChange(event.target.value)}
        className={fieldClass}
      >
        <option value="">Year</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      <select
        aria-label="Sort"
        value={sortBy}
        onChange={(event) => onSortByChange(event.target.value as CatalogSort)}
        className={fieldClass}
      >
        {(Object.values(CATALOG_SORT) as CatalogSort[]).map((value) => (
          <option key={value} value={value}>
            {CATALOG_SORT_LABELS[value]}
          </option>
        ))}
      </select>
    </div>
  )
}
