'use client'

import { useState } from 'react'
import { ChevronDown, Plus, X } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

export interface FilterComboboxOption {
  value: string
  label: string
  dot?: string
}

interface FilterComboboxProps {
  options: FilterComboboxOption[]
  value: string
  onChange: (value: string) => void
  className?: string
  popoverClassName?: string
  showSearch?: boolean
  footerAction?: { label: string; onSelect: () => void }
}

export function FilterCombobox({
  options,
  value,
  onChange,
  className,
  popoverClassName,
  showSearch = false,
  footerAction,
}: FilterComboboxProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)
  const isActive = value !== ''

  const dropdown = (
    <PopoverContent
      align="start"
      side="bottom"
      sideOffset={6}
      className={cn('p-0 overflow-hidden w-auto min-w-[160px] max-w-[280px]', popoverClassName)}
    >
      <Command className="p-0.5 bg-background">
        {showSearch && <CommandInput placeholder="Suchen…" />}
        <CommandList>
          <CommandEmpty>Keine Resultate.</CommandEmpty>
          <CommandGroup className="p-0">
            {options.map(opt => (
              <CommandItem
                key={opt.value === '' ? '__all__' : opt.value}
                value={opt.label}
                data-checked={opt.value === value ? 'true' : undefined}
                onSelect={() => { onChange(opt.value); setOpen(false) }}
                className="py-1 px-2.5 text-xs"
              >
                <span className="flex items-center gap-1.5 flex-1">
                  {opt.dot && (
                    <span className={cn('size-1.5 rounded-full shrink-0', opt.dot)} />
                  )}
                  <span>{opt.label}</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          {footerAction && (
            <>
              <CommandSeparator />
              <CommandGroup className="p-0">
                <CommandItem
                  value={footerAction.label}
                  onSelect={() => { footerAction.onSelect(); setOpen(false) }}
                  className="py-1 px-2.5 text-xs text-primary"
                >
                  <span className="flex items-center gap-1.5 flex-1">
                    <Plus className="size-3 shrink-0" />
                    <span>{footerAction.label}</span>
                  </span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </PopoverContent>
  )

  if (isActive) {
    return (
      <div className={cn('inline-flex items-stretch', className)}>
        <Popover open={open} onOpenChange={(v) => setOpen(v)}>
          <PopoverTrigger className="flex h-9 items-center gap-2 rounded-l-full border border-r-0 border-primary/25 bg-primary/10 pl-3.5 pr-3 text-sm font-medium text-foreground transition-colors hover:bg-primary/15 focus-visible:outline-none">
            {selected?.dot && (
              <span className={cn('size-2 rounded-full shrink-0', selected.dot)} />
            )}
            <span className="whitespace-nowrap">{selected?.label}</span>
          </PopoverTrigger>
          {dropdown}
        </Popover>
        <button
          type="button"
          onClick={() => onChange('')}
          className="flex h-9 items-center rounded-r-full border border-primary/25 bg-primary/10 px-2.5 text-foreground/40 transition-colors hover:bg-primary/20 hover:text-foreground focus-visible:outline-none"
          aria-label="Filter zurücksetzen"
        >
          <X className="size-3.5" />
        </button>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={(v) => setOpen(v)}>
      <PopoverTrigger
        className={cn(
          'flex h-9 items-center gap-2 rounded-full border border-border/60 bg-background px-3.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none',
          className,
        )}
      >
        {selected?.dot && (
          <span className={cn('size-2.5 rounded-full shrink-0', selected.dot)} />
        )}
        <span className="whitespace-nowrap">{selected?.label ?? options[0]?.label ?? '—'}</span>
        <ChevronDown className="size-3.5 shrink-0 opacity-50 ml-0.5" />
      </PopoverTrigger>
      {dropdown}
    </Popover>
  )
}
