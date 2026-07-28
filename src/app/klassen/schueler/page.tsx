'use client'

// TODO: This page is currently unlinked/hidden (no route navigates here anymore).
// Delete it once the Schüler detail view is replaced with its successor functionality.

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useData } from '@/contexts/DataContext'
import { StudentAnalytics } from '@/components/analytics/StudentAnalytics'
import { FachChipFilter } from '@/components/shared/FachChipFilter'
import { FilterDropdown } from '@/components/shared/FilterDropdown'
import { SectionBlock } from '@/components/shared/SectionBlock'
import { StatusCell } from '@/components/shared/StatusCell'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials, getAvatarColor } from '@/lib/avatar-utils'
import { computeStudentKpis } from '@/lib/student-kpis'
import { cn, getFachColor, scoreColor, statusChipClasses, categoryChipClasses } from '@/lib/utils'

// ── Helpers ───────────────────────────────────────────────────────────────

const StackedBar = ({ reached, partial, total }: { reached: number; partial: number; total: number }) => {
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

// ── Page ─────────────────────────────────────────────────────────────────

const SchuelerDetailPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const klassId = searchParams.get('klassId') ?? ''
  const studentId = searchParams.get('studentId') ?? ''
  const {
    getClass,
    getStudent,
    lernkontrollen,
    getLernzieleForLernkontrolle,
    faecher,
    lernziele,
    kommentare,
    getVersuche,
    getFachForLernkontrolle,
  } = useData()

  const klasse = getClass(klassId)
  const student = getStudent(studentId)
  const assignedThemen = lernkontrollen

  const [lzKatFilter, setLzKatFilter] = useState<'all' | 'grundlegend' | 'anspruchsvoll'>('all')
  const [selectedFachIds, setSelectedFachIds] = useState<string[]>([])
  const [selectedLzThemaId, setSelectedLzThemaId] = useState<string>('')

  useEffect(() => {
    const ids = searchParams.get('fachIds')?.split(',').filter(Boolean) ?? []
    if (ids.length > 0) setSelectedFachIds(ids)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const kpis = useMemo(() => {
    if (!student) return null
    return computeStudentKpis(student, assignedThemen, lernziele, faecher)
  }, [student, assignedThemen, lernziele, faecher])

  if (!student || !klasse || !kpis) {
    return (
      <div className="page-container py-8 text-sm text-muted-foreground">
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

  const filteredThemaKpis = selectedFachIds.length === 0
    ? kpis.lernkontrolleKpis
    : kpis.lernkontrolleKpis.filter(tk => selectedFachIds.includes(tk.fachId))

  const fullName = `${student.vorname} ${student.nachname}`
  const studentKommentare = kommentare.filter((k) => k.studentId === student.id)
  const lzWithMultipleVersuche = lernziele.filter((lz) => getVersuche(student, lz.id).length >= 2)

  const selectedThemaKpi = filteredThemaKpis.find(tk => tk.lernkontrolle.id === selectedLzThemaId)

  return (
    <div className="page-container py-5">
      {/* Zone A: Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            <AvatarFallback className={cn('text-sm font-semibold', getAvatarColor(fullName))}>
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1>{fullName}</h1>
            <div className="flex items-center flex-wrap gap-1.5 mt-0.5">
              <span className="text-sm text-muted-foreground">{klasse.name}</span>
              {student.bvsa && (
                <Badge variant="bvsa" className="font-semibold">bVSA</Badge>
              )}
              {(student.rilzFachIds ?? []).map((fachId) => {
                const fach = faecher.find((f) => f.id === fachId)
                if (!fach) return null
                const fc = getFachColor(fach.id, faecher.map((f) => f.id), fach.colorIndex)
                return (
                  <span key={fachId} className={cn('rounded px-1.5 py-0.5 text-3xs font-semibold', fc.bg, fc.text)}>
                    RILZ {fach.name}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">

        {/* Zone B: Analytics */}
        <StudentAnalytics
          student={student}
          themen={assignedThemen}
          lernziele={lernziele}
          faecher={faecher}
          klassId={klassId}
        />

        {/* Zone C: Fach chip filter */}
        {assignedFaecher.length > 1 && (
          <FachChipFilter
            faecher={assignedFaecher}
            allFachIds={allFachIds}
            selectedIds={selectedFachIds}
            onChange={setSelectedFachIds}
          />
        )}

        {/* Zone E: Thema list with expandable LZs */}
        {assignedThemen.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Noch keine Themen zugewiesen.{' '}
            <a href={`/klassen/detail?klassId=${klassId}`} className="underline text-primary">Themen zuweisen</a>
          </p>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h6>Lernziele</h6>
                <p className="text-xs text-muted-foreground">Zugewiesene Themen dieser Klasse</p>
              </div>
              <div className="flex rounded-lg border border-border overflow-hidden">
                {(['all', 'grundlegend', 'anspruchsvoll'] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setLzKatFilter(k)}
                    className={cn(
                      'px-2 py-1 text-xs font-medium transition-colors',
                      lzKatFilter === k
                        ? k === 'grundlegend' ? 'bg-category-grundlegend text-white'
                          : k === 'anspruchsvoll' ? 'bg-category-anspruchsvoll text-white'
                          : 'bg-primary text-primary-foreground'
                        : 'bg-card text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {k === 'all' ? 'Alle' : k === 'grundlegend' ? 'G' : 'A'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <FilterDropdown
                label="Thema"
                allLabel="wählen…"
                showSearch
                value={selectedLzThemaId}
                onChange={setSelectedLzThemaId}
                options={[
                  { value: '', label: 'Kein Thema' },
                  ...assignedFaecher.flatMap((fach) => {
                    const dot = getFachColor(fach.id, allFachIds, fach.colorIndex).dot
                    return filteredThemaKpis
                      .filter((tk) => tk.fachId === fach.id)
                      .map((tk) => ({ value: tk.lernkontrolle.id, label: tk.lernkontrolle.name, dot }))
                  }),
                ]}
              />
            </div>

            {filteredThemaKpis.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Themen in der aktuellen Auswahl.</p>
            ) : !selectedThemaKpi ? (
              <p className="text-sm text-muted-foreground">Wähle ein Thema um die Lernziele zu sehen.</p>
            ) : (() => {
              const tk = selectedThemaKpi
              const allThemaLZ = getLernzieleForLernkontrolle(tk.lernkontrolle.id)
              const hasRilz = (student.rilzFachIds ?? []).includes(tk.fachId)
              const applicableLZ = hasRilz
                ? allThemaLZ.filter(lz => lz.kategorie === 'grundlegend')
                : allThemaLZ
              const visibleLZ = lzKatFilter === 'all'
                ? applicableLZ
                : applicableLZ.filter(lz => lz.kategorie === lzKatFilter)
              const fc = getFachColor(tk.fachId, allFachIds, faecher.find(f => f.id === tk.fachId)?.colorIndex)
              const fachName = faecher.find(f => f.id === tk.fachId)?.name

              return (
                <div className="rounded-2xl border border-border overflow-hidden">
                  <div className="w-full flex items-center gap-2 px-4 py-3 text-left">
                    {showFachContext && (
                      <span className={cn('size-2 rounded-full shrink-0', fc.dot)} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {showFachContext && fachName && (
                          <span className="text-3xs font-medium text-muted-foreground uppercase tracking-wide shrink-0">
                            {fachName}
                          </span>
                        )}
                        <span className="text-sm font-medium">{tk.lernkontrolle.name}</span>
                        {hasRilz && (
                          <Badge variant="rilz" size="sm">RILZ</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {tk.gTotal > 0 && (
                        <span className="text-3xs text-muted-foreground hidden sm:block">
                          G <span className="font-medium text-foreground">{tk.gPct}%</span>
                        </span>
                      )}
                      {tk.aTotal > 0 && (
                        <span className="text-3xs text-muted-foreground hidden sm:block">
                          A <span className="font-medium text-foreground">{tk.aPct}%</span>
                        </span>
                      )}
                      <span className="text-3xs text-muted-foreground">{tk.total} LZ</span>
                      <div className="w-14 shrink-0">
                        <StackedBar reached={tk.reached} partial={tk.partial} total={tk.total} />
                      </div>
                      <span className={cn('text-sm font-bold tabular-nums w-9 text-right shrink-0', scoreColor(tk.pct))}>
                        {tk.pct}%
                      </span>
                    </div>
                  </div>

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
                            <div key={lz.id} className="flex items-center justify-between gap-4 px-4 py-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className={cn(
                                  'shrink-0 rounded px-1 text-4xs font-semibold',
                                  categoryChipClasses(lz.kategorie),
                                )}>
                                  {lz.kategorie === 'grundlegend' ? 'G' : 'A'}
                                </span>
                                <span className="text-sm leading-snug">{lz.label}</span>
                              </div>
                              <StatusCell status={current} readOnly onSelect={() => {}} />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Zone G: Kommentare (conditional) */}
        {studentKommentare.length > 0 && (
          <SectionBlock title="Kommentare" description="Aus der Lernkontrolle">
            <div className="space-y-2">
              {studentKommentare.map((k) => {
                const lz = lernziele.find((l) => l.id === k.lernzielId)
                const thema = lz ? assignedThemen.find((t) => t.id === lz.lernkontrolleId) : null
                const fach = thema ? getFachForLernkontrolle(thema.id) : null
                return (
                  <div key={`${k.studentId}-${k.lernzielId}`} className="rounded-lg border border-border bg-muted/20 px-3 py-2 space-y-0.5">
                    <p className="text-3xs text-muted-foreground">
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
                const thema = assignedThemen.find((t) => t.id === lz.lernkontrolleId)
                const fach = thema ? getFachForLernkontrolle(thema.id) : null
                return (
                  <div key={lz.id} className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                    <p className="text-3xs text-muted-foreground mb-1">
                      {fach?.name && <span className="font-medium">{fach.name} · </span>}
                      {lz.label}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {versuche.map((v, i) => (
                        <span key={i} className={cn(
                          'rounded px-1.5 py-0.5 text-4xs font-semibold',
                          statusChipClasses(v.status),
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

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SchuelerDetailPage />
    </Suspense>
  )
}
