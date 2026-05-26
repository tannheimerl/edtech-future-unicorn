'use client'

import { Fragment } from 'react'
import type { Schueler, Thema, Lernziel, Fach, StatusSnapshot, Status } from '@/types/domain'

// ── Helpers ──────────────────────────────────────────────────────────────

function calcPct(snap: Pick<StatusSnapshot, 'lernzielStatus'>, ids: string[]): number {
  if (ids.length === 0) return 0
  const reached = ids.filter((id) => snap.lernzielStatus[id] === 'reached').length
  const partial = ids.filter((id) => snap.lernzielStatus[id] === 'partially_reached').length
  return ((reached + partial * 0.5) / ids.length) * 100
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })
}

// ── Progress bars per thema ───────────────────────────────────────────────

function ThemaProgress({
  label,
  fachName,
  reached,
  partial,
  total,
}: {
  label: string
  fachName?: string
  reached: number
  partial: number
  total: number
}) {
  if (total === 0) return null
  const rPct = (reached / total) * 100
  const pPct = (partial / total) * 100
  const notReached = total - reached - partial
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end gap-4">
        <div>
          {fachName && <p className="text-xs text-muted-foreground">{fachName}</p>}
          <p className="text-sm font-medium">{label}</p>
        </div>
        <span className="text-sm font-semibold tabular-nums shrink-0">
          {reached} / {total}
        </span>
      </div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-foreground transition-all" style={{ width: `${rPct}%` }} />
        <div className="h-full bg-foreground/30 transition-all" style={{ width: `${pPct}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">
        {reached} erreicht · {partial} teilweise · {notReached} nicht erreicht
      </p>
    </div>
  )
}

// ── SVG sparkline chart ───────────────────────────────────────────────────

const COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6']
const PAD = { top: 12, right: 12, bottom: 28, left: 36 }
const W = 400
const H = 120
const innerW = W - PAD.left - PAD.right
const innerH = H - PAD.top - PAD.bottom

function VerlaufChart({
  snapshots,
  series,
}: {
  snapshots: StatusSnapshot[]
  series: { label: string; lernzieleIds: string[] }[]
}) {
  const n = snapshots.length
  if (n < 2) return null

  const xPos = (i: number) => PAD.left + (i / (n - 1)) * innerW
  const yPos = (pct: number) => PAD.top + innerH - (pct / 100) * innerH

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ maxWidth: 500 }}
        aria-hidden
      >
        {/* Y grid lines */}
        {[0, 50, 100].map((pct) => (
          <g key={pct}>
            <line
              x1={PAD.left}
              y1={yPos(pct)}
              x2={W - PAD.right}
              y2={yPos(pct)}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeDasharray="4 3"
            />
            <text
              x={PAD.left - 6}
              y={yPos(pct)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={9}
              fill="currentColor"
              fillOpacity={0.45}
            >
              {pct}%
            </text>
          </g>
        ))}

        {/* X axis labels */}
        {snapshots.map((snap, i) => (
          <text
            key={i}
            x={xPos(i)}
            y={H - 6}
            textAnchor="middle"
            fontSize={9}
            fill="currentColor"
            fillOpacity={0.5}
          >
            {i === n - 1 ? 'Heute' : formatDate(snap.date)}
          </text>
        ))}

        {/* Series */}
        {series.map(({ lernzieleIds }, si) => {
          const color = COLORS[si % COLORS.length]
          const pts = snapshots.map((snap, i) => [xPos(i), yPos(calcPct(snap, lernzieleIds))] as [number, number])
          const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
          return (
            <g key={si}>
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={3.5} fill={color} />
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
              style={{ background: COLORS[si % COLORS.length] }}
            />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Status dot row (fallback for single-point data) ───────────────────────

function SnapDot({ status }: { status: Status }) {
  const cls =
    status === 'reached'
      ? 'bg-foreground'
      : status === 'partially_reached'
        ? 'bg-foreground/30'
        : 'bg-muted border border-border'
  return <span className={`inline-block size-2.5 rounded-full ${cls}`} />
}

// ── Main component ────────────────────────────────────────────────────────

interface StudentVerlaufProps {
  student: Schueler
  assignedThemen: Thema[]
  lernziele: Lernziel[]
  faecher: Fach[]
}

export function StudentVerlauf({
  student,
  assignedThemen,
  lernziele,
  faecher,
}: StudentVerlaufProps) {
  if (assignedThemen.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Keine Themen zugewiesen – kein Verlauf verfügbar.
      </p>
    )
  }

  const themenData = assignedThemen.map((t) => {
    const tzLernziele = lernziele.filter((lz) => lz.themaId === t.id)
    return {
      thema: t,
      fach: faecher.find((f) => f.id === t.fachId),
      lernziele: tzLernziele,
      lernzieleIds: tzLernziele.map((lz) => lz.id),
    }
  })

  // Full timeline: historical snapshots + current state
  const history = student.progressHistory ?? []
  const currentSnapshot: StatusSnapshot = {
    date: new Date().toISOString().slice(0, 10),
    lernzielStatus: student.lernzielStatus,
  }
  const allSnapshots = [...history, currentSnapshot]

  const chartSeries = themenData.map(({ thema, lernzieleIds }) => ({
    label: thema.name,
    lernzieleIds,
  }))

  return (
    <div className="space-y-8">
      {/* Current progress per thema */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-4">
          Aktueller Stand
        </p>
        <div className="space-y-4">
          {themenData.map(({ thema, fach, lernziele: tzLz, lernzieleIds }) => {
            const reached = lernzieleIds.filter(
              (id) => student.lernzielStatus[id] === 'reached',
            ).length
            const partial = lernzieleIds.filter(
              (id) => student.lernzielStatus[id] === 'partially_reached',
            ).length
            return (
              <ThemaProgress
                key={thema.id}
                label={thema.name}
                fachName={fach?.name}
                reached={reached}
                partial={partial}
                total={tzLz.length}
              />
            )
          })}
        </div>
      </div>

      {/* Timeline chart (only when history exists) */}
      {history.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-4">
            Verlauf über Zeit
          </p>
          <VerlaufChart snapshots={allSnapshots} series={chartSeries} />
        </div>
      )}

      {/* Snapshot table (when history exists) */}
      {history.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
            Verlauf im Detail
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">
                    Lernziel
                  </th>
                  {history.map((snap) => (
                    <th
                      key={snap.date}
                      className="px-3 py-1.5 text-center font-normal text-muted-foreground"
                    >
                      {formatDate(snap.date)}
                    </th>
                  ))}
                  <th className="px-3 py-1.5 text-center font-medium text-foreground">
                    Heute
                  </th>
                </tr>
              </thead>
              <tbody>
                {themenData.map(({ thema, fach, lernziele: tzLz }) => (
                  <Fragment key={thema.id}>
                    <tr className="border-t border-border">
                      <td
                        colSpan={history.length + 2}
                        className="px-3 py-1.5 bg-muted/40"
                      >
                        {fach && (
                          <span className="text-muted-foreground">{fach.name} / </span>
                        )}
                        <span className="font-medium">{thema.name}</span>
                      </td>
                    </tr>
                    {tzLz.map((lz) => (
                      <tr key={lz.id} className="border-t border-border hover:bg-muted/20">
                        <td className="px-3 py-2 text-sm">{lz.label}</td>
                        {history.map((snap) => (
                          <td key={snap.date} className="px-3 py-2 text-center">
                            <SnapDot status={snap.lernzielStatus[lz.id] ?? 'not_reached'} />
                          </td>
                        ))}
                        <td className="px-3 py-2 text-center">
                          <SnapDot
                            status={student.lernzielStatus[lz.id] ?? 'not_reached'}
                          />
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
