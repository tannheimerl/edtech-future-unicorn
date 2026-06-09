'use client'

import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function Tooltip({ children, content, side = 'top' }: {
  children: ReactNode
  content: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger delay={300} className="cursor-default inline-flex items-center">
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner side={side} sideOffset={6} align="start">
          <TooltipPrimitive.Popup className="max-w-xs rounded-lg border border-border bg-popover px-3 py-2 text-[11px] text-popover-foreground shadow-md leading-relaxed z-50">
            {content}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

export function InfoTooltip({ content, side = 'top', className }: {
  content: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger delay={300} className={cn('cursor-default inline-flex items-center', className)}>
        <Info className="size-3.5 text-muted-foreground/50 hover:text-sky-500 transition-colors" />
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner side={side} sideOffset={6} align="start">
          <TooltipPrimitive.Popup className="max-w-xs rounded-lg border border-sky-100 bg-white px-3 py-2 text-[11px] text-sky-700/90 shadow-md leading-relaxed z-50">
            {content}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
