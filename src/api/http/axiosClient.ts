/**
 * =============================================================================
 * CLIENTE HTTP (Axios)
 * =============================================================================
 *
 * Portero de las llamadas a **TMDB**.
 *
 * Flujo:
 *   1. movies.api.ts llama axiosClient.get<TmdbPopularMoviesDto>('/discover/movie')
 *   2. El interceptor de REQUEST pone el Bearer token.
 *   3. Si hay error, el interceptor de RESPONSE lo convierte a AppError.
 *   4. En éxito devolvemos el AxiosResponse completo para que TypeScript
 *      sepa que `response.data` es exactamente el genérico T que pediste.
 *
 * ¿Por qué NO desempaquetamos `response.data` en el interceptor?
 *   Axios tipa `get<T>()` como Promise<AxiosResponse<T>>.
 *   Si el interceptor devolviera `response.data`, TypeScript seguiría
 *   creyendo que es AxiosResponse y perderíamos seguridad de tipos.
 *   La capa API hace `const { data } = await axiosClient.get<Dto>(...)`.
 *
 * Nunca uses `axios.get` suelto en un componente. Siempre este cliente,
 * y solo desde la carpeta api/.
 */

import axios from 'axios'
import { env } from '../../config/env.ts'
import { HTTP_TIMEOUT_MS, TMDB_API_BASE_URL } from '../../config/constants.ts'
import { toAppError } from './errors.ts'

export const axiosClient = axios.create({
  baseURL: TMDB_API_BASE_URL,
  timeout: HTTP_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
})

axiosClient.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${env.tmdbToken}`
  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toAppError(error)),
)
