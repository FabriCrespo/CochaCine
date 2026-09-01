import { CATALOG_SORT, type CatalogSort } from '../api/tmdb/sort.ts'

const SEARCH_KEY = 'cochacine.catalog.search'
const SCROLL_KEY = 'cochacine.catalog.scroll'

export type CatalogViewState = {
  query: string
  genreIds: number[]
  year: string
  sortBy: CatalogSort
}

export function defaultCatalogView(): CatalogViewState {
  return {
    query: '',
    genreIds: [],
    year: '',
    sortBy: CATALOG_SORT.featured,
  }
}

export function parseCatalogSearch(search: string): CatalogViewState {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const sortRaw = params.get('s') ?? ''
  const genreIds = (params.get('g') ?? '')
    .split(',')
    .map((value) => Number(value))
    .filter((id) => Number.isInteger(id) && id > 0)

  return {
    query: params.get('q') ?? '',
    genreIds,
    year: params.get('y') ?? '',
    sortBy: isCatalogSort(sortRaw) ? sortRaw : CATALOG_SORT.featured,
  }
}

export function catalogSearchString(view: CatalogViewState): string {
  const params = new URLSearchParams()
  if (view.query.length > 0) params.set('q', view.query)
  if (view.genreIds.length > 0) params.set('g', view.genreIds.join(','))
  if (view.year) params.set('y', view.year)
  if (view.sortBy !== CATALOG_SORT.featured) params.set('s', view.sortBy)
  const encoded = params.toString()
  return encoded ? `?${encoded}` : ''
}

export function rememberCatalogView(view: CatalogViewState): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(SEARCH_KEY, catalogSearchString(view))
}

export function catalogLocation(): string {
  if (typeof sessionStorage === 'undefined') return '/'
  return `/${sessionStorage.getItem(SEARCH_KEY) ?? ''}`
}

export function rememberCatalogScroll(y: number): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(SCROLL_KEY, String(Math.round(y)))
}

export function readCatalogScroll(): number | null {
  if (typeof sessionStorage === 'undefined') return null
  const raw = sessionStorage.getItem(SCROLL_KEY)
  if (raw == null) return null
  const y = Number(raw)
  return Number.isFinite(y) ? y : null
}

function isCatalogSort(value: string): value is CatalogSort {
  return (Object.values(CATALOG_SORT) as string[]).includes(value)
}
