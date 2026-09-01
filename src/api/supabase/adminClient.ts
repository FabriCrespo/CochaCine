/**
 * Candado del editor. La contraseña es de la página, no la secret de Supabase.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { AppError } from '../http/errors.ts'
import { env } from '../../config/env.ts'
import { getSupabase } from './client.ts'

const STORAGE_KEY = 'cochacine.admin.ok'
const LEGACY_SECRET_KEY = 'cochacine.admin.secret'

function remember(storage: Storage | undefined): boolean {
  return storage?.getItem(STORAGE_KEY) === '1'
}

export function hasAdminSession(): boolean {
  if (typeof window === 'undefined') return false
  if (remember(localStorage)) return true
  if (remember(sessionStorage)) {
    localStorage.setItem(STORAGE_KEY, '1')
    sessionStorage.removeItem(STORAGE_KEY)
    return true
  }
  return false
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(LEGACY_SECRET_KEY)
  localStorage.removeItem(LEGACY_SECRET_KEY)
}

export function requireWriteClient(): SupabaseClient {
  if (!hasAdminSession()) {
    throw new AppError('Editor session ended.', 'HTTP', 401)
  }

  const client = getSupabase()
  if (!client) {
    throw new AppError(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env. Restart npm run dev.',
      'HTTP',
      null,
    )
  }

  return client
}

export async function verifyAdminPassword(password: string): Promise<void> {
  const expected = env.adminPassword
  if (!expected) {
    throw new AppError('Missing VITE_ADMIN_PASSWORD in .env.', 'HTTP', null)
  }

  if (password !== expected) {
    throw new AppError('Incorrect password.', 'HTTP', 401)
  }

  localStorage.setItem(STORAGE_KEY, '1')
  sessionStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(LEGACY_SECRET_KEY)
}
