'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [isRecovery, setIsRecovery] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const cleanUsername = username.trim().toLowerCase()

    try {
      if (!cleanUsername || !password) {
        throw new Error('Inserisci nome utente e password.')
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', cleanUsername)
        .maybeSingle()

      if (profileError || !profile) {
        throw new Error('Nome utente non trovato o non autorizzato.')
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      })

      if (loginError) {
        throw new Error('Password non valida.')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Errore durante l’accesso.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleRecovery(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const cleanUsername = username.trim().toLowerCase()

    try {
      if (!cleanUsername) {
        throw new Error('Inserisci il tuo nome utente.')
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', cleanUsername)
        .maybeSingle()

      if (profileError || !profile) {
        throw new Error('Nome utente non trovato nel sistema.')
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        profile.email,
        {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      )

      if (resetError) {
        throw new Error(resetError.message)
      }

      setSuccessMsg(
        `Link di recupero inviato con successo alla mail associata a “${cleanUsername}”.`
      )
      setUsername('')
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Errore durante il recupero.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 px-3 py-4 sm:px-6 sm:py-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xl transition-all sm:p-8">
        <div className="mb-8 text-center">
          <img
            src="/polverigi.svg"
            alt=""
            aria-hidden="true"
            className="mx-auto mb-4 h-35 w-35"
          />

          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            Polverigi Hub
          </h1>

          <p className="mt-1 text-xs text-gray-500">
            {isRecovery
              ? 'Recupera la tua password'
              : 'Area riservata • Inserisci il tuo nome utente'}
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700"
          >
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700"
          >
            {successMsg}
          </div>
        )}

        {!isRecovery ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-xs font-semibold text-gray-700"
              >
                Nome Utente
              </label>

              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Es. admin"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 text-base text-gray-900 transition-all focus:border-gray-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-gray-700"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setIsRecovery(true)
                    setErrorMsg(null)
                    setSuccessMsg(null)
                  }}
                  className="cursor-pointer py-1 text-xs font-semibold text-lime-600 transition-colors hover:text-lime-700 hover:underline"
                >
                  Password dimenticata?
                </button>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 text-base text-gray-900 transition-all focus:border-gray-900 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full cursor-pointer rounded-xl bg-lime-500 py-3.5 text-sm font-bold text-gray-950 shadow-sm transition-all hover:bg-lime-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Accesso in corso...' : 'Accedi al Gestionale'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRecovery} className="space-y-4">
            <div>
              <label
                htmlFor="recovery-username"
                className="mb-1 block text-xs font-semibold text-gray-700"
              >
                Il tuo Nome Utente
              </label>

              <input
                id="recovery-username"
                name="username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Es. admin"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 text-base text-gray-900 transition-all focus:border-gray-900 focus:bg-white focus:outline-none"
              />

              <p className="mt-1.5 text-[11px] leading-relaxed text-gray-400">
                Ti invieremo un link di reset alla mail associata a questo account.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full cursor-pointer rounded-xl bg-lime-500 py-3.5 text-sm font-bold text-gray-950 shadow-sm transition-all hover:bg-lime-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Invio in corso...' : 'Invia Link di Recupero'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRecovery(false)
                setErrorMsg(null)
                setSuccessMsg(null)
              }}
              className="w-full cursor-pointer py-2.5 text-center text-xs font-semibold text-gray-600 transition-colors hover:text-gray-900"
            >
              ← Torna al Login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}