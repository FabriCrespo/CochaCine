/**
 * Parseo de la respuesta SPARQL de Wikidata (P495 = Bolivia).
 * El script de harvest solo hace fetch + escribir el archivo.
 */

/**
 * @param {Array<Record<string, { value?: string } | undefined>>} bindings
 */
export function parseWikidataBindings(bindings) {
  const rows = bindings.map((row) => ({
    label: row.filmLabel?.value ?? '',
    tmdb: row.tmdb?.value ?? null,
  }))

  const parsed = rows.map((row) => {
    const id = Number.parseInt(row.tmdb ?? '', 10)
    return {
      label: row.label,
      id: Number.isFinite(id) && id > 0 ? id : null,
    }
  })

  const ids = [...new Set(parsed.map((row) => row.id).filter((id) => id != null))].sort(
    (a, b) => a - b,
  )

  const unresolvedTitles = [
    ...new Set(
      parsed
        .filter((row) => row.id == null)
        .map((row) => row.label.trim())
        .filter((label) => label && !/^Q\d+$/i.test(label)),
    ),
  ].sort((a, b) => a.localeCompare(b, 'es'))

  return { ids, unresolvedTitles }
}
