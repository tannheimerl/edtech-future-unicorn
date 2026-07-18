'use client'

import React, { useMemo, useState } from 'react'
import { cn, getFachColor, scoreColor, sv, categoryChipClasses } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { FachChipFilter } from '@/components/shared/FachChipFilter'
import { FilterDropdown } from '@/components/shared/FilterDropdown'
import { SegmentedControl } from '@/components/shared/SegmentedControl'
import { UnderlineTabs } from '@/components/shared/UnderlineTabs'
import { StatusCell } from '@/components/shared/StatusCell'
import { useData } from '@/contexts/DataContext'
import { computeStudentKpis, themaCountsInStats } from '@/lib/student-kpis'
import type { Schueler, Thema, Lernziel, LernzielKategorie, Fach, Status } from '@/types/domain'

// ── Helpers ────────────────────────────────────────────────────────────────

const isLZSkipped = (lz: Lernziel, student: Schueler, themen: Thema[]): boolean => {
  if (lz.kategorie !== 'anspruchsvoll') return false
  if (!student.rilzFachIds?.length) return false
  const thema = themen.find(t => t.id === lz.themaId)
  return !!thema && student.rilzFachIds.includes(thema.fachId)
}

const studentScopedScore = (student: Schueler, lzList: Lernziel[], themen: Thema[]): number => {
  const applicable = lzList.filter(lz => !isLZSkipped(lz, student, themen))
  if (applicable.length === 0) return 0
  return (applicable.reduce((sum, lz) => sum + sv(student.lernzielStatus[lz.id] ?? 'not_reached'), 0) / applicable.length) * 100
}

// ── Types ──────────────────────────────────────────────────────────────────

type KatFilter = 'all' | 'grundlegend' | 'anspruchsvoll'
type StatView = 'gesamt' | 'fach' | 'thema' | 'pruefungen'

const KAT_LABELS: Record<KatFilter, string> = {
  all: 'G + A',
  grundlegend: 'Grundlegend',
  anspruchsvoll: 'Anspruchsvoll',
}

// ── Filter bar ─────────────────────────────────────────────────────────────

const FilterBar = ({ katFilter, onKatChange }: {
  katFilter: KatFilter
  onKatChange: (k: KatFilter) => void
}) => {
  return (
    <SegmentedControl<KatFilter>
      label="Lernziel-Kategorie"
      value={katFilter}
      onChange={onKatChange}
      options={[
        { key: 'all', label: KAT_LABELS.all },
        { key: 'grundlegend', label: KAT_LABELS.grundlegend, activeClass: 'bg-category-grundlegend text-white hover:bg-category-grundlegend/90' },
        { key: 'anspruchsvoll', label: KAT_LABELS.anspruchsvoll, activeClass: 'bg-category-anspruchsvoll text-white hover:bg-category-anspruchsvoll/90' },
      ]}
    />
  )
}

// ── Section label ──────────────────────────────────────────────────────────

const SectionLabel = ({ label }: { label: string }) => {
  return (
    <div className="pb-1 border-b border-border/40">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">{label}</span>
    </div>
  )
}

// ── KPI tile ───────────────────────────────────────────────────────────────

const KpiTile = ({ label, value, sub, valueClass }: {
  label: string
  value: string | number
  sub?: string
  valueClass?: string
}) => {
  return (
    <div className="bg-card border border-border rounded-md px-4 py-3">
      <p className="text-3xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">{label}</p>
      <p className={cn('text-2xl font-bold tabular-nums tracking-tight leading-none', valueClass ?? 'text-foreground')}>
        {value}
      </p>
      {sub && <p className="text-3xs text-muted-foreground/70 mt-1.5 leading-tight">{sub}</p>}
    </div>
  )
}

// ── LZ aggregate status bar ────────────────────────────────────────────────

const LZStatusBar = ({ reached, partial, notReached }: {
  reached: number; partial: number; notReached: number
}) => {
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
      <div className="flex gap-4 text-3xs text-muted-foreground">
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

// ── Blue progress bar ──────────────────────────────────────────────────────

const ProgressBar = ({ pct, h = 'h-1.5' }: { pct: number; h?: string }) => {
  return (
    <div className={cn('w-full bg-muted overflow-hidden', h)}>
      <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }} />
    </div>
  )
}

// ── LZ row (single student) ────────────────────────────────────────────────

const LZStudentRow = ({ lz, status, skipped }: {
  lz: Lernziel
  status: Status | undefined
  skipped: boolean
}) => {
  return (
    <div className={cn('py-2 px-3 flex items-center justify-between gap-3', skipped && 'opacity-40')}>
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <span className={cn(
          'shrink-0 rounded px-1 py-0.5 text-4xs font-bold leading-none',
          categoryChipClasses(lz.kategorie),
        )}>
          {lz.kategorie === 'grundlegend' ? 'G' : 'A'}
        </span>
        <span className="text-xs truncate">{lz.label}</span>
        {skipped && <span className="text-4xs text-rilz-foreground font-medium shrink-0">(RILZ)</span>}
      </div>
      {!skipped && <StatusCell status={status} readOnly onSelect={() => {}} />}
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


// ── Main component ─────────────────────────────────────────────────────────

type StudentAnalyticsProps = {
  student: Schueler
  themen: Thema[]
  lernziele: Lernziel[]
  faecher: Fach[]
  klassId: string
}

export const StudentAnalytics = ({ student, themen, lernziele, faecher, klassId }: StudentAnalyticsProps) => {
  const { pruefungen, pruefungErgebnisse } = useData()

  const [view, setView] = useState<StatView>('gesamt')
  const [selectedFachIds, setSelectedFachIds] = useState<string[]>([])
  const [katFilter, setKatFilter] = useState<KatFilter>('all')
  const [selectedThemaId, setSelectedThemaId] = useState<string>('')
  const [selectedPruefungId, setSelectedPruefungId] = useState<string>('')

  const today = new Date().toISOString().slice(0, 10)

  const activeThemen = useMemo(
    () => themen.filter(t => themaCountsInStats(t, today)),
    [themen, today],
  )

  const assignedFachIds = useMemo(() => [...new Set(themen.map(t => t.fachId))], [themen])
  const assignedFaecher = useMemo(() => faecher.filter(f => assignedFachIds.includes(f.id)), [faecher, assignedFachIds])
  const allFachIds = useMemo(() => faecher.map(f => f.id), [faecher])

  const kpis = useMemo(
    () => computeStudentKpis(student, activeThemen, lernziele, faecher),
    [student, activeThemen, lernziele, faecher],
  )

  // ── Scoped LZ (fach filter + kat filter) ──────────────────────────────

  const scopedThemen = selectedFachIds.length === 0
    ? activeThemen
    : activeThemen.filter(t => selectedFachIds.includes(t.fachId))

  const allScopedLZ = scopedThemen.flatMap(t => lernziele.filter(lz => lz.themaId === t.id))
  const scopedLZ = katFilter === 'all' ? allScopedLZ : allScopedLZ.filter(lz => lz.kategorie === katFilter)

  const scopedApplicable = scopedLZ.filter(lz => !isLZSkipped(lz, student, activeThemen))
  const scopedReached = scopedApplicable.filter(lz => student.lernzielStatus[lz.id] === 'reached').length
  const scopedPartial = scopedApplicable.filter(lz => student.lernzielStatus[lz.id] === 'partially_reached').length
  const scopedNotReached = scopedApplicable.length - scopedReached - scopedPartial

  // ── Thema tab data ─────────────────────────────────────────────────────

  const themaOptions = activeThemen.map(t => ({
    thema: t,
    fach: faecher.find(f => f.id === t.fachId),
  }))

  const selectedThema = themaOptions.find(o => o.thema.id === selectedThemaId)
  const themaAllLZ = selectedThemaId ? lernziele.filter(lz => lz.themaId === selectedThemaId) : []
  const themaKatFilteredLZ = katFilter === 'all' ? themaAllLZ : themaAllLZ.filter(lz => lz.kategorie === katFilter)

  const themaKpi = kpis.themaKpis.find(tk => tk.thema.id === selectedThemaId)
  const themaScore = themaKpi ? themaKpi.pct : 0

  const themaApplicable = themaKatFilteredLZ.filter(lz => !isLZSkipped(lz, student, activeThemen))
  const themaReached = themaApplicable.filter(lz => student.lernzielStatus[lz.id] === 'reached').length
  const themaPartial = themaApplicable.filter(lz => student.lernzielStatus[lz.id] === 'partially_reached').length
  const themaNotReached = themaApplicable.length - themaReached - themaPartial

  // ── Pruefungen tab data ────────────────────────────────────────────────

  const klassePruefungen = pruefungen
    .filter(p => p.klasseId === klassId)
    .sort((a, b) => b.datum.localeCompare(a.datum))

  const selectedPruefung = klassePruefungen.find(p => p.id === selectedPruefungId)
  const studentErgebnis = pruefungErgebnisse.find(
    e => e.pruefungId === selectedPruefungId && e.schuelerId === student.id,
  )

  const isStudentEligibleForPruefung = !selectedPruefung?.nurRilz
    || (selectedPruefung.rilzSchuelerIds ?? []).includes(student.id)

  const hasErgebnis = !!studentErgebnis && (
    selectedPruefung?.punkteEnabled ? studentErgebnis.punkte !== undefined
      : selectedPruefung?.noteEnabled ? !!studentErgebnis.note
      : studentErgebnis.status != null
  )

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* Tabs */}
      <UnderlineTabs options={VIEW_OPTIONS} value={view} onChange={setView} />

      {/* ── Filter zone ─────────────────────────────────────────────── */}
      <div className="space-y-2 pb-3 border-b border-border">
        {view === 'fach' && assignedFaecher.length > 1 && (
          <FachChipFilter
            faecher={assignedFaecher}
            allFachIds={allFachIds}
            selectedIds={selectedFachIds}
            onChange={setSelectedFachIds}
          />
        )}
        {view === 'thema' && (
          <FilterDropdown
            label="Thema"
            allLabel="wählen…"
            showSearch
            value={selectedThemaId}
            onChange={setSelectedThemaId}
            options={[
              { value: '', label: 'Kein Thema' },
              ...assignedFaecher.flatMap(fach => {
                const dot = getFachColor(fach.id, allFachIds, fach.colorIndex).dot
                return themaOptions
                  .filter(o => o.thema.fachId === fach.id)
                  .map(o => ({ value: o.thema.id, label: o.thema.name, dot }))
              }),
            ]}
          />
        )}
        {view === 'pruefungen' && (
          <FilterDropdown
            label="Lernzielkontrolle"
            allLabel="wählen…"
            showSearch
            value={selectedPruefungId}
            onChange={setSelectedPruefungId}
            options={[
              { value: '', label: 'Keine Lernzielkontrolle' },
              ...klassePruefungen.map(p => {
                const modeTag = p.punkteEnabled ? ' [Punkte]' : p.noteEnabled ? ' [Note]' : ' [Status]'
                return {
                  value: p.id,
                  label: `${p.datum} — ${p.name}${modeTag}`,
                }
              }),
            ]}
          />
        )}
        {view !== 'pruefungen' && (
          <FilterBar katFilter={katFilter} onKatChange={setKatFilter} />
        )}
      </div>

      {/* ── GESAMT ──────────────────────────────────────────────────────── */}
      {view === 'gesamt' && (
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-2">
            <KpiTile
              label="Gesamtfortschritt"
              value={`${kpis.gesamtPct}%`}
              valueClass={scoreColor(kpis.gesamtPct)}
              sub={`${kpis.totalLz} Lernziele`}
            />
            <KpiTile
              label="Noch offen"
              value={kpis.openLz}
              sub="nicht vollständig erreicht"
            />
            <KpiTile
              label="Grundlegend"
              value={`${kpis.grundPct}%`}
              valueClass={scoreColor(kpis.grundPct)}
              sub={`${kpis.grundTotal} LZ`}
            />
            <KpiTile
              label="Anspruchsvoll"
              value={kpis.ansprTotal > 0 ? `${kpis.ansprPct}%` : '—'}
              valueClass={kpis.ansprTotal > 0 ? scoreColor(kpis.ansprPct) : 'text-muted-foreground'}
              sub={kpis.ansprTotal > 0 ? `${kpis.ansprTotal} LZ` : 'RILZ'}
            />
          </div>

          <div className="space-y-2">
            <SectionLabel label="Lernziel-Status" />
            <LZStatusBar reached={kpis.reached} partial={kpis.partial} notReached={kpis.notReached} />
          </div>

          {/* Per-Fach overview */}
          {kpis.fachKpis.length > 0 && (
            <div className="space-y-2">
              <SectionLabel label="Nach Fach" />
              <div className="border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="py-2 px-3 text-left text-4xs font-mono uppercase tracking-widest text-muted-foreground">Fach</th>
                      <th className="py-2 px-3 text-right text-4xs font-mono uppercase tracking-widest text-muted-foreground w-16">Score</th>
                      <th className="py-2 px-3 text-4xs font-mono uppercase tracking-widest text-muted-foreground w-40">Verlauf</th>
                      <th className="py-2 px-3 text-right text-4xs font-mono uppercase tracking-widest text-muted-foreground w-12">G</th>
                      <th className="py-2 px-3 text-right text-4xs font-mono uppercase tracking-widest text-muted-foreground w-12">A</th>
                      <th className="py-2 px-3 text-right text-4xs font-mono uppercase tracking-widest text-muted-foreground w-10">LZ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpis.fachKpis.map(fk => {
                      const fc = getFachColor(fk.fach.id, allFachIds, fk.fach.colorIndex)
                      const isRilz = (student.rilzFachIds ?? []).includes(fk.fach.id)
                      return (
                        <tr key={fk.fach.id} className="border-b border-border last:border-b-0">
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className={cn('size-2 rounded-full shrink-0', fc.dot)} />
                              <span className="text-sm font-medium">{fk.fach.name}</span>
                              {isRilz && <span className="text-4xs font-bold bg-rilz-soft text-rilz-foreground rounded px-1">RILZ</span>}
                            </div>
                          </td>
                          <td className={cn('py-2 px-3 text-right tabular-nums font-bold text-sm', scoreColor(fk.pct))}>{fk.pct}%</td>
                          <td className="py-2 px-3"><ProgressBar pct={fk.pct} h="h-1.5" /></td>
                          <td className="py-2 px-3 text-right tabular-nums text-xs text-muted-foreground">{fk.gTotal > 0 ? `${fk.gPct}%` : '—'}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-xs text-muted-foreground">{fk.aTotal > 0 ? `${fk.aPct}%` : '—'}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-xs text-muted-foreground">{fk.total}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FACH ────────────────────────────────────────────────────────── */}
      {view === 'fach' && (
        <div className="space-y-4">
          {(() => {
            const filteredFaecher = selectedFachIds.length === 0
              ? assignedFaecher
              : assignedFaecher.filter(f => selectedFachIds.includes(f.id))

            const rows = filteredFaecher.map(fach => {
              const fachThemen = activeThemen.filter(t => t.fachId === fach.id)
              const fachAllLZ = fachThemen.flatMap(t => lernziele.filter(lz => lz.themaId === t.id))
              const fachLZ = katFilter === 'all' ? fachAllLZ : fachAllLZ.filter(lz => lz.kategorie === katFilter)
              const applicable = fachLZ.filter(lz => !isLZSkipped(lz, student, activeThemen))
              if (applicable.length === 0) return null
              const pct = Math.round(studentScopedScore(student, applicable, activeThemen))

              const gLZ = fachAllLZ.filter(lz => lz.kategorie === 'grundlegend')
              const aLZ = fachAllLZ.filter(lz => lz.kategorie === 'anspruchsvoll').filter(lz => !isLZSkipped(lz, student, activeThemen))
              const gPct = gLZ.length > 0 ? Math.round(studentScopedScore(student, gLZ, activeThemen)) : null
              const aPct = aLZ.length > 0 ? Math.round(studentScopedScore(student, aLZ, activeThemen)) : null
              const isRilz = (student.rilzFachIds ?? []).includes(fach.id)
              const fc = getFachColor(fach.id, allFachIds, fach.colorIndex)
              return { fach, pct, gPct, aPct, total: fachAllLZ.length, applicable: applicable.length, fc, isRilz }
            }).filter((r): r is NonNullable<typeof r> => r !== null)

            if (rows.length === 0) {
              return <p className="text-sm text-muted-foreground">Keine Fächer für diese Auswahl.</p>
            }

            return (
              <>
                <div className="border border-border rounded-2xl overflow-hidden">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted">
                        <th className="py-2 px-3 text-left text-4xs font-mono uppercase tracking-widest text-muted-foreground">Fach</th>
                        <th className="py-2 px-3 text-right text-4xs font-mono uppercase tracking-widest text-muted-foreground w-16">Score</th>
                        <th className="py-2 px-3 text-4xs font-mono uppercase tracking-widest text-muted-foreground w-40">Verlauf</th>
                        <th className="py-2 px-3 text-right text-4xs font-mono uppercase tracking-widest text-muted-foreground w-12">G</th>
                        <th className="py-2 px-3 text-right text-4xs font-mono uppercase tracking-widest text-muted-foreground w-12">A</th>
                        <th className="py-2 px-3 text-right text-4xs font-mono uppercase tracking-widest text-muted-foreground w-10">LZ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(({ fach, pct, gPct, aPct, total, fc, isRilz }) => (
                        <tr key={fach.id} className="border-b border-border last:border-b-0 hover:bg-accent transition-colors">
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className={cn('size-2 rounded-full shrink-0', fc.dot)} />
                              <span className="text-sm font-medium">{fach.name}</span>
                              {isRilz && <span className="text-4xs font-bold bg-rilz-soft text-rilz-foreground rounded px-1">RILZ</span>}
                            </div>
                          </td>
                          <td className={cn('py-2 px-3 text-right tabular-nums font-bold text-sm', scoreColor(pct))}>{pct}%</td>
                          <td className="py-2 px-3"><ProgressBar pct={pct} h="h-1.5" /></td>
                          <td className="py-2 px-3 text-right tabular-nums text-xs text-muted-foreground">{gPct !== null ? `${gPct}%` : '—'}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-xs text-muted-foreground">{aPct !== null ? `${aPct}%` : '—'}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-xs text-muted-foreground">{total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <LZStatusBar reached={scopedReached} partial={scopedPartial} notReached={scopedNotReached} />
              </>
            )
          })()}
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
                  {selectedThema.fach && (student.rilzFachIds ?? []).includes(selectedThema.fach.id) && (
                    <span className="text-4xs font-bold bg-rilz-soft text-rilz-foreground rounded px-1">RILZ</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{themaAllLZ.length} LZ</span>
                  <span className={cn('text-sm font-bold tabular-nums', scoreColor(themaScore))}>
                    {themaScore}%
                  </span>
                </div>
              </div>

              {/* LZ list */}
              {themaKatFilteredLZ.length > 0 && (
                <div className="divide-y divide-border">
                  {themaKatFilteredLZ.map(lz => {
                    const skipped = isLZSkipped(lz, student, activeThemen)
                    return (
                      <LZStudentRow
                        key={lz.id}
                        lz={lz}
                        status={student.lernzielStatus[lz.id]}
                        skipped={skipped}
                      />
                    )
                  })}
                </div>
              )}

              {/* Status bar */}
              {themaApplicable.length > 0 && (
                <div className="px-4 py-3 border-t border-border">
                  <LZStatusBar reached={themaReached} partial={themaPartial} notReached={themaNotReached} />
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
          ) : !isStudentEligibleForPruefung ? (
            <p className="text-sm text-muted-foreground">Diese Lernzielkontrolle ist nur für bestimmte Schüler.</p>
          ) : !hasErgebnis ? (
            <p className="text-sm text-muted-foreground">Noch keine Beurteilung für diese Lernzielkontrolle erfasst.</p>
          ) : (
            <div className="border border-border rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 bg-muted border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{selectedPruefung.name}</span>
                  <Badge variant="primary">
                    {selectedPruefung.punkteEnabled ? 'Punkte' : selectedPruefung.noteEnabled ? 'Note' : 'Status'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span>{selectedPruefung.datum}</span>
                </div>
              </div>

              {/* Result */}
              <div className="px-4 py-3 border-b border-border">
                <p className="text-4xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Mein Ergebnis</p>
                {selectedPruefung.punkteEnabled ? (
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold tabular-nums">
                        {studentErgebnis?.punkte !== undefined ? studentErgebnis.punkte : <span className="text-muted-foreground text-lg font-normal">—</span>}
                      </span>
                      {selectedPruefung.maxPunkte && (
                        <span className="text-sm text-muted-foreground">/ {selectedPruefung.maxPunkte} Punkte</span>
                      )}
                    </div>
                    {selectedPruefung.maxPunkte && studentErgebnis?.punkte !== undefined && (
                      <ProgressBar pct={(studentErgebnis.punkte / selectedPruefung.maxPunkte) * 100} h="h-2" />
                    )}
                  </div>
                ) : selectedPruefung.noteEnabled ? (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold tabular-nums">
                      {studentErgebnis?.note ?? <span className="text-muted-foreground text-lg font-normal">—</span>}
                    </span>
                    <span className="text-sm text-muted-foreground">Note</span>
                  </div>
                ) : (
                  <StatusCell status={studentErgebnis?.status} readOnly onSelect={() => {}} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
