'use client'

import { useState } from 'react'

const rooms = [
  { id: 1, name: 'CINEMA', type: 'cinema', x: 40, y: 40, w: 180, h: 200, color: '#F3E8FF', border: '#D8B4FE', text: '#6B21A8', manageable: true, desc: 'Sala proiezioni, eventi e serate cinema.' },
  { id: 2, name: 'UFFICIO', type: 'office', x: 230, y: 40, w: 140, h: 200, color: '#E0F2FE', border: '#7DD3FC', text: '#0369A1', manageable: true, desc: 'Coordinamento e amministrazione.' },
  { id: 3, name: 'AULA CORSI', type: 'courses', x: 380, y: 40, w: 220, h: 200, color: '#ECFCCB', border: '#BEF264', text: '#365314', manageable: true, desc: 'Spazio laboratori e corsi pomeridiani.' },
  { id: 4, name: 'PORTINERIA', type: 'reception', x: 610, y: 40, w: 230, h: 200, color: '#FEF3C7', border: '#FDE68A', text: '#92400E', manageable: true, desc: 'Accoglienza, reception e punto informazioni.' },
  { id: 5, name: 'AREA POLIVALENTE / RELAX', type: 'relax', x: 40, y: 250, w: 330, h: 220, color: '#FFEDD5', border: '#FED7AA', text: '#9A3412', manageable: true, desc: 'Open space centrale per aggregazione e svago.' },
  { id: 6, name: 'LABORATORIO ARTIGIANO', type: 'lab', x: 380, y: 250, w: 220, h: 220, color: '#D1FAE5', border: '#A7F3D0', text: '#065F46', manageable: true, desc: 'Spazio tecnico, artigianale e creativo.' },
  { id: 7, name: 'STUDIO REGISTRAZIONE', type: 'music', x: 610, y: 250, w: 230, h: 220, color: '#FCE7F3', border: '#FBCFE8', text: '#9D174D', manageable: true, desc: 'Sala prove, registrazione audio e podcast.' },
]

export default function InteractiveFloorPlan() {
  const [selectedRoom, setSelectedRoom] = useState<typeof rooms[0] | null>(null)
  const [scale, setScale] = useState(1) // Gestione dello zoom

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 2.0))
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.8))
  const resetZoom = () => setScale(1)

  return (
    <div className="responsive-card bg-white rounded-2xl border border-gray-200 p-3 sm:p-5 lg:p-6 shadow-sm">
      <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-6 flex-wrap gap-3 sm:gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Planimetria Orizzontale Interattiva</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0">Usa i controlli di zoom per esplorare la mappa in dettaglio.</p>
        </div>
        
        {/* Controlli di Zoom */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200 self-stretch sm:self-auto justify-center">
          <button onClick={zoomOut} className="px-3 py-1 bg-white hover:bg-gray-50 rounded-lg text-sm font-bold text-gray-700 shadow-sm transition-all">-</button>
          <span className="text-xs font-bold text-gray-600 px-2">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="px-3 py-1 bg-white hover:bg-gray-50 rounded-lg text-sm font-bold text-gray-700 shadow-sm transition-all">+</button>
          <button onClick={resetZoom} className="text-xs text-gray-500 hover:text-gray-900 px-2 font-medium">Reset</button>
        </div>
      </div>

      {/* Contenitore Mappa con Zoom Applicato */}
      <div className="floorplan-scroll border border-gray-200 rounded-xl bg-gray-950 p-2 sm:p-4 lg:p-6 flex justify-start sm:justify-center shadow-inner overflow-auto min-h-[280px] sm:min-h-[400px]">
        <div className="floorplan-canvas" style={{ transform: `scale(${scale})`, transformOrigin: 'center', transition: 'transform 0.2s ease-in-out' }}>
          <svg viewBox="0 0 880 510" className="block w-full h-auto drop-shadow-2xl">
            {/* Perimetro esterno dell'edificio */}
            <rect x="20" y="20" width="840" height="470" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="6" />

            {rooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id

              return (
                <g 
                  key={room.id} 
                  onClick={() => room.manageable && setSelectedRoom(room)}
                  className="cursor-pointer group"
                >
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.w}
                    height={room.h}
                    rx="8"
                    fill={isSelected ? '#1e293b' : room.color}
                    stroke={isSelected ? '#22c55e' : room.border}
                    strokeWidth={isSelected ? '3.5' : '2'}
                    className="transition-all duration-200 group-hover:brightness-95 shadow-sm"
                  />

                  <text
                    x={room.x + room.w / 2}
                    y={room.y + room.h / 2 - 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-extrabold tracking-tight select-none pointer-events-none"
                    style={{ fill: isSelected ? '#ffffff' : room.text }}
                  >
                    {room.name}
                  </text>

                  <text
                    x={room.x + room.w / 2}
                    y={room.y + room.h / 2 + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[9px] font-semibold select-none pointer-events-none fill-gray-500"
                  >
                    {isSelected ? '● SELEZIONATO' : 'Clicca per gestire'}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Pannello Dettagli Dinamico */}
      {selectedRoom ? (
        <div className="mt-4 p-4 sm:p-5 bg-gray-900 text-white rounded-xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 shadow-lg border border-gray-800 animate-fadeIn">
          <div>
            <span className="text-xs text-lime-400 font-bold uppercase tracking-wider">Ambiente Selezionato</span>
            <h4 className="font-bold text-lg">{selectedRoom.name}</h4>
            <p className="text-xs text-gray-300 mt-0.5">{selectedRoom.desc}</p>
          </div>
          <div className="text-left sm:text-right">
            <button className="w-full sm:w-auto bg-lime-500 hover:bg-lime-400 text-gray-950 font-bold text-xs px-4 py-2.5 rounded-lg shadow transition-all cursor-pointer">
              Gestisci Spazio →
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-4 bg-gray-50 border border-dashed border-gray-200 text-gray-500 text-center rounded-xl text-xs">
          💡 Clicca su un ambiente della planimetria orizzontale o usa i tasti + e - per zoomare.
        </div>
      )}
    </div>
  )
}