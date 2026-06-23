'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn, getFachColor, sv, scoreColor, categoryChipClasses } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FachChipFilter } from '@/components/shared/FachChipFilter'
import { DistributionBars } from '@/components/analytics/DistributionBars'
import { useData } from '@/contexts/DataContext'
import type { Schueler, Thema, Lernziel, LernzielKategorie, Fach } from '@/types/domain'

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

function sName(s: Schueler): string {
  return `${s.vorname} ${s.nachname}`
}

// ── Types ──────────────────────────────────────────────────────────────────

type KatFilter = 'all' | 'grundlegend' | 'anspruchsvoll'
type StudentSort = 'score' | 'name'
type StatView = 'gesamt' | 'fach' | 'thema' | 'pruefungen'

type ScoredStudent = Schueler & { score: number; allScore: number }

const KAT_LABELS: Record<KatFilter, string> = {
  all: 'G + A',
  grundlegend: 'Grundlegend',
  anspruchsvoll: 'Anspruchsvoll',
}

// ── Chip ───────────────────────────────────────────────────────────────────

function Chip({
  label, active, activeClass, onClick,
}: {
  label: string
  active: boolean
  activeClass?: string
  onClick: () => void
}) {
  return (
    <Button
      onClick={onClick}
      variant={active ? 'default' : 'outline'}
      size="sm"
      className={cn('whitespace-nowrap', active && activeClass)}
    >
      {label}
    </Button>
  )
}

// ── Filter bar ─────────────────────────────────────────────────────────────

function FilterBar({
  katFilter, onKatChange,
}: {
  katFilter: KatFilter
  onKatChange: (k: KatFilter) => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 shrink-0">Lernziel-Kategorie</span>
      {(['all', 'grundlegend', 'anspruchsvoll'] as KatFilter[]).map(k => (
        <Chip
          key={k}
          label={KAT_LABELS[k]}
          active={katFilter === k}
          activeClass={
            k === 'grundlegend' ? 'bg-category-grundlegend text-white hover:bg-category-grundlegend/90'
            : k === 'anspruchsvoll' ? 'bg-category-anspruchsvoll text-white hover:bg-category-anspruchsvoll/90'
            : undefined
          }
          onClick={() => onKatChange(k)}
        />
      ))}
    </div>
  )
}

// ── Section label ──────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="pb-1 border-b border-border/40">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">{label}</span>
    </div>
  )
}

// ── KPI tile ───────────────────────────────────────────────────────────────

function KpiTile({
  label, value, sub, valueClass,
}: {
  label: string
  value: string | number
  sub?: string
  valueClass?: string
}) {
  return (
    <div className="bg-card border border-border rounded-md px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">{label}</p>
      <p className={cn('text-2xl font-bold tabular-nums tracking-tight leading-none', valueClass ?? 'text-foreground')}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-muted-foreground/70 mt-1.5 leading-tight">{sub}</p>}
    </div>
  )
}

// ── LZ aggregate status bar ────────────────────────────────────────────────

function LZStatusBar({
  reached, partial, notReached,
}: {
  reached: number; partial: number; notReached: number
}) {
  const total = reached + partial + notReached
  if (total === 0) return null
  const rp = (reached / total) * 100
  const pp = (partial / total) * 100
  const np = (notReached / total) * 100
  return (
    <div className="space-y-1.5">
      <div className="flex h-2 w-full overflow-hidden bg-muted">
        {rp > 0 && <div style={{ width: `${rp}%` }} className="h-full bg-status-reached transition-all" />}
        {pp > 0 && <div style={{ width: `${pp}%` }} className="h-full bg-status-partial transition-all" />}
        {np > 0 && <div style={{ width: `${np}%` }} className="h-full bg-status-none-soft transition-all" />}
      </div>
      <div className="flex gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block size-1.5 bg-status-reached shrink-0" />
          {reached} erreicht
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-1.5 bg-status-partial shrink-0" />
          {partial} teilweise
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-1.5 bg-status-none-soft shrink-0" />
          {notReached} nicht erreicht
        </span>
      </div>
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
    <div className="space-y-1.5">
      <div className="flex h-3 w-full overflow-hidden bg-muted">
        {ep > 0 && (
          <div style={{ width: `${ep}%` }} className="h-full bg-status-reached flex items-center justify-center transition-all">
            {ep > 10 && <span className="text-white text-[9px] font-bold tabular-nums">{excellent}</span>}
          </div>
        )}
        {pp > 0 && (
          <div style={{ width: `${pp}%` }} className="h-full bg-status-partial flex items-center justify-center transition-all">
            {pp > 10 && <span className="text-white text-[9px] font-bold tabular-nums">{progressing}</span>}
          </div>
        )}
        {sp > 0 && (
          <div style={{ width: `${sp}%` }} className="h-full bg-status-not-reached flex items-center justify-center transition-all">
            {sp > 10 && <span className="text-white text-[9px] font-bold tabular-nums">{struggling}</span>}
          </div>
        )}
      </div>
      <div className="flex gap-5 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-1.5 bg-status-reached inline-block shrink-0" />
          {excellent} sehr gut (≥75%)
        </span>
        <span className="flex items-center gap-1">
          <span className="size-1.5 bg-status-partial inline-block shrink-0" />
          {progressing} im Aufbau (25–74%)
        </span>
        <span className="flex items-center gap-1">
          <span className="size-1.5 bg-status-not-reached inline-block shrink-0" />
          {struggling} Förderbedarf (&lt;25%)
        </span>
      </div>
    </div>
  )
}

// ── Blue progress bar ──────────────────────────────────────────────────────

function ProgressBar({ pct, h = 'h-1.5' }: { pct: number; h?: string }) {
  return (
    <div className={cn('w-full bg-muted overflow-hidden', h)}>
      <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }} />
    </div>
  )
}

// ── Student ranking table ──────────────────────────────────────────────────

function StudentRankingTable({
  students, sort, onSortChange, onRowClick,
}: {
  students: ScoredStudent[]
  sort: StudentSort
  onSortChange: (s: StudentSort) => void
  onRowClick?: (studentId: string) => void
}) {
  const sorted = [...students].sort(
    sort === 'score'
      ? (a, b) => b.score - a.score
      : (a, b) => sName(a).localeCompare(sName(b)),
  )

  function ColHeader({ field, children }: { field: StudentSort; children: React.ReactNode }) {
    return (
      <Button
        onClick={() => onSortChange(field)}
        variant="ghost"
        size="xs"
        className={cn(
          'h-auto px-0 font-mono text-[9px] uppercase tracking-widest hover:bg-transparent',
          sort === field ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {children}{sort === field ? ' ↓' : ''}
      </Button>
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
                  <span className="inline-flex items-center justify-center size-5 rounded text-[10px] font-bold tabular-nums bg-muted text-muted-foreground">
                    {i + 1}
                  </span>
                </td>
                <td className="py-2 px-2 text-sm font-medium">{sName(s)}</td>
                <td className={cn('py-2 px-2 text-right tabular-nums text-sm font-bold', scoreColor(pct))}>{pct}%</td>
                <td className="py-2 px-2"><ProgressBar pct={pct} h="h-1.5" /></td>
                <td className="py-2 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {s.rilzFachIds?.length
                      ? <span className="text-[9px] font-bold bg-rilz-soft text-rilz-foreground rounded px-1 py-0.5">RILZ</span>
                      : null}
                    {s.bvsa
                      ? <span className="text-[9px] font-bold bg-primary/10 text-primary rounded px-1 py-0.5">BVSA</span>
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
    <div className="py-1.5 px-2 hover:bg-accent transition-colors">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className={cn(
            'shrink-0 rounded px-1 py-0.5 text-[8px] font-bold leading-none',
            categoryChipClasses(kategorie),
          )}>
            {kategorie === 'grundlegend' ? 'G' : 'A'}
          </span>
          <span className="text-xs truncate">{label}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-xs">
          <span className="text-[10px] tabular-nums text-muted-foreground">
            <span className="text-status-reached font-medium">{reached}</span>/{total}
          </span>
          <span className={cn('font-bold tabular-nums w-8 text-right', scoreColor(pct))}>{pct}%</span>
        </div>
      </div>
      <ProgressBar pct={pct} h="h-1" />
    </div>
  )
}

// ── View switcher ──────────────────────────────────────────────────────────

const VIEW_OPTIONS: { key: StatView; label: string }[] = [
  { key: 'gesamt', label: 'Gesamt' },
  { key: 'fach', label: 'Fach' },
  { key: 'thema', label: 'Thema' },
  { key: 'pruefungen', label: 'Lernzielkontrollen' },
]

function ViewSwitcher({ view, onChange }: { view: StatView; onChange: (v: StatView) => void }) {
  return (
    <div className="flex border-b border-border -mx-1">
      {VIEW_OPTIONS.map(o => (
        <Button
          key={o.key}
          onClick={() => onChange(o.key)}
          variant="ghost"
          className={cn(
            'h-auto rounded-none px-4 py-2 border-b-2 -mb-px whitespace-nowrap hover:bg-transparent',
            view === o.key
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
        </Button>
      ))}
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
  const { pruefungen, pruefungErgebnisse } = useData()
  const router = useRouter()

  function navigateToStudent(studentId: string, fachIds: string[] = []) {
    const params = fachIds.length > 0 ? `?fachIds=${fachIds.join(',')}` : ''
    router.push(`/klassen/${klassId}/schueler/${studentId}${params}`)
  }

  const [view, setView] = useState<StatView>('gesamt')
  const [selectedFachIds, setSelectedFachIds] = useState<string[]>([])
  const [katFilter, setKatFilter] = useState<KatFilter>('all')
  const [studentSort, setStudentSort] = useState<StudentSort>('score')
  const [selectedThemaId, setSelectedThemaId] = useState<string>('')
  const [selectedPruefungId, setSelectedPruefungId] = useState<string>('')

  if (students.length === 0) {
    return <p className="text-sm text-muted-foreground">Noch keine Schüler in dieser Klasse.</p>
  }
  if (themen.length === 0) {
    return <p className="text-sm text-muted-foreground">Dieser Klasse sind noch keine Themen zugewiesen.</p>
  }

  const today = new Date().toISOString().slice(0, 10)
  const activeThemen = themen.filter(t => !t.faelligAm || t.faelligAm <= today)

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

  const allScored = students.map(s => ({
    ...s,
    allScore: studentLZScoreAdjusted(s, allLZ, activeThemen),
  }))

  const scopeScored: ScoredStudent[] = allScored.map(s => ({
    ...s,
    score: studentLZScoreAdjusted(s, scopedLZ, activeThemen),
  }))

  const regularStudents = allScored.filter(s => !isSpecial(s))
  const regularScoped = scopeScored.filter(s => !isSpecial(s))

  const avgScore = regularScoped.length
    ? regularScoped.reduce((sum, x) => sum + x.score, 0) / regularScoped.length
    : 0

  const excellent = allScored.filter(s => s.allScore >= 75).length
  const progressing = allScored.filter(s => s.allScore >= 25 && s.allScore < 75).length
  const struggling = allScored.filter(s => s.allScore < 25).length

  const scopeExcellent = scopeScored.filter(s => s.score >= 75).length
  const scopeProgressing = scopeScored.filter(s => s.score >= 25 && s.score < 75).length
  const scopeStruggling = scopeScored.filter(s => s.score < 25).length

  // ── Thema selector data ────────────────────────────────────────────────

  const themaOptions = activeThemen.map(t => ({
    thema: t,
    fach: faecher.find(f => f.id === t.fachId),
  }))

  const selectedThema = themaOptions.find(o => o.thema.id === selectedThemaId)
  const themaLZ = selectedThemaId ? lernziele.filter(lz => lz.themaId === selectedThemaId) : []
  const themaKatFilteredLZ = katFilter === 'all' ? themaLZ : themaLZ.filter(lz => lz.kategorie === katFilter)

  const themaLZStats = themaKatFilteredLZ.map(lz => {
    const eligible = regularStudents.filter(s => !isLZSkipped(lz, s, activeThemen))
    const reached = eligible.filter(s => s.lernzielStatus[lz.id] === 'reached').length
    const partial = eligible.filter(s => s.lernzielStatus[lz.id] === 'partially_reached').length
    return { lz, reached, partial, eligibleCount: eligible.length }
  })

  const themaAvgPct = themaKatFilteredLZ.length === 0 ? 0 : (() => {
    if (regularStudents.length === 0) return 0
    const scores = regularStudents.map(s => studentLZScoreAdjusted(s, themaKatFilteredLZ, activeThemen))
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  })()

  const themaStudents = [...scopeScored]
    .map(s => ({ ...s, themaScore: studentLZScoreAdjusted(s, themaKatFilteredLZ, activeThemen) }))
    .sort((a, b) => b.themaScore - a.themaScore)

  // ── Prüfungsstatistiken data ───────────────────────────────────────────

  const klassePruefungen = pruefungen
    .filter(p => p.klasseId === klassId)
    .sort((a, b) => b.datum.localeCompare(a.datum))

  const selectedPruefung = klassePruefungen.find(p => p.id === selectedPruefungId)
  const pruefungErgebn = pruefungErgebnisse.filter(e => e.pruefungId === selectedPruefungId)

  const pruefungStudentRows = students
    .filter(s => selectedPruefung?.nurRilz
      ? (selectedPruefung.rilzSchuelerIds ?? []).includes(s.id)
      : !s.rilzFachIds?.includes(selectedPruefung?.fachId ?? ''))
    .map(s => ({ student: s, ergebnis: pruefungErgebn.find(e => e.schuelerId === s.id) }))
    .sort((a, b) => {
      if (selectedPruefung?.punkteEnabled) {
        return (b.ergebnis?.punkte ?? -1) - (a.ergebnis?.punkte ?? -1)
      }
      if (selectedPruefung?.noteEnabled) {
        return parseFloat(b.ergebnis?.note ?? '0') - parseFloat(a.ergebnis?.note ?? '0')
      }
      const ord = { reached: 0, partially_reached: 1, not_reached: 2 }
      return ord[a.ergebnis?.status ?? 'not_reached'] - ord[b.ergebnis?.status ?? 'not_reached']
    })

  // Notenverteilung als Buckets über der festen Skala 1.0–6.0 (0.5-Schritte)
  const gradeDistribution = (() => {
    if (!selectedPruefung?.noteEnabled) return []
    const counts = new Map<number, number>()
    for (const row of pruefungStudentRows) {
      const note = row.ergebnis?.note
      if (!note) continue
      const val = Math.round(parseFloat(note) * 2) / 2
      if (Number.isNaN(val)) continue
      counts.set(val, (counts.get(val) ?? 0) + 1)
    }
    const buckets: { x: number; count: number }[] = []
    for (let g = 1; g <= 6.0001; g += 0.5) {
      const x = Math.round(g * 2) / 2
      buckets.push({ x, count: counts.get(x) ?? 0 })
    }
    return buckets
  })()

  const pointsStats = (() => {
    if (!selectedPruefung?.punkteEnabled) return null
    const values = pruefungStudentRows
      .map(r => r.ergebnis?.punkte)
      .filter((v): v is number => v !== undefined && v !== null)
    if (values.length === 0) return null
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    }
  })()

  // Punkteverteilung als Buckets über 0…maxPunkte (Fallback: beobachteter Bereich)
  const pointsDistribution = (() => {
    if (!selectedPruefung?.punkteEnabled || !pointsStats) return null
    const lo = selectedPruefung.maxPunkte != null ? 0 : pointsStats.min
    const hi = selectedPruefung.maxPunkte ?? pointsStats.max
    const min = Math.floor(lo)
    const max = Math.ceil(hi)
    if (max <= min) return null
    const counts = new Map<number, number>()
    for (const row of pruefungStudentRows) {
      const p = row.ergebnis?.punkte
      if (p == null) continue
      const x = Math.round(p)
      counts.set(x, (counts.get(x) ?? 0) + 1)
    }
    const buckets: { x: number; count: number }[] = []
    for (let p = min; p <= max; p++) buckets.push({ x: p, count: counts.get(p) ?? 0 })
    // ~5 gleichmäßige X-Ticks über den Bereich
    const ticks: number[] = []
    for (let i = 0; i <= 4; i++) ticks.push(Math.round(min + ((max - min) * i) / 4))
    return { buckets, min, max, ticks: [...new Set(ticks)] }
  })()

  const statusDistrib = (() => {
    if (selectedPruefung?.punkteEnabled || selectedPruefung?.noteEnabled || !selectedPruefung) return null
    const r = pruefungStudentRows.filter(x => x.ergebnis?.status === 'reached').length
    const p = pruefungStudentRows.filter(x => x.ergebnis?.status === 'partially_reached').length
    const n = pruefungStudentRows.filter(x => !x.ergebnis || x.ergebnis.status === 'not_reached').length
    return { reached: r, partial: p, notReached: n }
  })()

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* Tabs */}
      <ViewSwitcher view={view} onChange={setView} />

      {/* ── Unified filter zone ─────────────────────────────────────── */}
      <div className="space-y-2 pb-3 border-b border-border">
        {view === 'fach' && (
          <FachChipFilter
            faecher={assignedFaecher}
            allFachIds={allFachIds}
            selectedIds={selectedFachIds}
            onChange={setSelectedFachIds}
          />
        )}
        {view === 'thema' && (
          <div className="flex items-center gap-2">
            <label htmlFor="thema-select" className="text-xs text-muted-foreground shrink-0">Thema:</label>
            <select
              id="thema-select"
              value={selectedThemaId}
              onChange={e => setSelectedThemaId(e.target.value)}
              className="flex-1 text-sm border border-input rounded-md px-2 py-1.5 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
            >
              <option value="">— Thema wählen —</option>
              {assignedFaecher.map(fach => {
                const fachThemen = themaOptions.filter(o => o.thema.fachId === fach.id)
                if (fachThemen.length === 0) return null
                return (
                  <optgroup key={fach.id} label={fach.name}>
                    {fachThemen.map(o => (
                      <option key={o.thema.id} value={o.thema.id}>{o.thema.name}</option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
          </div>
        )}
        {view === 'pruefungen' && (
          <div className="flex items-center gap-2">
            <label htmlFor="pruefung-select" className="text-xs text-muted-foreground shrink-0">Lernzielkontrolle:</label>
            <select
              id="pruefung-select"
              value={selectedPruefungId}
              onChange={e => setSelectedPruefungId(e.target.value)}
              className="flex-1 text-sm border border-input rounded-md px-2 py-1.5 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
            >
              <option value="">— Lernzielkontrolle wählen —</option>
              {klassePruefungen.map(p => {
                const fach = faecher.find(f => f.id === p.fachId)
                const modeTag = p.punkteEnabled ? ' [Punkte]' : p.noteEnabled ? ' [Note]' : ' [Status]'
                return (
                  <option key={p.id} value={p.id}>
                    {p.datum} — {p.name}{fach ? ` (${fach.name})` : ''}{modeTag}
                  </option>
                )
              })}
            </select>
          </div>
        )}
        {view !== 'pruefungen' && (
          <FilterBar katFilter={katFilter} onKatChange={setKatFilter} />
        )}
      </div>

      {/* ── GESAMT ──────────────────────────────────────────────────────── */}
      {view === 'gesamt' && (
        <div className="space-y-5">

          {/* KPI tiles */}
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <KpiTile
                label="Ø Score"
                value={`${Math.round(avgScore)}%`}
                valueClass={scoreColor(Math.round(avgScore))}
                sub={`${students.length} Schüler`}
              />
              <KpiTile label="Sehr gut" value={excellent} valueClass="text-status-reached" sub={`≥75% · ${students.length} gesamt`} />
              <KpiTile label="Im Aufbau" value={progressing} valueClass="text-status-partial" sub="25–74%" />
              <KpiTile label="Förderbedarf" value={struggling} valueClass={struggling > 0 ? 'text-status-not-reached' : 'text-muted-foreground'} sub="unter 25%" />
            </div>

            <DistributionBar excellent={excellent} progressing={progressing} struggling={struggling} total={students.length} />

          </div>

          {/* Schüler-Ranking */}
          <div className="space-y-2">
            <SectionLabel label={`Lernstand — ${scopeScored.length} Schüler`} />
            <div className="border border-border rounded-2xl overflow-hidden bg-card">
              <StudentRankingTable
                students={scopeScored}
                sort={studentSort}
                onSortChange={setStudentSort}
                onRowClick={id => navigateToStudent(id)}
              />
            </div>
          </div>

        </div>
      )}

      {/* ── FACH ────────────────────────────────────────────────────────── */}
      {view === 'fach' && (
        <div className="space-y-4">
          {filteredFaecher.length > 0 ? (
            <>
              <div className="border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="py-2 px-3 text-left text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Fach</th>
                      <th className="py-2 px-3 text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground w-16">Ø</th>
                      <th className="py-2 px-3 text-[9px] font-mono uppercase tracking-widest text-muted-foreground w-40">Verlauf</th>
                      <th className="py-2 px-3 text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground w-16">G</th>
                      <th className="py-2 px-3 text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground w-16">A</th>
                      <th className="py-2 px-3 text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground w-12">LZ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFaecher.map(fach => {
                      const fachThemen = activeThemen.filter(t => t.fachId === fach.id)
                      const fachAllLZ = fachThemen.flatMap(t => lernziele.filter(lz => lz.themaId === t.id))
                      const fachLZ = katFilter === 'all' ? fachAllLZ : fachAllLZ.filter(lz => lz.kategorie === katFilter)
                      if (fachLZ.length === 0) return null

                      const grundLZ = fachAllLZ.filter(lz => lz.kategorie === 'grundlegend')
                      const ansprLZ = fachAllLZ.filter(lz => lz.kategorie === 'anspruchsvoll')
                      const nReg = regularStudents.length

                      const avgG = nReg && grundLZ.length
                        ? Math.round(regularStudents.reduce((s, x) => s + studentLZScore(x, grundLZ.map(l => l.id)), 0) / nReg)
                        : null
                      const avgA = nReg && ansprLZ.length
                        ? Math.round(regularStudents.reduce((s, x) => s + studentLZScore(x, ansprLZ.map(l => l.id)), 0) / nReg)
                        : null

                      const reached = fachLZ.reduce((sum, lz) => {
                        const elig = regularStudents.filter(s => !isLZSkipped(lz, s, activeThemen))
                        return sum + elig.filter(s => s.lernzielStatus[lz.id] === 'reached').length
                      }, 0)
                      const partial = fachLZ.reduce((sum, lz) => {
                        const elig = regularStudents.filter(s => !isLZSkipped(lz, s, activeThemen))
                        return sum + elig.filter(s => s.lernzielStatus[lz.id] === 'partially_reached').length
                      }, 0)
                      const total = fachLZ.reduce((sum, lz) =>
                        sum + regularStudents.filter(s => !isLZSkipped(lz, s, activeThemen)).length, 0)
                      const avgPct = total === 0 ? 0 : Math.round(((reached + partial * 0.5) / total) * 100)
                      const fc = getFachColor(fach.id, allFachIds, fach.colorIndex)

                      return (
                        <tr key={fach.id} className="border-b border-border last:border-b-0 hover:bg-accent transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className={cn('size-2 rounded-full shrink-0', fc.dot)} />
                              <span className="text-sm font-medium">{fach.name}</span>
                            </div>
                          </td>
                          <td className={cn('py-2.5 px-3 text-right tabular-nums font-bold text-sm', scoreColor(avgPct))}>{avgPct}%</td>
                          <td className="py-2.5 px-3"><ProgressBar pct={avgPct} h="h-1.5" /></td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-xs text-muted-foreground">{avgG !== null ? `${avgG}%` : '—'}</td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-xs text-muted-foreground">{avgA !== null ? `${avgA}%` : '—'}</td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-xs text-muted-foreground">{fachAllLZ.length}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <DistributionBar
                excellent={scopeExcellent}
                progressing={scopeProgressing}
                struggling={scopeStruggling}
                total={scopeScored.length}
              />

              <div className="space-y-2">
                <SectionLabel label={`Lernstand — ${scopeScored.length} Schüler`} />
                <div className="border border-border rounded-2xl overflow-hidden bg-card">
                  <StudentRankingTable
                    students={scopeScored}
                    sort={studentSort}
                    onSortChange={setStudentSort}
                    onRowClick={id => navigateToStudent(id, selectedFachIds)}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Keine Fächer für diese Auswahl.</p>
          )}
        </div>
      )}

      {/* ── THEMA ───────────────────────────────────────────────────────── */}
      {view === 'thema' && (
        <div className="space-y-4">
          {!selectedThema ? (
            <p className="text-sm text-muted-foreground">Wähle ein Thema um die Statistiken zu sehen.</p>
          ) : (
            <div className="border border-border rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between gap-4 px-4 py-3 bg-muted border-b border-border">
                <div className="flex items-center gap-2">
                  {selectedThema.fach && (
                    <span className={cn('size-2 rounded-full shrink-0', getFachColor(selectedThema.fach.id, allFachIds, selectedThema.fach.colorIndex).dot)} />
                  )}
                  <span className="text-sm font-semibold">{selectedThema.thema.name}</span>
                  {selectedThema.fach && (
                    <span className="text-xs text-muted-foreground">{selectedThema.fach.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{themaLZ.length} LZ</span>
                  <span className={cn('text-sm font-bold tabular-nums', scoreColor(themaAvgPct))}>
                    Ø {themaAvgPct}%
                  </span>
                </div>
              </div>

              {/* LZ breakdown */}
              {themaLZStats.length > 0 && (
                <div className="divide-y divide-border px-2 py-1">
                  {themaLZStats.map(({ lz, reached, partial, eligibleCount }) => (
                    <LZRow key={lz.id} label={lz.label} kategorie={lz.kategorie} reached={reached} partial={partial} total={eligibleCount} />
                  ))}
                </div>
              )}

              {/* Student list */}
              {themaStudents.length > 0 && (() => {
                const themaExcellent = themaStudents.filter(s => s.themaScore >= 75).length
                const themaProgressing = themaStudents.filter(s => s.themaScore >= 25 && s.themaScore < 75).length
                const themaStruggling = themaStudents.filter(s => s.themaScore < 25).length
                const themaAsScored: ScoredStudent[] = themaStudents.map(s => ({ ...s, score: s.themaScore }))
                return (
                  <div className="border-t border-border space-y-4 p-4">
                    <DistributionBar
                      excellent={themaExcellent}
                      progressing={themaProgressing}
                      struggling={themaStruggling}
                      total={themaStudents.length}
                    />
                    <div className="space-y-2">
                      <SectionLabel label={`Lernstand — ${themaStudents.length} Schüler`} />
                      <div className="border border-border rounded-2xl overflow-hidden bg-card">
                        <StudentRankingTable
                          students={themaAsScored}
                          sort={studentSort}
                          onSortChange={setStudentSort}
                          onRowClick={id => navigateToStudent(id, selectedThema?.fach ? [selectedThema.fach.id] : [])}
                        />
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── PRÜFUNGEN ───────────────────────────────────────────────────── */}
      {view === 'pruefungen' && (
        <div className="space-y-4">
          {klassePruefungen.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Lernzielkontrollen für diese Klasse erfasst.</p>
          ) : !selectedPruefung ? (
            <p className="text-sm text-muted-foreground">Wähle eine Lernzielkontrolle um die Statistiken zu sehen.</p>
          ) : (
            <div className="border border-border rounded-2xl overflow-hidden">
              {/* Exam header */}
              <div className="px-4 py-3 bg-muted border-b border-border flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{selectedPruefung.name}</span>
                    <span className="text-[10px] bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium">
                      {selectedPruefung.punkteEnabled ? 'Punkte' : selectedPruefung.noteEnabled ? 'Note' : 'Status'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span>{selectedPruefung.datum}</span>
                    {faecher.find(f => f.id === selectedPruefung.fachId) && (
                      <span>· {faecher.find(f => f.id === selectedPruefung.fachId)!.name}</span>
                    )}
                    <span>· {pruefungStudentRows.length} Schüler</span>
                  </div>
                </div>
              </div>

              {/* Points stats */}
              {selectedPruefung.punkteEnabled && pointsStats && (
                <div className="px-4 py-3 border-b border-border space-y-2">
                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-muted-foreground">Ø Punkte </span>
                      <span className="font-bold tabular-nums">{pointsStats.avg.toFixed(1)}</span>
                      {selectedPruefung.maxPunkte && <span className="text-muted-foreground"> / {selectedPruefung.maxPunkte}</span>}
                    </div>
                    <div><span className="text-muted-foreground">Min </span><span className="font-bold tabular-nums text-status-not-reached">{pointsStats.min}</span></div>
                    <div><span className="text-muted-foreground">Max </span><span className="font-bold tabular-nums text-status-reached">{pointsStats.max}</span></div>
                    <div><span className="text-muted-foreground">Bewertet </span><span className="font-bold tabular-nums">{pointsStats.count}</span></div>
                  </div>
                  {selectedPruefung.maxPunkte && (
                    <ProgressBar pct={(pointsStats.avg / selectedPruefung.maxPunkte) * 100} h="h-2" />
                  )}
                </div>
              )}

              {/* Verteilungen — kompakt, nebeneinander */}
              {((selectedPruefung.punkteEnabled && pointsDistribution) || (selectedPruefung.noteEnabled && gradeDistribution.length > 0)) && (
                <div className="px-4 py-3 border-b border-border flex flex-col sm:flex-row gap-6">
                  {selectedPruefung.punkteEnabled && pointsDistribution && (
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Punkteverteilung</p>
                      <DistributionBars
                        buckets={pointsDistribution.buckets}
                        domainMin={pointsDistribution.min}
                        domainMax={pointsDistribution.max}
                        ticks={pointsDistribution.ticks}
                        ariaLabel="Punkteverteilung der Klasse"
                      />
                    </div>
                  )}
                  {selectedPruefung.noteEnabled && gradeDistribution.length > 0 && (
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Notenverteilung</p>
                      <DistributionBars
                        buckets={gradeDistribution}
                        domainMin={1}
                        domainMax={6}
                        ticks={[1, 2, 3, 4, 5, 6]}
                        formatTick={v => v.toFixed(1)}
                        ariaLabel="Notenverteilung der Klasse"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Status mode */}
              {statusDistrib && (
                <div className="px-4 py-3 border-b border-border">
                  <LZStatusBar reached={statusDistrib.reached} partial={statusDistrib.partial} notReached={statusDistrib.notReached} />
                </div>
              )}

              {/* Student results */}
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0 bg-card border-b border-border">
                    <tr>
                      <th className="py-2 px-3 text-left text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Schüler</th>
                      <th className="py-2 px-3 text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                        {selectedPruefung.punkteEnabled ? 'Punkte' : selectedPruefung.noteEnabled ? 'Note' : 'Status'}
                      </th>
                      {selectedPruefung.punkteEnabled && selectedPruefung.maxPunkte && <th className="py-2 px-3 w-32"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {pruefungStudentRows.map(({ student, ergebnis }) => (
                      <tr
                        key={student.id}
                        className="border-b border-border last:border-b-0 hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => navigateToStudent(student.id, selectedPruefung?.fachId ? [selectedPruefung.fachId] : [])}
                      >
                        <td className="py-2 px-3 font-medium">{sName(student)}</td>
                        <td className="py-2 px-3 text-right font-bold tabular-nums">
                          {selectedPruefung.punkteEnabled
                            ? (ergebnis?.punkte !== undefined
                              ? ergebnis.punkte
                              : <span className="text-muted-foreground font-normal">—</span>)
                            : selectedPruefung.noteEnabled
                            ? (ergebnis?.note ?? <span className="text-muted-foreground font-normal">—</span>)
                            : (
                              <span className={cn('inline-flex items-center gap-1',
                                ergebnis?.status === 'reached' ? 'text-status-reached'
                                  : ergebnis?.status === 'partially_reached' ? 'text-status-partial'
                                  : 'text-muted-foreground',
                              )}>
                                <span className={cn('inline-block size-2 rounded-full',
                                  ergebnis?.status === 'reached' ? 'bg-status-reached'
                                    : ergebnis?.status === 'partially_reached' ? 'bg-status-partial'
                                    : 'bg-status-none-soft',
                                )} />
                                {ergebnis?.status === 'reached' ? 'Erreicht'
                                  : ergebnis?.status === 'partially_reached' ? 'Teilweise'
                                  : 'Nicht erreicht'}
                              </span>
                            )
                          }
                        </td>
                        {selectedPruefung.punkteEnabled && selectedPruefung.maxPunkte && (
                          <td className="py-2 px-3">
                            <ProgressBar
                              pct={ergebnis?.punkte !== undefined ? (ergebnis.punkte / selectedPruefung.maxPunkte!) * 100 : 0}
                              h="h-1.5"
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
