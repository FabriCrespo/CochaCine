import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router'
import type { Movie, MovieGenre } from '../../../domain/movie.ts'
import type { CatalogDecade } from '../../../lib/catalog.ts'
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
  decades: CatalogDecade[]
  selectedDecade: string
  onDecadeChange: (value: string) => void
  filtersOpen: boolean
  onToggleFilters: () => void
  onCloseFilters: () => void
  sortBy: CatalogSort
  onSortByChange: (value: CatalogSort) => void
}

const fieldClass =
  'border-0 border-b border-ivory/15 bg-transparent px-1 py-1.5 text-xs tracking-[0.16em] uppercase text-ivory outline-none focus:border-brand'

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
  decades,
  selectedDecade,
  onDecadeChange,
  filtersOpen,
  onToggleFilters,
  onCloseFilters,
  sortBy,
  onSortByChange,
}: CatalogControlsProps) {
  const panelId = useId()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const genreButtonRef = useRef<HTMLButtonElement>(null)
  const genrePanelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const [genrePanelStyle, setGenrePanelStyle] = useState<CSSProperties>({})
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
  const [indexForDraft, setIndexForDraft] = useState(draft)
  if (indexForDraft !== draft) {
    setIndexForDraft(draft)
    setActiveIndex(0)
  }

  const filterCount = selectedCount + (selectedYear ? 1 : 0) + (selectedDecade ? 1 : 0)

  useEffect(() => {
    if (!filtersOpen) return

    function handlePointer(event: MouseEvent) {
      if (!window.matchMedia('(min-width: 768px)').matches) return
      const target = event.target as Node
      if (rootRef.current?.contains(target) || genrePanelRef.current?.contains(target)) {
        return
      }
      onCloseFilters()
    }

    function handleKey(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') onCloseFilters()
    }

    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [filtersOpen, onCloseFilters])

  useLayoutEffect(() => {
    if (!filtersOpen) return

    function placePanel() {
      if (!window.matchMedia('(min-width: 768px)').matches) return
      const anchor = genreButtonRef.current
      if (!anchor) return

      const rect = anchor.getBoundingClientRect()
      const width = Math.min(22 * 16, window.innerWidth - 24)
      const left = Math.min(
        Math.max(12, rect.right - width),
        window.innerWidth - width - 12,
      )
      const gap = 10
      const below = window.innerHeight - rect.bottom - gap - 16
      const above = rect.top - gap - 16
      const openDown = below >= 220 || below >= above
      const maxHeight = Math.max(160, Math.min(openDown ? below : above, 420))

      setGenrePanelStyle(
        openDown
          ? { top: rect.bottom + gap, left, width, maxHeight }
          : { top: Math.max(12, rect.top - gap - maxHeight), left, width, maxHeight },
      )
    }

    placePanel()
    window.addEventListener('resize', placePanel)
    window.addEventListener('scroll', placePanel, true)
    return () => {
      window.removeEventListener('resize', placePanel)
      window.removeEventListener('scroll', placePanel, true)
    }
  }, [filtersOpen])

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

  function handleSearchKey(event: ReactKeyboardEvent<HTMLInputElement>) {
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

  const genrePanel =
    filtersOpen &&
    typeof document !== 'undefined' &&
    typeof genrePanelStyle.top === 'number'
      ? createPortal(
          <div
            ref={genrePanelRef}
            id={panelId}
            role="dialog"
            aria-label="Categories"
            style={genrePanelStyle}
            className="fixed z-60 hidden overflow-y-auto overscroll-contain border border-ivory/10 bg-ink p-4 shadow-[0_18px_40px_rgba(0,0,0,0.45)] md:block"
          >
            <div className="sticky top-0 z-10 mb-3 flex items-center justify-between bg-ink pb-1">
              <p className="text-xs tracking-[0.2em] uppercase text-muted">Categories</p>
              {selectedCount > 0 ? (
                <button
                  type="button"
                  onClick={onClearGenres}
                  className="text-xs tracking-wide text-muted underline-offset-4 hover:text-ivory hover:underline"
                >
                  Clear
                </button>
              ) : null}
            </div>
            {genres.length === 0 ? (
              <p className="text-sm text-muted">No genres in this catalog yet.</p>
            ) : (
              <ul className="space-y-1">
                {genres.map((genre) => {
                  const checked = selectedGenreIds.includes(genre.id)
                  return (
                    <li key={genre.id}>
                      <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-ivory">
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
          </div>,
          document.body,
        )
      : null

  return (
    <div className="flex w-full flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-x-3 md:gap-y-2">
      {genrePanel}
      <div className="relative min-w-0 flex-1" ref={searchRef}>
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
            placeholder="Search the archive..."
            className="w-full border-0 border-b border-ivory/15 bg-transparent px-0 py-2.5 text-base text-ivory outline-none placeholder:text-muted/70 focus:border-brand md:py-1.5 md:text-sm"
          />
        </label>

        {showSuggestions ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-40 mt-1 max-h-64 w-full overflow-auto border border-ivory/10 bg-ink md:max-h-80"
          >
            {suggestions.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-muted">No titles match.</li>
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
                          ? 'flex items-center gap-3 bg-ivory/8 px-3 py-2'
                          : 'flex items-center gap-3 px-3 py-2 hover:bg-ivory/5'
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
                        <span className="block truncate font-serif text-sm text-ivory">{movie.title}</span>
                        <span className="text-xs text-muted">
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

      <div className="relative md:flex md:items-center md:gap-2" ref={rootRef}>
        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-controls={panelId}
          onClick={() => {
            setOpenSuggestions(false)
            onToggleFilters()
          }}
          className={`${fieldClass} w-full py-2.5 text-left md:hidden`}
        >
          Filters
          {filterCount > 0 ? ` (${filterCount})` : ''}
        </button>

        <button
          ref={genreButtonRef}
          type="button"
          aria-expanded={filtersOpen}
          aria-controls={panelId}
          onClick={onToggleFilters}
          className={`${fieldClass} hidden md:inline`}
        >
          Genres
          {selectedCount > 0 ? ` (${selectedCount})` : ''}
        </button>

        <select
          aria-label="Decade"
          value={selectedDecade}
          onChange={(event) => onDecadeChange(event.target.value)}
          className={`${fieldClass} hidden [&>option]:bg-ink [&>option]:text-ivory md:inline`}
        >
          <option value="">Decade</option>
          {decades.map((decade) => (
            <option key={decade.id} value={decade.id}>
              {decade.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Year"
          value={selectedYear}
          onChange={(event) => onYearChange(event.target.value)}
          className={`${fieldClass} hidden [&>option]:bg-ink [&>option]:text-ivory md:inline`}
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
          className={`${fieldClass} hidden [&>option]:bg-ink [&>option]:text-ivory md:inline`}
        >
          {(Object.values(CATALOG_SORT) as CatalogSort[]).map((value) => (
            <option key={value} value={value}>
              {CATALOG_SORT_LABELS[value]}
            </option>
          ))}
        </select>

      </div>
    </div>
  )
}

type CatalogMobileFiltersProps = {
  genres: MovieGenre[]
  selectedGenreIds: number[]
  onToggleGenre: (id: number) => void
  onClear: () => void
  onDone: () => void
  years: string[]
  selectedYear: string
  onYearChange: (value: string) => void
  decades: CatalogDecade[]
  selectedDecade: string
  onDecadeChange: (value: string) => void
  sortBy: CatalogSort
  onSortByChange: (value: CatalogSort) => void
}

export function CatalogMobileFilters({
  genres,
  selectedGenreIds,
  onToggleGenre,
  onClear,
  onDone,
  years,
  selectedYear,
  onYearChange,
  decades,
  selectedDecade,
  onDecadeChange,
  sortBy,
  onSortByChange,
}: CatalogMobileFiltersProps) {
  const filterCount = selectedGenreIds.length + (selectedYear ? 1 : 0) + (selectedDecade ? 1 : 0)

  return (
    <div className="space-y-6 pb-8 md:hidden">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] tracking-[0.2em] uppercase text-muted">Filters</p>
        <button
          type="button"
          onClick={onDone}
          className="text-xs tracking-[0.16em] uppercase text-ivory"
        >
          Done
        </button>
      </div>
      <label className="block">
        <span className="mb-2 block text-[11px] tracking-[0.2em] uppercase text-muted">Sort</span>
        <select
          aria-label="Sort"
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value as CatalogSort)}
          className="w-full border-0 border-b border-ivory/15 bg-transparent py-2.5 text-sm text-ivory outline-none focus:border-brand [&>option]:bg-ink [&>option]:text-ivory"
        >
          {(Object.values(CATALOG_SORT) as CatalogSort[]).map((value) => (
            <option key={value} value={value}>
              {CATALOG_SORT_LABELS[value]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-[11px] tracking-[0.2em] uppercase text-muted">Decade</span>
        <select
          aria-label="Decade"
          value={selectedDecade}
          onChange={(event) => onDecadeChange(event.target.value)}
          className="w-full border-0 border-b border-ivory/15 bg-transparent py-2.5 text-sm text-ivory outline-none focus:border-brand [&>option]:bg-ink [&>option]:text-ivory"
        >
          <option value="">Any decade</option>
          {decades.map((decade) => (
            <option key={decade.id} value={decade.id}>
              {decade.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-[11px] tracking-[0.2em] uppercase text-muted">Year</span>
        <select
          aria-label="Year"
          value={selectedYear}
          onChange={(event) => onYearChange(event.target.value)}
          className="w-full border-0 border-b border-ivory/15 bg-transparent py-2.5 text-sm text-ivory outline-none focus:border-brand [&>option]:bg-ink [&>option]:text-ivory"
        >
          <option value="">Any year</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted">Categories</p>
          {filterCount > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="text-xs tracking-wide text-muted underline-offset-4 hover:text-ivory hover:underline"
            >
              Clear
            </button>
          ) : null}
        </div>
        {genres.length === 0 ? (
          <p className="text-sm text-muted">No genres in this catalog yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {genres.map((genre) => {
              const checked = selectedGenreIds.includes(genre.id)
              return (
                <li key={genre.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleGenre(genre.id)}
                    className={
                      checked
                        ? 'w-full truncate bg-brand px-3 py-2.5 text-left text-[11px] tracking-[0.14em] uppercase text-ink'
                        : 'w-full truncate border border-ivory/15 px-3 py-2.5 text-left text-[11px] tracking-[0.14em] uppercase text-ivory/70'
                    }
                  >
                    {genre.name}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
