'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

type Space = {
  id: number
  name: string
  description: string
  is_active: boolean
}

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSpaces() {
      const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .order('id', { ascending: true })

      if (error) {
        console.error('Errore nel recupero degli spazi:', error)
      } else {
        setSpaces(data || [])
      }
      setLoading(false)
    }

    fetchSpaces()
  }, [])

  return (
    <div className="responsive-page min-h-screen bg-gray-50 flex flex-col md:flex-row w-full">
      <Sidebar active="spaces" />

      <main className="responsive-main flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
        <header className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Gestione Spazi 🏢</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Elenco completo dei 15 ambienti ufficiali del centro giovanile.</p>
        </header>

        {loading ? (
          <div className="text-sm text-gray-500">Caricamento spazi in corso...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 w-full">
            {spaces.map((space) => (
              <div key={space.id} className="responsive-card bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-all">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900 text-base">{space.name}</h3>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      space.is_active ? 'bg-lime-100 text-lime-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {space.is_active ? 'Attivo' : 'Servizio'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">{space.description}</p>
                </div>
                
                <div className="border-t pt-4 flex justify-end items-center text-xs text-gray-500 font-medium">
                  <span className="text-lime-600 hover:underline cursor-pointer font-semibold">Modifica stanza →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}