'use client'

import { cn } from '@/lib/utils'
import type { Schueler, Thema, Lernziel, Fach, Status } from '@/types/domain'
import { STATUS_LABELS } from '@/types/domain'

// ── Helpers ──────────────────────────────────────────────────────────────

function statusScore(s: Status): number {
  return s === 'reached' ? 1 : s === 'partially_reached' ? 0.5 : 0
}

// ── Distribution bar ─────────────────────────────────────────────────────

function DistributionBar({
  reached,
  partial,
  total,
}: {
  reached: number
  partial: number
  total: number
}) {
  if (total === 0) return null
  const rPct = (reached / total) * 100
  const pPct = (partial / total) * 100
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full bg-foreground transition-all" style={{ width: `${rPct}%` }} />
      <div className="h-full bg-foreground/30 transition-all" style={{ width: `${pPct}%` }} />
    </div>
  )
}

// ── Heat map ─────────────────────────────────────────────────────────────

const CELL_COLOR: Record<Status, string> = {
  reached: 'bg-foreground',
  partially_reached: 'bg-foreground/30',
  not_reached: 'bg-muted',
}

function HeatMap({
  students,
  lernziele,
}: {
  students: Schueler[]
  lernziele: Lernziel[]
}) {
  if (students.length === 0 || lernziele.length === 0) return null
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="px-3 py-1.5 text-left font-medium text-muted-foreground whitespace-nowrap">
              Schüler
            </th>
            {lernziele.map((lz) => (
              <th
                key={lz.id}
                className="px-2 py-1.5 font-normal text-muted-foreground text-center"
                style={{ maxWidth: 72 }}
              >
                <span
                  className="block truncate"
                  style={{ maxWidth: 72 }}
                  title={lz.label}
                >
                  {lz.label.length > 16 ? lz.label.slice(0, 16) + '…' : lz.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="border-t border-border hover:bg-muted/30">
              <td className="px-3 py-2 text-sm whitespace-nowrap">{student.name}</td>
              {lernziele.map((lz) => {
                const status = student.lernzielStatus[lz.id] ?? 'not_reached'
                return (
                  <td key={lz.id} className="px-2 py-2 text-center">
                    <span
                      className={cn('inline-block size-3 rounded-sm', CELL_COLOR[status])}
                      title={STATUS_LABELS[status]}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Thema section ─────────────────────────────────────────────────────────

function ThemaSection({
  thema,
  fach,
  lernziele,
  students,
}: {
  thema: Thema
  fach: Fach | undefined
  lernziele: Lernziel[]
  students: Schueler[]
}) {
  const n = students.length
  return (
    <div className="rounded-lg border border-border p-4 space-y-4">
      <div>
        {fach && <p className="text-xs text-muted-foreground">{fach.name}</p>}
        <h3 className="text-sm font-semibold">{thema.name}</h3>
      </div>

      {lernziele.length === 0 ? (
        <p className="text-xs text-muted-foreground">Keine Lernziele vorhanden.</p>
      ) : (
        <>
          <div className="space-y-3">
            {lernziele.map((lz) => {
              const reached = students.filter(
                (s) => s.lernzielStatus[lz.id] === 'reached',
              ).length
              const partial = students.filter(
                (s) => s.lernzielStatus[lz.id] === 'partially_reached',
              ).length
              const notReached = n - reached - partial
              return (
                <div key={lz.id} className="space-y-1.5">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-sm">{lz.label}</span>
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                      {reached} / {n}
                    </span>
                  </div>
                  <DistributionBar reached={reached} partial={partial} total={n} />
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{reached} erreicht</span>
                    {partial > 0 && <span>{partial} teilweise</span>}
                    {notReached > 0 && <span>{notReached} nicht erreicht</span>}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
              Heatmap
            </p>
            <HeatMap students={students} lernziele={lernziele} />
          </div>
        </>
      )}
    </div>
  )
}

// ── Summary stats ─────────────────────────────────────────────────────────

function SummaryStats({
  students,
  lernziele,
}: {
  students: Schueler[]
  lernziele: Lernziel[]
}) {
  if (students.length === 0) return null

  let totalScore = 0
  let totalItems = 0
  let atRiskCount = 0

  students.forEach((s) => {
    let score = 0
    lernziele.forEach((lz) => {
      score += statusScore(s.lernzielStatus[lz.id] ?? 'not_reached')
    })
    totalScore += score
    totalItems += lernziele.length
    if (lernziele.length > 0 && score / lernziele.length < 0.25) atRiskCount++
  })

  const avgPct = totalItems === 0 ? 0 : Math.round((totalScore / totalItems) * 100)

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg border border-border p-4">
        <p className="text-2xl font-bold">{students.length}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Schüler</p>
      </div>
      <div className="rounded-lg border border-border p-4">
        <p className="text-2xl font-bold">{avgPct}%</p>
        <p className="text-xs text-muted-foreground mt-0.5">⌀ Lernziele erreicht</p>
      </div>
      <div className="rounded-lg border border-border p-4">
        <p className="text-2xl font-bold">{atRiskCount}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {atRiskCount === 1 ? 'Kind' : 'Kinder'} mit Förderbedarf
        </p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────

interface ClassAnalyticsProps {
  students: Schueler[]
  themen: Thema[]
  lernziele: Lernziel[]
  faecher: Fach[]
}

export function ClassAnalytics({ students, themen, lernziele, faecher }: ClassAnalyticsProps) {
  if (students.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Noch keine Schüler in dieser Klasse.</p>
    )
  }

  if (themen.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Dieser Klasse sind noch keine Themen zugewiesen.
      </p>
    )
  }

  const themenData = themen.map((t) => ({
    thema: t,
    fach: faecher.find((f) => f.id === t.fachId),
    lernziele: lernziele.filter((lz) => lz.themaId === t.id),
  }))

  const allLernziele = themenData.flatMap((t) => t.lernziele)

  return (
    <div className="space-y-6">
      <SummaryStats students={students} lernziele={allLernziele} />
      {themenData.map(({ thema, fach, lernziele: tzLernziele }) => (
        <ThemaSection
          key={thema.id}
          thema={thema}
          fach={fach}
          lernziele={tzLernziele}
          students={students}
        />
      ))}
    </div>
  )
}
