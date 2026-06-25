'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface UnderlineTabsProps<T extends string> {
  options: { key: T; label: string }[]
  value: T
  onChange: (v: T) => void
}

export function UnderlineTabs<T extends string>({ options, value, onChange }: UnderlineTabsProps<T>) {
  return (
    <div className="flex border-b border-border -mx-1">
      {options.map(o => (
        <Button
          key={o.key}
          onClick={() => onChange(o.key)}
          variant="ghost"
          className={cn(
            'h-auto rounded-none px-4 py-2 border-b-2 -mb-px whitespace-nowrap',
            'hover:bg-transparent focus-visible:ring-0 focus-visible:border-x-transparent focus-visible:border-t-transparent',
            value === o.key
              ? 'border-b-primary text-primary'
              : 'border-b-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
        </Button>
      ))}
    </div>
  )
}
