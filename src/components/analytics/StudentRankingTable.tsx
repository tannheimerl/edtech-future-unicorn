'use client'

import React from 'react'
import { cn, scoreColor, fullName } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/shared/ProgressBar'
import type { Schueler } from '@/types/domain'

export type StudentSort = 'score' | 'name'
export type ScoredStudent = Schueler & { score: number; allScore: number }

const ColHeader = ({ field, sort, onSortChange, children }: {
  field: StudentSort
  sort: StudentSort
  onSortChange: (s: StudentSort) => void
  children: React.ReactNode
}) => {
  return (
    <Button
      onClick={() => onSortChange(field)}
      variant="secondary"
      className={cn(
        'h-auto border-transparent bg-transparent px-0 font-mono text-4xs uppercase tracking-widest hover:bg-transparent',
        sort === field ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}{sort === field ? ' ↓' : ''}
    </Button>
  )
}

export const StudentRankingTable = ({
  students, sort, onSortChange, onRowClick,
}: {
  students: ScoredStudent[]
  sort: StudentSort
  onSortChange: (s: StudentSort) => void
  onRowClick?: (studentId: string) => void
}) => {
  const sorted = [...students].sort(
    sort === 'score'
      ? (a, b) => b.score - a.score
      : (a, b) => fullName(a).localeCompare(fullName(b)),
  )

  return (
    <div className="overflow-y-auto max-h-[380px]">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 bg-card z-10 border-b border-border">
          <tr>
            <th className="py-2 px-3 text-left text-4xs font-mono uppercase tracking-widest text-muted-foreground w-8">#</th>
            <th className="py-2 px-2 text-left"><ColHeader field="name" sort={sort} onSortChange={onSortChange}>Name</ColHeader></th>
            <th className="py-2 px-2 text-right"><ColHeader field="score" sort={sort} onSortChange={onSortChange}>Score</ColHeader></th>
            <th className="py-2 px-2 w-20"></th>
            <th className="py-2 px-3 w-14"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s, i) => {
            const pct = Math.round(s.score)
            return (
              <tr
                key={s.id}
                className={cn('border-b border-border hover:bg-accent transition-colors', onRowClick && 'cursor-pointer')}
                onClick={() => onRowClick?.(s.id)}
              >
                <td className="py-2 px-3">
                  <span className="inline-flex items-center justify-center size-5 rounded text-3xs font-bold tabular-nums bg-muted text-muted-foreground">
                    {i + 1}
                  </span>
                </td>
                <td className="py-2 px-2 text-sm font-medium">{fullName(s)}</td>
                <td className={cn('py-2 px-2 text-right tabular-nums text-sm font-bold', scoreColor(pct))}>{pct}%</td>
                <td className="py-2 px-2"><ProgressBar segments={[{ value: pct, className: 'bg-primary' }]} total={100} size="xs" /></td>
                <td className="py-2 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {s.rilzFachIds?.length
                      ? <span className="text-4xs font-bold bg-rilz-soft text-rilz-foreground rounded px-1 py-0.5">RILZ</span>
                      : null}
                    {s.bvsa
                      ? <span className="text-4xs font-bold bg-primary/10 text-primary rounded px-1 py-0.5">bVSA</span>
                      : null}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
