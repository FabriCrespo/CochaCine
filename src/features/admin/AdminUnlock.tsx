import { useState, type FormEvent } from 'react'
import { AppError } from '../../api/http/errors.ts'

type AdminUnlockProps = {
  onSignIn: (email: string, password: string) => Promise<unknown>
}

export function AdminUnlock({ onSignIn }: AdminUnlockProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      await onSignIn(email, password)
    } catch (caught) {
      setError(caught instanceof AppError ? caught.message : 'Could not sign in.')
    } finally {
      setPending(false)
    }
  }

  const canSubmit = email.trim().length > 0 && password.length > 0

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand">The desk</p>
        <h1 className="mt-3 font-display text-5xl italic text-ivory">Sign in</h1>
        <span className="mt-6 block h-px w-12 bg-brand" />
        <p className="mt-6 font-serif text-base leading-7 text-ivory/60">
          Only listed editors can write. The house stays public.
        </p>
        <form onSubmit={(event) => void handleSubmit(event)} className="mt-10 space-y-5">
          <label className="block">
            <span className="mb-2 block text-[11px] tracking-[0.18em] uppercase text-muted">Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border-0 border-b border-ivory/20 bg-transparent py-2 font-serif text-ivory outline-none placeholder:text-ivory/25 focus:border-brand"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] tracking-[0.18em] uppercase text-muted">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border-0 border-b border-ivory/20 bg-transparent py-2 font-serif text-ivory outline-none placeholder:text-ivory/25 focus:border-brand"
            />
          </label>
          {error ? <p className="font-serif text-sm text-red-300">{error}</p> : null}
          <button
            type="submit"
            disabled={pending || !canSubmit}
            className="mt-4 w-full bg-brand px-4 py-3 text-[11px] tracking-[0.22em] uppercase text-ink disabled:opacity-40"
          >
            {pending ? 'Signing in...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
