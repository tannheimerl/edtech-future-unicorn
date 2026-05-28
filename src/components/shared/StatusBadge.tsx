import { cn } from '@/lib/utils'
import type { Status } from '@/types/domain'
import { STATUS_LABELS } from '@/types/domain'

const STATUS_CLASSES: Record<Status, string> = {
  reached:           'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  partially_reached: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  not_reached:       'bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        STATUS_CLASSES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
