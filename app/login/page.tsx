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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
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
    } catch (err: any) {
      setErrorMsg(err.message || 'Errore durante l\'accesso.')
    }

    setLoading(false)
  }

  async function handleRecovery(e: React.FormEvent) {
    e.preventDefault()
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

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/dashboard`,
      })

      if (resetError) {
        throw new Error(resetError.message)
      }

      setSuccessMsg(`Link di recupero inviato con successo alla mail reale associata a "${cleanUsername}"!`)
      setUsername('')
    } catch (err: any) {
      setErrorMsg(err.message || 'Errore durante il recupero.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-3 sm:px-6 py-4 sm:py-6 w-full">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200/80 shadow-xl p-5 sm:p-8 transition-all">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-lime-100 text-lime-700 mb-3 shadow-inner">
            <span className="w-4 h-4 bg-lime-500 rounded-full animate-pulse"></span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Polverigi Hub</h1>
          <p className="text-xs text-gray-500 mt-1">
            {isRecovery ? 'Recupera la tua password' : 'Area riservata • Inserisci il tuo nome utente'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {successMsg}
          </div>
        )}

        {!isRecovery ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nome Utente</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Es. admin"
                className="w-full border border-gray-200 rounded-xl p-3.5 text-base text-gray-900 bg-gray-50/50 focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-gray-700">Password</label>
                <button 
                  type="button" 
                  onClick={() => { setIsRecovery(true); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-xs font-semibold text-lime-600 hover:text-lime-700 hover:underline cursor-pointer py-1"
                >
                  Password dimenticata?
                </button>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl p-3.5 text-base text-gray-900 bg-gray-50/50 focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-lime-500 hover:bg-lime-400 active:scale-[0.99] text-gray-950 font-bold text-sm py-3.5 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? 'Accesso in corso...' : 'Accedi al Gestionale'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRecovery} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Il tuo Nome Utente</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Es. admin"
                className="w-full border border-gray-200 rounded-xl p-3.5 text-base text-gray-900 bg-gray-50/50 focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
              />
              <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                Ti invieremo un link di reset alla mail reale associata a questo account.
              </p>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-lime-500 hover:bg-lime-400 active:scale-[0.99] text-gray-950 font-bold text-sm py-3.5 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? 'Invio in corso...' : 'Invia Link di Recupero'}
            </button>

            <button 
              type="button"
              onClick={() => { setIsRecovery(false); setErrorMsg(null); setSuccessMsg(null); }}
              className="w-full text-center text-xs font-semibold text-gray-600 hover:text-gray-900 py-2.5 cursor-pointer transition-colors"
            >
              ← Torna al Login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}