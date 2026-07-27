'use client'

import { useEffect, useRef, useState } from 'react'
import { Icon } from "@/components/ui/Icon"
import { cn, getFachColor } from '@/lib/utils'

// Nach Fach gruppiertes, durchsuchbares Thema-Dropdown der freien Beurteilung.
export const ThemaSelect = ({
  value,
  onChange,
  placeholder,
  themenByFach,
  themaIds,
  getLernzieleForThema,
  allFachIds,
}: {
  value: string | null
  onChange: (id: string) => void
  placeholder: string
  allFachIds: string[]
  themenByFach: { fach: { id: string; name: string; colorIndex?: number }; themen: { id: string; name: string }[] }[]
  themaIds: (string | null)[]
  getLernzieleForThema: (id: string) => unknown[]
}) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (open) { inputRef.current?.focus(); setSearch('') }
  }, [open])

  const filtered = themenByFach
    .map(({ fach, themen }) => ({
      fach,
      themen: themen.filter(
        t => (t.id === value || !themaIds.includes(t.id)) &&
             t.name.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter(f => f.themen.length > 0)

  const selectedName = value
    ? themenByFach.flatMap(f => f.themen).find(t => t.id === value)?.name ?? null
    : null

  const selectedFachId = value
    ? themenByFach.find(({ themen }) => themen.some(t => t.id === value))?.fach.id ?? null
    : null
  const selectedFach = selectedFachId
    ? themenByFach.find(({ fach }) => fach.id === selectedFachId)?.fach ?? null
    : null
  const selectedFachColor = selectedFach ? getFachColor(selectedFach.id, allFachIds, selectedFach.colorIndex) : null

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'h-7 min-w-44 rounded-md border border-border bg-card px-2 pr-6 text-xs font-medium shadow-sm flex items-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring overflow-hidden',
          selectedFachColor && 'border-l-4',
          selectedFachColor?.border,
        )}
      >
        <span className={cn('truncate flex-1 text-left', selectedName ? 'text-foreground' : 'text-muted-foreground')}>
          {selectedName ?? placeholder}
        </span>
        <Icon name="expand_more" size={12} className="shrink-0 absolute right-1.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-64 rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-border">
            <Icon name="search" size={12} className="text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && setOpen(false)}
              placeholder="Thema suchen …"
              className="flex-1 text-xs bg-transparent focus:outline-none placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">Keine Treffer</p>
            ) : (
              filtered.map(({ fach, themen }) => (
                <div key={fach.id}>
                  <p className="px-3 pt-2 pb-0.5 text-3xs font-semibold uppercase tracking-wide text-muted-foreground/60 flex items-center gap-1">
                    <span className={cn('size-1.5 rounded-full shrink-0', getFachColor(fach.id, allFachIds, fach.colorIndex).dot)} />
                    {fach.name}
                  </p>
                  {themen.map(thema => {
                    const lzCount = getLernzieleForThema(thema.id).length
                    const isSelected = thema.id === value
                    return (
                      <button
                        key={thema.id}
                        onClick={() => { onChange(thema.id); setOpen(false) }}
                        className={cn(
                          'w-full text-left px-3 py-1.5 text-xs flex items-center justify-between gap-2 hover:bg-muted/60 transition-colors',
                          isSelected && 'bg-primary/5 text-primary font-medium',
                        )}
                      >
                        <span className="truncate">{thema.name}</span>
                        <span className="text-3xs text-muted-foreground shrink-0">{lzCount} LZ</span>
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Visual identity for each selection slot
export const SLOT_STYLES = [
  {
    badge: 'bg-primary text-primary-foreground',
    groupHeader: 'bg-primary/5 text-primary',
    swatch: 'bg-primary/30',
  },
  {
    badge: 'bg-amber-500 text-white',
    groupHeader: 'bg-amber-500/5 text-amber-700',
    swatch: 'bg-amber-300',
  },
  {
    badge: 'bg-violet-500 text-white',
    groupHeader: 'bg-violet-500/5 text-violet-700',
    swatch: 'bg-violet-300',
  },
  {
    badge: 'bg-teal-500 text-white',
    groupHeader: 'bg-teal-500/5 text-teal-700',
    swatch: 'bg-teal-300',
  },
]

