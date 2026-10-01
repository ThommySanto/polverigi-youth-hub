'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type ActivePage = 'dashboard' | 'events' | 'spaces' | 'users'

interface NavItem {
  id: ActivePage
  label: string
  href: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { id: 'events', label: 'Agenda & Eventi', href: '/dashboard/events', icon: '📅' },
  { id: 'spaces', label: 'Spazi & Stanze', href: '/dashboard/spaces', icon: '🏢' },
  { id: 'users', label: 'Gestione Utenti', href: '/dashboard/users', icon: '👥' },
]

export default function Sidebar({ active }: { active: ActivePage }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Top bar visibile solo su mobile */}
      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-xs md:hidden">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-3 w-3 animate-pulse rounded-full bg-lime-500"
          />
          <span className="text-sm font-black tracking-tight text-gray-900">
            Polverigi Hub
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-expanded={isOpen}
          aria-controls="main-sidebar"
          aria-label={isOpen ? 'Chiudi menu di navigazione' : 'Apri menu di navigazione'}
          className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl p-2 text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          <svg
            aria-hidden="true"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </header>

      {/* Backdrop mobile */}
      {isOpen && (
        <div
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        id="main-sidebar"
        aria-label="Navigazione principale"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(16rem,calc(100vw-1rem))] flex-col justify-between border-r border-gray-200 bg-white p-4 transition-transform duration-300 ease-in-out sm:p-6 md:sticky md:top-0 md:h-dvh md:w-64 md:translate-x-0 md:shadow-none ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Intestazione */}
          <div className="mb-8 flex items-center justify-between gap-3">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              <img
                src="/polverigi.svg"
                alt=""
                aria-hidden="true"
                className="h-12 w-12 shrink-0"
              />

              <span className="min-w-0">
                <span className="block truncate text-base font-black tracking-tight text-gray-900">
                  Polverigi Hub
                </span>
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Chiudi menu di navigazione"
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 md:hidden"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Menu */}
          <nav aria-label="Sezioni dell’area riservata" className="space-y-1.5">
            <ul className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive = active === item.id

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
                        isActive
                          ? 'bg-gray-900 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span aria-hidden="true" className="text-sm">
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        {/* Logout */}
        <div className="border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            <span aria-hidden="true">🚪</span>
            Esci (Logout)
          </button>

          <p className="mt-4 px-2 text-[11px] font-medium text-gray-400">
            Giunta Giovanile • Area Riservata
          </p>
        </div>
      </aside>
    </>
  )
}