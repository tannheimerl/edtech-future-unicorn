import { cn } from '@/lib/utils'

interface LzCountClusterProps {
  g: number
  a: number
  className?: string
}

export function LzCountCluster({ g, a, className }: LzCountClusterProps) {
  return (
    <span className={cn('flex items-center gap-0.5 shrink-0', className)}>
      <span className={cn(
        'rounded px-1 text-[9px] font-semibold tabular-nums',
        g > 0 ? 'bg-sky-100 text-sky-700' : 'text-muted-foreground/30',
      )}>
        G:{g}
      </span>
      <span className={cn(
        'rounded px-1 text-[9px] font-semibold tabular-nums',
        a > 0 ? 'bg-amber-100 text-amber-700' : 'text-muted-foreground/30',
      )}>
        A:{a}
      </span>
    </span>
  )
}
