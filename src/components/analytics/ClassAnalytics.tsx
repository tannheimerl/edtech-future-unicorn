'use client'

import React, { useState } from 'react'
import { cn, getFachColor, sv, scoreColor } from '@/lib/utils'
import { FachChipFilter } from '@/components/shared/FachChipFilter'
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
    <button
      onClick={onClick}
      className={cn(
        'h-7 px-2.5 rounded text-xs font-medium transition-all whitespace-nowrap',
        active
          ? cn('shadow-sm', activeClass ?? 'bg-blue-600 text-white')
          : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {label}
    </button>
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
            k === 'grundlegend' ? 'bg-slate-500 text-white'
            : k === 'anspruchsvoll' ? 'bg-violet-500 text-white'
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
    <div className="bg-white border border-gray-200 rounded-sm px-4 py-3">
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
      <div className="flex h-2 w-full overflow-hidden bg-gray-100">
        {rp > 0 && <div style={{ width: `${rp}%` }} className="h-full bg-green-500 transition-all" />}
        {pp > 0 && <div style={{ width: `${pp}%` }} className="h-full bg-amber-400 transition-all" />}
        {np > 0 && <div style={{ width: `${np}%` }} className="h-full bg-gray-200 transition-all" />}
      </div>
      <div className="flex gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block size-1.5 bg-green-500 shrink-0" />
          {reached} erreicht
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-1.5 bg-amber-400 shrink-0" />
          {partial} teilweise
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-1.5 bg-gray-300 shrink-0" />
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
      <div className="flex h-3 w-full overflow-hidden bg-gray-100">
        {ep > 0 && (
          <div style={{ width: `${ep}%` }} className="h-full bg-green-500 flex items-center justify-center transition-all">
            {ep > 10 && <span className="text-white text-[9px] font-bold tabular-nums">{excellent}</span>}
          </div>
        )}
        {pp > 0 && (
          <div style={{ width: `${pp}%` }} className="h-full bg-amber-400 flex items-center justify-center transition-all">
            {pp > 10 && <span className="text-white text-[9px] font-bold tabular-nums">{progressing}</span>}
          </div>
        )}
        {sp > 0 && (
          <div style={{ width: `${sp}%` }} className="h-full bg-red-400 flex items-center justify-center transition-all">
            {sp > 10 && <span className="text-white text-[9px] font-bold tabular-nums">{struggling}</span>}
          </div>
        )}
      </div>
      <div className="flex gap-5 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-1.5 bg-green-500 inline-block shrink-0" />
          {excellent} sehr gut (≥75%)
        </span>
        <span className="flex items-center gap-1">
          <span className="size-1.5 bg-amber-400 inline-block shrink-0" />
          {progressing} im Aufbau (25–74%)
        </span>
        <span className="flex items-center gap-1">
          <span className="size-1.5 bg-red-400 inline-block shrink-0" />
          {struggling} Förderbedarf (&lt;25%)
        </span>
      </div>
    </div>
  )
}

// ── Blue progress bar ──────────────────────────────────────────────────────

function ProgressBar({ pct, h = 'h-1.5' }: { pct: number; h?: string }) {
  return (
    <div className={cn('w-full bg-gray-100 overflow-hidden', h)}>
      <div className="h-full bg-blue-600 transition-all" style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }} />
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
        <thead className="sticky top-0 bg-white z-10 border-b border-gray-200">
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
              <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-2 px-3">
                  <span className="inline-flex items-center justify-center size-5 rounded text-[10px] font-bold tabular-nums bg-gray-100 text-gray-600">
                    {i + 1}
                  </span>
                </td>
                <td className="py-2 px-2 text-sm font-medium">{sName(s)}</td>
                <td className={cn('py-2 px-2 text-right tabular-nums text-sm font-bold', scoreColor(pct))}>{pct}%</td>
                <td className="py-2 px-2"><ProgressBar pct={pct} h="h-1.5" /></td>
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
    <div className="py-1.5 px-2 hover:bg-gray-50 transition-colors">
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
        <div className="flex items-center gap-2 shrink-0 text-xs">
          <span className="text-[10px] tabular-nums text-muted-foreground">
            <span className="text-green-600 font-medium">{reached}</span>/{total}
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
    <div className="flex border-b border-gray-200 -mx-1">
      {VIEW_OPTIONS.map(o => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap',
            view === o.key
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
        </button>
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
    .filter(s => !selectedPruefung?.nurRilz || (selectedPruefung.rilzSchuelerIds ?? []).includes(s.id))
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

  const gradeDistribution = (() => {
    if (!selectedPruefung?.noteEnabled) return []
    const counts = new Map<string, number>()
    for (const row of pruefungStudentRows) {
      const note = row.ergebnis?.note
      if (note) counts.set(note, (counts.get(note) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
      .map(([note, count]) => ({ note, count }))
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
      <div className="space-y-2 pb-3 border-b border-gray-100">
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
              className="flex-1 text-sm border border-gray-200 rounded-sm px-2 py-1.5 bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
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
              className="flex-1 text-sm border border-gray-200 rounded-sm px-2 py-1.5 bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
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
              <KpiTile label="Sehr gut" value={excellent} valueClass="text-green-600" sub={`≥75% · ${students.length} gesamt`} />
              <KpiTile label="Im Aufbau" value={progressing} valueClass="text-amber-600" sub="25–74%" />
              <KpiTile label="Förderbedarf" value={struggling} valueClass={struggling > 0 ? 'text-red-500' : 'text-muted-foreground'} sub="unter 25%" />
            </div>

            <DistributionBar excellent={excellent} progressing={progressing} struggling={struggling} total={students.length} />

          </div>

          {/* Schüler-Ranking */}
          <div className="space-y-2">
            <SectionLabel label={`Lernstand — ${scopeScored.length} Schüler`} />
            <div className="border border-gray-200 rounded-sm overflow-hidden bg-white">
              <StudentRankingTable students={scopeScored} sort={studentSort} onSortChange={setStudentSort} />
            </div>
          </div>

        </div>
      )}

      {/* ── FACH ────────────────────────────────────────────────────────── */}
      {view === 'fach' && (
        <div className="space-y-4">
          {filteredFaecher.length > 0 ? (
            <div className="border border-gray-200 rounded-sm overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
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
                    const fc = getFachColor(fach.id, allFachIds)

                    return (
                      <tr key={fach.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
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
            <div className="border border-gray-200 rounded-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  {selectedThema.fach && (
                    <span className={cn('size-2 rounded-full shrink-0', getFachColor(selectedThema.fach.id, allFachIds).dot)} />
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
                <div className="divide-y divide-gray-100 px-2 py-1">
                  {themaLZStats.map(({ lz, reached, partial, eligibleCount }) => (
                    <LZRow key={lz.id} label={lz.label} kategorie={lz.kategorie} reached={reached} partial={partial} total={eligibleCount} />
                  ))}
                </div>
              )}

              {/* Student list */}
              {themaStudents.length > 0 && (
                <div className="border-t border-gray-200">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Schüler</span>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                    {themaStudents.map((s, i) => {
                      const pct = Math.round(s.themaScore)
                      return (
                        <div key={s.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors">
                          <span className="text-[10px] tabular-nums text-muted-foreground w-4 text-right">{i + 1}</span>
                          <span className="text-xs font-medium flex-1 truncate">{sName(s)}</span>
                          <span className={cn('text-xs font-bold tabular-nums w-10 text-right', scoreColor(pct))}>{pct}%</span>
                          <div className="w-24 shrink-0"><ProgressBar pct={pct} h="h-1.5" /></div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
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
            <div className="border border-gray-200 rounded-sm overflow-hidden">
              {/* Exam header */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{selectedPruefung.name}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 font-medium">
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

              {/* Points mode */}
              {selectedPruefung.punkteEnabled && pointsStats && (
                <div className="px-4 py-3 border-b border-gray-100 space-y-2">
                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-muted-foreground">Ø Punkte </span>
                      <span className="font-bold tabular-nums">{pointsStats.avg.toFixed(1)}</span>
                      {selectedPruefung.maxPunkte && <span className="text-muted-foreground"> / {selectedPruefung.maxPunkte}</span>}
                    </div>
                    <div><span className="text-muted-foreground">Min </span><span className="font-bold tabular-nums text-red-500">{pointsStats.min}</span></div>
                    <div><span className="text-muted-foreground">Max </span><span className="font-bold tabular-nums text-green-600">{pointsStats.max}</span></div>
                    <div><span className="text-muted-foreground">Bewertet </span><span className="font-bold tabular-nums">{pointsStats.count}</span></div>
                  </div>
                  {selectedPruefung.maxPunkte && (
                    <ProgressBar pct={(pointsStats.avg / selectedPruefung.maxPunkte) * 100} h="h-2" />
                  )}
                </div>
              )}

              {/* Grade mode */}
              {selectedPruefung.noteEnabled && gradeDistribution.length > 0 && (
                <div className="px-4 py-3 border-b border-gray-100 space-y-1.5">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Notenverteilung</p>
                  {gradeDistribution.map(({ note, count }) => {
                    const maxCount = Math.max(...gradeDistribution.map(g => g.count))
                    const pct = (count / maxCount) * 100
                    return (
                      <div key={note} className="flex items-center gap-2">
                        <span className="text-xs font-bold tabular-nums w-8 text-right">{note}</span>
                        <div className="flex-1 bg-gray-100 h-4 overflow-hidden flex items-center">
                          <div
                            className="h-full bg-blue-600 flex items-center justify-end pr-1 transition-all"
                            style={{ width: `${pct}%`, minWidth: count > 0 ? 20 : 0 }}
                          >
                            {pct > 15 && <span className="text-[9px] text-white font-bold tabular-nums">{count}</span>}
                          </div>
                          {pct <= 15 && <span className="text-[9px] text-muted-foreground font-bold tabular-nums ml-1">{count}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Status mode */}
              {statusDistrib && (
                <div className="px-4 py-3 border-b border-gray-100">
                  <LZStatusBar reached={statusDistrib.reached} partial={statusDistrib.partial} notReached={statusDistrib.notReached} />
                </div>
              )}

              {/* Student results */}
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0 bg-white border-b border-gray-200">
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
                      <tr key={student.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
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
                                ergebnis?.status === 'reached' ? 'text-green-600'
                                  : ergebnis?.status === 'partially_reached' ? 'text-amber-600'
                                  : 'text-muted-foreground',
                              )}>
                                <span className={cn('inline-block size-2 rounded-full',
                                  ergebnis?.status === 'reached' ? 'bg-green-500'
                                    : ergebnis?.status === 'partially_reached' ? 'bg-amber-400'
                                    : 'bg-gray-300',
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
