/**
 * Plot en inglés desde IMDb cuando TMDB no lo tiene (o lo tiene en español).
 * IMDb bloquea el fetch directo; leemos la ficha pública vía r.jina.ai.
 */

import axios from 'axios'
import { HTTP_IMDB_TIMEOUT_MS } from '../../config/constants.ts'
import { englishOrEmpty } from '../tmdb/englishText.ts'
import { IMDB_ENDPOINTS } from './endpoints.ts'
import { extractImdbPlot } from './plot.ts'

const imdbReader = axios.create({
  timeout: HTTP_IMDB_TIMEOUT_MS,
  headers: { Accept: 'text/plain' },
})

export async function fetchImdbPlot(imdbId: string): Promise<string> {
  if (!/^tt\d+$/.test(imdbId)) return ''

  try {
    const { data } = await imdbReader.get<string>(IMDB_ENDPOINTS.titlePage(imdbId), {
      responseType: 'text',
    })
    return englishOrEmpty(extractImdbPlot(typeof data === 'string' ? data : ''))
  } catch {
    return ''
  }
}
