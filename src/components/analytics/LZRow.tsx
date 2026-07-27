'use client'

import { cn, scoreColor, categoryChipClasses, weightedPct } from '@/lib/utils'
import { ProgressBar } from '@/components/shared/ProgressBar'
import type { LernzielKategorie } from '@/types/domain'

// Eine Lernziel-Zeile der Thema-Statistik (erreicht/teilweise über die Klasse).
export const LZRow = ({
  label, kategorie, reached, partial, total,
}: {
  label: string
  kategorie: LernzielKategorie
  reached: number
  partial: number
  total: number
}) => {
  const pct = weightedPct(reached, partial, total)
  return (
    <div className="py-1.5 px-2 hover:bg-accent transition-colors">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className={cn(
            'shrink-0 rounded px-1 py-0.5 text-4xs font-bold leading-none',
            categoryChipClasses(kategorie),
          )}>
            {kategorie === 'grundlegend' ? 'G' : 'A'}
          </span>
          <span className="text-xs truncate">{label}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-xs">
          <span className="text-3xs tabular-nums text-muted-foreground">
            <span className="text-status-reached font-medium">{reached}</span>/{total}
          </span>
          <span className={cn('font-bold tabular-nums w-8 text-right', scoreColor(pct))}>{pct}%</span>
        </div>
      </div>
      <ProgressBar segments={[{ value: pct, className: 'bg-primary' }]} total={100} size="xxs" />
    </div>
  )
}
