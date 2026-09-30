'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Sidebar({ active }: { active: 'dashboard' | 'events' | 'spaces' | 'users' }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { id: 'events', label: 'Agenda & Eventi', href: '/dashboard/events', icon: '📅' },
  { id: 'spaces', label: 'Spazi & Stanze', href: '/dashboard/spaces', icon: '🏢' },
  { id: 'users', label: 'Gestione Utenti', href: '/dashboard/users', icon: '👥' },
]

  return (
    <>
      {/* Top Bar Mobile (Visibile SOLO su smartphone) */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-40 w-full shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-lime-500 rounded-full animate-pulse"></span>
          <span className="font-black text-gray-900 text-sm">Polverigi Hub</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="min-w-11 min-h-11 p-2 rounded-xl text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors cursor-pointer"
          aria-label="Apri menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sfondo scuro (backdrop) quando il menu mobile è aperto */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar principale (Fissa su PC, a scomparsa con drawer su Smartphone) */}
      <aside className={`
        fixed md:sticky md:top-0 md:h-dvh inset-y-0 left-0 z-50
        w-[min(16rem,calc(100vw-1rem))] md:w-64 bg-white border-r border-gray-200 p-4 sm:p-6 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        shadow-2xl md:shadow-none
      `}>
        <div>
          {/* Intestazione Sidebar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-lime-500 rounded-full animate-pulse"></div>
              <h1 className="font-black text-gray-900 text-base tracking-tight">Polverigi Hub</h1>
            </div>
            {/* Pulsante di chiusura per smartphone */}
            <button 
              onClick={() => setIsOpen(false)} 
              className="md:hidden text-gray-400 hover:text-gray-700 font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Voci di Menu */}
          <nav className="space-y-1.5" aria-label="Navigazione principale">
            {navItems.map((item) => {
              const isActive = active === item.id
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsOpen(false)} // Chiude automaticamente il menu al tocco su mobile
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Pulsante Logout in basso */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
          >
            <span>🚪</span> Esci (Logout)
          </button>
          <div className="mt-4 px-2 text-[11px] text-gray-400 font-medium">
            Giunta Giovanile • Area Riservata
          </div>
        </div>
      </aside>
    </>
  )
}