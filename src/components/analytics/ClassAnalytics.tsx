'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Schueler, Thema, Lernziel, LernzielKategorie, Fach, Kompetenz, Status } from '@/types/domain'
import { STATUS_LABELS } from '@/types/domain'

// ── Helpers ────────────────────────────────────────────────────────────────

function sv(status: Status): number {
  return status === 'reached' ? 1 : status === 'partially_reached' ? 0.5 : 0
}

function studentLZScore(student: Schueler, ids: string[]): number {
  if (ids.length === 0) return 0
  return (ids.reduce((sum, id) => sum + sv(student.lernzielStatus[id] ?? 'not_reached'), 0) / ids.length) * 100
}

function isSpecial(s: Schueler): boolean {
  return !!(s.bvsa || s.rilzFachIds?.length)
}

function isLZSkipped(lz: Lernziel, student: Schueler, themen: Thema[]): boolean {
  if (lz.kategorie !== 'anspruchsvoll') return false
  if (!student.rilzFachIds?.length) return false
  const thema = themen.find(t => t.id === lz.themaId)
  return !!thema && student.rilzFachIds.includes(thema.fachId)
}

function studentLZScoreAdjusted(student: Schueler, lzList: Lernziel[], themen: Thema[]): number {
  const applicable = lzList.filter(lz => !isLZSkipped(lz, student, themen))
  if (applicable.length === 0) return 0
  return (applicable.reduce((sum, lz) => sum + sv(student.lernzielStatus[lz.id] ?? 'not_reached'), 0) / applicable.length) * 100
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })
}

type Tier = 'all' | 'excellent' | 'progressing' | 'struggling'
type KatFilter = 'all' | 'grundlegend' | 'anspruchsvoll'

// ── Filter bar ─────────────────────────────────────────────────────────────

const TIER_LABELS: Record<Tier, string> = {
  all: 'Alle Schüler',
  excellent: 'Sehr gut ≥75%',
  progressing: 'Im Aufbau 25–74%',
  struggling: 'Förderbedarf <25%',
}

const KAT_LABELS: Record<KatFilter, string> = {
  all: 'Alle',
  grundlegend: 'Grundlegend',
  anspruchsvoll: 'Anspruchsvoll',
}

const SELECT_STYLE = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 10px center' as const,
}

const SELECT_CLS = 'h-9 rounded-lg border border-border bg-card px-3 pr-8 text-sm font-medium text-foreground shadow-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'

function FilterBar({
  faecher,
  selectedFachId,
  onFachChange,
  tier,
  onTierChange,
  katFilter,
  onKatChange,
}: {
  faecher: Fach[]
  selectedFachId: string | null
  onFachChange: (id: string | null) => void
  tier: Tier
  onTierChange: (t: Tier) => void
  katFilter: KatFilter
  onKatChange: (k: KatFilter) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {faecher.length > 1 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground shrink-0">Fach</span>
          <select
            value={selectedFachId ?? ''}
            onChange={e => onFachChange(e.target.value || null)}
            className={SELECT_CLS}
            style={SELECT_STYLE}
          >
            <option value="">Alle</option>
            {faecher.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground shrink-0">Schüler</span>
        <select
          value={tier}
          onChange={e => onTierChange(e.target.value as Tier)}
          className={SELECT_CLS}
          style={SELECT_STYLE}
        >
          {(['all', 'excellent', 'progressing', 'struggling'] as Tier[]).map(t => (
            <option key={t} value={t}>{TIER_LABELS[t]}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground shrink-0">Kategorie</span>
        <div className="flex rounded-lg border border-border overflow-hidden h-9">
          {(['all', 'grundlegend', 'anspruchsvoll'] as KatFilter[]).map(k => (
            <button
              key={k}
              onClick={() => onKatChange(k)}
              className={cn(
                'px-3 text-sm font-medium transition-colors',
                katFilter === k
                  ? k === 'grundlegend' ? 'bg-sky-500 text-white'
                    : k === 'anspruchsvoll' ? 'bg-amber-500 text-white'
                    : 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted',
              )}
            >
              {KAT_LABELS[k]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Fächer-Übersicht ────────────────────────────────────────────────────────

function FachCard({
  fach, themen, lernziele, students, selected, onClick,
}: {
  fach: Fach
  themen: Thema[]
  lernziele: Lernziel[]
  students: Schueler[]
  selected: boolean
  onClick: () => void
}) {
  const fachThemen = themen.filter(t => t.fachId === fach.id)
  const fachLZ = fachThemen.flatMap(t => lernziele.filter(lz => lz.themaId === t.id))
  const regularStudents = students.filter(s => !isSpecial(s))
  const n = regularStudents.length

  const reached = fachLZ.reduce((sum, lz) => {
    const eligible = regularStudents.filter(s => !isLZSkipped(lz, s, themen))
    return sum + eligible.filter(s => s.lernzielStatus[lz.id] === 'reached').length
  }, 0)
  const partial = fachLZ.reduce((sum, lz) => {
    const eligible = regularStudents.filter(s => !isLZSkipped(lz, s, themen))
    return sum + eligible.filter(s => s.lernzielStatus[lz.id] === 'partially_reached').length
  }, 0)
  const total = fachLZ.reduce((sum, lz) =>
    sum + regularStudents.filter(s => !isLZSkipped(lz, s, themen)).length, 0)
  const avgPct = total === 0 ? 0 : Math.round(((reached + partial * 0.5) / total) * 100)

  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-2xl border p-4 text-left transition-all space-y-3 w-full',
        selected
          ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
          : 'border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-px',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm">{fach.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {fachThemen.length} {fachThemen.length === 1 ? 'Thema' : 'Themen'} · {fachLZ.length} Lernziele
          </p>
        </div>
        <span className={cn(
          'text-xl font-bold tabular-nums shrink-0',
          avgPct >= 75 ? 'text-emerald-600' : avgPct >= 25 ? 'text-amber-600' : 'text-red-500'
        )}>
          {avgPct}%
        </span>
      </div>
      <StackedBar reached={reached} partial={partial} total={total} h="h-2" />
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span className="text-emerald-600 font-medium">{reached} ✓</span>
        {partial > 0 && <span className="text-amber-600">{partial} ~</span>}
        {total - reached - partial > 0 && <span>{total - reached - partial} ✗</span>}
      </div>
    </button>
  )
}

function ThemenBreakdown({
  fach, themen, lernziele, students,
}: { fach: Fach; themen: Thema[]; lernziele: Lernziel[]; students: Schueler[] }) {
  const fachThemen = themen.filter(t => t.fachId === fach.id)
  if (fachThemen.length === 0) return null
  const regularStudents = students.filter(s => !isSpecial(s))
  return (
    <div className="space-y-3">
      {fachThemen.map(t => {
        const tzLZ = lernziele.filter(lz => lz.themaId === t.id)
        const reached = tzLZ.reduce((s, lz) => {
          const eligible = regularStudents.filter(sc => !isLZSkipped(lz, sc, themen))
          return s + eligible.filter(sc => sc.lernzielStatus[lz.id] === 'reached').length
        }, 0)
        const partial = tzLZ.reduce((s, lz) => {
          const eligible = regularStudents.filter(sc => !isLZSkipped(lz, sc, themen))
          return s + eligible.filter(sc => sc.lernzielStatus[lz.id] === 'partially_reached').length
        }, 0)
        const total = tzLZ.reduce((s, lz) =>
          s + regularStudents.filter(sc => !isLZSkipped(lz, sc, themen)).length, 0)
        const avg = total === 0 ? 0 : Math.round(((reached + partial * 0.5) / total) * 100)
        return (
          <div key={t.id} className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">{tzLZ.length} Lernziele</p>
              </div>
              <span className={cn('text-sm font-bold tabular-nums',
                avg >= 75 ? 'text-emerald-600' : avg >= 25 ? 'text-amber-600' : 'text-red-500'
              )}>
                {avg}%
              </span>
            </div>
            <StackedBar reached={reached} partial={partial} total={total} h="h-2" />
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="text-emerald-600">{reached} erreicht</span>
              {partial > 0 && <span className="text-amber-600">{partial} teilweise</span>}
              {total - reached - partial > 0 && <span>{total - reached - partial} nicht erreicht</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── KPI card ────────────────────────────────────────────────────────────────

function StatCard({ value, label, color, sub }: { value: string | number; label: string; color?: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className={cn('text-3xl font-bold tracking-tight', color ?? 'text-foreground')}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      {sub && <p className="text-xs text-muted-foreground/60 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Stacked bar ─────────────────────────────────────────────────────────────

function StackedBar({ reached, partial, total, h = 'h-2.5' }: {
  reached: number; partial: number; total: number; h?: string
}) {
  if (total === 0) return <div className={cn('rounded-full bg-muted w-full', h)} />
  const rp = (reached / total) * 100
  const pp = (partial / total) * 100
  return (
    <div className={cn('flex w-full overflow-hidden rounded-full bg-muted', h)}>
      {rp > 0 && <div style={{ width: `${rp}%` }} className="h-full bg-status-reached transition-all" />}
      {pp > 0 && <div style={{ width: `${pp}%` }} className="h-full bg-status-partial transition-all" />}
    </div>
  )
}

// ── Score row ───────────────────────────────────────────────────────────────

function ScoreRow({ rank, name, score, variant, special }: {
  rank: number; name: string; score: number; variant: 'top' | 'bottom'; special?: string
}) {
  const pct = Math.round(score)
  const barColor = variant === 'top' ? 'bg-status-reached' : 'bg-red-400'
  const textColor = variant === 'top'
    ? pct >= 75 ? 'text-emerald-600' : 'text-amber-600'
    : pct < 25 ? 'text-red-500' : 'text-amber-600'
  return (
    <div className="flex items-center gap-3 py-2 border-t border-border/50 first:border-0">
      <span className="text-xs font-mono text-muted-foreground w-4 shrink-0">{rank}</span>
      <span className="flex-1 flex items-center gap-1.5 min-w-0">
        <span className="text-sm font-medium truncate">{name}</span>
        {special && <span className="shrink-0 rounded px-1 py-0.5 text-[8px] font-bold bg-purple-100 text-purple-700">{special}</span>}
      </span>
      <div className="w-20 shrink-0">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className={cn('h-full transition-all', barColor)} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className={cn('text-xs font-semibold tabular-nums w-8 text-right shrink-0', textColor)}>
        {pct}%
      </span>
    </div>
  )
}

// ── Lernziel bar row ────────────────────────────────────────────────────────

function LZRow({ label, kategorie, reached, partial, total, highlight }: {
  label: string; kategorie: LernzielKategorie; reached: number; partial: number; total: number; highlight?: 'hard' | 'easy'
}) {
  const pct = total === 0 ? 0 : Math.round(((reached + partial * 0.5) / total) * 100)
  return (
    <div className={cn(
      'space-y-1.5 p-2.5 rounded-xl transition-colors',
      highlight === 'hard' ? 'bg-red-50/60' : highlight === 'easy' ? 'bg-emerald-50/60' : '',
    )}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {highlight === 'hard' && <span className="shrink-0 text-red-500 text-xs font-bold">↓</span>}
          {highlight === 'easy' && <span className="shrink-0 text-emerald-600 text-xs font-bold">↑</span>}
          <span className={cn(
            'shrink-0 rounded px-1 text-[8px] font-bold',
            kategorie === 'grundlegend' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700',
          )}>
            {kategorie === 'grundlegend' ? 'G' : 'A'}
          </span>
          <span className="text-xs truncate">{label}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
          <span className="text-emerald-600 font-medium">{reached}✓</span>
          {partial > 0 && <span className="text-amber-600">{partial}~</span>}
          {total - reached - partial > 0 && <span>{total - reached - partial}✗</span>}
          <span className="font-semibold text-foreground tabular-nums w-8 text-right">{pct}%</span>
        </div>
      </div>
      <StackedBar reached={reached} partial={partial} total={total} h="h-2" />
    </div>
  )
}

// ── SVG trend chart ─────────────────────────────────────────────────────────

const CP = { t: 20, r: 20, b: 30, l: 42 }
const CW = 520, CH = 120

function TrendChart({ points }: { points: { label: string; pct: number }[] }) {
  if (points.length < 2) return null
  const n = points.length
  const xp = (i: number) => CP.l + (i / (n - 1)) * (CW - CP.l - CP.r)
  const yp = (v: number) => CP.t + (1 - v / 100) * (CH - CP.t - CP.b)
  const d = points.map(({ pct }, i) => `${i === 0 ? 'M' : 'L'}${xp(i).toFixed(1)},${yp(pct).toFixed(1)}`).join(' ')
  const isUp = points[points.length - 1].pct >= points[0].pct
  const color = isUp ? '#10b981' : '#f59e0b'

  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full" aria-hidden>
      {[0, 25, 50, 75, 100].map(v => (
        <g key={v}>
          <line x1={CP.l} y1={yp(v)} x2={CW - CP.r} y2={yp(v)}
            stroke="currentColor" strokeOpacity={0.07} strokeDasharray="4 3" />
          <text x={CP.l - 6} y={yp(v)} textAnchor="end" dominantBaseline="middle"
            fontSize={9} fill="currentColor" fillOpacity={0.35}>{v}%</text>
        </g>
      ))}
      {points.map(({ label }, i) => (
        <text key={i} x={xp(i)} y={CH - 4} textAnchor="middle"
          fontSize={8.5} fill="currentColor" fillOpacity={0.5}>{label}</text>
      ))}
      <path
        d={`${d} L${xp(n - 1).toFixed(1)},${yp(0).toFixed(1)} L${xp(0).toFixed(1)},${yp(0).toFixed(1)} Z`}
        fill={color} fillOpacity={0.08}
      />
      <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map(({ pct }, i) => (
        <g key={i}>
          <circle cx={xp(i)} cy={yp(pct)} r={4} fill={color} stroke="white" strokeWidth={1.5} />
          <text x={xp(i)} y={yp(pct) - 9} textAnchor="middle"
            fontSize={8.5} fill={color} fontWeight="700">{Math.round(pct)}%</text>
        </g>
      ))}
    </svg>
  )
}

// ── Heatmap ─────────────────────────────────────────────────────────────────

const CELL_CLS: Record<Status, string> = {
  reached: 'bg-emerald-400',
  partially_reached: 'bg-amber-400',
  not_reached: 'bg-muted border border-border',
}

function HeatMap({ students, lernziele }: { students: Schueler[]; lernziele: Lernziel[] }) {
  if (!students.length || !lernziele.length) return null
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="px-3 py-1.5 text-left font-medium text-muted-foreground whitespace-nowrap">Schüler</th>
            {lernziele.map(lz => (
              <th key={lz.id} className="px-2 py-1.5 font-normal text-muted-foreground text-center" style={{ maxWidth: 80 }}>
                <span className={cn(
                  'inline-block rounded px-1 text-[8px] font-bold mb-0.5',
                  lz.kategorie === 'grundlegend' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700',
                )}>
                  {lz.kategorie === 'grundlegend' ? 'G' : 'A'}
                </span>
                <span className="block truncate" style={{ maxWidth: 80 }} title={lz.label}>
                  {lz.label.length > 16 ? lz.label.slice(0, 16) + '…' : lz.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id} className="border-t border-border hover:bg-accent/30 transition-colors">
              <td className="px-3 py-2 text-sm whitespace-nowrap font-medium">{s.name}</td>
              {lernziele.map(lz => (
                <td key={lz.id} className="px-2 py-2 text-center">
                  <span
                    className={cn('inline-block size-3 rounded-sm', CELL_CLS[s.lernzielStatus[lz.id] ?? 'not_reached'])}
                    title={STATUS_LABELS[s.lernzielStatus[lz.id] ?? 'not_reached']}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children, action, sub }: {
  title: string; children: React.ReactNode; action?: React.ReactNode; sub?: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
          {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

// ── Snapshot types ────────────────────────────────────────────────────────────

interface ClassSnap {
  date: string
  avgScore: number
  atRisk: number
  excellent: number
  studentCount: number
}

// ── Main component ─────────────────────────────────────────────────────────────

interface ClassAnalyticsProps {
  klassId: string
  students: Schueler[]
  themen: Thema[]
  lernziele: Lernziel[]
  faecher: Fach[]
  competencies: Kompetenz[]
  showTrend?: boolean  // false = hide trend chart (Jahresabschluss mode)
}

export function ClassAnalytics({ klassId, students, themen, lernziele, faecher, competencies, showTrend = true }: ClassAnalyticsProps) {
  const [selectedFachId, setSelectedFachId] = useState<string | null>(null)
  const [tier, setTier] = useState<Tier>('all')
  const [katFilter, setKatFilter] = useState<KatFilter>('all')
  const snapKey = `class-snaps-${klassId}`
  const [snaps, setSnaps] = useState<ClassSnap[]>(() => {
    try {
      const raw = localStorage.getItem(snapKey)
      if (raw) return JSON.parse(raw)
    } catch { /* ignore */ }
    return []
  })

  if (students.length === 0) return <p className="text-sm text-muted-foreground">Noch keine Schüler in dieser Klasse.</p>
  if (themen.length === 0) return <p className="text-sm text-muted-foreground">Dieser Klasse sind noch keine Themen zugewiesen.</p>

  // ── Filter themen by fälligkeitsdatum ─────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10)
  const activeThemen = themen.filter(t => !t.faelligAm || t.faelligAm <= today)
  const futureThemen = themen.filter(t => !!t.faelligAm && t.faelligAm > today)

  // ── Fächer that actually have themen assigned ──────────────────────────────
  const assignedFachIds = [...new Set(themen.map(t => t.fachId))]
  const assignedFaecher = faecher.filter(f => assignedFachIds.includes(f.id))

  // ── LZ filtered by selected Fach (active only) ────────────────────────────
  const scopedThemen = selectedFachId
    ? activeThemen.filter(t => t.fachId === selectedFachId)
    : activeThemen
  const allScopedLZ = scopedThemen.flatMap(t => lernziele.filter(lz => lz.themaId === t.id))
  const scopedLZ = katFilter === 'all' ? allScopedLZ : allScopedLZ.filter(lz => lz.kategorie === katFilter)
  const scopedLZIds = scopedLZ.map(lz => lz.id)

  // ── All LZ (for global tier classification — active only) ─────────────────
  const allLZ = activeThemen.flatMap(t => lernziele.filter(lz => lz.themaId === t.id))
  const allLZIds = allLZ.map(lz => lz.id)

  // ── Score all students on ALL lz (RILZ-adjusted, for tier assignment) ─────
  const allScored = students
    .map(s => ({ ...s, allScore: studentLZScoreAdjusted(s, allLZ, activeThemen) }))

  // ── Filter by tier ────────────────────────────────────────────────────────
  const tierStudents = tier === 'all'
    ? allScored
    : tier === 'excellent'
    ? allScored.filter(s => s.allScore >= 75)
    : tier === 'progressing'
    ? allScored.filter(s => s.allScore >= 25 && s.allScore < 75)
    : allScored.filter(s => s.allScore < 25)

  // ── Re-score filtered students on scoped LZ (RILZ-adjusted) ─────────────
  const scopeScored = tierStudents
    .map(s => ({ ...s, score: studentLZScoreAdjusted(s, scopedLZ, activeThemen) }))
    .sort((a, b) => b.score - a.score)

  // RILZ/BVSA students are shown in lists but excluded from class averages
  const regularTierStudents = tierStudents.filter(s => !isSpecial(s))
  const regularScored = scopeScored.filter(s => !isSpecial(s))

  const n = scopeScored.length
  const avgScore = regularScored.length ? regularScored.reduce((sum, x) => sum + x.score, 0) / regularScored.length : 0
  const specialCount = scopeScored.length - regularScored.length

  // ── G/A split stats (always on full Fach scope, regular students only) ────
  const grundIds = allScopedLZ.filter(lz => lz.kategorie === 'grundlegend').map(lz => lz.id)
  const ansprIds = allScopedLZ.filter(lz => lz.kategorie === 'anspruchsvoll').map(lz => lz.id)
  const nReg = regularTierStudents.length
  const avgGrund = nReg ? Math.round(regularTierStudents.reduce((s, x) => s + studentLZScore(x, grundIds), 0) / nReg) : 0
  const avgAnsp  = nReg ? Math.round(regularTierStudents.reduce((s, x) => s + studentLZScore(x, ansprIds), 0) / nReg) : 0
  const grundReached = grundIds.reduce((s, id) => s + regularTierStudents.filter(x => x.lernzielStatus[id] === 'reached').length, 0)
  const grundPartial = grundIds.reduce((s, id) => s + regularTierStudents.filter(x => x.lernzielStatus[id] === 'partially_reached').length, 0)
  const grundTotal   = grundIds.length * nReg
  const ansprReached = ansprIds.reduce((s, id) => s + regularTierStudents.filter(x => x.lernzielStatus[id] === 'reached').length, 0)
  const ansprPartial = ansprIds.reduce((s, id) => s + regularTierStudents.filter(x => x.lernzielStatus[id] === 'partially_reached').length, 0)
  const ansprTotal   = ansprIds.length * nReg

  // ── KPI tier counts (all students, including RILZ/BVSA) ──────────────────
  const excellent = allScored.filter(s => s.allScore >= 75).length
  const progressing = allScored.filter(s => s.allScore >= 25 && s.allScore < 75).length
  const struggling = allScored.filter(s => s.allScore < 25).length
  const atRisk = struggling
  const fullyDone = allScored.filter(s =>
    allLZIds.length > 0 && allLZIds.every(id => s.lernzielStatus[id] === 'reached')
  ).length

  const top5 = scopeScored.slice(0, 5)
  const bottom5 = [...scopeScored].reverse().slice(0, 5)

  // ── Scoped LZ stats: exclude RILZ-skipped students per LZ ────────────────
  const lzStats = scopedLZ.map(lz => {
    const eligible = regularTierStudents.filter(s => !isLZSkipped(lz, s, activeThemen))
    const reached = eligible.filter(s => s.lernzielStatus[lz.id] === 'reached').length
    const partial = eligible.filter(s => s.lernzielStatus[lz.id] === 'partially_reached').length
    const pct = eligible.length === 0 ? 0
      : ((reached + partial * 0.5) / eligible.length) * 100
    return { lz, reached, partial, pct, eligibleCount: eligible.length }
  }).sort((a, b) => a.pct - b.pct)

  // ── Kompetenz stats (regular students only) ───────────────────────────────
  const compStats = competencies.map(c => {
    const reached = regularTierStudents.filter(s => s.competencyStatus[c.id] === 'reached').length
    const partial = regularTierStudents.filter(s => s.competencyStatus[c.id] === 'partially_reached').length
    const pct = regularTierStudents.length === 0 ? 0
      : ((reached + partial * 0.5) / regularTierStudents.length) * 100
    return { c, reached, partial, pct }
  }).sort((a, b) => b.pct - a.pct)

  // ── Historical trend (regular students only) ──────────────────────────────
  const regularStudents = students.filter(s => !isSpecial(s))
  const histDates = [...new Set(
    regularStudents.flatMap(s => s.progressHistory?.map(p => p.date) ?? [])
  )].sort()
  const histPoints = histDates.map(date => {
    const withData = regularStudents.filter(s => s.progressHistory?.some(p => p.date === date))
    const avg = withData.length === 0 ? 0 : withData.reduce((sum, s) => {
      const snap = s.progressHistory!.find(p => p.date === date)!
      return sum + (allLZIds.length === 0 ? 0
        : (allLZIds.reduce((sc, id) => sc + sv(snap.lernzielStatus[id] ?? 'not_reached'), 0) / allLZIds.length) * 100)
    }, 0) / withData.length
    return { label: formatDate(date), pct: avg }
  })

  const snapPoints = snaps.map(s => ({ label: formatDate(s.date), pct: s.avgScore }))
  const regularAllScored = allScored.filter(s => !isSpecial(s))
  const todayPct = Math.round(regularAllScored.reduce((s, x) => s + x.allScore, 0) / (regularAllScored.length || 1))
  const trendPoints = snaps.length >= 1
    ? [...snapPoints, { label: 'Heute', pct: todayPct }]
    : histPoints.length >= 1
    ? [...histPoints, { label: 'Heute', pct: todayPct }]
    : []

  // ── Snapshot actions ──────────────────────────────────────────────────────
  function saveSnap() {
    const snap: ClassSnap = {
      date: new Date().toISOString().slice(0, 10),
      avgScore: todayPct,
      atRisk,
      excellent,
      studentCount: students.length,
    }
    const updated = [...snaps.filter(s => s.date !== snap.date), snap]
      .sort((a, b) => a.date.localeCompare(b.date))
    setSnaps(updated)
    try { localStorage.setItem(snapKey, JSON.stringify(updated)) } catch { /* ignore */ }
  }

  function deleteSnap(date: string) {
    const updated = snaps.filter(s => s.date !== date)
    setSnaps(updated)
    try { localStorage.setItem(snapKey, JSON.stringify(updated)) } catch { /* ignore */ }
  }

  // ── Active filter label for section subtitles ─────────────────────────────
  const fachLabel = selectedFachId ? assignedFaecher.find(f => f.id === selectedFachId)?.name : null
  const tierLabel = tier !== 'all' ? TIER_LABELS[tier] : null
  const filterSub = [fachLabel, tierLabel].filter(Boolean).join(' · ') || undefined

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Filter bar — horizontal single row */}
      <FilterBar
        faecher={assignedFaecher}
        selectedFachId={selectedFachId}
        onFachChange={(id) => { setSelectedFachId(id); }}
        tier={tier}
        onTierChange={setTier}
        katFilter={katFilter}
        onKatChange={setKatFilter}
      />

      {/* Future themen notice */}
      {futureThemen.length > 0 && (
        <div className="rounded-xl border border-sky-200 bg-sky-50/60 px-4 py-2.5 text-xs text-sky-700 flex items-center gap-2">
          <span className="shrink-0">📅</span>
          <span>
            <strong>{futureThemen.length} {futureThemen.length === 1 ? 'Thema' : 'Themen'}</strong> noch nicht fällig und daher aus der Statistik ausgeschlossen:
            {' '}{futureThemen.map(t => t.name).join(', ')}
          </span>
        </div>
      )}

      {/* Fächer-Kacheln */}
      <div className="space-y-3">
        <div className={cn(
          'grid gap-3',
          assignedFaecher.length <= 2 ? 'grid-cols-2' :
          assignedFaecher.length === 3 ? 'grid-cols-3' :
          assignedFaecher.length === 4 ? 'grid-cols-4' :
          'grid-cols-4 xl:grid-cols-5',
        )}>
          {assignedFaecher.map(f => (
            <FachCard
              key={f.id}
              fach={f}
              themen={activeThemen}
              lernziele={lernziele}
              students={students}
              selected={selectedFachId === f.id}
              onClick={() => setSelectedFachId(selectedFachId === f.id ? null : f.id)}
            />
          ))}
        </div>
        {selectedFachId && (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Themen in {fachLabel}
            </p>
            <ThemenBreakdown
              fach={assignedFaecher.find(f => f.id === selectedFachId)!}
              themen={themen}
              lernziele={lernziele}
              students={tierStudents}
            />
          </div>
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          value={n < students.length ? `${n}/${students.length}` : students.length}
          label="Schüler"
          sub={tierLabel ?? undefined}
        />
        <StatCard
          value={`${Math.round(avgScore)}%`}
          label={`Ø ${fachLabel ?? 'Lernziele'}`}
          color="text-primary"
          sub={specialCount > 0 ? `${regularScored.length} Schüler · ${specialCount} RILZ/BVSA ausgeschlossen` : undefined}
        />
        <StatCard
          value={atRisk}
          label="Förderbedarf gesamt"
          color={atRisk > 0 ? 'text-red-500' : 'text-emerald-600'}
          sub="unter 25%"
        />
        <StatCard
          value={fullyDone}
          label="Alle Ziele erreicht"
          color={fullyDone > 0 ? 'text-emerald-600' : 'text-muted-foreground'}
        />
      </div>

      {/* G vs A Vergleich — nur wenn keine Kategorie gefiltert und beide Typen vorhanden */}
      {katFilter === 'all' && grundIds.length > 0 && ansprIds.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              kat: 'Grundlegende Lernziele',
              badge: 'G',
              count: grundIds.length,
              avg: avgGrund,
              reached: grundReached,
              partial: grundPartial,
              total: grundTotal,
              border: 'border-sky-100',
              bg: 'bg-sky-50/50',
              badge_cls: 'bg-sky-100 text-sky-700',
              pct_cls: avgGrund >= 75 ? 'text-emerald-600' : avgGrund >= 25 ? 'text-amber-600' : 'text-red-500',
            },
            {
              kat: 'Anspruchsvollere Lernziele',
              badge: 'A',
              count: ansprIds.length,
              avg: avgAnsp,
              reached: ansprReached,
              partial: ansprPartial,
              total: ansprTotal,
              border: 'border-amber-100',
              bg: 'bg-amber-50/50',
              badge_cls: 'bg-amber-100 text-amber-700',
              pct_cls: avgAnsp >= 75 ? 'text-emerald-600' : avgAnsp >= 25 ? 'text-amber-600' : 'text-red-500',
            },
          ].map(({ kat, badge, count, avg, reached, partial, total, border, bg, badge_cls, pct_cls }) => (
            <div key={kat} className={cn('rounded-2xl border p-5 shadow-sm space-y-3', border, bg)}>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <span className={cn('inline-block rounded px-1.5 py-0.5 text-[10px] font-bold', badge_cls)}>{badge}</span>
                  <p className="text-xs font-semibold text-foreground">{kat}</p>
                  <p className="text-xs text-muted-foreground">{count} Ziele</p>
                </div>
                <p className={cn('text-3xl font-bold tabular-nums shrink-0', pct_cls)}>{avg}%</p>
              </div>
              <StackedBar reached={reached} partial={partial} total={total} h="h-2" />
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="text-emerald-600 font-medium">{reached} ✓</span>
                {partial > 0 && <span className="text-amber-600">{partial} ~</span>}
                {total - reached - partial > 0 && <span>{total - reached - partial} ✗</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2-column main content */}
      <div className="grid grid-cols-2 gap-5 items-start">

        {/* Left column */}
        <div className="space-y-5">

          {/* Leistungsverteilung */}
          {tier === 'all' && !selectedFachId && (
            <Section title="Leistungsverteilung" sub="Alle Schüler · Alle Fächer">
              <div className="flex h-5 rounded-full overflow-hidden gap-0.5">
                {excellent > 0 && (
                  <div className="h-full bg-status-reached" style={{ width: `${(excellent / students.length) * 100}%` }} />
                )}
                {progressing > 0 && (
                  <div className="h-full bg-status-partial" style={{ width: `${(progressing / students.length) * 100}%` }} />
                )}
                {struggling > 0 && (
                  <div className="h-full bg-red-400" style={{ width: `${(struggling / students.length) * 100}%` }} />
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { count: excellent, label: 'Sehr gut ≥75%', color: 'text-emerald-600', dot: 'bg-status-reached' },
                  { count: progressing, label: 'Im Aufbau 25–74%', color: 'text-amber-600', dot: 'bg-status-partial' },
                  { count: struggling, label: 'Förderbedarf <25%', color: 'text-red-500', dot: 'bg-red-400' },
                ].map(({ count, label, color, dot }) => (
                  <div key={label} className="text-center space-y-1">
                    <p className={cn('text-2xl font-bold', color)}>{count}</p>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <span className={cn('inline-block size-2 rounded-full', dot)} />
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Top 5 / Bottom 5 */}
          <Section title="Top 5 Schüler" sub={filterSub}>
            {top5.length === 0
              ? <p className="text-xs text-muted-foreground">Keine Schüler in dieser Auswahl.</p>
              : top5.map((s, i) => (
                <ScoreRow
                  key={s.id} rank={i + 1} name={s.name} score={s.score} variant="top"
                  special={s.rilzFachIds?.length ? 'RILZ' : s.bvsa ? 'BVSA' : undefined}
                />
              ))
            }
          </Section>

          <Section title="Förderbedarf (Bottom 5)" sub={filterSub}>
            {bottom5.length === 0
              ? <p className="text-xs text-muted-foreground">Keine Schüler in dieser Auswahl.</p>
              : bottom5.map((s, i) => (
                <ScoreRow
                  key={s.id} rank={n - i} name={s.name} score={s.score} variant="bottom"
                  special={s.rilzFachIds?.length ? 'RILZ' : s.bvsa ? 'BVSA' : undefined}
                />
              ))
            }
          </Section>

          {/* Kompetenz-Profil */}
          {competencies.length > 0 && (
            <Section title="Kompetenz-Profil" sub={tierLabel ?? undefined}>
              <div className="space-y-3">
                {compStats.map(({ c, reached, partial }) => {
                  const pct = regularTierStudents.length
                    ? Math.round(((reached + partial * 0.5) / regularTierStudents.length) * 100)
                    : 0
                  return (
                    <div key={c.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground">{c.label}</span>
                        <div className="flex items-center gap-2 shrink-0 text-xs">
                          <span className="text-emerald-600 font-medium">{reached}✓</span>
                          {partial > 0 && <span className="text-amber-600">{partial}~</span>}
                          {regularTierStudents.length - reached - partial > 0 && (
                            <span className="text-muted-foreground">{regularTierStudents.length - reached - partial}✗</span>
                          )}
                          <span className="font-semibold tabular-nums w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                      <StackedBar reached={reached} partial={partial} total={regularTierStudents.length} h="h-2" />
                    </div>
                  )
                })}
              </div>
            </Section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Lernziel-Performance */}
          {scopedLZ.length > 0 && (
            <Section
              title={`Lernziel-Performance — ${scopedLZ.length} Ziele`}
              sub={filterSub}
            >
              {lzStats.length >= 2 && (
                <div className="flex flex-wrap gap-3 pb-1 border-b border-border">
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="inline-block size-2 rounded-full bg-red-400" />
                    <span className="text-muted-foreground">Schwächstes:</span>
                    <span className="font-medium text-red-600">{lzStats[0]?.lz.label}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="inline-block size-2 rounded-full bg-status-reached" />
                    <span className="text-muted-foreground">Stärkstes:</span>
                    <span className="font-medium text-emerald-600">{lzStats[lzStats.length - 1]?.lz.label}</span>
                  </span>
                </div>
              )}
              <div className="space-y-1">
                {lzStats.map(({ lz, reached, partial, eligibleCount }, i) => (
                  <LZRow
                    key={lz.id}
                    label={lz.label}
                    kategorie={lz.kategorie}
                    reached={reached}
                    partial={partial}
                    total={eligibleCount}
                    highlight={i === 0 ? 'hard' : i === lzStats.length - 1 ? 'easy' : undefined}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* Klassentrend */}
          {showTrend && <Section
            title="Klassentrend"
            sub="Alle Schüler · Alle Fächer"
            action={
              <button
                onClick={saveSnap}
                className="text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0"
              >
                Snapshot erstellen
              </button>
            }
          >
            {trendPoints.length >= 2
              ? <TrendChart points={trendPoints} />
              : (
                <p className="text-xs text-muted-foreground">
                  Klicke &ldquo;Snapshot erstellen&rdquo; um Verläufe aufzuzeichnen. Ab 1 Snapshot wird der Trend sichtbar.
                </p>
              )
            }
            {snaps.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground">Gespeicherte Snapshots</p>
                <div className="flex flex-wrap gap-2">
                  {snaps.map(snap => (
                    <div key={snap.date} className="flex items-center gap-2 text-xs bg-muted rounded-lg px-3 py-1.5">
                      <span className="font-medium">{formatDate(snap.date)}</span>
                      <span className="text-muted-foreground">Ø {snap.avgScore}%</span>
                      {snap.atRisk > 0 && <span className="text-red-500 font-medium">{snap.atRisk} ⚠</span>}
                      <button
                        onClick={() => deleteSnap(snap.date)}
                        className="text-muted-foreground hover:text-red-500 transition-colors font-bold leading-none ml-1"
                        aria-label="Snapshot löschen"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>}

        </div>
      </div>

      {/* Heatmap — full width */}
      {scopedLZ.length > 0 && (
        <Section title="Heatmap — Schüler × Lernziele" sub={filterSub}>
          <HeatMap students={scopeScored} lernziele={scopedLZ} />
          <div className="flex items-center gap-4 pt-2 border-t border-border">
            {[
              { cls: 'bg-emerald-400', label: 'Erreicht' },
              { cls: 'bg-amber-400', label: 'Teilweise' },
              { cls: 'bg-muted border border-border', label: 'Nicht erreicht' },
            ].map(({ cls, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn('inline-block size-3 rounded-sm', cls)} />
                {label}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}
