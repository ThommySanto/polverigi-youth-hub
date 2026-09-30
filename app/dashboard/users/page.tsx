'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function UsersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setLoading(false)
    }
    checkUser()
  }, [router])

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante la creazione.')
      }

      setMessage({ text: `Utente "${username}" creato con successo!`, type: 'success' })
      setUsername('')
      setEmail('')
      setPassword('')
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' })
    }

    setSubmitting(false)
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">Caricamento...</div>

  return (
    <div className="responsive-page min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Sidebar active="users" />

      <main className="responsive-main flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <header className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Gestione Utenti & Autorizzazioni 👥</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Crea i membri della Giunta associando un nome utente e una email reale.</p>
        </header>

        <div className="responsive-card bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 sm:p-6 lg:p-8 w-full max-w-xl">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Aggiungi Nuovo Utente</h3>

          {message && (
            <div className={`mb-6 p-4 rounded-xl text-xs font-semibold ${
              message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nome Utente (per il login)</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Es. mario_rossi"
                className="w-full border border-gray-200 rounded-xl p-3.5 text-base text-gray-900 bg-gray-50/50 focus:outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Reale (per sicurezza e recupero)</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Es. mario@email.it"
                className="w-full border border-gray-200 rounded-xl p-3.5 text-base text-gray-900 bg-gray-50/50 focus:outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl p-3.5 text-base text-gray-900 bg-gray-50/50 focus:outline-none focus:border-gray-900"
              />
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-lime-500 hover:bg-lime-400 active:scale-[0.99] text-gray-950 font-bold text-sm py-3.5 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {submitting ? 'Creazione in corso...' : 'Crea Utente Autorizzato'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}