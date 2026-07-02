'use client'

import { Icon } from "@/components/ui/Icon"
import { cn } from '@/lib/utils'

export const SearchBar = ({
  value,
  onChange,
  placeholder,
  right,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  /** Optionaler Inhalt rechts (z. B. Import-/Hinzufügen-Button oder Zähler).
   *  Buttons mit `size="sm" className="h-auto"` übergeben → strecken sich auf Feldhöhe.
   *  Nicht-streckende Inhalte (z. B. Zähler) mit `self-center` übergeben. */
  right?: React.ReactNode
  className?: string
}) => {
  return (
    <div className={cn('flex items-stretch gap-2', className)}>
      <div className="relative flex-1">
        <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      {right}
    </div>
  )
}
