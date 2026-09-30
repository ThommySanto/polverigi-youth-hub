'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

type Event = {
  id: number
  title: string
  description: string
  event_date: string
  category: string
  status: string
  space_id?: number
  spaces?: {
    name: string
  }
}

type Space = {
  id: number
  name: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [currentDate, setCurrentDate] = useState(new Date())

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [category, setCategory] = useState('Cinema')
  const [status, setStatus] = useState('Confermato')
  const [spaceId, setSpaceId] = useState<number | ''>('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*, spaces(name)')
      .order('event_date', { ascending: true })

    const { data: spacesData } = await supabase
      .from('spaces')
      .select('id, name')
      .order('id', { ascending: true })

    if (eventsError) {
      console.error('Errore nel recupero eventi:', eventsError)
    } else {
      setEvents(eventsData || [])
    }

    if (spacesData) {
      setSpaces(spacesData)
      if (spacesData.length > 0) setSpaceId(spacesData[0].id)
    }

    setLoading(false)
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault()
    const formattedDate = new Date(eventDate).toISOString()

    const { error } = await supabase.from('events').insert([
      { 
        title, 
        description, 
        event_date: formattedDate, 
        category, 
        status, 
        space_id: spaceId ? Number(spaceId) : null 
      }
    ])

    if (!error) {
      setTitle('')
      setDescription('')
      setEventDate('')
      setShowModal(false)
      fetchData()
    } else {
      alert(`Errore durante la creazione: ${error.message}`)
    }
  }

  async function handleUpdateEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEvent) return

    const formattedDate = new Date(eventDate).toISOString()

    const { error } = await supabase
      .from('events')
      .update({ 
        title, 
        description, 
        event_date: formattedDate, 
        category, 
        status, 
        space_id: spaceId ? Number(spaceId) : null 
      })
      .eq('id', selectedEvent.id)

    if (!error) {
      setIsEditing(false)
      setSelectedEvent(null)
      fetchData()
    } else {
      alert(`Errore durante l'aggiornamento: ${error.message}`)
    }
  }

  async function handleDeleteEvent(id: number) {
    if (!confirm('Sei sicuro di voler eliminare questo evento dal calendario?')) return

    const { error } = await supabase.from('events').delete().eq('id', id)

    if (!error) {
      setSelectedEvent(null)
      setIsEditing(false)
      fetchData()
    } else {
      alert('Errore durante l\'eliminazione dell\'evento')
    }
  }

  function startEditing(ev: Event) {
    setSelectedEvent(ev)
    setTitle(ev.title)
    setDescription(ev.description || '')
    const d = new Date(ev.event_date)
    setEventDate(d.toISOString().slice(0, 16))
    setCategory(ev.category)
    setStatus(ev.status || 'Confermato')
    setSpaceId(ev.space_id || (spaces.length > 0 ? spaces[0].id : ''))
    setIsEditing(true)
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const startingDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ]

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  return (
    <div className="responsive-page min-h-screen bg-gray-50 flex flex-col md:flex-row w-full">
      <Sidebar active="events" />

      <main className="responsive-main flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto flex flex-col w-full">
        <header className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-5 sm:mb-6 flex-wrap gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Agenda & Calendario Unificato 📅</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Gestisci eventi, attività e occupazione delle stanze in un unico posto.</p>
          </div>
          <button 
            onClick={() => {
              setTitle('')
              setDescription('')
              setEventDate(new Date().toISOString().slice(0, 16))
              setCategory('Cinema')
              setStatus('Confermato')
              if (spaces.length > 0) setSpaceId(spaces[0].id)
              setShowModal(true)
            }}
            className="w-full sm:w-auto justify-center bg-lime-500 hover:bg-lime-400 active:scale-[0.99] text-gray-950 font-bold text-xs px-4 py-3 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            + Pianifica Attività
          </button>
        </header>

        <div className="responsive-calendar bg-white rounded-2xl border border-gray-200/80 shadow-sm p-3 sm:p-5 flex-1 flex flex-col overflow-x-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-4 flex-wrap gap-3">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              {monthNames[month]} {year}
            </h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={prevMonth}
                className="flex-1 sm:flex-none px-2.5 sm:px-3 py-2 border border-gray-200 rounded-xl text-[11px] sm:text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
              >
                ◀ Mese Prec.
              </button>
              <button 
                onClick={nextMonth}
                className="flex-1 sm:flex-none px-2.5 sm:px-3 py-2 border border-gray-200 rounded-xl text-[11px] sm:text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
              >
                Mese Succ. ▶
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500 py-12 text-center">Caricamento calendario...</div>
          ) : (
            <div className="responsive-calendar-grid flex-1 flex flex-col min-w-0 w-full">
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
                {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((d) => (
                  <div key={d} className="text-xs font-bold text-gray-400 uppercase">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2 flex-1">
                {Array.from({ length: startingDayIndex }).map((_, index) => (
                  <div key={`empty-${index}`} className="responsive-calendar-cell h-20 sm:h-28 bg-gray-50/50 rounded-lg sm:rounded-xl border border-gray-100 opacity-40"></div>
                ))}

                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const dayNum = index + 1
                  const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                  const dayEvents = events.filter((ev) => ev.event_date.startsWith(dateString))

                  return (
                    <div 
                      key={dayNum} 
                      onClick={() => {
                        setTitle('')
                        setDescription('')
                        setEventDate(`${dateString}T10:00`)
                        setCategory('Cinema')
                        setStatus('Confermato')
                        if (spaces.length > 0) setSpaceId(spaces[0].id)
                        setShowModal(true)
                      }}
                      className="responsive-calendar-cell h-20 sm:h-28 bg-white rounded-lg sm:rounded-xl border border-gray-200 p-1.5 sm:p-2 flex flex-col justify-between overflow-y-auto hover:border-lime-400 hover:bg-lime-50/20 transition-all cursor-pointer group shadow-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] sm:text-[11px] font-bold text-gray-700 bg-gray-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                          {dayNum}
                        </span>
                        <span className="hidden sm:inline opacity-0 group-hover:opacity-100 text-[9px] text-lime-700 font-bold bg-lime-100 px-1 py-0.5 rounded transition-opacity">
                          + Aggiungi
                        </span>
                      </div>

                      <div className="space-y-1 mt-1 flex-1 overflow-y-auto">
                        {dayEvents.map((ev) => (
                          <div 
                            key={ev.id} 
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedEvent(ev)
                              setIsEditing(false)
                            }}
                            className="responsive-calendar-event bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-[10px] font-semibold p-1 rounded truncate shadow-xs transition-all"
                            title={`${ev.title} - ${ev.spaces?.name || 'Spazio non assegnato'}`}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modale Dettagli */}
        {selectedEvent && !isEditing && (
          <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-fadeIn border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <span className="px-3 py-1 text-xs font-bold rounded-lg bg-purple-100 text-purple-800 uppercase tracking-wider">
                  {selectedEvent.category}
                </span>
                <button 
                  onClick={() => setSelectedEvent(null)} 
                  className="text-gray-400 hover:text-gray-700 font-bold p-1 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 tracking-tight">{selectedEvent.title}</h3>

              <div className="mb-6 px-4 py-2.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-900 text-xs font-semibold flex items-center gap-2">
                <span>🏢</span> Stanza Assegnata: <strong className="text-sky-950">{selectedEvent.spaces?.name || 'Nessuna stanza associata'}</strong>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">📅 Data</span>
                  <span className="text-sm font-bold text-gray-900">
                    {new Date(selectedEvent.event_date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">⏰ Orario</span>
                  <span className="text-sm font-bold text-gray-900">
                    {new Date(selectedEvent.event_date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs font-semibold">
                <span>●</span> Stato: <strong className="uppercase">{selectedEvent.status}</strong>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm text-gray-700 mb-8">
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">📝 Descrizione</span>
                <p className="leading-relaxed">{selectedEvent.description || 'Nessuna descrizione inserita.'}</p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100 flex-wrap gap-3">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-red-200"
                  >
                    Elimina
                  </button>
                  <button 
                    onClick={() => startEditing(selectedEvent)}
                    className="px-4 py-2.5 text-xs font-bold text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer border border-gray-300"
                  >
                    Modifica ✏️
                  </button>
                </div>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="px-5 py-2.5 text-xs font-bold bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modale Modifica */}
        {selectedEvent && isEditing && (
          <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-900">Modifica Attività</h3>
                <button onClick={() => { setIsEditing(false); setSelectedEvent(null); }} className="text-gray-400 hover:text-gray-700 font-bold p-1">✕</button>
              </div>

              <form onSubmit={handleUpdateEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Titolo Attività</label>
                  <input 
                    type="text" 
                    required
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-base text-gray-900 bg-gray-50/50 focus:outline-none focus:border-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Stanza Assegnata</label>
                  <select 
                    value={spaceId} 
                    onChange={(e) => setSpaceId(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-base text-gray-900 bg-gray-50/50 focus:outline-none focus:border-gray-900"
                  >
                    {spaces.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Categoria</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3.5 text-base text-gray-900 bg-gray-50/50 focus:outline-none focus:border-gray-900"
                    >
                      <option value="Cinema">Cinema & Proiezioni</option>
                      <option value="Corsi">Corsi & Laboratori</option>
                      <option value="Musica">Musica & Studio</option>
                      <option value="Giunta">Riunione Giunta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Stato</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3.5 text-base text-gray-900 bg-gray-50/50 focus:outline-none focus:border-gray-900"
                    >
                      <option value="Confermato">Confermato</option>
                      <option value="In attesa">In attesa</option>
                      <option value="Annullato">Annullato</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Data e Ora</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={eventDate} 
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-base text-gray-900 bg-gray-50/50 focus:outline-none focus:border-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Descrizione</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-base text-gray-900 bg-gray-50/50 focus:outline-none focus:border-gray-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button 
                    type="button" 
                    onClick={() => { setIsEditing(false); setSelectedEvent(null); }}
                    className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2.5 text-xs font-bold bg-lime-500 hover:bg-lime-400 text-gray-950 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Salva Modifiche
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modale Nuovo */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-900">Pianifica Nuova Attività</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 font-bold p-1">✕</button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Titolo Attività / Scopo</label>
                  <input 
                    type="text" 
                    required
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Es. Prove band o Serata Cinema" 
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-base text-gray-900 bg-gray-50/50 focus:outline-none focus:border-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Assegna Stanza</label>
                  <select 
                    value={spaceId} 
                    onChange={(e) => setSpaceId(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-base text-gray-900 bg-gray-50/50 focus:outline-none focus:border-gray-900"
                  >
                    {spaces.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Categoria</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3.5 text-base text-gray-900 bg-gray-50/50 focus:outline-none focus:border-gray-900"
                    >
                      <option value="Cinema">Cinema & Proiezioni</option>
                      <option value="Corsi">Corsi & Laboratori</option>
                      <option value="Musica">Musica & Studio</option>
                      <option value="Giunta">Riunione Giunta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Stato</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-3.5 text-base text-gray-900 bg-gray-50/50 focus:outline-none focus:border-gray-900"
                    >
                      <option value="Confermato">Confermato</option>
                      <option value="In attesa">In attesa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Data e Ora</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={eventDate} 
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-base text-gray-900 bg-gray-50/50 focus:outline-none focus:border-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Descrizione</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Dettagli dell'attività..." 
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-base text-gray-900 bg-gray-50/50 focus:outline-none focus:border-gray-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2.5 text-xs font-bold bg-lime-500 hover:bg-lime-400 text-gray-950 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Salva Attività
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}