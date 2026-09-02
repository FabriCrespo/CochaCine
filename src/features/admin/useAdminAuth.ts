import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  getEditorSession,
  isListedEditor,
  isSupabaseConfigured,
  signInEditor,
  signOutEditor,
} from '../../api/supabase/adminClient.ts'
import { AppError } from '../../api/http/errors.ts'
import { getSupabase } from '../../api/supabase/client.ts'

type AdminAuth = {
  ready: boolean
  configured: boolean
  user: User | null
  isEditor: boolean
  error: string | null
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuth>({
    ready: false,
    configured: isSupabaseConfigured(),
    user: null,
    isEditor: false,
    error: null,
  })

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setState({
        ready: true,
        configured: false,
        user: null,
        isEditor: false,
        error: null,
      })
      return
    }

    let cancelled = false

    async function sync(user: User | null) {
      if (!user) {
        if (!cancelled) {
          setState({
            ready: true,
            configured: true,
            user: null,
            isEditor: false,
            error: null,
          })
        }
        return
      }

      try {
        const listed = await isListedEditor(user.id)
        if (!cancelled) {
          setState({
            ready: true,
            configured: true,
            user,
            isEditor: listed,
            error: listed ? null : 'This account is not an editor.',
          })
        }
      } catch (caught) {
        if (!cancelled) {
          setState({
            ready: true,
            configured: true,
            user,
            isEditor: false,
            error: caught instanceof AppError ? caught.message : 'Could not verify the editor.',
          })
        }
      }
    }

    void getEditorSession().then((session) => {
      void sync(session?.user ?? null)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      void sync(session?.user ?? null)
    })

    return () => {
      cancelled = true
      data.subscription.unsubscribe()
    }
  }, [])

  return {
    ...state,
    signIn: signInEditor,
    signOut: signOutEditor,
  }
}
