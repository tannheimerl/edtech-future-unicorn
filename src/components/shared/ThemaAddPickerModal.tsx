'use client'

import { Plus, Upload } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  fachName: string
  onImportieren: () => void
  onNeuErstellen: () => void
}

export function ThemaAddPickerModal({ open, onOpenChange, fachName, onImportieren, onNeuErstellen }: Props) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Thema hinzufügen" size="xs">
      <div className="grid gap-2 pt-1 pb-2">
        {fachName && (
          <p className="text-xs text-muted-foreground pb-1">Für Fach: {fachName}</p>
        )}
        {([
          { Icon: Upload, label: 'Importieren', desc: '.lezio-Datei importieren', action: onImportieren },
          { Icon: Plus,   label: 'Neu erstellen', desc: 'Eigenes Thema mit Lernzielen', action: onNeuErstellen },
        ] as const).map(({ Icon, label, desc, action }) => (
          <button
            key={label}
            onClick={() => { action(); onOpenChange(false) }}
            className="flex items-center gap-3 rounded-2xl border border-border p-3.5 text-left hover:border-primary/40 hover:bg-accent transition-all"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium leading-snug">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  )
}
