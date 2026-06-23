'use client'

import { Check, Minus, X } from 'lucide-react'
import { cn, statusChipClasses } from '@/lib/utils'
import type { Status } from '@/types/domain'

export function nextStatus(current: Status | undefined): Status | undefined {
  if (current === undefined) return 'reached'
  if (current === 'reached') return 'partially_reached'
  if (current === 'partially_reached') return 'not_reached'
  return undefined
}

export function StatusCell({
  status,
  onSelect,
  readOnly = false,
}: {
  status: Status | undefined
  onSelect: (s: Status | undefined) => void
  readOnly?: boolean
}) {
  return (
    <div className="flex justify-center">
      <button
        onClick={() => !readOnly && onSelect(nextStatus(status))}
        title={
          readOnly ? undefined
          : status === 'reached' ? 'Erreicht'
          : status === 'partially_reached' ? 'Teilweise erreicht'
          : status === 'not_reached' ? 'Nicht erreicht'
          : 'Nicht bewertet'
        }
        className={cn(
          'w-7 h-7 rounded-md flex items-center justify-center transition-all',
          readOnly
            ? 'cursor-default opacity-80'
            : 'hover:scale-110 active:scale-95 cursor-pointer hover:brightness-95 dark:hover:brightness-110',
          statusChipClasses(status),
        )}
      >
        {status === 'reached' && <Check className="size-3 stroke-[2.5]" />}
        {status === 'partially_reached' && <Minus className="size-3 stroke-[2.5]" />}
        {status === 'not_reached' && <X className="size-3 stroke-[2.5]" />}
        {status === undefined && <span className="size-1.5 rounded-full bg-status-none-fg" />}
      </button>
    </div>
  )
}
