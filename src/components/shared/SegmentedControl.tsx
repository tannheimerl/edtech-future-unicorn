'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SegmentedOption<T extends string> {
  key: T
  label: string
  /** Optional override for the active state, e.g. category colors. */
  activeClass?: string
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (v: T) => void
  /** Optional caption shown before the segments (e.g. "Status", "Fach"). */
  label?: string
  size?: 'xs' | 'sm'
  className?: string
}

/**
 * Solid-blue segmented toggle for small, fixed sets of mutually exclusive
 * choices (Status, Lernziel-Kategorie …). All options stay visible — one click
 * to switch. Built on the shared Button component (default/outline variants).
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'xs',
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {label && (
        <span className="text-xs text-muted-foreground shrink-0">{label}:</span>
      )}
      <div className="flex flex-wrap gap-1">
        {options.map(o => {
          const active = value === o.key
          return (
            <Button
              key={o.key}
              type="button"
              variant={active ? 'default' : 'outline'}
              size={size}
              onClick={() => onChange(o.key)}
              className={cn('whitespace-nowrap', active && o.activeClass)}
            >
              {o.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
