'use client'

import type { Schueler, Thema, Lernziel, Fach, StatusSnapshot } from '@/types/domain'

// ── Helpers ───────────────────────────────────────────────────────────────

function calcPct(snap: StatusSnapshot, allIds: string[]): number {
  // Use the snapshot's active pool when set (models mid-semester thema introductions)
  const ids = snap.activeLzIds
    ? allIds.filter(id => snap.activeLzIds!.includes(id))
    : allIds
  if (ids.length === 0) return 0
  const reached = ids.filter((id) => snap.lernzielStatus[id] === 'reached').length
  const partial = ids.filter((id) => snap.lernzielStatus[id] === 'partially_reached').length
  return Math.round(((reached + partial * 0.5) / ids.length) * 100)
}

function formatLabel(iso: string): string {
  const [, mm, dd] = iso.split('-')
  return `${dd}.${mm}.`
}

// ── Chart ─────────────────────────────────────────────────────────────────

const FACH_COLORS: Record<string, string> = {
  Deutsch:     '#6366f1',
  Mathematik:  '#f59e0b',
  NMG:         '#10b981',
  Französisch: '#ec4899',
}
const FALLBACK_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#0ea5e9', '#8b5cf6']

const PAD = { top: 16, right: 12, bottom: 30, left: 36 }
const W = 480
const H = 180
const innerW = W - PAD.left - PAD.right
const innerH = H - PAD.top - PAD.bottom

function getColor(label: string, si: number): string {
  return FACH_COLORS[label] ?? FALLBACK_COLORS[si % FALLBACK_COLORS.length]
}

function TrendChart({
  snapshots,
  series,
}: {
  snapshots: StatusSnapshot[]
  series: { label: string; lernzieleIds: string[] }[]
}) {
  const n = snapshots.length
  if (n < 2) {
    return (
      <p className="py-6 text-center text-xs text-muted-foreground">
        Verlauf wird sichtbar, sobald zwei Einträge vorhanden sind.
      </p>
    )
  }

  const xPos = (i: number) => PAD.left + (i / (n - 1)) * innerW
  const yPos = (pct: number) => PAD.top + innerH - (pct / 100) * innerH

  // Show at most 6 X-axis labels, always include first and last
  const step = Math.max(1, Math.ceil((n - 1) / 5))
  const labelSet = new Set<number>()
  for (let i = 0; i < n; i += step) labelSet.add(i)
  labelSet.add(n - 1)

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden>
        {/* Y gridlines at 0, 25, 50, 75, 100% */}
        {[0, 25, 50, 75, 100].map((pct) => (
          <g key={pct}>
            <line
              x1={PAD.left} y1={yPos(pct)}
              x2={W - PAD.right} y2={yPos(pct)}
              stroke="currentColor"
              strokeOpacity={pct === 0 ? 0.12 : 0.07}
              strokeDasharray={pct === 0 ? undefined : '3 3'}
            />
            <text
              x={PAD.left - 5} y={yPos(pct)}
              textAnchor="end" dominantBaseline="middle"
              fontSize={8.5} fill="currentColor" fillOpacity={0.38}
            >
              {pct}%
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {snapshots.map((snap, i) =>
          labelSet.has(i) ? (
            <text
              key={i}
              x={xPos(i)} y={H - 5}
              textAnchor="middle"
              fontSize={8.5} fill="currentColor" fillOpacity={0.45}
            >
              {i === n - 1 ? 'Heute' : formatLabel(snap.date)}
            </text>
          ) : null
        )}

        {/* One line per Fach */}
        {series.map(({ label, lernzieleIds }, si) => {
          const color = getColor(label, si)
          const pts = snapshots.map((snap, i) => [
            xPos(i),
            yPos(calcPct(snap, lernzieleIds)),
          ] as [number, number])
          const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
          return (
            <g key={si}>
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={i === n - 1 ? 4 : 2.5} fill={color} />
              ))}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {series.map(({ label }, si) => (
          <div key={si} className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ background: getColor(label, si) }}
            />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────

interface StudentVerlaufProps {
  student: Schueler
  assignedThemen: Thema[]
  lernziele: Lernziel[]
  faecher: Fach[]
}

export function StudentVerlauf({ student, assignedThemen, lernziele, faecher }: StudentVerlaufProps) {
  if (assignedThemen.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Keine Themen zugewiesen – kein Verlauf verfügbar.
      </p>
    )
  }

  const fachSeries = faecher
    .map((fach) => {
      const fachThemen = assignedThemen.filter((t) => t.fachId === fach.id)
      const ids = fachThemen.flatMap((t) =>
        lernziele.filter((lz) => lz.themaId === t.id).map((lz) => lz.id)
      )
      if (ids.length === 0) return null
      return { label: fach.name, lernzieleIds: ids }
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)

  const history = student.progressHistory ?? []
  const currentSnapshot: StatusSnapshot = {
    date: new Date().toISOString().slice(0, 10),
    lernzielStatus: student.lernzielStatus,
  }
  const allSnapshots = [...history, currentSnapshot]

  return <TrendChart snapshots={allSnapshots} series={fachSeries} />
}
