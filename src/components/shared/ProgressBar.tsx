import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type ProgressSegment = {
  value: number
  className: string
  label?: ReactNode
}

const SIZE_CLASSES = {
  xxs: 'h-1',
  xs: 'h-1.5',
  sm: 'h-2',
  md: 'h-2.5',
  lg: 'h-3',
} as const

export const ProgressBar = ({
  segments,
  total,
  size = 'xs',
  rounded = true,
  trackClassName = 'bg-muted',
  legend,
  emptyFallback,
  className,
}: {
  segments: ProgressSegment[]
  total?: number
  size?: keyof typeof SIZE_CLASSES
  rounded?: boolean
  trackClassName?: string
  legend?: { label: ReactNode; className: string }[]
  emptyFallback?: ReactNode
  className?: string
}) => {
  const sum = total ?? segments.reduce((acc, s) => acc + s.value, 0)

  if (sum <= 0) {
    return emptyFallback ?? (
      <div className={cn(SIZE_CLASSES[size], 'w-full', rounded && 'rounded-full', trackClassName, className)} />
    )
  }

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          'flex w-full overflow-hidden',
          SIZE_CLASSES[size],
          rounded && 'rounded-full',
          trackClassName,
          className,
        )}
      >
        {segments.map((seg, i) => {
          const pct = Math.min(Math.max((seg.value / sum) * 100, 0), 100)
          if (pct <= 0) return null
          return (
            <div
              key={i}
              className={cn('h-full transition-all', seg.label && 'flex items-center justify-center', seg.className)}
              style={{ width: `${pct}%` }}
            >
              {seg.label && pct > 10 && seg.label}
            </div>
          )
        })}
      </div>
      {legend && (
        <div className="flex gap-4 text-xs text-muted-foreground">
          {legend.map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className={cn('inline-block size-1.5 shrink-0', item.className)} />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
