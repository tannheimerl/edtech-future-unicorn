'use client'

import { cn, categoryChipClasses } from '@/lib/utils'
import { StatusCell } from '@/components/shared/StatusCell'
import type { Lernziel, Status } from '@/types/domain'

// Eine Lernziel-Zeile der Einzelschüler-Statistik (readonly Status).
export const LZStudentRow = ({ lz, status, skipped }: {
  lz: Lernziel
  status: Status | undefined
  skipped: boolean
}) => {
  return (
    <div className={cn('py-2 px-3 flex items-center justify-between gap-3', skipped && 'opacity-40')}>
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <span className={cn(
          'shrink-0 rounded px-1 py-0.5 text-4xs font-bold leading-none',
          categoryChipClasses(lz.kategorie),
        )}>
          {lz.kategorie === 'grundlegend' ? 'G' : 'A'}
        </span>
        <span className="text-xs truncate">{lz.label}</span>
        {skipped && <span className="text-4xs text-rilz-foreground font-medium shrink-0">(RILZ)</span>}
      </div>
      {!skipped && <StatusCell status={status} readOnly onSelect={() => {}} />}
    </div>
  )
}
