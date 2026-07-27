'use client'

import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

/**
 * Einfache Options-Liste für `ModalRow`-Dropdowns (Fach, Typ, Schulstufe,
 * Tag-Werte …): aktueller Wert mit Häkchen, optionaler „Auswahl aufheben"-
 * Eintrag. `onSelect` schließt die Zeile selbst (via Callback des Aufrufers).
 */
export const ModalOptionList = ({
  options,
  current,
  onSelect,
  clearLabel,
}: {
  options: { value: string; label: string }[]
  current: string
  onSelect: (value: string) => void
  clearLabel?: string
}) => {
  return (
    <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto">
      {clearLabel && current && (
        <button
          onClick={() => onSelect('')}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted/60 text-left"
        >
          <Icon name="close" size={12} className="shrink-0" />{clearLabel}
        </button>
      )}
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors text-left',
            opt.value === current ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/60 text-foreground'
          )}
        >
          {opt.value === current
            ? <Icon name="check" size={12} className="shrink-0" />
            : <span className="size-3 shrink-0" />
          }
          {opt.label}
        </button>
      ))}
    </div>
  )
}
