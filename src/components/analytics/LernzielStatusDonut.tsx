'use client'

const R = 44
const CX = 60
const CY = 60
const STROKE = 17
const CIRC = 2 * Math.PI * R

const COLOR_REACHED = '#10b981'
const COLOR_PARTIAL = '#f59e0b'
const COLOR_NONE    = '#e5e7eb'

interface Props {
  reached: number
  partial: number
  notReached: number
  gesamtPct: number
}

export function LernzielStatusDonut({ reached, partial, notReached, gesamtPct }: Props) {
  const total = reached + partial + notReached
  if (total === 0) return null

  const rLen = (reached / total) * CIRC
  const pLen = (partial / total) * CIRC
  const nLen = (notReached / total) * CIRC

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col items-center">
      <h2 className="text-sm font-semibold self-start mb-3">Übersicht</h2>
      <svg viewBox="0 0 120 120" className="w-full max-w-[140px]" aria-hidden>
        <g transform={`rotate(-90, ${CX}, ${CY})`}>
          {/* background track */}
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={COLOR_NONE}
            strokeWidth={STROKE}
          />
          {/* reached */}
          {rLen > 0 && (
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={COLOR_REACHED}
              strokeWidth={STROKE}
              strokeDasharray={`${rLen.toFixed(2)} ${CIRC}`}
              strokeDashoffset="0"
              strokeLinecap="butt"
            />
          )}
          {/* partial */}
          {pLen > 0 && (
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={COLOR_PARTIAL}
              strokeWidth={STROKE}
              strokeDasharray={`${pLen.toFixed(2)} ${CIRC}`}
              strokeDashoffset={`${-rLen}`}
              strokeLinecap="butt"
            />
          )}
        </g>
        {/* center label */}
        <text x={CX} y={CY - 5} textAnchor="middle" dominantBaseline="middle" fontSize={22} fontWeight="700" fill="currentColor">
          {gesamtPct}%
        </text>
        <text x={CX} y={CY + 14} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="currentColor" fillOpacity={0.45}>
          Gesamt
        </text>
      </svg>

      <div className="mt-3 w-full space-y-1.5">
        <LegendRow color={COLOR_REACHED} label="Erreicht" count={reached} total={total} />
        <LegendRow color={COLOR_PARTIAL} label="Teilweise" count={partial} total={total} />
        <LegendRow color={COLOR_NONE}    label="Nicht erreicht" count={notReached} total={total} border />
      </div>
    </div>
  )
}

function LegendRow({ color, label, count, total, border }: {
  color: string; label: string; count: number; total: number; border?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-2 rounded-full shrink-0" style={{ background: color, outline: border ? '1px solid #d1d5db' : undefined }} />
      <span className="text-xs text-muted-foreground flex-1">{label}</span>
      <span className="text-xs font-medium tabular-nums">{count}</span>
    </div>
  )
}
