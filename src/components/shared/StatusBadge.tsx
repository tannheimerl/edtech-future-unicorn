import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Status } from '@/types/domain'
import { STATUS_LABELS } from '@/types/domain'

const STATUS_VARIANT: Record<Status, 'default' | 'secondary' | 'outline'> = {
  reached: 'default',
  partially_reached: 'secondary',
  not_reached: 'outline',
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className={cn('shrink-0', className)}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
