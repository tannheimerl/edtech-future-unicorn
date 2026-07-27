'use client'

// TODO: This page is currently unlinked/hidden (no route navigates here anymore).
// Delete it once the Schüler detail view is replaced with its successor functionality.

import { Suspense, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Icon } from "@/components/ui/Icon"
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { cn, categoryChipClasses } from '@/lib/utils'
import type { Status } from '@/types/domain'
import { STATUS_LABELS } from '@/types/domain'

const STATUS_DOT: Record<Status, string> = {
  reached: 'bg-status-reached',
  partially_reached: 'bg-status-partial',
  not_reached: 'bg-status-not-reached',
}

const STATUS_TEXT: Record<Status, string> = {
  reached: 'text-status-reached-fg',
  partially_reached: 'text-status-partial-fg',
  not_reached: 'text-status-not-reached-fg',
}

const BerichtPage = () => {
  const searchParams = useSearchParams()
  const klassId = searchParams.get('klassId') ?? ''
  const studentId = searchParams.get('studentId') ?? ''
  const router = useRouter()
  const { getClass, getStudent, getThemenForKlasse, getLernzieleForThema, getFachForThema, faecher, kommentare } = useData()

  const klasse = getClass(klassId)
  const student = getStudent(studentId)
  const assignedThemen = getThemenForKlasse(klassId)

  const [includeGrundlegend, setIncludeGrundlegend] = useState(true)
  const [includeAnspruchsvoll, setIncludeAnspruchsvoll] = useState(true)
  const [includeKommentare, setIncludeKommentare] = useState(true)
  const [fachFilter, setFachFilter] = useState<string | null>(null)
  const [zeitraumBis, setZeitraumBis] = useState<string>('')

  const today = new Date().toLocaleDateString('de-CH', { day: '2-digit', month: 'long', year: 'numeric' })

  const filteredThemen = useMemo(() => {
    let themen = assignedThemen
    if (fachFilter) themen = themen.filter(t => t.fachId === fachFilter)
    if (zeitraumBis) themen = themen.filter(t => !t.faelligAm || t.faelligAm <= zeitraumBis)
    return themen
  }, [assignedThemen, fachFilter, zeitraumBis])

  const reportData = useMemo(() => {
    if (!student) return []
    return filteredThemen
      .map(thema => {
        const allLZ = getLernzieleForThema(thema.id)
        const visibleLZ = allLZ.filter(lz => {
          if (!includeGrundlegend && lz.kategorie === 'grundlegend') return false
          if (!includeAnspruchsvoll && lz.kategorie === 'anspruchsvoll') return false
          return true
        })
        if (visibleLZ.length === 0) return null
        const fach = getFachForThema(thema.id)
        return {
          fach: fach?.name ?? '',
          thema: thema.name,
          lernziele: visibleLZ.map(lz => ({
            lz,
            status: (student.lernzielStatus[lz.id] ?? 'not_reached') as Status,
            kommentar: includeKommentare
              ? kommentare.find(k => k.studentId === student.id && k.lernzielId === lz.id)?.text
              : undefined,
          })),
        }
      })
      .filter((d): d is NonNullable<typeof d> => d !== null)
  }, [filteredThemen, student, getLernzieleForThema, getFachForThema, kommentare, includeGrundlegend, includeAnspruchsvoll, includeKommentare])

  if (!student || !klasse) {
    return (
      <div className="page-container py-8 text-sm text-muted-foreground">
        Schüler nicht gefunden.{' '}
        <Button variant="secondary" className="h-auto border-transparent bg-transparent p-0 underline" onClick={() => router.push('/klassen')}>Zur Übersicht</Button>
      </div>
    )
  }

  return (
    <div className="page-container py-5">
      {/* Non-print: breadcrumb + controls */}
      <div className="print:hidden">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1>Bericht erstellen</h1>
            <p className="text-sm text-muted-foreground">{student.vorname} {student.nachname} · {klasse.name}</p>
          </div>
          <Button onClick={() => window.print()}>
            <Icon name="print" size={16} /> Drucken / PDF
          </Button>
        </div>

        {/* Filter controls */}
        <div className="rounded-2xl border border-border bg-card p-4 mb-6 space-y-4">
          <h6>Berichtsoptionen</h6>
          <div className="flex flex-wrap gap-6">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Lernziele</p>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={includeGrundlegend} onChange={e => setIncludeGrundlegend(e.target.checked)} className="accent-category-grundlegend h-3.5 w-3.5" />
                Grundlegend (G)
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={includeAnspruchsvoll} onChange={e => setIncludeAnspruchsvoll(e.target.checked)} className="accent-category-anspruchsvoll h-3.5 w-3.5" />
                Anspruchsvoll (A)
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={includeKommentare} onChange={e => setIncludeKommentare(e.target.checked)} className="accent-primary h-3.5 w-3.5" />
                Kommentare einbeziehen
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Fach</p>
              <div className="flex flex-wrap gap-1">
                <Button variant={fachFilter === null ? 'default' : 'secondary'} onClick={() => setFachFilter(null)}>Alle</Button>
                {faecher.map(f => (
                  <Button key={f.id} variant={fachFilter === f.id ? 'default' : 'secondary'} onClick={() => setFachFilter(f.id === fachFilter ? null : f.id)}>{f.name}</Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Zeitraum bis</p>
              <input
                type="date"
                value={zeitraumBis}
                onChange={e => setZeitraumBis(e.target.value)}
                className="h-7 rounded border border-border bg-background text-xs px-2 focus:outline-none"
              />
              {zeitraumBis && (
                <Button variant="secondary" onClick={() => setZeitraumBis('')} className="h-auto border-transparent bg-transparent p-0 ml-1 text-3xs text-muted-foreground hover:text-foreground no-underline hover:no-underline">zurücksetzen</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Printable report ── */}
      <div className="rounded-2xl border border-border bg-card p-6 print:border-none print:shadow-none print:p-0 print:rounded-none">

        {/* Report header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2>{student.vorname} {student.nachname}</h2>
            <p className="text-sm text-muted-foreground">{klasse.name} · {klasse.schuljahr ?? ''}</p>
          </div>
          <p className="text-sm text-muted-foreground shrink-0">{today}</p>
        </div>

        {reportData.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Lernziele entsprechen den gewählten Filtern.</p>
        ) : (
          <div className="space-y-6">
            {reportData.map(({ fach, thema, lernziele }) => (
              <div key={`${fach}-${thema}`} className="space-y-2 print:break-inside-avoid">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{fach}</span>
                  <h6>{thema}</h6>
                </div>
                <div className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
                  {lernziele.map(({ lz, status, kommentar }) => (
                    <div key={lz.id} className="px-3 py-2 space-y-1">
                      <div className="flex items-start gap-2">
                        <div className={cn('mt-1.5 shrink-0 size-2 rounded-full', STATUS_DOT[status])} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={cn(
                              'rounded px-1 text-4xs font-semibold',
                              categoryChipClasses(lz.kategorie),
                            )}>
                              {lz.kategorie === 'grundlegend' ? 'G' : 'A'}
                            </span>
                            <span className="text-sm">{lz.label}</span>
                          </div>
                          <p className={cn('text-xs font-medium mt-0.5', STATUS_TEXT[status])}>
                            {STATUS_LABELS[status]}
                          </p>
                          {kommentar && (
                            <p className="text-xs text-muted-foreground italic mt-0.5">{kommentar}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Note from student profile */}
        {student.note && (
          <div className="mt-6 pt-4 border-t border-border space-y-1 print:break-inside-avoid">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notiz der Lehrperson</p>
            <p className="text-sm">{student.note}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BerichtPage />
    </Suspense>
  )
}
