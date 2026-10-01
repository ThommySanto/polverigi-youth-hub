'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUserAndFetch() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const userId = session.user.id
      const userEmail = session.user.email ?? ''

      // Legge il nome utente dalla tabella profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single()

      // Se non trova lo username, usa l'email come fallback
      const fallbackName =
        userEmail.split('@')[0].replace(/[._-]+/g, ' ') || 'Utente'

      setUserName(profile?.username?.trim() || fallbackName)

      // Conta gli eventi futuri
      const { data: eventsData } = await supabase.from('events').select('*')

      if (eventsData) {
        const now = new Date()
        now.setHours(0, 0, 0, 0)

        const upcoming = eventsData.filter(
          (event) => new Date(event.event_date) >= now
        )

        setUpcomingEventsCount(upcoming.length)
      }

      setLoading(false)
    }

    checkUserAndFetch()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 text-sm text-gray-500">
        Verifica autorizzazioni in corso...
      </div>
    )
  }

  return (
    <div className="responsive-page flex min-h-screen w-full flex-col bg-gray-50 md:flex-row">
      <Sidebar active="dashboard" />

      <main className="responsive-main w-full flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
        <header className="mb-6 sm:mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Ciao, <span className="capitalize text-lime-600">{userName}</span>! 👋
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Benvenuto nell’area di controllo del centro giovanile.
          </p>
        </header>

        <div className="responsive-card grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Eventi in Programma
            </span>

            <div className="mt-2 text-3xl font-extrabold text-gray-900">
              {upcomingEventsCount}
            </div>

            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              Attività e appuntamenti attivi sincronizzati dall’agenda.
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-dashed border-gray-300 bg-white p-4 shadow-sm sm:p-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                Sezione da Definire
              </span>

              <div className="mt-2 text-xl font-bold text-gray-900">
                Da Aggiungere 📌
              </div>

              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                Spazio riservato per una nuova metrica o funzione da decidere nel
                prossimo incontro.
              </p>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-3 text-[11px] font-medium text-gray-400">
              In attesa di indicazioni
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-dashed border-gray-300 bg-white p-4 shadow-sm sm:p-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                Sezione da Definire
              </span>

              <div className="mt-2 text-xl font-bold text-gray-900">
                Da Aggiungere 📌
              </div>

              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                Spazio riservato per un’ulteriore funzionalità o widget da valutare
                insieme.
              </p>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-3 text-[11px] font-medium text-gray-400">
              In attesa di indicazioni
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}