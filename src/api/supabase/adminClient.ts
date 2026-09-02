/**
 * Auth del editor: email + password de Supabase Auth.
 * RLS (public.is_editor) decide quién puede escribir.
 */

import type { Session, User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { AppError } from '../http/errors.ts'
import { getSupabase } from './client.ts'

const LEGACY_OK = 'cochacine.admin.ok'
const LEGACY_SECRET = 'cochacine.admin.secret'

export const EDITORS_TABLE = 'editors'

function forgetLegacyLock(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LEGACY_OK)
  sessionStorage.removeItem(LEGACY_OK)
  localStorage.removeItem(LEGACY_SECRET)
  sessionStorage.removeItem(LEGACY_SECRET)
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() != null
}

export async function getEditorSession(): Promise<Session | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    throw new AppError(error.message, 'HTTP', null)
  }
  return data.session
}

export async function isListedEditor(userId: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const claimed = await claimEditorSeat()
  if (claimed === 'yes') return true

  const { data, error } = await supabase
    .from(EDITORS_TABLE)
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    if (isMissingTableError(error.message)) {
      throw new AppError(
        'Run supabase/migrations/20260902_editor_auth.sql in the Supabase SQL editor.',
        'HTTP',
        null,
      )
    }
    throw new AppError(error.message, 'HTTP', null)
  }

  if (data != null) return true
  if (claimed === 'missing') {
    throw new AppError(
      'Run supabase/migrations/20260903_claim_editor.sql in the Supabase SQL editor, then refresh.',
      'HTTP',
      null,
    )
  }
  return false
}

/** Primer usuario autenticado entra en public.editors. Si ya hay uno, no. */
async function claimEditorSeat(): Promise<'yes' | 'no' | 'missing'> {
  const supabase = getSupabase()
  if (!supabase) return 'missing'

  const { data, error } = await supabase.rpc('claim_editor')
  if (error) {
    if (isMissingFunctionError(error.message)) return 'missing'
    throw new AppError(error.message, 'HTTP', null)
  }
  return data === true ? 'yes' : 'no'
}

export async function signInEditor(email: string, password: string): Promise<User> {
  const supabase = getSupabase()
  if (!supabase) {
    throw missingConfig()
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error || !data.user) {
    throw new AppError(signInMessage(error?.message), 'HTTP', 401)
  }

  forgetLegacyLock()

  try {
    const listed = await isListedEditor(data.user.id)
    if (!listed) {
      await supabase.auth.signOut()
      throw new AppError('This account is not an editor.', 'HTTP', 403)
    }
  } catch (caught) {
    if (caught instanceof AppError && caught.status === 403) throw caught
    await supabase.auth.signOut()
    throw caught
  }

  return data.user
}

export async function signOutEditor(): Promise<void> {
  forgetLegacyLock()
  const supabase = getSupabase()
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new AppError(error.message, 'HTTP', null)
  }
}

export async function requireWriteClient(): Promise<SupabaseClient> {
  const supabase = getSupabase()
  if (!supabase) {
    throw missingConfig()
  }

  const session = await getEditorSession()
  if (!session?.user) {
    throw new AppError('Editor session ended. Sign in again.', 'HTTP', 401)
  }

  const listed = await isListedEditor(session.user.id)
  if (!listed) {
    throw new AppError('This account is not an editor.', 'HTTP', 403)
  }

  return supabase
}

export function writeDeniedMessage(message: string | undefined): string {
  if (!message) return 'Could not save.'
  if (/row-level security|42501|permission denied/i.test(message)) {
    return 'This account cannot edit the catalog.'
  }
  return message
}

function missingConfig(): AppError {
  return new AppError(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env. Restart npm run dev.',
    'HTTP',
    null,
  )
}

function signInMessage(message: string | undefined): string {
  if (!message) return 'Could not sign in.'
  if (/invalid login|invalid credentials/i.test(message)) return 'Incorrect email or password.'
  if (/email not confirmed/i.test(message)) {
    return 'Confirm the email for this account in Supabase Auth, then try again.'
  }
  return message
}

function isMissingTableError(message: string): boolean {
  return /schema cache|does not exist|could not find the table/i.test(message)
}

function isMissingFunctionError(message: string): boolean {
  return /could not find the function|function public\.claim_editor/i.test(message)
}
