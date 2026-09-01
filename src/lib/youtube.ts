/** Extrae el id de un video de YouTube desde una URL o desde el id suelto. */
export function youtubeKeyFromInput(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed)
    if (url.hostname === 'youtu.be' || url.hostname.endsWith('.youtu.be')) {
      return url.pathname.replace(/^\//, '').slice(0, 11)
    }
    const fromQuery = url.searchParams.get('v')
    if (fromQuery) return fromQuery
    const embed = url.pathname.match(/\/embed\/([\w-]{11})/)
    if (embed?.[1]) return embed[1]
  } catch {
    return trimmed
  }

  return trimmed
}
