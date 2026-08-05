'use client'

import type { ReactNode } from 'react'
import { Icon } from "@/components/ui/Icon"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export const ModalRow = ({ label, displayValue, placeholder, open, onOpenChange, disabled = false, children }: {
  label: string
  displayValue?: string
  placeholder?: string
  open: boolean
  onOpenChange: (v: boolean) => void
  disabled?: boolean
  children: ReactNode
}) => {
  return (
    <div className="w-full min-w-0">
      <Popover open={disabled ? false : open} onOpenChange={disabled ? undefined : onOpenChange}>
        <PopoverTrigger
          disabled={disabled}
          className={cn(
            'w-full min-w-0 max-w-full flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2 transition-colors text-left',
            disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-accent/30',
          )}
        >
          <span className="text-xs text-muted-foreground shrink-0 w-16">{label}</span>
          <span className={cn(
            'flex-1 min-w-0 truncate text-xs',
            displayValue ? 'text-foreground font-medium' : 'text-muted-foreground/40'
          )}>
            {displayValue ?? placeholder ?? '—'}
          </span>
          {!disabled && (
            <Icon name="expand_more" size={16} className="text-muted-foreground shrink-0" />
          )}
        </PopoverTrigger>
        {!disabled && (
          <PopoverContent className="p-1.5 w-52 max-h-[var(--available-height)] overflow-y-auto" align="start" side="bottom" collisionAvoidance={{ side: 'none', align: 'none' }}>
            {children}
          </PopoverContent>
        )}
      </Popover>
    </div>
  )
}
