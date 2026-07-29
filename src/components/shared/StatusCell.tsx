'use client'

import { Icon } from "@/components/ui/Icon"
import { IconButton } from "@/components/ui/icon-button"
import { cn, statusChipClasses } from '@/lib/utils'
import type { Status } from '@/types/domain'

export const nextStatus = (current: Status | undefined): Status | undefined => {
  if (current === undefined) return 'reached'
  if (current === 'reached') return 'partially_reached'
  if (current === 'partially_reached') return 'not_reached'
  return undefined
}

export const StatusCell = ({
  status,
  onSelect,
  readOnly = false,
}: {
  status: Status | undefined
  onSelect: (s: Status | undefined) => void
  readOnly?: boolean
}) => {
  return (
    <div className="flex justify-center">
      <IconButton
        onClick={() => !readOnly && onSelect(nextStatus(status))}
        title={
          readOnly ? undefined
          : status === 'reached' ? 'Erreicht'
          : status === 'partially_reached' ? 'Teilweise erreicht'
          : status === 'not_reached' ? 'Nicht erreicht'
          : 'Nicht bewertet'
        }
        className={cn(
          'w-7 h-7 rounded-md border-transparent bg-transparent hover:bg-transparent hover:text-inherit transition-all',
          readOnly
            ? 'cursor-default opacity-80'
            : 'hover:scale-110 active:scale-95 cursor-pointer hover:brightness-95 dark:hover:brightness-110',
          statusChipClasses(status),
        )}
      >
        {status === 'reached' && <Icon name="check" size={16} weight={600} />}
        {status === 'partially_reached' && <Icon name="remove" size={16} weight={600} />}
        {status === 'not_reached' && <Icon name="close" size={16} weight={600} />}
        {status === undefined && <span className="size-1.5 rounded-full bg-status-none-fg" />}
      </IconButton>
    </div>
  )
}
