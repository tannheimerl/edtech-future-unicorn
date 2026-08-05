'use client'

import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Icon } from "@/components/ui/Icon"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, statusChipClasses } from '@/lib/utils'
import type { Status } from '@/types/domain'

export const STATUS_LABEL: Record<'none' | Status, string> = {
  none: 'Nicht bewertet',
  reached: 'Erreicht',
  partially_reached: 'Teilweise erreicht',
  not_reached: 'Nicht erreicht',
}

const OPTIONS: (Status | undefined)[] = [undefined, 'not_reached', 'partially_reached', 'reached']

export const StatusIcon = ({ status }: { status: Status | undefined }) => (
  <>
    {status === 'reached' && <Icon name="check" size={16} weight={600} />}
    {status === 'partially_reached' && <Icon name="remove" size={16} weight={600} />}
    {status === 'not_reached' && <Icon name="close" size={16} weight={600} />}
    {status === undefined && <span className="size-1.5 rounded-full bg-status-none-fg" />}
  </>
)

// Generischer Hover-Flyout-Trigger: zeigt beim Hover ein Popover mit allen
// vier Status-Optionen. Wird sowohl für die Status-Chips selbst als auch für
// den "Versuch hinzufügen"-Button verwendet.
export const HoverStatusPicker = ({
  onSelect,
  onDelete,
  triggerClassName,
  triggerTitle,
  side = 'bottom',
  children,
}: {
  onSelect: (s: Status | undefined) => void
  /** Zeigt zusätzlich einen Löschen-Button im Flyout — z. B. um einen ganzen Versuch zu entfernen. */
  onDelete?: () => void
  triggerClassName: string
  triggerTitle?: string
  side?: 'top' | 'bottom'
  children: ReactNode
}) => {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }

  return (
    <div
      className="flex justify-center"
      onMouseEnter={() => {
        cancelClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger title={triggerTitle} className={triggerClassName}>
          {children}
        </PopoverTrigger>
        <PopoverContent
          align="center"
          side={side}
          sideOffset={4}
          className="w-auto flex-row gap-1 p-1"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt ?? 'none'}
              type="button"
              title={STATUS_LABEL[opt ?? 'none']}
              onClick={() => {
                onSelect(opt)
                setOpen(false)
              }}
              className={cn(
                'flex size-5 items-center justify-center rounded-md transition-transform hover:scale-110 cursor-pointer',
                statusChipClasses(opt),
              )}
            >
              <StatusIcon status={opt} />
            </button>
          ))}
          {onDelete && (
            <button
              type="button"
              title="Versuch löschen"
              onClick={() => {
                onDelete()
                setOpen(false)
              }}
              className="ml-2 flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
            >
              <Icon name="delete" size={16} />
            </button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

export const StatusCell = ({
  status,
  onSelect,
  onDelete,
  readOnly = false,
}: {
  status: Status | undefined
  onSelect: (s: Status | undefined) => void
  /** Zeigt einen Löschen-Button im Flyout, um diesen Versuch komplett zu entfernen. */
  onDelete?: () => void
  readOnly?: boolean
}) => {
  if (readOnly) {
    return (
      <div className="flex justify-center">
        <span
          title={STATUS_LABEL[status ?? 'none']}
          className={cn(
            'flex size-5 items-center justify-center rounded-md opacity-80',
            statusChipClasses(status),
          )}
        >
          <StatusIcon status={status} />
        </span>
      </div>
    )
  }

  return (
    <HoverStatusPicker
      onSelect={onSelect}
      onDelete={onDelete}
      triggerTitle={STATUS_LABEL[status ?? 'none']}
      side="bottom"
      triggerClassName={cn(
        'flex size-5 items-center justify-center rounded-md transition-all hover:scale-110 active:scale-95 cursor-pointer hover:brightness-95 dark:hover:brightness-110 focus-visible:outline-none',
        statusChipClasses(status),
      )}
    >
      <StatusIcon status={status} />
    </HoverStatusPicker>
  )
}
