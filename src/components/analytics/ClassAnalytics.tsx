'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Camera, Trash2 } from 'lucide-react'
import { cn, getFachColor, sv, scoreColor } from '@/lib/utils'
import { FachChipFilter } from '@/components/shared/FachChipFilter'
import type { Schueler, Thema, Lernziel, LernzielKategorie, Fach, Status } from '@/types/domain'
import { STATUS_LABELS } from '@/types/domain'

// ── Helpers ────────────────────────────────────────────────────────────────

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

function sName(s: Schueler): string {
  return `${s.vorname} ${s.nachname}`
}

// ── Types ──────────────────────────────────────────────────────────────────

type Tier = 'all' | 'excellent' | 'progressing' | 'struggling'
type KatFilter = 'all' | 'grundlegend' | 'anspruchsvoll'
type StudentSort = 'score' | 'name'

interface ClassSnap {
  date: string
  avgScore: number
  atRisk: number
  excellent: number
  studentCount: number
  fachScores: Record<string, number>
}

type ScoredStudent = Schueler & { score: number; allScore: number }

const TIER_FULL: Record<Tier, string> = {
  all: 'Alle Schüler',
  excellent: 'Sehr gut ≥75%',
  progressing: 'Im Aufbau 25–74%',
  struggling: 'Förderbedarf <25%',
}

const TIER_LABELS: Record<Tier, string> = {
  all: 'Alle',
  excellent: '≥75%',
  progressing: '25–74%',
  struggling: '<25%',
}

const KAT_LABELS: Record<KatFilter, string> = {
  all: 'G + A',
  grundlegend: 'Grundlegend',
  anspruchsvoll: 'Anspruchsvoll',
}

// ── Chip ───────────────────────────────────────────────────────────────────

function Chip({
  label, active, activeClass, onClick, dotClass,
}: {
  label: string
  active: boolean
  activeClass?: string
  onClick: () => void
  dotClass?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-7 px-2.5 rounded-md text-xs font-medium transition-all whitespace-nowrap',
        dotClass && 'flex items-center gap-1.5',
        active
          ? cn('shadow-sm', activeClass ?? 'bg-primary text-primary-foreground')
          : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {dotClass && <span className={cn('size-2 rounded-full shrink-0', dotClass)} />}
      {label}
    </button>
  )
}

// ── Filter bar (Tier + Kat only) ───────────────────────────────────────────

function FilterBar({
  tier, onTierChange, katFilter, onKatChange,
}: {
  tier: Tier
  onTierChange: (t: Tier) => void
  katFilter: KatFilter
  onKatChange: (k: KatFilter) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 shrink-0">Gruppe</span>
        {(['all', 'excellent', 'progressing', 'struggling'] as Tier[]).map(t => (
          <Chip key={t} label={TIER_LABELS[t]} active={tier === t} onClick={() => onTierChange(t)} />
        ))}
      </div>
      <span className="h-4 w-px bg-border/60 mx-0.5 shrink-0" />
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 shrink-0">Kat.</span>
        {(['all', 'grundlegend', 'anspruchsvoll'] as KatFilter[]).map(k => (
          <Chip
            key={k}
            label={KAT_LABELS[k]}
            active={katFilter === k}
            activeClass={
              k === 'grundlegend' ? 'bg-slate-500 text-white'
              : k === 'anspruchsvoll' ? 'bg-violet-500 text-white'
              : undefined
            }
            onClick={() => onKatChange(k)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Section label ──────────────────────────────────────────────────────────

function SectionLabel({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 pb-1 border-b border-border/30">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {action}
    </div>
  )
}

// ── KPI tile ───────────────────────────────────────────────────────────────

function KpiTile({
  label, value, sub, borderColor,
}: {
  label: string
  value: string | number
  sub?: string
  borderColor?: string
}) {
  return (
    <div className={cn('bg-card rounded-xl px-5 py-4 border border-border border-l-4', borderColor ?? 'border-l-border')}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <p className="text-3xl font-bold tabular-nums tracking-tight leading-none text-foreground">
        {value}
      </p>
      {sub && <p className="text-[10px] text-muted-foreground/70 mt-2 leading-tight">{sub}</p>}
    </div>
  )
}

// ── Distribution bar ───────────────────────────────────────────────────────

function DistributionBar({
  excellent, progressing, struggling, total,
}: {
  excellent: number; progressing: number; struggling: number; total: number
}) {
  if (total === 0) return null
  const ep = (excellent / total) * 100
  const pp = (progressing / total) * 100
  const sp = (struggling / total) * 100
  return (
    <div className="space-y-2">
      <div className="flex h-8 rounded-xl overflow-hidden gap-px">
        {ep > 0 && (
          <div style={{ width: `${ep}%` }} className="h-full bg-status-reached flex items-center justify-center shrink-0 transition-all">
            {ep > 8 && <span className="text-white text-xs font-bold tabular-nums">{excellent}</span>}
          </div>
        )}
        {pp > 0 && (
          <div style={{ width: `${pp}%` }} className="h-full bg-status-partial flex items-center justify-center shrink-0 transition-all">
            {pp > 8 && <span className="text-white text-xs font-bold tabular-nums">{progressing}</span>}
          </div>
        )}
        {sp > 0 && (
          <div style={{ width: `${sp}%` }} className="h-full bg-red-400 flex items-center justify-center shrink-0 transition-all">
            {sp > 8 && <span className="text-white text-xs font-bold tabular-nums">{struggling}</span>}
          </div>
        )}
      </div>
      <div className="flex gap-5 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-status-reached inline-block shrink-0" />
          {excellent} sehr gut (≥75%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-status-partial inline-block shrink-0" />
          {progressing} im Aufbau (25–74%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-red-400 inline-block shrink-0" />
          {struggling} Förderbedarf (&lt;25%)
        </span>
      </div>
    </div>
  )
}

// ── Stacked bar ────────────────────────────────────────────────────────────

function StackedBar({ reached, partial, total, h = 'h-2' }: {
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

// ── Student ranking table ──────────────────────────────────────────────────

function StudentRankingTable({
  students, sort, onSortChange,
}: {
  students: ScoredStudent[]
  sort: StudentSort
  onSortChange: (s: StudentSort) => void
}) {
  const sorted = [...students].sort(
    sort === 'score'
      ? (a, b) => b.score - a.score
      : (a, b) => sName(a).localeCompare(sName(b)),
  )

  function ColHeader({ field, children }: { field: StudentSort; children: React.ReactNode }) {
    return (
      <button
        onClick={() => onSortChange(field)}
        className={cn(
          'text-[9px] font-mono uppercase tracking-widest transition-colors',
          sort === field ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {children}{sort === field ? ' ↓' : ''}
      </button>
    )
  }

  return (
    <div className="overflow-y-auto max-h-[380px]">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 bg-card z-10 border-b border-border">
          <tr>
            <th className="py-2 px-3 text-left text-[9px] font-mono uppercase tracking-widest text-muted-foreground w-8">#</th>
            <th className="py-2 px-2 text-left"><ColHeader field="name">Name</ColHeader></th>
            <th className="py-2 px-2 text-right"><ColHeader field="score">Score</ColHeader></th>
            <th className="py-2 px-2 w-14"></th>
            <th className="py-2 px-3 w-14"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s, i) => {
            const pct = Math.round(s.score)
            const tier = pct >= 75 ? 'excellent' : pct >= 25 ? 'progressing' : 'struggling'
            const barColor = tier === 'excellent' ? 'bg-status-reached' : tier === 'progressing' ? 'bg-status-partial' : 'bg-red-400'
            const rankBg = tier === 'excellent' ? 'bg-emerald-100 text-emerald-700' : tier === 'progressing' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'
            return (
              <tr key={s.id} className="border-b border-border/40 odd:bg-muted/10 hover:bg-muted/25 transition-colors">
                <td className="py-2 px-3">
                  <span className={cn('inline-flex items-center justify-center size-5 rounded-md text-[10px] font-bold tabular-nums', rankBg)}>
                    {i + 1}
                  </span>
                </td>
                <td className="py-2 px-2 text-sm font-medium">{sName(s)}</td>
                <td className={cn('py-2 px-2 text-right tabular-nums text-sm font-bold', scoreColor(pct))}>{pct}%</td>
                <td className="py-2 px-2">
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className={cn('h-full transition-all', barColor)} style={{ width: `${pct}%` }} />
                  </div>
                </td>
                <td className="py-2 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {s.rilzFachIds?.length
                      ? <span className="text-[9px] font-bold bg-purple-100 text-purple-700 rounded px-1 py-0.5">RILZ</span>
                      : null}
                    {s.bvsa
                      ? <span className="text-[9px] font-bold bg-blue-100 text-blue-700 rounded px-1 py-0.5">BVSA</span>
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

// ── LZ performance row ─────────────────────────────────────────────────────

function LZRow({
  label, kategorie, reached, partial, total,
}: {
  label: string
  kategorie: LernzielKategorie
  reached: number
  partial: number
  total: number
}) {
  const pct = total === 0 ? 0 : Math.round(((reached + partial * 0.5) / total) * 100)
  return (
    <div className="py-2 px-2 rounded-md hover:bg-muted/25 transition-colors">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className={cn(
            'shrink-0 rounded px-1 py-0.5 text-[8px] font-bold leading-none',
            kategorie === 'grundlegend' ? 'bg-slate-100 text-slate-700' : 'bg-violet-100 text-violet-700',
          )}>
            {kategorie === 'grundlegend' ? 'G' : 'A'}
          </span>
          <span className="text-xs truncate">{label}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-xs">
          <span className="text-emerald-600 font-medium tabular-nums">{reached}✓</span>
          {partial > 0 && <span className="text-amber-600 tabular-nums">{partial}~</span>}
          <span className={cn('font-bold tabular-nums w-8 text-right', scoreColor(pct))}>{pct}%</span>
        </div>
      </div>
      <StackedBar reached={reached} partial={partial} total={total} h="h-1.5" />
    </div>
  )
}

// ── Trend chart ────────────────────────────────────────────────────────────

const CP = { t: 22, r: 20, b: 32, l: 44 }
const CW = 520, CH = 180

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
          <line
            x1={CP.l} y1={yp(v)} x2={CW - CP.r} y2={yp(v)}
            stroke="currentColor" strokeOpacity={0.08} strokeDasharray="4 3"
          />
          <text x={CP.l - 6} y={yp(v)} textAnchor="end" dominantBaseline="middle"
            fontSize={9} fill="currentColor" fillOpacity={0.4}>
            {v}%
          </text>
        </g>
      ))}
      {points.map(({ label }, i) => (
        <text key={i} x={xp(i)} y={CH - 4} textAnchor="middle"
          fontSize={8.5} fill="currentColor" fillOpacity={0.5}>
          {label}
        </text>
      ))}
      <path
        d={`${d} L${xp(n - 1).toFixed(1)},${yp(0).toFixed(1)} L${xp(0).toFixed(1)},${yp(0).toFixed(1)} Z`}
        fill={color} fillOpacity={0.07}
      />
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {points.map(({ pct }, i) => (
        <g key={i}>
          <circle cx={xp(i)} cy={yp(pct)} r={3.5} fill={color} stroke="white" strokeWidth={1.5} />
          <text x={xp(i)} y={yp(pct) - 9} textAnchor="middle"
            fontSize={8} fill={color} fontWeight="700">
            {Math.round(pct)}%
          </text>
        </g>
      ))}
    </svg>
  )
}

// ── Snapshot history table ─────────────────────────────────────────────────

function SnapshotHistoryTable({
  snaps, faecher, onDelete,
}: {
  snaps: ClassSnap[]
  faecher: Fach[]
  onDelete: (date: string) => void
}) {
  if (snaps.length === 0) {
    return (
      <p className="text-xs text-muted-foreground px-4 py-3">
        Noch kein Snapshot erstellt. Klicke &ldquo;Snapshot&rdquo; um den aktuellen Stand aufzuzeichnen.
      </p>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 px-3 text-left text-[9px] font-mono uppercase tracking-widest text-muted-foreground whitespace-nowrap">Datum</th>
            <th className="py-2 px-3 text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground whitespace-nowrap">Ø Score</th>
            <th className="py-2 px-3 text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground whitespace-nowrap">Δ</th>
            <th className="py-2 px-3 text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground whitespace-nowrap">Sehr gut</th>
            <th className="py-2 px-3 text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground whitespace-nowrap">Förderbedarf</th>
            {faecher.map(f => (
              <th key={f.id} className="py-2 px-3 text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                {f.name}
              </th>
            ))}
            <th className="py-2 px-3 w-8"></th>
          </tr>
        </thead>
        <tbody>
          {snaps.map((snap, i) => {
            const prev = i > 0 ? snaps[i - 1] : null
            const delta = prev !== null ? snap.avgScore - prev.avgScore : null
            return (
              <tr key={snap.date} className="border-b border-border/40 odd:bg-muted/10 hover:bg-muted/20 transition-colors">
                <td className="py-2 px-3 font-medium text-foreground">{formatDate(snap.date)}</td>
                <td className={cn('py-2 px-3 text-right tabular-nums font-bold', scoreColor(snap.avgScore))}>
                  {snap.avgScore}%
                </td>
                <td className={cn('py-2 px-3 text-right tabular-nums font-semibold',
                  delta === null ? 'text-muted-foreground'
                    : delta > 0 ? 'text-emerald-600'
                    : delta < 0 ? 'text-red-500'
                    : 'text-muted-foreground',
                )}>
                  {delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`}
                </td>
                <td className="py-2 px-3 text-right tabular-nums text-emerald-600 font-medium">
                  {snap.excellent}
                </td>
                <td className={cn('py-2 px-3 text-right tabular-nums font-medium',
                  snap.atRisk > 0 ? 'text-red-500' : 'text-muted-foreground',
                )}>
                  {snap.atRisk}
                </td>
                {faecher.map(f => (
                  <td key={f.id} className={cn('py-2 px-3 text-right tabular-nums',
                    snap.fachScores?.[f.id] != null ? scoreColor(Math.round(snap.fachScores[f.id])) : 'text-muted-foreground',
                  )}>
                    {snap.fachScores?.[f.id] != null ? `${Math.round(snap.fachScores[f.id])}%` : '—'}
                  </td>
                ))}
                <td className="py-2 px-3 text-right">
                  <button
                    onClick={() => onDelete(snap.date)}
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                    aria-label="Snapshot löschen"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Heatmap ────────────────────────────────────────────────────────────────

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
                  lz.kategorie === 'grundlegend' ? 'bg-slate-100 text-slate-700' : 'bg-violet-100 text-violet-700',
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
              <td className="px-3 py-2 text-sm whitespace-nowrap font-medium">{sName(s)}</td>
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

// ── Main component ─────────────────────────────────────────────────────────

interface ClassAnalyticsProps {
  klassId: string
  students: Schueler[]
  themen: Thema[]
  lernziele: Lernziel[]
  faecher: Fach[]
}

export function ClassAnalytics({
  klassId, students, themen, lernziele, faecher,
}: ClassAnalyticsProps) {
  const [selectedFachIds, setSelectedFachIds] = useState<string[]>([])
  const [tier, setTier] = useState<Tier>('all')
  const [katFilter, setKatFilter] = useState<KatFilter>('all')
  const [studentSort, setStudentSort] = useState<StudentSort>('score')
  const [heatmapOpen, setHeatmapOpen] = useState(false)
  const [snapHistoryOpen, setSnapHistoryOpen] = useState(false)
  const [expandedThemaIds, setExpandedThemaIds] = useState<Set<string>>(new Set())
  const snapKey = `class-snaps-${klassId}`
  const [snaps, setSnaps] = useState<ClassSnap[]>(() => {
    try {
      const raw = localStorage.getItem(snapKey)
      if (raw) return JSON.parse(raw)
    } catch { /* ignore */ }
    return []
  })

  if (students.length === 0) {
    return <p className="text-sm text-muted-foreground">Noch keine Schüler in dieser Klasse.</p>
  }
  if (themen.length === 0) {
    return <p className="text-sm text-muted-foreground">Dieser Klasse sind noch keine Themen zugewiesen.</p>
  }

  const today = new Date().toISOString().slice(0, 10)
  const activeThemen = themen.filter(t => !t.faelligAm || t.faelligAm <= today)
  const futureThemen = themen.filter(t => !!t.faelligAm && t.faelligAm > today)

  const assignedFachIds = [...new Set(themen.map(t => t.fachId))]
  const assignedFaecher = faecher.filter(f => assignedFachIds.includes(f.id))
  const allFachIds = faecher.map(f => f.id)

  const filteredFaecher = selectedFachIds.length === 0
    ? assignedFaecher
    : assignedFaecher.filter(f => selectedFachIds.includes(f.id))

  const scopedThemen = selectedFachIds.length === 0
    ? activeThemen
    : activeThemen.filter(t => selectedFachIds.includes(t.fachId))

  const allScopedLZ = scopedThemen.flatMap(t => lernziele.filter(lz => lz.themaId === t.id))
  const scopedLZ = katFilter === 'all' ? allScopedLZ : allScopedLZ.filter(lz => lz.kategorie === katFilter)

  const allLZ = activeThemen.flatMap(t => lernziele.filter(lz => lz.themaId === t.id))
  const allLZIds = allLZ.map(lz => lz.id)

  const allScored = students.map(s => ({
    ...s,
    allScore: studentLZScoreAdjusted(s, allLZ, activeThemen),
  }))

  const tierStudents = tier === 'all' ? allScored
    : tier === 'excellent' ? allScored.filter(s => s.allScore >= 75)
    : tier === 'progressing' ? allScored.filter(s => s.allScore >= 25 && s.allScore < 75)
    : allScored.filter(s => s.allScore < 25)

  const scopeScored: ScoredStudent[] = tierStudents.map(s => ({
    ...s,
    score: studentLZScoreAdjusted(s, scopedLZ, activeThemen),
  }))

  const regularTierStudents = tierStudents.filter(s => !isSpecial(s))
  const regularScoped = scopeScored.filter(s => !isSpecial(s))

  const avgScore = regularScoped.length
    ? regularScoped.reduce((sum, x) => sum + x.score, 0) / regularScoped.length
    : 0

  const excellent = allScored.filter(s => s.allScore >= 75).length
  const progressing = allScored.filter(s => s.allScore >= 25 && s.allScore < 75).length
  const struggling = allScored.filter(s => s.allScore < 25).length

  const lzStats = scopedLZ.map(lz => {
    const eligible = regularTierStudents.filter(s => !isLZSkipped(lz, s, activeThemen))
    const reached = eligible.filter(s => s.lernzielStatus[lz.id] === 'reached').length
    const partial = eligible.filter(s => s.lernzielStatus[lz.id] === 'partially_reached').length
    const pct = eligible.length === 0 ? 0 : ((reached + partial * 0.5) / eligible.length) * 100
    return { lz, reached, partial, pct, eligibleCount: eligible.length }
  })

  // Per-thema class aggregate (difficulty list)
  const themaStats = scopedThemen.map(thema => {
    const tzLZ = lernziele.filter(lz => lz.themaId === thema.id)
    const r = tzLZ.reduce((s, lz) => {
      const elig = regularTierStudents.filter(sc => !isLZSkipped(lz, sc, activeThemen))
      return s + elig.filter(sc => sc.lernzielStatus[lz.id] === 'reached').length
    }, 0)
    const p = tzLZ.reduce((s, lz) => {
      const elig = regularTierStudents.filter(sc => !isLZSkipped(lz, sc, activeThemen))
      return s + elig.filter(sc => sc.lernzielStatus[lz.id] === 'partially_reached').length
    }, 0)
    const t = tzLZ.reduce((s, lz) =>
      s + regularTierStudents.filter(sc => !isLZSkipped(lz, sc, activeThemen)).length, 0)
    const avg = t === 0 ? 0 : Math.round(((r + p * 0.5) / t) * 100)
    const fach = faecher.find(f => f.id === thema.fachId)
    return { thema, fach, r, p, t, avg, lzCount: tzLZ.length }
  }).sort((a, b) => a.avg - b.avg)

  // Trend from student history
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
  const todayPct = Math.round(
    regularAllScored.reduce((s, x) => s + x.allScore, 0) / (regularAllScored.length || 1),
  )
  const trendPoints = snaps.length >= 1
    ? [...snapPoints, { label: 'Heute', pct: todayPct }]
    : histPoints.length >= 1
    ? [...histPoints, { label: 'Heute', pct: todayPct }]
    : []

  const lastSnap = snaps.length > 0 ? snaps[snaps.length - 1] : null
  const deltaVsLast = lastSnap !== null ? todayPct - lastSnap.avgScore : null

  const trendIsUp = trendPoints.length >= 2
    ? trendPoints[trendPoints.length - 1].pct >= trendPoints[0].pct
    : null

  function saveSnap() {
    const fachScores: Record<string, number> = {}
    for (const fach of assignedFaecher) {
      const fachThemen = activeThemen.filter(t => t.fachId === fach.id)
      const fachLZ = fachThemen.flatMap(t => lernziele.filter(lz => lz.themaId === t.id))
      if (fachLZ.length > 0 && regularStudents.length > 0) {
        fachScores[fach.id] = regularStudents.reduce(
          (sum, s) => sum + studentLZScoreAdjusted(s, fachLZ, activeThemen), 0,
        ) / regularStudents.length
      }
    }
    const snap: ClassSnap = {
      date: new Date().toISOString().slice(0, 10),
      avgScore: todayPct,
      atRisk: struggling,
      excellent,
      studentCount: students.length,
      fachScores,
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

  function toggleThema(id: string) {
    setExpandedThemaIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const showFachContext = selectedFachIds.length !== 1

  return (
    <div className="space-y-6">

      {/* Fach chip filter */}
      <FachChipFilter
        faecher={assignedFaecher}
        allFachIds={allFachIds}
        selectedIds={selectedFachIds}
        onChange={setSelectedFachIds}
      />

      {/* Tier + Kat filter */}
      <FilterBar tier={tier} onTierChange={setTier} katFilter={katFilter} onKatChange={setKatFilter} />

      {/* Future themen notice */}
      {futureThemen.length > 0 && (
        <div className="rounded-lg border border-sky-200 bg-sky-50/60 px-4 py-2.5 text-xs text-sky-700 flex items-center gap-2">
          <span className="shrink-0">📅</span>
          <span>
            <strong>{futureThemen.length} {futureThemen.length === 1 ? 'Thema' : 'Themen'}</strong> noch nicht fällig und daher ausgeschlossen:{' '}
            {futureThemen.map(t => t.name).join(', ')}
          </span>
        </div>
      )}

      {/* ── Zone 1: KPI row ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-3">
          <KpiTile
            label={tier !== 'all' ? TIER_FULL[tier] : 'Ø Score'}
            value={`${Math.round(avgScore)}%`}
            borderColor={Math.round(avgScore) >= 75 ? 'border-l-emerald-400' : Math.round(avgScore) >= 25 ? 'border-l-amber-400' : 'border-l-red-400'}
            sub={
              deltaVsLast !== null
                ? `${deltaVsLast > 0 ? '▲' : deltaVsLast < 0 ? '▼' : '='} ${Math.abs(deltaVsLast).toFixed(1)}% vs. letztem Snap`
                : trendIsUp !== null
                ? trendIsUp ? '▲ steigender Trend' : '▼ fallender Trend'
                : `${students.length} Schüler`
            }
          />
          <KpiTile
            label="Sehr gut"
            value={excellent}
            borderColor="border-l-emerald-400"
            sub={`≥75% · ${tier === 'all' ? students.length : tierStudents.length} gesamt`}
          />
          <KpiTile
            label="Im Aufbau"
            value={progressing}
            borderColor="border-l-amber-400"
            sub="25–74%"
          />
          <KpiTile
            label="Förderbedarf"
            value={struggling}
            borderColor={struggling > 0 ? 'border-l-red-400' : 'border-l-border'}
            sub="unter 25%"
          />
        </div>

        {tier === 'all' && (
          <DistributionBar
            excellent={excellent}
            progressing={progressing}
            struggling={struggling}
            total={students.length}
          />
        )}
      </div>

      {/* ── Zone 2: Trend chart (full width) ────────────────────────────── */}
      <div className="space-y-2">
        <SectionLabel
          label="Klassentrend"
          action={
            <button
              onClick={saveSnap}
              className="flex items-center gap-1.5 text-xs bg-foreground text-background hover:bg-foreground/85 px-3 py-1.5 rounded-md font-medium transition-colors"
            >
              <Camera className="size-3" />
              Snapshot
            </button>
          }
        />
        <div className="rounded-xl border border-border bg-card p-5">
          {trendPoints.length >= 2
            ? (
              <div className="space-y-1">
                {trendIsUp !== null && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-xs font-semibold', trendIsUp ? 'text-emerald-600' : 'text-amber-600')}>
                      {trendIsUp ? '▲ Steigender Trend' : '▼ Fallender Trend'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {trendPoints[0].pct.toFixed(0)}% → {trendPoints[trendPoints.length - 1].pct.toFixed(0)}%
                    </span>
                  </div>
                )}
                <TrendChart points={trendPoints} />
              </div>
            )
            : (
              <div className="flex items-center justify-center py-12 text-xs text-center text-muted-foreground">
                <div className="space-y-1">
                  <p className="font-medium">Noch kein Verlauf</p>
                  <p className="text-muted-foreground/70">Klicke &ldquo;Snapshot&rdquo; um den aktuellen Stand aufzuzeichnen,<br />oder erfasse Beurteilungen um den automatischen Verlauf zu sehen.</p>
                </div>
              </div>
            )
          }
        </div>
      </div>

      {/* ── Zone 3: Per-Fach KPI cards | Schüler-Ranking ────────────────── */}
      <div className="grid grid-cols-2 gap-5 items-start">

        <div className="space-y-2">
          <SectionLabel label={`Fächer — ${filteredFaecher.length} ${filteredFaecher.length === 1 ? 'Fach' : 'Fächer'}`} />
          <div className="grid grid-cols-2 gap-3">
            {filteredFaecher.map(fach => {
              const fachThemen = activeThemen.filter(t => t.fachId === fach.id)
              const fachLZ = fachThemen.flatMap(t => lernziele.filter(lz => lz.themaId === t.id))
              if (fachLZ.length === 0) return null
              const grundIds = fachLZ.filter(lz => lz.kategorie === 'grundlegend').map(lz => lz.id)
              const ansprIds = fachLZ.filter(lz => lz.kategorie === 'anspruchsvoll').map(lz => lz.id)
              const nReg = regularTierStudents.length
              const avgG = nReg && grundIds.length
                ? Math.round(regularTierStudents.reduce((s, x) => s + studentLZScore(x, grundIds), 0) / nReg)
                : null
              const avgA = nReg && ansprIds.length
                ? Math.round(regularTierStudents.reduce((s, x) => s + studentLZScore(x, ansprIds), 0) / nReg)
                : null
              const reached = fachLZ.reduce((sum, lz) => {
                const elig = regularTierStudents.filter(s => !isLZSkipped(lz, s, activeThemen))
                return sum + elig.filter(s => s.lernzielStatus[lz.id] === 'reached').length
              }, 0)
              const partial = fachLZ.reduce((sum, lz) => {
                const elig = regularTierStudents.filter(s => !isLZSkipped(lz, s, activeThemen))
                return sum + elig.filter(s => s.lernzielStatus[lz.id] === 'partially_reached').length
              }, 0)
              const total = fachLZ.reduce((sum, lz) =>
                sum + regularTierStudents.filter(s => !isLZSkipped(lz, s, activeThemen)).length, 0)
              const avgPct = total === 0 ? 0 : Math.round(((reached + partial * 0.5) / total) * 100)
              const fc = getFachColor(fach.id, allFachIds)

              return (
                <div key={fach.id} className={cn('rounded-xl border border-border bg-card px-4 py-3 border-l-4', fc.border)}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={cn('size-2 rounded-full shrink-0', fc.dot)} />
                    <span className="text-xs font-semibold">{fach.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={cn('text-xl font-bold tabular-nums', scoreColor(avgPct))}>{avgPct}%</span>
                    {avgG !== null && (
                      <span className="text-[10px] text-muted-foreground">
                        G <span className="font-semibold text-foreground">{avgG}%</span>
                      </span>
                    )}
                    {avgA !== null && (
                      <span className="text-[10px] text-muted-foreground">
                        A <span className="font-semibold text-foreground">{avgA}%</span>
                      </span>
                    )}
                  </div>
                  <StackedBar reached={reached} partial={partial} total={total} h="h-2" />
                  <p className="text-[10px] text-muted-foreground mt-1.5">{fachLZ.length} LZ</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <SectionLabel label={`Schüler-Ranking — ${scopeScored.length} Schüler`} />
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <StudentRankingTable
              students={scopeScored}
              sort={studentSort}
              onSortChange={setStudentSort}
            />
          </div>
        </div>

      </div>

      {/* ── Zone 4: Thema difficulty list (full width) ───────────────────── */}
      {themaStats.length > 0 && (
        <div className="space-y-2">
          <SectionLabel label={`Themen — ${themaStats.length} ${themaStats.length === 1 ? 'Thema' : 'Themen'}, nach Schwierigkeit`} />
          <div className="space-y-1.5">
            {themaStats.map(({ thema, fach, r, p, t, avg, lzCount }) => {
              const isExpanded = expandedThemaIds.has(thema.id)
              const fc = fach ? getFachColor(fach.id, allFachIds) : null
              const themaLzStats = lzStats.filter(({ lz }) => lz.themaId === thema.id)
              const diffBadge = avg < 40
                ? <span className="rounded px-1.5 py-0.5 text-[9px] font-bold bg-red-100 text-red-600">↓ schwierig</span>
                : avg >= 75
                ? <span className="rounded px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-600">↑ gut</span>
                : null

              return (
                <div key={thema.id} className="rounded-xl border border-border overflow-hidden">
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/30 transition-colors text-left"
                    onClick={() => toggleThema(thema.id)}
                  >
                    <ChevronRight className={cn(
                      'size-3 text-muted-foreground shrink-0 transition-transform',
                      isExpanded && 'rotate-90',
                    )} />
                    {showFachContext && fc && (
                      <span className={cn('size-2 rounded-full shrink-0', fc.dot)} />
                    )}
                    <span className="text-xs font-medium flex-1 truncate">{thema.name}</span>
                    {diffBadge}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground">{lzCount} LZ</span>
                      <div className="w-16 shrink-0">
                        <StackedBar reached={r} partial={p} total={t} h="h-1.5" />
                      </div>
                      <span className={cn('text-xs font-bold tabular-nums w-8 text-right shrink-0', scoreColor(avg))}>
                        {avg}%
                      </span>
                    </div>
                  </button>

                  {isExpanded && themaLzStats.length > 0 && (
                    <div className="border-t border-border bg-muted/10 p-1">
                      {themaLzStats.map(({ lz, reached, partial, eligibleCount }) => (
                        <LZRow
                          key={lz.id}
                          label={lz.label}
                          kategorie={lz.kategorie}
                          reached={reached}
                          partial={partial}
                          total={eligibleCount}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Zone 5: Heatmap (collapsible) ───────────────────────────────── */}
      {scopedLZ.length > 0 && (
        <div className="space-y-2">
          <SectionLabel
            label="Heatmap — Schüler × Lernziele"
            action={
              <button
                onClick={() => setHeatmapOpen(v => !v)}
                className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
              >
                {heatmapOpen
                  ? <ChevronDown className="size-3" />
                  : <ChevronRight className="size-3" />
                }
                {heatmapOpen ? 'Ausblenden' : 'Anzeigen'}
              </button>
            }
          />
          {heatmapOpen && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
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
            </div>
          )}
        </div>
      )}

      {/* ── Zone 6: Snapshot history (collapsible) ──────────────────────── */}
      <div className="space-y-2">
        <SectionLabel
          label={`Snapshot-Verlauf — ${snaps.length} gespeichert`}
          action={
            <button
              onClick={() => setSnapHistoryOpen(v => !v)}
              className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              {snapHistoryOpen
                ? <ChevronDown className="size-3" />
                : <ChevronRight className="size-3" />
              }
              {snapHistoryOpen ? 'Ausblenden' : 'Anzeigen'}
            </button>
          }
        />
        {snapHistoryOpen && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <SnapshotHistoryTable snaps={snaps} faecher={assignedFaecher} onDelete={deleteSnap} />
          </div>
        )}
      </div>

    </div>
  )
}
