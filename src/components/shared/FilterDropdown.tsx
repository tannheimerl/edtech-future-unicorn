'use client'

import { Fragment, useState } from 'react'
import { Icon } from "@/components/ui/Icon"
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type FilterDropdownOption = {
  value: string
  label: string
  /** Optional color dot class, e.g. 'bg-blue-400'. */
  dot?: string
}

type FilterDropdownProps = {
  label: string
  value: string
  options: FilterDropdownOption[]
  onChange: (v: string) => void
  /** Label shown for the empty/"all" value. Defaults to `Alle ${label}`. */
  allLabel?: string
  showSearch?: boolean
  /** When set, renders a trailing ✕ segment that calls this handler. */
  onRemove?: () => void
  /** Optional action row at the bottom of the list (e.g. "Neue Kategorie"). */
  footerAction?: { label: string; onSelect: () => void }
  className?: string
  popoverClassName?: string
}

/**
 * Canonical labeled filter pill: `Label | Wert ⌄` with an optional ✕ to remove
 * the column. Used for every single-select list filter (Fach, Typ, Schulstufe,
 * Quartal, Thema, Lernzielkontrolle). Consolidates the former FilterSpalte and
 * FilterCombobox into one component.
 */
export const FilterDropdown = ({
  label,
  value,
  options,
  onChange,
  allLabel,
  showSearch = false,
  onRemove,
  footerAction,
  className,
  popoverClassName,
}: FilterDropdownProps) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = options.find(o => o.value === value)
  const isActive = value !== ''
  const displayLabel = selected?.label ?? allLabel ?? `Alle ${label}`
  const filtered = showSearch && search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  return (
    <div
      className={cn(
        'flex items-center rounded-full border bg-card text-xs overflow-hidden shrink-0 transition-colors',
        isActive ? 'border-primary/30' : 'border-border',
        className,
      )}
    >
      <Popover open={open} onOpenChange={v => { setOpen(v); if (!v) setSearch('') }}>
        <PopoverTrigger className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 hover:bg-accent/30 transition-colors focus-visible:outline-none">
          <span className="font-medium text-muted-foreground">{label}</span>
          <span className="text-border">|</span>
          {selected?.dot && <span className={cn('size-2 rounded-full shrink-0', selected.dot)} />}
          <span className={cn(isActive ? 'font-medium text-foreground' : 'text-muted-foreground')}>
            {displayLabel}
          </span>
          <Icon name="expand_more" size={12} className="text-muted-foreground shrink-0" />
        </PopoverTrigger>
        <PopoverContent className={cn('p-1.5 w-52', popoverClassName)} align="start" side="bottom">
          {showSearch && (
            <div className="px-1 pb-1.5">
              <input
                autoFocus
                placeholder="Suchen…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-md border border-border bg-transparent px-2 py-1.5 text-xs outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}
          <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto">
            {filtered.map((opt, i) => (
              <Fragment key={opt.value || '__all__'}>
                <button
                  onClick={() => { onChange(opt.value); setOpen(false); setSearch('') }}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs transition-colors text-left',
                    opt.value === value
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted/60 text-foreground',
                  )}
                >
                  {opt.dot
                    ? <span className={cn('size-2.5 rounded-full shrink-0', opt.dot)} />
                    : <span className="size-2.5 shrink-0" />}
                  <span className="flex-1">{opt.label}</span>
                  {opt.value === value && <Icon name="check" size={12} className="shrink-0 text-primary" />}
                </button>
                {i === 0 && options.length > 1 && !search && (
                  <div className="my-0.5 border-t border-border/40" />
                )}
              </Fragment>
            ))}
          </div>
          {footerAction && (
            <>
              <div className="my-0.5 border-t border-border/40" />
              <button
                onClick={() => { footerAction.onSelect(); setOpen(false); setSearch('') }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs text-primary hover:bg-muted/60 transition-colors text-left"
              >
                <Icon name="add" size={12} className="shrink-0" />
                <span className="flex-1">{footerAction.label}</span>
              </button>
            </>
          )}
        </PopoverContent>
      </Popover>
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex items-center justify-center px-1.5 py-1.5 hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground border-l border-border/40"
          aria-label={`${label}-Spalte entfernen`}
        >
          <Icon name="close" size={12} />
        </button>
      )}
    </div>
  )
}
