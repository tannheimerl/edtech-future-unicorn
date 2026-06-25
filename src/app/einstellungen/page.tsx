'use client'

import { Check } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { FACH_COLORS, getFachColor, cn } from '@/lib/utils'
import Link from 'next/link'

const COLOR_LABELS = ['Blau', 'Violett', 'Grün', 'Rot', 'Gelb', 'Türkis', 'Pink', 'Indigo']

export default function EinstellungenPage() {
  const { faecher, updateFachColor } = useData()
  const allFachIds = faecher.map(f => f.id)

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="heading-page">Einstellungen</h1>
        <p className="text-sm text-muted-foreground mt-1">Passe Lezio nach deinen Wünschen an.</p>
      </div>

      <div className="max-w-2xl">
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <h2 className="heading-section">Fachfarben</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Wähle eine Farbe pro Fach — sie wird überall in der App verwendet.</p>
          </div>

          {faecher.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-muted-foreground">Noch keine Fächer vorhanden.</p>
              <Link href="/lernziele" className="text-sm text-primary hover:underline mt-1 inline-block">
                Fächer in der Lernzielsammlung erstellen →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {faecher.map((fach) => {
                const currentColor = getFachColor(fach.id, allFachIds, fach.colorIndex)
                return (
                  <li key={fach.id} className="flex items-center gap-4 px-6 py-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className={cn('size-2 rounded-full shrink-0', currentColor.dot)} />
                      <span className="text-sm font-medium truncate">{fach.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {FACH_COLORS.map((c, idx) => {
                        const isActive = fach.colorIndex === idx ||
                          (fach.colorIndex === undefined && getFachColor(fach.id, allFachIds) === c)
                        return (
                          <button
                            key={idx}
                            title={COLOR_LABELS[idx]}
                            onClick={() => updateFachColor(fach.id, idx)}
                            className={cn(
                              'relative size-6 rounded-full transition-all',
                              c.dot,
                              isActive
                                ? 'ring-2 ring-offset-2 ring-foreground/40 scale-110'
                                : 'opacity-70 hover:opacity-100 hover:scale-110',
                            )}
                          >
                            {isActive && (
                              <Check className="absolute inset-0 m-auto size-3 text-white drop-shadow" strokeWidth={3} />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
