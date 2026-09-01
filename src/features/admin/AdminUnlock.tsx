import { useState, type FormEvent } from 'react'
import { verifyAdminPassword } from '../../api/supabase/adminClient.ts'
import { AppError } from '../../api/http/errors.ts'

type AdminUnlockProps = {
  onUnlocked: () => void
}

export function AdminUnlock({ onUnlocked }: AdminUnlockProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      await verifyAdminPassword(password)
      onUnlocked()
    } catch (caught) {
      setError(caught instanceof AppError ? caught.message : 'No se pudo entrar.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto max-w-md pt-16">
      <p className="text-center text-xs tracking-[0.28em] uppercase text-brand/70">Editor</p>
      <h1 className="mt-3 text-center text-2xl text-brand">Correcciones rápidas</h1>
      <p className="mt-4 text-center text-sm text-brand/70">Ingresá la contraseña del editor.</p>
      <form onSubmit={(event) => void handleSubmit(event)} className="mt-8 space-y-4">
        <label className="block">
          <span className="sr-only">Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Contraseña"
            className="w-full border border-brand/40 bg-ink px-3 py-2 text-sm text-brand outline-none placeholder:text-brand/35 focus:border-brand"
          />
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button
          type="submit"
          disabled={pending || !password}
          className="w-full border border-brand bg-brand px-3 py-2 text-sm tracking-[0.18em] uppercase text-ink disabled:opacity-40"
        >
          {pending ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
