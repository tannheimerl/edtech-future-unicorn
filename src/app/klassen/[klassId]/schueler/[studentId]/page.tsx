'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { StudentVerlauf } from '@/components/analytics/StudentVerlauf'
import { LernzielStatusDonut } from '@/components/analytics/LernzielStatusDonut'
import { StudentKpiTiles } from '@/components/student/StudentKpiTiles'
import { FachChipFilter } from '@/components/shared/FachChipFilter'
import { SectionBlock } from '@/components/shared/SectionBlock'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { getInitials, getAvatarColor } from '@/lib/avatar-utils'
import { computeStudentKpis } from '@/lib/student-kpis'
import { cn, getFachColor, scoreColor } from '@/lib/utils'
import type { Status } from '@/types/domain'
import { STATUS_LABELS, STATUS_CYCLE } from '@/types/domain'

// ── Helpers ───────────────────────────────────────────────────────────────

function StackedBar({ reached, partial, total }: { reached: number; partial: number; total: number }) {
  if (total === 0) return <div className="h-1.5 rounded-full bg-muted w-full" />
  const rp = (reached / total) * 100
  const pp = (partial / total) * 100
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
      {rp > 0 && <div style={{ width: `${rp}%` }} className="h-full bg-status-reached transition-all" />}
      {pp > 0 && <div style={{ width: `${pp}%` }} className="h-full bg-status-partial transition-all" />}
    </div>
  )
}

// ── Status selector ───────────────────────────────────────────────────────

const STATUS_ACTIVE_CLASS: Record<Status, string> = {
  reached:           'bg-emerald-500 text-white border-transparent shadow-sm',
  partially_reached: 'bg-amber-400 text-white border-transparent shadow-sm',
  not_reached:       'bg-red-400 text-white border-transparent shadow-sm',
}

function StatusSelector({ studentId, itemId, current, onUpdate }: {
  studentId: string
  itemId: string
  current: Status
  onUpdate: (studentId: string, itemId: string, status: Status) => void
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {STATUS_CYCLE.map((status) => (
        <button
          key={status}
          onClick={() => onUpdate(studentId, itemId, status)}
          className={cn(
            'whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
            status === current
              ? STATUS_ACTIVE_CLASS[status]
              : 'border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {STATUS_LABELS[status]}
        </button>
      ))}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function SchuelerDetailPage() {
  const { klassId, studentId } = useParams<{ klassId: string; studentId: string }>()
  const router = useRouter()
  const {
    getClass,
    getStudent,
    updateStudent,
    updateLernzielStatus,
    setRilzFach,
    setBvsa,
    getThemenForKlasse,
    getLernzieleForThema,
    faecher,
    lernziele,
    kommentare,
    getVersuche,
    getFachForThema,
  } = useData()

  const klasse = getClass(klassId)
  const student = getStudent(studentId)
  const assignedThemen = getThemenForKlasse(klassId)

  const [note, setNote] = useState(student?.note ?? '')
  const [noteSaved, setNoteSaved] = useState(true)
  const [lzKatFilter, setLzKatFilter] = useState<'all' | 'grundlegend' | 'anspruchsvoll'>('all')
  const [selectedFachIds, setSelectedFachIds] = useState<string[]>([])
  const [expandedThemaIds, setExpandedThemaIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setNote(student?.note ?? '')
    setNoteSaved(true)
  }, [studentId, student?.note])

  const kpis = useMemo(() => {
    if (!student) return null
    return computeStudentKpis(student, assignedThemen, lernziele, faecher)
  }, [student, assignedThemen, lernziele, faecher])

  const handleNoteSave = () => {
    if (!student) return
    updateStudent(student.id, { note })
    setNoteSaved(true)
  }

  if (!student || !klasse || !kpis) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-8 text-sm text-muted-foreground">
        Schüler nicht gefunden.{' '}
        <button className="underline text-primary" onClick={() => router.push('/klassen')}>
          Zur Übersicht
        </button>
      </div>
    )
  }

  const allFachIds = faecher.map(f => f.id)
  const assignedFaecher = faecher.filter(f => assignedThemen.some(t => t.fachId === f.id))
  const showFachContext = assignedFaecher.length > 1 && selectedFachIds.length !== 1

  const filteredFachKpis = selectedFachIds.length === 0
    ? kpis.fachKpis
    : kpis.fachKpis.filter(fk => selectedFachIds.includes(fk.fach.id))

  const filteredThemaKpis = selectedFachIds.length === 0
    ? kpis.themaKpis
    : kpis.themaKpis.filter(tk => selectedFachIds.includes(tk.fachId))

  const fullName = `${student.vorname} ${student.nachname}`
  const studentKommentare = kommentare.filter((k) => k.studentId === student.id)
  const lzWithMultipleVersuche = lernziele.filter((lz) => getVersuche(student, lz.id).length >= 2)

  function toggleThema(id: string) {
    setExpandedThemaIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-5">
      <Breadcrumb
        className="mb-4"
        items={[
          { label: 'Klassen', href: '/klassen' },
          { label: klasse.name, href: `/klassen/${klassId}` },
          { label: fullName },
        ]}
      />

      {/* Zone A: Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            <AvatarFallback className={cn('text-sm font-semibold', getAvatarColor(fullName))}>
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
            <div className="flex items-center flex-wrap gap-1.5 mt-0.5">
              <span className="text-sm text-muted-foreground">{klasse.name}</span>
              {student.bvsa && (
                <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-700">BVSA</span>
              )}
              {(student.rilzFachIds ?? []).map((fachId) => {
                const fach = faecher.find((f) => f.id === fachId)
                return fach ? (
                  <span key={fachId} className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-orange-100 text-orange-700">
                    RILZ {fach.name}
                  </span>
                ) : null
              })}
            </div>
          </div>
        </div>
        <Link
          href={`/klassen/${klassId}/schueler/${studentId}/bericht`}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
        >
          Bericht erstellen
        </Link>
      </div>

      <div className="space-y-5">

        {/* Zone B: General KPIs — always full/unfiltered */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_180px_210px] items-start">
          <SectionBlock title="Verlauf" description="Fortschritt über die Zeit">
            <StudentVerlauf
              student={student}
              assignedThemen={assignedThemen}
              lernziele={lernziele}
              faecher={faecher}
              showGesamt
            />
          </SectionBlock>
          <LernzielStatusDonut
            reached={kpis.reached}
            partial={kpis.partial}
            notReached={kpis.notReached}
            gesamtPct={kpis.gesamtPct}
          />
          <StudentKpiTiles kpis={kpis} />
        </div>

        {/* Zone C: Fach chip filter */}
        {assignedFaecher.length > 1 && (
          <FachChipFilter
            faecher={assignedFaecher}
            allFachIds={allFachIds}
            selectedIds={selectedFachIds}
            onChange={setSelectedFachIds}
          />
        )}

        {/* Zone D: Per-Fach KPI cards */}
        {filteredFachKpis.length > 0 && (
          <div className={cn(
            'grid gap-3',
            filteredFachKpis.length === 1 ? 'grid-cols-1 max-w-xs'
            : filteredFachKpis.length === 2 ? 'grid-cols-2'
            : 'grid-cols-2 lg:grid-cols-4',
          )}>
            {filteredFachKpis.map(fk => {
              const fc = getFachColor(fk.fach.id, allFachIds)
              return (
                <div key={fk.fach.id} className={cn('rounded-xl border border-border bg-card px-4 py-3 border-l-4', fc.border)}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={cn('size-2 rounded-full shrink-0', fc.dot)} />
                    <span className="text-xs font-semibold">{fk.fach.name}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn('text-xl font-bold tabular-nums', scoreColor(fk.pct))}>{fk.pct}%</span>
                    {fk.gTotal > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        G <span className="font-semibold text-foreground">{fk.gPct}%</span>
                      </span>
                    )}
                    {fk.aTotal > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        A <span className="font-semibold text-foreground">{fk.aPct}%</span>
                      </span>
                    )}
                  </div>
                  <StackedBar reached={fk.reached} partial={fk.partial} total={fk.total} />
                  <p className="text-[10px] text-muted-foreground mt-1.5">{fk.total} Lernziele</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Zone E: Thema list with expandable LZs */}
        {assignedThemen.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Noch keine Themen zugewiesen.{' '}
            <a href={`/klassen/${klassId}`} className="underline text-primary">Themen zuweisen</a>
          </p>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold">Lernziele</h2>
                <p className="text-xs text-muted-foreground">Zugewiesene Themen dieser Klasse</p>
              </div>
              <div className="flex rounded-lg border border-border overflow-hidden">
                {(['all', 'grundlegend', 'anspruchsvoll'] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setLzKatFilter(k)}
                    className={cn(
                      'px-2.5 py-1 text-xs font-medium transition-colors',
                      lzKatFilter === k
                        ? k === 'grundlegend' ? 'bg-slate-500 text-white'
                          : k === 'anspruchsvoll' ? 'bg-violet-500 text-white'
                          : 'bg-primary text-primary-foreground'
                        : 'bg-card text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {k === 'all' ? 'Alle' : k === 'grundlegend' ? 'G' : 'A'}
                  </button>
                ))}
              </div>
            </div>

            {filteredThemaKpis.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Themen in der aktuellen Auswahl.</p>
            ) : (
              <div className="space-y-2">
                {filteredThemaKpis.map((tk) => {
                  const isExpanded = expandedThemaIds.has(tk.thema.id)
                  const allThemaLZ = getLernzieleForThema(tk.thema.id)
                  const hasRilz = (student.rilzFachIds ?? []).includes(tk.fachId)
                  const applicableLZ = hasRilz
                    ? allThemaLZ.filter(lz => lz.kategorie === 'grundlegend')
                    : allThemaLZ
                  const visibleLZ = lzKatFilter === 'all'
                    ? applicableLZ
                    : applicableLZ.filter(lz => lz.kategorie === lzKatFilter)
                  const fc = getFachColor(tk.fachId, allFachIds)
                  const fachName = faecher.find(f => f.id === tk.fachId)?.name

                  return (
                    <div key={tk.thema.id} className="rounded-xl border border-border overflow-hidden">
                      <button
                        className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                        onClick={() => toggleThema(tk.thema.id)}
                      >
                        <ChevronRight className={cn(
                          'size-3.5 text-muted-foreground shrink-0 transition-transform',
                          isExpanded && 'rotate-90',
                        )} />
                        {showFachContext && (
                          <span className={cn('size-2 rounded-full shrink-0', fc.dot)} />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {showFachContext && fachName && (
                              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide shrink-0">
                                {fachName}
                              </span>
                            )}
                            <span className="text-sm font-medium">{tk.thema.name}</span>
                            {hasRilz && (
                              <span className="rounded px-1 text-[9px] font-semibold bg-orange-100 text-orange-700">RILZ</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {tk.gTotal > 0 && (
                            <span className="text-[10px] text-muted-foreground hidden sm:block">
                              G <span className="font-medium text-foreground">{tk.gPct}%</span>
                            </span>
                          )}
                          {tk.aTotal > 0 && (
                            <span className="text-[10px] text-muted-foreground hidden sm:block">
                              A <span className="font-medium text-foreground">{tk.aPct}%</span>
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">{tk.total} LZ</span>
                          <div className="w-14 shrink-0">
                            <StackedBar reached={tk.reached} partial={tk.partial} total={tk.total} />
                          </div>
                          <span className={cn('text-sm font-bold tabular-nums w-9 text-right shrink-0', scoreColor(tk.pct))}>
                            {tk.pct}%
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-border bg-muted/10">
                          {visibleLZ.length === 0 ? (
                            <p className="px-4 py-3 text-xs text-muted-foreground">
                              Keine Lernziele in dieser Kategorie.
                            </p>
                          ) : (
                            <div className="divide-y divide-border">
                              {visibleLZ.map((lz) => {
                                const current = student.lernzielStatus[lz.id] ?? 'not_reached'
                                return (
                                  <div key={lz.id} className="flex items-center justify-between gap-4 px-4 py-2.5">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className={cn(
                                        'shrink-0 rounded px-1 text-[9px] font-semibold',
                                        lz.kategorie === 'grundlegend'
                                          ? 'bg-slate-100 text-slate-700'
                                          : 'bg-violet-100 text-violet-700',
                                      )}>
                                        {lz.kategorie === 'grundlegend' ? 'G' : 'A'}
                                      </span>
                                      <span className="text-sm leading-snug">{lz.label}</span>
                                    </div>
                                    <StatusSelector
                                      studentId={student.id}
                                      itemId={lz.id}
                                      current={current}
                                      onUpdate={updateLernzielStatus}
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Zone F: Notiz + RILZ/BVSA */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 items-start">
          <SectionBlock title="Notiz">
            <div className="grid gap-2">
              <Textarea
                id="student-note"
                rows={4}
                placeholder="Beobachtungen, Besonderheiten, Förderbedarf …"
                value={note}
                onChange={(e) => { setNote(e.target.value); setNoteSaved(false) }}
              />
              <div className="flex items-center gap-3">
                <Button size="sm" onClick={handleNoteSave} disabled={noteSaved}>Speichern</Button>
                {noteSaved && note !== '' && (
                  <span className="text-xs text-muted-foreground">Gespeichert</span>
                )}
              </div>
            </div>
          </SectionBlock>

          <details className="group rounded-2xl border border-border bg-card shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 select-none">
              <div>
                <span className="text-sm font-semibold">RILZ &amp; BVSA</span>
                <p className="text-xs text-muted-foreground">Besondere Förderung</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="group-open:hidden flex flex-wrap gap-1">
                  {student.bvsa && (
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-700">BVSA</span>
                  )}
                  {(student.rilzFachIds ?? []).map((fachId) => {
                    const fach = faecher.find((f) => f.id === fachId)
                    return fach ? (
                      <span key={fachId} className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-orange-100 text-orange-700">
                        RILZ {fach.name}
                      </span>
                    ) : null
                  })}
                </span>
                <svg className="size-4 text-muted-foreground transition-transform group-open:rotate-180" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </summary>
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={student.bvsa ?? false}
                  onChange={(e) => setBvsa(student.id, e.target.checked)}
                  className="rounded border-border h-3.5 w-3.5 accent-purple-600"
                />
                <div>
                  <span className="text-xs font-medium">BVSA</span>
                  <p className="text-[10px] text-muted-foreground">Bericht auch ohne Noten in einzelnen Fächern</p>
                </div>
              </label>
              <div className="border-t border-border pt-2.5 space-y-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Reduzierte Lernziele (RILZ)</p>
                {faecher.map((fach) => {
                  const active = (student.rilzFachIds ?? []).includes(fach.id)
                  return (
                    <label key={fach.id} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setRilzFach(student.id, fach.id, e.target.checked)}
                        className="rounded border-border h-3.5 w-3.5 accent-orange-500"
                      />
                      <span className="text-xs">{fach.name}</span>
                      {active && (
                        <span className="rounded px-1 py-0 text-[9px] font-semibold bg-orange-100 text-orange-700">RILZ</span>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          </details>
        </div>

        {/* Zone G: Kommentare (conditional) */}
        {studentKommentare.length > 0 && (
          <SectionBlock title="Kommentare" description="Aus der Lernkontrolle">
            <div className="space-y-2">
              {studentKommentare.map((k) => {
                const lz = lernziele.find((l) => l.id === k.lernzielId)
                const thema = lz ? assignedThemen.find((t) => t.id === lz.themaId) : null
                const fach = thema ? getFachForThema(thema.id) : null
                return (
                  <div key={`${k.studentId}-${k.lernzielId}`} className="rounded-lg border border-border bg-muted/20 px-3 py-2 space-y-0.5">
                    <p className="text-[10px] text-muted-foreground">
                      {fach?.name && <span className="font-medium">{fach.name} · </span>}
                      {lz?.label}
                    </p>
                    <p className="text-sm leading-snug">{k.text}</p>
                  </div>
                )
              })}
            </div>
          </SectionBlock>
        )}

        {/* Zone G: Mehrere Versuche (conditional) */}
        {lzWithMultipleVersuche.length > 0 && (
          <SectionBlock title="Mehrere Versuche" description="Lernziele die mehr als einen Versuch benötigten">
            <div className="space-y-2">
              {lzWithMultipleVersuche.map((lz) => {
                const versuche = getVersuche(student, lz.id)
                const thema = assignedThemen.find((t) => t.id === lz.themaId)
                const fach = thema ? getFachForThema(thema.id) : null
                return (
                  <div key={lz.id} className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                    <p className="text-[10px] text-muted-foreground mb-1">
                      {fach?.name && <span className="font-medium">{fach.name} · </span>}
                      {lz.label}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {versuche.map((v, i) => (
                        <span key={i} className={cn(
                          'rounded px-1.5 py-0.5 text-[9px] font-semibold',
                          v.status === 'reached' ? 'bg-emerald-100 text-emerald-700'
                          : v.status === 'partially_reached' ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700',
                        )}>
                          {i + 1}. {v.status === 'reached' ? 'Erreicht' : v.status === 'partially_reached' ? 'Teilweise' : 'Nicht err.'} {v.date}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </SectionBlock>
        )}

      </div>
    </div>
  )
}
