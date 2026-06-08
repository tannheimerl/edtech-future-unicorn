'use client'

import type { FachKpi } from '@/lib/student-kpis'

const FACH_HEX: Record<string, string> = {
  Deutsch:     '#6366f1',
  Mathematik:  '#f59e0b',
  NMG:         '#10b981',
  Französisch: '#ec4899',
}
const FALLBACK = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#0ea5e9']

const ROW_H = 48
const LABEL_W = 92
const PCT_W = 36
const BAR_H = 12
const BAR_Y_OFFSET = 10
const PAD_RIGHT = 8

interface Props {
  fachKpis: FachKpi[]
}

export function FachStatusChart({ fachKpis }: Props) {
  if (fachKpis.length === 0) {
    return <p className="text-sm text-muted-foreground">Keine Fächer vorhanden.</p>
  }

  const W = 400
  const H = fachKpis.length * ROW_H
  const innerW = W - LABEL_W - PCT_W - PAD_RIGHT

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden>
      {fachKpis.map(({ fach, pct, reached, partial, total, gPct, aPct, gTotal, aTotal }, i) => {
        const color = FACH_HEX[fach.name] ?? FALLBACK[i % FALLBACK.length]
        const y = i * ROW_H
        const barY = y + BAR_Y_OFFSET
        const reachedW = total > 0 ? (reached / total) * innerW : 0
        const partialW = total > 0 ? (partial / total) * innerW : 0

        return (
          <g key={fach.id}>
            {/* Fach label */}
            <text
              x={0} y={barY + BAR_H / 2}
              dominantBaseline="middle"
              fontSize={11} fontWeight="600"
              fill="currentColor" fillOpacity={0.75}
            >
              {fach.name}
            </text>

            {/* Background bar */}
            <rect
              x={LABEL_W} y={barY}
              width={innerW} height={BAR_H}
              rx={4} ry={4}
              fill="currentColor" fillOpacity={0.07}
            />

            {/* Reached segment */}
            {reachedW > 0 && (
              <rect
                x={LABEL_W} y={barY}
                width={reachedW} height={BAR_H}
                rx={4} ry={4}
                fill={color}
              />
            )}

            {/* Partial segment */}
            {partialW > 0 && (
              <rect
                x={LABEL_W + reachedW} y={barY}
                width={partialW} height={BAR_H}
                rx={0} ry={0}
                fill={color} fillOpacity={0.38}
              />
            )}

            {/* Percentage label */}
            <text
              x={LABEL_W + innerW + 6} y={barY + BAR_H / 2}
              dominantBaseline="middle"
              fontSize={11} fontWeight="700"
              fill="currentColor" fillOpacity={0.8}
            >
              {pct}%
            </text>

            {/* G / A sub-labels */}
            <text
              x={LABEL_W} y={barY + BAR_H + 9}
              fontSize={8.5} fill="currentColor" fillOpacity={0.45}
            >
              {gTotal > 0 ? `G: ${gPct}%` : ''}
              {gTotal > 0 && aTotal > 0 ? '  ·  ' : ''}
              {aTotal > 0 ? `A: ${aPct}%` : ''}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
