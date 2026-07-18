'use client'

import { Icon } from "@/components/ui/Icon"
import { useData } from '@/contexts/DataContext'
import { FACH_COLORS, getFachColor, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { DatenbankSettings } from '@/components/einstellungen/DatenbankSettings'
import Link from 'next/link'

const COLOR_LABELS = ['Blau', 'Violett', 'Grün', 'Rot', 'Gelb', 'Türkis', 'Pink', 'Indigo']

const EinstellungenPage = () => {
  const { faecher, updateFachColor, loadError, reloadData } = useData()
  const allFachIds = faecher.map(f => f.id)

  return (
    <div className="page-container py-8">
      <div className="mb-6">
        <p className="text-lg font-semibold text-foreground">Passe Lezio nach deinen Wünschen an.</p>
      </div>

      <div className="max-w-2xl">
        <DatenbankSettings onDataChanged={reloadData} />
      </div>

      <div className="max-w-2xl">
        {faecher.length === 0 ? (
          loadError ? (
            <EmptyState
              icon={<Icon name="cloud_off" size={20} className="text-accent-foreground" />}
              title="Daten konnten nicht geladen werden"
              description="Prüfe deine Internetverbindung und versuche es erneut."
              action={
                <Button variant="outline" size="sm" onClick={() => reloadData()}>
                  Erneut laden
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<Icon name="palette" size={20} className="text-accent-foreground" />}
              title="Noch keine Fächer vorhanden"
              description={
                <Link href="/lernziele" className="text-primary hover:underline">
                  Fächer in der Lernzielsammlung erstellen →
                </Link>
              }
            />
          )
        ) : (
          <ul className="divide-y divide-border">
            {faecher.map((fach) => {
              const currentColor = getFachColor(fach.id, allFachIds, fach.colorIndex)
              return (
                <li key={fach.id} className="flex items-center gap-4 py-3">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('size-2 rounded-full shrink-0', currentColor.dot)} />
                    <span className="text-sm font-medium whitespace-nowrap">{fach.name}</span>
                  </div>
                  <div className="flex flex-1 items-center justify-end gap-1.5">
                    {FACH_COLORS.map((c, idx) => {
                      const isActive = fach.colorIndex === idx ||
                        (fach.colorIndex === undefined && getFachColor(fach.id, allFachIds) === c)
                      return (
                        <button
                          key={idx}
                          title={COLOR_LABELS[idx]}
                          onClick={() => updateFachColor(fach.id, idx)}
                          className={cn(
                            'relative size-5 rounded-full transition-all',
                            c.dot,
                            isActive
                              ? 'ring-2 ring-foreground/30'
                              : 'opacity-60 hover:opacity-100',
                          )}
                        >
                          {isActive && (
                            <Icon name="check" size={12} weight={700} className="absolute inset-0 m-auto text-white drop-shadow" />
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
  )
}

export default EinstellungenPage
