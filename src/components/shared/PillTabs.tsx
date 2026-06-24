'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PillTabsProps<T extends string> {
  options: { key: T; label: string }[]
  value: T
  onChange: (v: T) => void
  size?: 'default' | 'sm'
  leading?: ReactNode
}

export function PillTabs<T extends string>({ options, value, onChange, size = 'default', leading }: PillTabsProps<T>) {
  const sm = size === 'sm'
  return (
    <div
      className={cn(
        'flex items-center bg-muted',
        sm ? 'gap-0.5 p-0.5 rounded-lg text-xs' : 'gap-1 p-1 rounded-xl w-fit min-w-full sm:min-w-0',
      )}
    >
      {leading}
      {options.map(o => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={cn(
            'rounded-lg font-medium transition-all whitespace-nowrap shrink-0',
            sm ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm',
            value === o.key
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
