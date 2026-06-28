'use client'

import { useState } from 'react'
import { ArrowRight, Check, ChevronDown, Plus } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn, getFachColor } from '@/lib/utils'
import { rankFachSuggestions, SUGGEST_THRESHOLD } from '@/lib/fachMatch'
import { NEW_FACH } from '@/lib/lezioImport'
import type { Fach } from '@/types/domain'

/** Eine Zeile der „Fächer zuordnen“-Maske: ordnet einen importierten Fachnamen einem
 *  bestehenden Fach zu oder legt es neu an. `value` ist eine fachId oder {@link NEW_FACH}. */
export function FachZuordnenRow({ importName, count, faecher, value, onChange }: {
  importName: string
  count: number
  faecher: Fach[]
  value: string  // fachId oder NEW_FACH
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ranked = rankFachSuggestions(importName, faecher)
  const selectedFach = value === NEW_FACH ? null : faecher.find(f => f.id === value)

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_13rem] items-center gap-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{importName}</p>
        <p className="text-[11px] text-muted-foreground">{count} {count === 1 ? 'Thema' : 'Themen'}</p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent/30 transition-colors">
          {selectedFach ? (
            <>
              <span className={cn('size-2 rounded-full shrink-0', getFachColor(selectedFach.id, faecher.map(f => f.id), selectedFach.colorIndex).dot)} />
              <span className="flex-1 truncate text-left">{selectedFach.name}</span>
            </>
          ) : (
            <span className="flex-1 truncate text-left text-muted-foreground">Neues Fach anlegen</span>
          )}
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1.5" align="end">
          <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto">
            {ranked.map(({ fach: f, score }, idx) => {
              const isSuggested = idx === 0 && score >= SUGGEST_THRESHOLD
              return (
                <button
                  key={f.id}
                  onClick={() => { onChange(f.id); setOpen(false) }}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-left transition-colors',
                    value === f.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/60',
                  )}
                >
                  <span className={cn('size-2 rounded-full shrink-0', getFachColor(f.id, faecher.map(fx => fx.id), f.colorIndex).dot)} />
                  <span className="flex-1 truncate">{f.name}</span>
                  {isSuggested && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">Vorschlag</span>
                  )}
                  {value === f.id && <Check className="size-3 shrink-0 text-primary" />}
                </button>
              )
            })}
            <div className="my-0.5 border-t border-border/40" />
            <button
              onClick={() => { onChange(NEW_FACH); setOpen(false) }}
              className={cn(
                'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-left transition-colors',
                value === NEW_FACH ? 'bg-primary/10 text-primary' : 'hover:bg-muted/60',
              )}
            >
              <Plus className="size-3.5 shrink-0" />
              <span className="flex-1 truncate">Neues Fach „{importName}“ anlegen</span>
              {value === NEW_FACH && <Check className="size-3 shrink-0 text-primary" />}
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
