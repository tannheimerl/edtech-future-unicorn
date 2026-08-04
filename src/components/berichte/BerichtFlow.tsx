'use client'

import { Fragment, useState } from 'react'
import { Icon } from "@/components/ui/Icon"
import { useData } from '@/contexts/DataContext'
import { cn, fullName } from '@/lib/utils'
import { formatDateCH } from '@/lib/dates'
import { downloadBerichte, sanitizeFilename } from '@/lib/berichtUtils'
import type { SchuelerBerichtPDFProps } from '@/components/berichte/SchuelerBerichtPDF'
import { BerichtPreviewModal } from '@/components/berichte/BerichtPreviewModal'
import { StepCard } from '@/components/berichte/StepCard'
import { Button } from '@/components/ui/button'

const CheckboxRow = ({ label, isIncluded, onToggle }: { label: string; isIncluded: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    className={cn(
      'flex items-center gap-3 w-full px-4 py-2 text-left transition-colors hover:bg-accent/20',
      !isIncluded && 'opacity-40',
    )}
  >
    <div className={cn(
      'flex size-4 shrink-0 items-center justify-center rounded-sm border-2 transition-all',
      isIncluded ? 'border-primary bg-primary' : 'border-muted-foreground/30 bg-background',
    )}>
      {isIncluded && <Icon name="check" size={16} weight={700} className="text-primary-foreground" />}
    </div>
    <span className="flex-1 text-sm">{label}</span>
  </button>
)

// Berichte auf Basis einer Lernkontrolle: Lernziele und Schüler/innen wählbar, inkl. Kommentar.
export const BerichtFlow = ({ klassId }: { klassId: string }) => {
  const {
    getClass,
    getStudentsForClass,
    getPruefungenForKlasse,
    faecher,
    lernziele: allLernziele,
  } = useData()

  const klasse = getClass(klassId)!
  const students = getStudentsForClass(klassId)
  const pruefungen = getPruefungenForKlasse(klassId).sort((a, b) => b.datum.localeCompare(a.datum))

  const faecherWithPruefungen = faecher
    .map(f => ({ fach: f, pruefungen: pruefungen.filter(p => p.fachId === f.id) }))
    .filter(({ pruefungen }) => pruefungen.length > 0)

  // Fallback auf die neueste Prüfung erst zur Renderzeit ableiten — die Daten
  // laden asynchron und sind beim ersten Mount noch leer, ein useState-
  // Initialwert bliebe dauerhaft null.
  const [chosenPruefungId, setChosenPruefungId] = useState<string | null>(null)
  const selectedPruefungId = chosenPruefungId ?? pruefungen[0]?.id ?? null
  const [excludedLzIds, setExcludedLzIds] = useState<Set<string>>(new Set())
  const [excludedStudentIds, setExcludedStudentIds] = useState<Set<string>>(new Set())
  const [reportKommentare, setReportKommentare] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [openStep, setOpenStep] = useState<1 | 2 | 3 | 4 | null>(1)
  const [previewStudentId, setPreviewStudentId] = useState<string | null>(null)

  const pruefung = selectedPruefungId ? pruefungen.find(p => p.id === selectedPruefungId) : null
  const fach = pruefung ? faecher.find(f => f.id === pruefung.fachId) : null
  const alleLz = pruefung
    ? (pruefung.lernzielIds
        .map(id => allLernziele.find(l => l.id === id))
        .filter((l): l is NonNullable<typeof l> => l != null))
    : []
  const activeLz = alleLz.filter(lz => !excludedLzIds.has(lz.id))
  const grundlegendLz = alleLz.filter(lz => lz.kategorie === 'grundlegend')
  const anspruchsvollLz = alleLz.filter(lz => lz.kategorie === 'anspruchsvoll')
  const targetStudents = students.filter(s => !excludedStudentIds.has(s.id))
  const allStudentsSelected = students.length > 0 && excludedStudentIds.size === 0
  const canDownload = !!pruefung && activeLz.length > 0 && targetStudents.length > 0 && !isGenerating

  const selectPruefung = (id: string) => {
    setChosenPruefungId(id)
    setExcludedLzIds(new Set())
    setExcludedStudentIds(new Set())
    setReportKommentare({})
    setOpenStep(2)
  }

  const toggleLz = (lzId: string) => {
    setExcludedLzIds(prev => {
      const next = new Set(prev)
      next.has(lzId) ? next.delete(lzId) : next.add(lzId)
      return next
    })
  }

  const toggleStudent = (studentId: string) => {
    setExcludedStudentIds(prev => {
      const next = new Set(prev)
      next.has(studentId) ? next.delete(studentId) : next.add(studentId)
      return next
    })
  }

  const toggleAllStudents = () => {
    setExcludedStudentIds(allStudentsSelected ? new Set(students.map(s => s.id)) : new Set())
  }

  const handleDownload = async () => {
    if (!canDownload || !pruefung || !fach) return
    setIsGenerating(true)
    try {
      const dateStr = formatDateCH(pruefung.datum, { day: 'numeric', month: 'long', year: 'numeric' })
      const baseFilename = `${sanitizeFilename(klasse.name)}_${sanitizeFilename(pruefung.name)}`
      await downloadBerichte(
        targetStudents.map((student) => {
          const props: SchuelerBerichtPDFProps = {
            studentName: fullName(student),
            klassenName: klasse.name,
            fachName: fach.name,
            themaName: pruefung.name,
            date: dateStr,
            lernziele: activeLz.map(lz => ({
              label: lz.label,
              kategorie: lz.kategorie,
              status: student.lernzielStatus[lz.id] ?? 'not_reached',
            })),
            kommentar: reportKommentare[student.id] || undefined,
          }
          return { filename: `Bericht_${sanitizeFilename(fullName(student))}_${sanitizeFilename(pruefung.name)}.pdf`, props }
        }),
        `Berichte_${baseFilename}.zip`,
        `Gesamt_${baseFilename}.pdf`
      )
    } finally {
      setIsGenerating(false)
    }
  }

  if (pruefungen.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Noch keine Lernkontrollen vorhanden.</p>
      </div>
    )
  }

  return (
    <>
      {/* Step 1: Lernkontrolle */}
      <StepCard
        step={1}
        title="Lernkontrolle"
        summary={pruefung ? `${pruefung.name} (${formatDateCH(pruefung.datum)})` : undefined}
        isOpen={openStep === 1}
        onToggle={() => setOpenStep(prev => prev === 1 ? null : 1)}
      >
        <div className="divide-y divide-border/40">
          {faecherWithPruefungen.map(({ fach: f, pruefungen: pruefungenFuerFach }) => (
            <Fragment key={f.id}>
              <div className="px-4 py-1.5">
                <span className="text-xs font-semibold text-foreground">{f.name}</span>
              </div>
              {pruefungenFuerFach.map(p => {
                const isSelected = selectedPruefungId === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectPruefung(p.id)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2 text-left text-xs transition-colors hover:bg-accent/20',
                      isSelected && 'text-primary font-medium',
                    )}
                  >
                    {isSelected
                      ? <Icon name="check" size={16} className="shrink-0" />
                      : <span className="size-4 shrink-0" />}
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="text-muted-foreground shrink-0">{formatDateCH(p.datum)}</span>
                  </button>
                )
              })}
            </Fragment>
          ))}
        </div>
      </StepCard>

      {/* Step 2: Lernziele */}
      {selectedPruefungId && (
        <StepCard
          step={2}
          title="Lernziele"
          summary={`${activeLz.length} / ${alleLz.length}`}
          isOpen={openStep === 2}
          onToggle={() => setOpenStep(prev => prev === 2 ? null : 2)}
        >
          <div className="divide-y divide-border/40">
            {grundlegendLz.length > 0 && (
              <>
                <div className="px-4 py-1.5">
                  <span className="text-xs font-semibold text-foreground">
                    Grundlegend
                  </span>
                </div>
                {grundlegendLz.map(lz => (
                  <CheckboxRow key={lz.id} label={lz.label} isIncluded={!excludedLzIds.has(lz.id)} onToggle={() => toggleLz(lz.id)} />
                ))}
              </>
            )}
            {anspruchsvollLz.length > 0 && (
              <>
                <div className="px-4 py-1.5">
                  <span className="text-xs font-semibold text-foreground">
                    Anspruchsvoll
                  </span>
                </div>
                {anspruchsvollLz.map(lz => (
                  <CheckboxRow key={lz.id} label={lz.label} isIncluded={!excludedLzIds.has(lz.id)} onToggle={() => toggleLz(lz.id)} />
                ))}
              </>
            )}
          </div>
        </StepCard>
      )}

      {/* Step 3: Schüler */}
      {selectedPruefungId && (
        <StepCard
          step={3}
          title="Schüler/innen"
          summary={`${targetStudents.length} / ${students.length}`}
          isOpen={openStep === 3}
          onToggle={() => setOpenStep(prev => prev === 3 ? null : 3)}
        >
          {students.length === 0 ? (
            <p className="text-xs text-muted-foreground">Keine Schüler/innen in dieser Klasse.</p>
          ) : (
            <div className="divide-y divide-border/40">
              <CheckboxRow
                label={allStudentsSelected ? 'Alle abwählen' : 'Alle auswählen'}
                isIncluded={allStudentsSelected}
                onToggle={toggleAllStudents}
              />
              {students.map(s => (
                <CheckboxRow key={s.id} label={fullName(s)} isIncluded={!excludedStudentIds.has(s.id)} onToggle={() => toggleStudent(s.id)} />
              ))}
            </div>
          )}
        </StepCard>
      )}

      {/* Step 4: Kommentar */}
      {selectedPruefungId && (
        <StepCard
          step={4}
          title="Kommentar"
          summary="optional"
          isOpen={openStep === 4}
          onToggle={() => setOpenStep(prev => prev === 4 ? null : 4)}
        >
          {students.length === 0 ? (
            <p className="text-xs text-muted-foreground">Keine Schüler/innen in dieser Klasse.</p>
          ) : students.length === 1 ? (
            <Button
              variant="secondary"
              onClick={() => setPreviewStudentId(students[0].id)}
              className="gap-2 px-4 py-1.5"
            >
              <Icon name="edit" size={16} />
              {(reportKommentare[students[0].id] ?? '').trim() ? 'Kommentar bearbeiten' : 'Kommentar schreiben'}
            </Button>
          ) : (
            <div className="divide-y divide-border/40">
              {students.map(s => {
                const hasKommentar = !!(reportKommentare[s.id] ?? '').trim()
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPreviewStudentId(s.id)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-accent/20 transition-colors"
                  >
                    <span className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded-full',
                      hasKommentar ? 'bg-status-reached' : 'bg-muted',
                    )}>
                      {hasKommentar
                        ? <Icon name="check" size={16} weight={700} className="text-white" />
                        : <span className="size-1.5 rounded-full bg-status-none-fg" />}
                    </span>
                    <span className="flex-1 text-sm text-foreground truncate">{fullName(s)}</span>
                    <span className="text-xs font-medium text-primary shrink-0">
                      {hasKommentar ? 'Kommentar bearbeiten' : 'Kommentar schreiben'}
                    </span>
                    <Icon name="chevron_right" size={16} className="text-muted-foreground shrink-0" />
                  </button>
                )
              })}
            </div>
          )}
        </StepCard>
      )}

      {/* Preview modal */}
      {previewStudentId && pruefung && fach && (() => {
        const s = students.find(st => st.id === previewStudentId)!
        const fakeThema = { id: pruefung.id, name: pruefung.name, fachId: fach.id }
        const previewIndex = students.findIndex(st => st.id === previewStudentId)
        return (
          <BerichtPreviewModal
            open={true}
            onClose={() => setPreviewStudentId(null)}
            student={s}
            klasse={klasse}
            fach={fach}
            thema={fakeThema as never}
            activeLz={activeLz}
            kommentar={reportKommentare[s.id] ?? ''}
            onKommentarChange={val => setReportKommentare(prev => ({ ...prev, [s.id]: val }))}
            onPrev={previewIndex > 0 ? () => setPreviewStudentId(students[previewIndex - 1].id) : undefined}
            onNext={previewIndex >= 0 && previewIndex < students.length - 1 ? () => setPreviewStudentId(students[previewIndex + 1].id) : undefined}
            position={students.length > 1 && previewIndex >= 0 ? { current: previewIndex + 1, total: students.length } : undefined}
          />
        )
      })()}

      {/* Download button */}
      <div className="pt-1">
        <Button
          onClick={handleDownload}
          disabled={!canDownload}
          className="gap-2 px-5 py-2"
        >
          {isGenerating ? (
            <Icon name="progress_activity" size={16} className="animate-spin" />
          ) : targetStudents.length === 1 ? (
            <Icon name="description" size={16} />
          ) : (
            <Icon name="download" size={16} />
          )}
          {isGenerating
            ? 'Wird erstellt…'
            : targetStudents.length === 0
              ? 'Berichte herunterladen'
              : targetStudents.length === 1
                ? 'PDF herunterladen'
                : `ZIP herunterladen (${targetStudents.length} Berichte + Gesamt-PDF)`}
        </Button>
        {activeLz.length === 0 && alleLz.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">Bitte mindestens ein Lernziel einschliessen.</p>
        )}
        {targetStudents.length === 0 && students.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">Bitte mindestens eine/n Schüler/in wählen.</p>
        )}
      </div>
    </>
  )
}
