'use client'

import { useState } from 'react'
import { Icon } from "@/components/ui/Icon"
import { useData } from '@/contexts/DataContext'
import { cn, categoryChipClasses, fullName } from '@/lib/utils'
import { downloadBerichte, sanitizeFilename } from '@/lib/berichtUtils'
import type { SchuelerBerichtPDFProps } from '@/components/berichte/SchuelerBerichtPDF'
import { BerichtPreviewModal } from '@/components/berichte/BerichtPreviewModal'
import { StepCard } from '@/components/berichte/StepCard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

// Berichte auf Basis eines Themas mit (abwählbaren) Lernzielen.
export const LernzielBerichtFlow = ({ klassId }: { klassId: string }) => {
  const {
    getClass,
    lernkontrollen,
    getLernzieleForLernkontrolle,
    getStudentsForClass,
    getKommentar,
    getLernkontrolleKommentar,
    faecher,
  } = useData()

  const klasse = getClass(klassId)!
  const allThemen = lernkontrollen
  const students = getStudentsForClass(klassId)

  // Which accordion step is currently open (1–4, or null)
  const [openStep, setOpenStep] = useState<1 | 2 | 3 | 4 | null>(1)

  const [selectedFachId, setSelectedFachId] = useState<string | null>(null)
  const [selectedThemaId, setSelectedThemaId] = useState<string | null>(null)
  const [excludedLzIds, setExcludedLzIds] = useState<Set<string>>(new Set())
  const [lzOpen, setLzOpen] = useState(false)
  const [studentMode, setStudentMode] = useState<'all' | 'individual' | null>(null)
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set())
  const [reportKommentare, setReportKommentare] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewStudentId, setPreviewStudentId] = useState<string | null>(null)

  const fachWithThemen = faecher
    .map(f => ({ fach: f, themen: allThemen.filter(t => t.fachId === f.id) }))
    .filter(({ themen }) => themen.length > 0)

  const themenForFach = selectedFachId ? allThemen.filter(t => t.fachId === selectedFachId) : []
  const thema = selectedThemaId ? allThemen.find(t => t.id === selectedThemaId) : null
  const fach = selectedFachId ? faecher.find(f => f.id === selectedFachId) : null
  const allLz = selectedThemaId ? getLernzieleForLernkontrolle(selectedThemaId) : []
  const activeLz = allLz.filter(lz => !excludedLzIds.has(lz.id))

  const targetStudents =
    studentMode === 'all' ? students :
    studentMode === 'individual' ? students.filter(s => selectedStudentIds.has(s.id)) :
    []

  const canDownload = !!selectedThemaId && activeLz.length > 0 && targetStudents.length > 0 && !isGenerating

  // ── Selection handlers ──────────────────────────────────────────────────

  const selectFach = (id: string) => {
    setSelectedFachId(id)
    setSelectedThemaId(null)
    setExcludedLzIds(new Set())
    setLzOpen(false)
    setStudentMode(null)
    setSelectedStudentIds(new Set())
    setReportKommentare({})
    setOpenStep(2)
  }

  const selectThema = (id: string) => {
    const next = id === selectedThemaId ? null : id
    setSelectedThemaId(next)
    setExcludedLzIds(new Set())
    setLzOpen(false)
    setStudentMode(null)
    setSelectedStudentIds(new Set())
    setReportKommentare({})
    if (next) setOpenStep(3)
  }

  const selectStudentMode = (mode: 'all' | 'individual') => {
    setStudentMode(mode)
    if (mode === 'individual') setSelectedStudentIds(new Set())
    if (mode === 'all') setOpenStep(4)
  }

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev)
      next.has(studentId) ? next.delete(studentId) : next.add(studentId)
      return next
    })
  }

  const toggleLz = (lzId: string) => {
    setExcludedLzIds(prev => {
      const next = new Set(prev)
      next.has(lzId) ? next.delete(lzId) : next.add(lzId)
      return next
    })
  }

  const toggleStep = (step: 1 | 2 | 3 | 4) => {
    setOpenStep(prev => prev === step ? null : step)
  }

  // ── PDF generation ──────────────────────────────────────────────────────

  const handleDownload = async () => {
    if (!canDownload || !thema || !fach) return
    setIsGenerating(true)
    try {
      const dateStr = new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' })
      await downloadBerichte(
        targetStudents.map((student) => ({
          filename: `Bericht_${sanitizeFilename(fullName(student))}_${sanitizeFilename(thema.name)}.pdf`,
          props: {
            studentName: fullName(student),
            klassenName: klasse.name,
            fachName: fach.name,
            themaName: thema.name,
            date: dateStr,
            lernziele: activeLz.map(lz => ({
              label: lz.label,
              kategorie: lz.kategorie,
              status: student.lernzielStatus[lz.id] ?? 'not_reached',
            })),
            kommentar: reportKommentare[student.id] || undefined,
          } satisfies SchuelerBerichtPDFProps,
        })),
        `Berichte_${sanitizeFilename(klasse.name)}.zip`
      )
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Student mode summary label ──────────────────────────────────────────

  const studentSummary =
    studentMode === 'all' ? `Alle (${students.length})` :
    studentMode === 'individual' ? `${targetStudents.length} von ${students.length}` :
    undefined

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      {/* Step 1: Fach */}
      <StepCard
        step={1}
        title="Fach"
        summary={fach?.name}
        isOpen={openStep === 1}
        onToggle={() => toggleStep(1)}
      >
        <div className="flex flex-wrap gap-2">
          {fachWithThemen.map(({ fach: f }) => (
            <Button
              key={f.id}
              variant={selectedFachId === f.id ? 'default' : 'secondary'}
              onClick={() => selectFach(f.id)}
              className="px-4 py-1.5"
            >
              {f.name}
            </Button>
          ))}
        </div>
      </StepCard>

      {/* Step 2: Thema */}
      {selectedFachId && (
        <StepCard
          step={2}
          title="Thema"
          summary={thema?.name}
          isOpen={openStep === 2}
          onToggle={() => toggleStep(2)}
        >
          <div className="flex flex-wrap gap-2">
            {themenForFach.map(t => (
              <Button
                key={t.id}
                variant={selectedThemaId === t.id ? 'default' : 'secondary'}
                onClick={() => selectThema(t.id)}
                className="px-4 py-1.5"
              >
                {t.name}
              </Button>
            ))}
          </div>
        </StepCard>
      )}

      {/* LZ sub-accordion (optional, persistent after Thema selected) */}
      {selectedThemaId && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <Button
            variant="secondary"
            onClick={() => setLzOpen(v => !v)}
            className="flex w-full h-auto justify-start rounded-none gap-2 px-4 py-2 text-left hover:bg-accent/20"
          >
            {lzOpen
              ? <Icon name="expand_more" size={16} className="text-muted-foreground shrink-0" />
              : <Icon name="chevron_right" size={16} className="text-muted-foreground shrink-0" />}
            <span className="text-sm font-medium">Lernziele anpassen</span>
            <span className="ml-auto text-xs text-muted-foreground">{activeLz.length} / {allLz.length}</span>
          </Button>
          {lzOpen && (
            <div className="border-t border-border divide-y divide-border/40">
              {allLz.map(lz => {
                const isIncluded = !excludedLzIds.has(lz.id)
                return (
                  <Button
                    key={lz.id}
                    variant="secondary"
                    onClick={() => toggleLz(lz.id)}
                    className={cn(
                      'flex items-center gap-3 w-full h-auto justify-start rounded-none px-4 py-2 text-left hover:bg-accent/20',
                      !isIncluded && 'opacity-40',
                    )}
                  >
                    <div className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded-sm border-2 transition-all',
                      isIncluded ? 'border-primary bg-primary' : 'border-muted-foreground/30 bg-background',
                    )}>
                      {isIncluded && <Icon name="check" size={16} weight={700} className="text-primary-foreground" />}
                    </div>
                    <span className="flex-1 text-sm">{lz.label}</span>
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded font-medium shrink-0',
                      categoryChipClasses(lz.kategorie)
                    )}>
                      {lz.kategorie === 'grundlegend' ? 'G' : 'A'}
                    </span>
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Schüler */}
      {selectedThemaId && (
        <StepCard
          step={3}
          title="Schüler*innen"
          summary={studentSummary}
          isOpen={openStep === 3}
          onToggle={() => toggleStep(3)}
        >
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant={studentMode === 'all' ? 'default' : 'secondary'}
                onClick={() => selectStudentMode('all')}
                className="px-4 py-1.5"
              >
                <Icon name="group" size={16} />
                Alle ({students.length})
              </Button>
              <Button
                variant={studentMode === 'individual' ? 'default' : 'secondary'}
                onClick={() => selectStudentMode('individual')}
                className="px-4 py-1.5"
              >
                <Icon name="person" size={16} />
                Einzelne
              </Button>
            </div>
            {studentMode === 'individual' && (
              <div className="flex flex-wrap gap-2">
                {students.map(s => {
                  const isSelected = selectedStudentIds.has(s.id)
                  return (
                    <Button
                      key={s.id}
                      variant={isSelected ? 'default' : 'secondary'}
                      onClick={() => toggleStudent(s.id)}
                      className="px-3 py-1.5"
                    >
                      {s.vorname} {s.nachname}
                    </Button>
                  )
                })}
              </div>
            )}
          </div>
        </StepCard>
      )}

      {/* Step 4: Kommentar */}
      {selectedThemaId && studentMode !== null && (
        <StepCard
          step={4}
          title="Kommentar"
          summary="optional"
          isOpen={openStep === 4}
          onToggle={() => toggleStep(4)}
        >
          <div className="space-y-4">
            {targetStudents.map(s => {
              const themaKommentar = getLernkontrolleKommentar(s.id, selectedThemaId)
              const lzKommentare = activeLz
                .map(lz => ({ lz, k: getKommentar(s.id, lz.id) }))
                .filter(({ k }) => !!k)
              const hasInspiration = !!themaKommentar || lzKommentare.length > 0

              return (
                <div key={s.id} className="space-y-2">
                  {targetStudents.length > 1 && (
                    <p className="text-xs font-medium text-foreground">{s.vorname} {s.nachname}</p>
                  )}
                  <Textarea
                    value={reportKommentare[s.id] ?? ''}
                    onChange={e => setReportKommentare(prev => ({ ...prev, [s.id]: e.target.value }))}
                    onClick={() => setPreviewStudentId(s.id)}
                    placeholder="Klicken für Vorschau und Kommentar…"
                    rows={3}
                    readOnly
                    className="field-sizing-fixed resize-none cursor-pointer"
                  />
                  {hasInspiration && (
                    <div className="rounded-md bg-muted/50 px-3 py-2 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Notizen aus der Beurteilung</p>
                      {themaKommentar && (
                        <p className="text-xs text-muted-foreground italic">{themaKommentar.text}</p>
                      )}
                      {lzKommentare.map(({ lz, k }) => (
                        <p key={lz.id} className="text-xs text-muted-foreground">
                          <span className="font-medium not-italic">{lz.label}: </span>
                          <span className="italic">{k!.text}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </StepCard>
      )}

      {/* PDF preview modal */}
      {previewStudentId && fach && thema && (() => {
        const s = students.find(st => st.id === previewStudentId)!
        return (
          <BerichtPreviewModal
            open={true}
            onClose={() => setPreviewStudentId(null)}
            student={s}
            klasse={klasse}
            fach={fach}
            thema={thema}
            activeLz={activeLz}
            kommentar={reportKommentare[s.id] ?? ''}
            onKommentarChange={(val) => setReportKommentare(prev => ({ ...prev, [s.id]: val }))}
            themaKommentar={getLernkontrolleKommentar(s.id, selectedThemaId!)?.text}
            inspirationNotes={activeLz
              .map(lz => ({ lz, k: getKommentar(s.id, lz.id) }))
              .filter(({ k }) => !!k)
              .map(({ lz, k }) => ({ label: lz.label, text: k!.text }))}
          />
        )
      })()}

      {/* Download button */}
      {selectedThemaId && studentMode !== null && (
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
              : targetStudents.length === 1
                ? 'PDF herunterladen'
                : `ZIP herunterladen (${targetStudents.length} PDFs)`}
          </Button>
          {activeLz.length === 0 && allLz.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">Bitte mindestens ein Lernziel einschliessen.</p>
          )}
          {studentMode === 'individual' && targetStudents.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">Bitte mindestens eine*n Schüler*in wählen.</p>
          )}
        </div>
      )}
    </>
  )
}
