'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'
import { subscribeToasts, type ToastItem } from '@/lib/toast'

export const Toaster = () => {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => subscribeToasts(setItems), [])

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          role="alert"
          className={cn(
            'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-lg',
            item.variant === 'error'
              ? 'border-destructive/30 bg-destructive/10 text-destructive'
              : 'border-status-reached/30 bg-status-reached-soft text-status-reached-fg'
          )}
        >
          <Icon
            name={item.variant === 'error' ? 'error' : 'check_circle'}
            size={16}
            className="mt-0.5 shrink-0"
          />
          <span>{item.message}</span>
        </div>
      ))}
    </div>
  )
}
