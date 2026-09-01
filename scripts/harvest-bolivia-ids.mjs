import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const sparql = `
SELECT DISTINCT ?film ?filmLabel ?tmdb WHERE {
  VALUES ?type { wd:Q11424 wd:Q24869 wd:Q202866 wd:Q226730 wd:Q93204 }
  ?film wdt:P31 ?type .
  ?film wdt:P495 wd:Q750 .
  OPTIONAL { ?film wdt:P4947 ?tmdb . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
}
`

const res = await fetch(
  'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(sparql),
  {
    headers: {
      Accept: 'application/sparql-results+json',
      'User-Agent': 'Cochacine/1.0 (catalog research)',
    },
  },
)

if (!res.ok) {
  console.error('Wikidata', res.status, await res.text())
  process.exit(1)
}

const data = await res.json()
const rows = data.results.bindings.map((row) => ({
  label: row.filmLabel?.value ?? '',
  tmdb: row.tmdb?.value ?? null,
}))

const ids = [
  ...new Set(
    rows
      .map((row) => Number.parseInt(row.tmdb ?? '', 10))
      .filter((id) => Number.isFinite(id) && id > 0),
  ),
].sort((a, b) => a - b)

const unresolvedTitles = [
  ...new Set(
    rows
      .filter((row) => !row.tmdb)
      .map((row) => row.label.trim())
      .filter((label) => label && !/^Q\d+$/i.test(label)),
  ),
].sort((a, b) => a.localeCompare(b, 'es'))

const dest = join(root, 'src/api/tmdb/boliviaProducedIds.ts')
const idsLiteral = ids.join(',\n  ')
const titlesLiteral = unresolvedTitles
  .map((title) => JSON.stringify(title))
  .join(',\n  ')

writeFileSync(
  dest,
  `/**
 * Cine con país de origen Bolivia en Wikidata (P495 = Q750).
 *
 * En TMDB, origin_country suele copiarse del idioma (es → ES, en → US),
 * así que discover/with_origin_country=BO no las encuentra.
 * Esta lista aplica esa regla: producidas en Bolivia, no IDs sueltos.
 *
 * Regenerar: node scripts/harvest-bolivia-ids.mjs
 */
export const BOLIVIA_PRODUCED_TMDB_IDS = [
  ${idsLiteral},
] as const

/** Títulos bolivianos en Wikidata todavía sin ID de TMDB. */
export const BOLIVIA_UNRESOLVED_TITLES = [
  ${titlesLiteral},
] as const
`,
  'utf8',
)

console.log(`ids=${ids.length} unresolved=${unresolvedTitles.length}`)
