/**
 * =============================================================================
 * ORDEN DEL CATÁLOGO (en cliente)
 * =============================================================================
 *
 * El catálogo es la unión de varias fuentes TMDB. `sort_by` de /discover
 * no cubre los IDs de Wikidata, así que ordenamos acá sobre Movie[].
 */

export const CATALOG_SORT = {
  featured: 'featured',
  popularity: 'popularity',
  newest: 'newest',
  oldest: 'oldest',
  rating: 'rating',
  mostVoted: 'votes',
  title: 'title',
} as const

export type CatalogSort = (typeof CATALOG_SORT)[keyof typeof CATALOG_SORT]

export const CATALOG_SORT_LABELS: Record<CatalogSort, string> = {
  [CATALOG_SORT.featured]: 'Featured',
  [CATALOG_SORT.popularity]: 'Most popular',
  [CATALOG_SORT.newest]: 'Newest',
  [CATALOG_SORT.oldest]: 'Oldest',
  [CATALOG_SORT.rating]: 'Highest rated',
  [CATALOG_SORT.mostVoted]: 'Most voted',
  [CATALOG_SORT.title]: 'Title A–Z',
}
