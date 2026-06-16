'use client'

import { Settings } from 'lucide-react'
import { useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { cn } from '@/lib/utils'
import type { KlasseBeurteilungSettings } from '@/types/domain'

interface Props {
  klassId: string
  settings: KlasseBeurteilungSettings
}

export function BeurteilungSettingsPanel({ klassId, settings }: Props) {
  const { updateBeurteilungSettings } = useData()
  const [open, setOpen] = useState(false)

  const toggle = (key: keyof KlasseBeurteilungSettings) => {
    updateBeurteilungSettings(klassId, { ...settings, [key]: !settings[key] })
  }

  const fields: { key: keyof KlasseBeurteilungSettings; label: string; desc: string }[] = [
    { key: 'punkteEnabled', label: 'Punktezahl', desc: 'Punktespalte im Beurteilungsgrid anzeigen' },
    { key: 'noteEnabled', label: 'Note', desc: 'Notenspalte (1–6) im Beurteilungsgrid anzeigen' },
    { key: 'anhangEnabled', label: 'Anhang', desc: 'Datei-Upload pro Schüler ermöglichen' },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        title="Beurteilungs-Einstellungen"
        className={cn(
          'flex items-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-xs font-medium transition-colors',
          open
            ? 'bg-muted text-foreground border-border'
            : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40',
        )}
      >
        <Settings className="size-3.5" />
        Einstellungen
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-72 rounded-xl border border-border bg-card shadow-lg p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Optionale Felder
          </p>
          {fields.map(({ key, label, desc }) => (
            <label key={key} className="flex items-start gap-3 cursor-pointer group">
              <div
                onClick={() => toggle(key)}
                className={cn(
                  'mt-0.5 size-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors',
                  settings[key]
                    ? 'bg-primary border-primary'
                    : 'border-border group-hover:border-primary/50',
                )}
              >
                {settings[key] && (
                  <svg className="size-2.5 text-primary-foreground" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5l3 4 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
