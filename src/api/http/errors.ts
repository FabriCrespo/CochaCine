/**
 * =============================================================================
 * ERRORES HTTP NORMALIZADOS
 * =============================================================================
 *
 * Axios tira un objeto enorme. La UI no debería saber si falló Axios o TMDB.
 *
 * AppError es una clase (extiende Error) para que `instanceof AppError`
 * funcione y React Query reciba siempre el mismo shape:
 *   message  → texto para humanos
 *   status   → 401, 404, 500... o null si no hubo respuesta HTTP
 *   code     → 'NETWORK' | 'TIMEOUT' | 'HTTP'
 *
 * El interceptor de Axios llama a `toAppError(unknown)`.
 * Tipamos `unknown` (no `any`) porque no controlamos lo que llega.
 */

import { isAxiosError } from 'axios'
import type { TmdbErrorDto } from '../tmdb/tmdb.types.ts'

export type AppErrorCode = 'NETWORK' | 'TIMEOUT' | 'HTTP'

export class AppError extends Error {
  readonly code: AppErrorCode
  readonly status: number | null

  constructor(message: string, code: AppErrorCode, status: number | null) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
  }
}

export function toAppError(error: unknown): AppError {
  if (isAxiosError<TmdbErrorDto>(error)) {
    if (error.code === 'ECONNABORTED') {
      return new AppError(
        'The request took too long. Try again.',
        'TIMEOUT',
        null,
      )
    }

    if (!error.response) {
      return new AppError(
        'No connection. Check your internet.',
        'NETWORK',
        null,
      )
    }

    const status = error.response.status
    const apiMessage = error.response.data?.status_message

    return new AppError(apiMessage || messageForStatus(status), 'HTTP', status)
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'NETWORK', null)
  }

  return new AppError('Something went wrong.', 'NETWORK', null)
}

function messageForStatus(status: number): string {
  if (status === 401) return 'Invalid API key or token.'
  if (status === 404) return 'We could not find that.'
  if (status >= 500) return 'The remote service is failing. Try again later.'
  return `API error (${status}).`
}
