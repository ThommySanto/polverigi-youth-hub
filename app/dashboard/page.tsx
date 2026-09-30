'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function DashboardPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string>('')
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUserAndFetch() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      setUserEmail(session.user.email || 'Utente')

      const { data: eventsData } = await supabase.from('events').select('*')
      if (eventsData) {
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        const upcoming = eventsData.filter((ev) => new Date(ev.event_date) >= now)
        setUpcomingEventsCount(upcoming.length)
      }
      setLoading(false)
    }

    checkUserAndFetch()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500 w-full">
        Verifica autorizzazioni in corso...
      </div>
    )
  }

  const userName = userEmail.split('@')[0]

  return (
    <div className="responsive-page min-h-screen bg-gray-50 flex flex-col md:flex-row w-full m-0 p-0">
      <Sidebar active="dashboard" />

      <main className="responsive-main flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto w-full">
        <header className="mb-6 sm:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Ciao, <span className="text-lime-600 capitalize">{userName}</span>! 👋
          </h2>
          <p className="text-sm text-gray-500 mt-1">Benvenuto nell'area di controllo del centro giovanile.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 w-full">
          <div className="responsive-card bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Eventi in Programma</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">
              {upcomingEventsCount}
            </div>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              Attività e appuntamenti attivi sincronizzati dall'agenda.
            </p>
          </div>

          <div className="responsive-card bg-white p-4 sm:p-6 rounded-2xl border border-dashed border-gray-300 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Sezione da Definire</span>
              <div className="text-xl font-bold text-gray-900 mt-2">Da Aggiungere 📌</div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Spazio riservato per una nuova metrica o funzione da decidere nel prossimo incontro.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400 font-medium">
              In attesa di indicazioni
            </div>
          </div>

          <div className="responsive-card bg-white p-4 sm:p-6 rounded-2xl border border-dashed border-gray-300 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Sezione da Definire</span>
              <div className="text-xl font-bold text-gray-900 mt-2">Da Aggiungere 📌</div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Spazio riservato per un'ulteriore funzionalità o widget da valutare insieme.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400 font-medium">
              In attesa di indicazioni
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}