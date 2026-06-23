'use client'

import { useState } from 'react'
import { Check, ChevronDown, ChevronRight, Download, FileText, Loader2, User, Users } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { cn, categoryChipClasses } from '@/lib/utils'
import { generatePdfBlob, downloadZip, triggerDownload } from '@/lib/berichtUtils'
import type { SchuelerBerichtPDFProps } from '@/components/berichte/SchuelerBerichtPDF'
import { BerichtPreviewModal } from '@/components/berichte/BerichtPreviewModal'
import { Button } from '@/components/ui/button'

export function BerichteTab({ klassId }: { klassId: string }) {
  const {
    getClass,
    getThemenForKlasse,
    getLernzieleForThema,
    getStudentsForClass,
    getKommentar,
    getThemaKommentar,
    faecher,
    getPruefungenForKlasse,
    getPruefungErgebnisse,
    lernziele: allLernziele,
    themen: allThemen2,
  } = useData()

  const klasse = getClass(klassId)!
  const allThemen = getThemenForKlasse(klassId)
  const students = getStudentsForClass(klassId)
  const pruefungen = getPruefungenForKlasse(klassId).sort((a, b) => b.datum.localeCompare(a.datum))

  // Basis selection: 'lz' = Lernziel-Basis, 'pruefung' = Prüfungs-Basis
  const [basis, setBasis] = useState<'lz' | 'pruefung'>('lz')

  // Prüfungs-Basis state
  const [pSelectedPruefungId, setPSelectedPruefungId] = useState<string | null>(
    pruefungen.length > 0 ? pruefungen[0].id : null
  )
  const [pStudentMode, setPStudentMode] = useState<'all' | 'individual' | null>(null)
  const [pSelectedStudentIds, setPSelectedStudentIds] = useState<Set<string>>(new Set())
  const [pReportKommentare, setPReportKommentare] = useState<Record<string, string>>({})
  const [pIsGenerating, setPIsGenerating] = useState(false)
  const [pIncludePunkte, setPIncludePunkte] = useState(true)
  const [pIncludeNote, setPIncludeNote] = useState(true)
  const [pOpenStep, setPOpenStep] = useState<1 | 2 | 3 | null>(1)
  const [pPreviewStudentId, setPPreviewStudentId] = useState<string | null>(null)
  const [pSelectedVersuchNr, setPSelectedVersuchNr] = useState<Record<string, number>>({})

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
  const allLz = selectedThemaId ? getLernzieleForThema(selectedThemaId) : []
  const activeLz = allLz.filter(lz => !excludedLzIds.has(lz.id))

  const targetStudents =
    studentMode === 'all' ? students :
    studentMode === 'individual' ? students.filter(s => selectedStudentIds.has(s.id)) :
    []

  const canDownload = !!selectedThemaId && activeLz.length > 0 && targetStudents.length > 0 && !isGenerating

  // ── Selection handlers ──────────────────────────────────────────────────

  function selectFach(id: string) {
    setSelectedFachId(id)
    setSelectedThemaId(null)
    setExcludedLzIds(new Set())
    setLzOpen(false)
    setStudentMode(null)
    setSelectedStudentIds(new Set())
    setReportKommentare({})
    setOpenStep(2)
  }

  function selectThema(id: string) {
    const next = id === selectedThemaId ? null : id
    setSelectedThemaId(next)
    setExcludedLzIds(new Set())
    setLzOpen(false)
    setStudentMode(null)
    setSelectedStudentIds(new Set())
    setReportKommentare({})
    if (next) setOpenStep(3)
  }

  function selectStudentMode(mode: 'all' | 'individual') {
    setStudentMode(mode)
    if (mode === 'individual') setSelectedStudentIds(new Set())
    if (mode === 'all') setOpenStep(4)
  }

  function toggleStudent(studentId: string) {
    setSelectedStudentIds(prev => {
      const next = new Set(prev)
      next.has(studentId) ? next.delete(studentId) : next.add(studentId)
      return next
    })
  }

  function toggleLz(lzId: string) {
    setExcludedLzIds(prev => {
      const next = new Set(prev)
      next.has(lzId) ? next.delete(lzId) : next.add(lzId)
      return next
    })
  }

  function toggleStep(step: 1 | 2 | 3 | 4) {
    setOpenStep(prev => prev === step ? null : step)
  }

  // ── Prüfungs-Basis helpers ──────────────────────────────────────────────

  const pPruefung = pSelectedPruefungId ? pruefungen.find(p => p.id === pSelectedPruefungId) : null
  const pFach = pPruefung ? faecher.find(f => f.id === pPruefung.fachId) : null
  const pLernziele = pPruefung
    ? (pPruefung.lernzielIds
        .map(id => allLernziele.find(l => l.id === id))
        .filter((l): l is NonNullable<typeof l> => l != null))
    : []
  const pThemaName = pPruefung
    ? (() => {
        const themaIds = [...new Set(pLernziele.map(l => l.themaId))]
        return themaIds.map(id => allThemen2.find(t => t.id === id)?.name ?? '').filter(Boolean).join(', ')
      })()
    : ''
  const pTargetStudents =
    pStudentMode === 'all' ? students :
    pStudentMode === 'individual' ? students.filter(s => pSelectedStudentIds.has(s.id)) :
    []
  const pCanDownload = !!pPruefung && pTargetStudents.length > 0 && !pIsGenerating

  async function handlePruefungDownload() {
    if (!pCanDownload || !pPruefung || !pFach) return
    setPIsGenerating(true)
    try {
      const dateStr = new Date(pPruefung.datum).toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' })
      const ergebnisse = getPruefungErgebnisse(pPruefung.id)
      const entries = await Promise.all(
        pTargetStudents.map(async (student) => {
          const ergebnis = ergebnisse.find(e => e.schuelerId === student.id)
          const chosenNr = pSelectedVersuchNr[student.id] ?? ergebnis?.anzahlVersuche ?? 1
          const isLatest = chosenNr === (ergebnis?.anzahlVersuche ?? 1)
          const snap = ergebnis?.versuchSnapshots?.find(s => s.nr === chosenNr)
          const props: SchuelerBerichtPDFProps = {
            studentName: `${student.vorname} ${student.nachname}`,
            klassenName: klasse.name,
            fachName: pFach.name,
            themaName: pPruefung.name,
            date: dateStr,
            lernziele: pLernziele.map(lz => ({
              label: lz.label,
              kategorie: lz.kategorie,
              status: student.lernzielStatus[lz.id] ?? 'not_reached',
            })),
            kommentar: pReportKommentare[student.id] || undefined,
            pruefungsErgebnis: ergebnis ? {
              punkte: isLatest ? ergebnis.punkte : snap?.punkte,
              maxPunkte: pPruefung.maxPunkte,
              note: isLatest ? ergebnis.note : snap?.note,
            } : undefined,
            includeInBericht: { punkte: pIncludePunkte, note: pIncludeNote },
          }
          const blob = await generatePdfBlob(props)
          const safeName = `${student.vorname}_${student.nachname}`
          const safePruefung = pPruefung.name.replace(/\s+/g, '_')
          return { filename: `Bericht_${safeName}_${safePruefung}.pdf`, blob }
        })
      )
      if (entries.length === 1) {
        triggerDownload(entries[0].blob, entries[0].filename)
      } else {
        await downloadZip(entries, `Berichte_${klasse.name.replace(/\s+/g, '_')}_${pPruefung.name.replace(/\s+/g, '_')}.zip`)
      }
    } finally {
      setPIsGenerating(false)
    }
  }

  // ── PDF generation ──────────────────────────────────────────────────────

  async function handleDownload() {
    if (!canDownload || !thema || !fach) return
    setIsGenerating(true)
    try {
      const dateStr = new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' })
      const entries = await Promise.all(
        targetStudents.map(async (student) => {
          const props: SchuelerBerichtPDFProps = {
            studentName: `${student.vorname} ${student.nachname}`,
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
          }
          const blob = await generatePdfBlob(props)
          const safeName = `${student.vorname}_${student.nachname}`
          const safeThema = thema.name.replace(/\s+/g, '_')
          return { filename: `Bericht_${safeName}_${safeThema}.pdf`, blob }
        })
      )
      if (entries.length === 1) {
        triggerDownload(entries[0].blob, entries[0].filename)
      } else {
        await downloadZip(entries, `Berichte_${klasse.name.replace(/\s+/g, '_')}.zip`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Empty state ─────────────────────────────────────────────────────────

  if (allThemen.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center space-y-2">
        <p className="text-sm text-muted-foreground">Dieser Klasse sind noch keine Themen zugewiesen.</p>
        <p className="text-xs text-muted-foreground">Füge zuerst Themen unter <strong>Lernziel-Management</strong> hinzu.</p>
      </div>
    )
  }

  // ── Student mode summary label ──────────────────────────────────────────

  const studentSummary =
    studentMode === 'all' ? `Alle (${students.length})` :
    studentMode === 'individual' ? `${targetStudents.length} von ${students.length}` :
    undefined

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-2 max-w-2xl">

      {/* Subtitle */}
      <p className="text-sm text-muted-foreground pb-1">
        Wähle Berichtsbasis, Thema und Schüler:innen — dann kannst du individuelle Berichte herunterladen.
      </p>

      {/* Basis selector */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">Berichtsbasis</p>
        <div className="flex gap-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div
              className={cn(
                'mt-0.5 size-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors',
                basis === 'lz' ? 'border-primary bg-primary' : 'border-border group-hover:border-primary/50',
              )}
              onClick={() => setBasis('lz')}
            >
              {basis === 'lz' && <div className="size-1.5 rounded-full bg-primary-foreground" />}
            </div>
            <div>
              <p className="text-sm font-medium">Lernziel-Basis</p>
              <p className="text-xs text-muted-foreground">Bericht über ein Thema mit Lernzielen</p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer group ml-6">
            <div
              className={cn(
                'mt-0.5 size-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors',
                basis === 'pruefung' ? 'border-primary bg-primary' : 'border-border group-hover:border-primary/50',
              )}
              onClick={() => setBasis('pruefung')}
            >
              {basis === 'pruefung' && <div className="size-1.5 rounded-full bg-primary-foreground" />}
            </div>
            <div>
              <p className="text-sm font-medium">Lernzielkontrolle-Basis</p>
              <p className="text-xs text-muted-foreground">Bericht zu einer Lernzielkontrolle mit Ergebnis</p>
            </div>
          </label>
        </div>
      </div>

      {/* ── PRÜFUNGS-BASIS FLOW ── */}
      {basis === 'pruefung' && (
        <>
          {pruefungen.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">Noch keine Lernzielkontrollen vorhanden.</p>
            </div>
          ) : (
            <>
              {/* P-Step 1: Prüfung */}
              <StepCard
                step={1}
                title="Lernzielkontrolle"
                summary={pPruefung ? `${pPruefung.name} (${new Date(pPruefung.datum).toLocaleDateString('de-CH')})` : undefined}
                isOpen={pOpenStep === 1}
                onToggle={() => setPOpenStep(prev => prev === 1 ? null : 1)}
              >
                <div className="flex flex-wrap gap-2">
                  {pruefungen.map(p => {
                    const fach = faecher.find(f => f.id === p.fachId)
                    return (
                      <Button
                        key={p.id}
                        variant={pSelectedPruefungId === p.id ? 'default' : 'outline'}
                        onClick={() => { setPSelectedPruefungId(p.id); setPStudentMode(null); setPSelectedStudentIds(new Set()); setPOpenStep(2) }}
                        className="px-4 py-1.5 text-left"
                      >
                        <span className="font-medium">{p.name}</span>
                        <span className="ml-2 text-xs opacity-70">{fach?.name} · {new Date(p.datum).toLocaleDateString('de-CH')}</span>
                      </Button>
                    )
                  })}
                </div>
              </StepCard>

              {/* P-Step 2: Schüler */}
              {pSelectedPruefungId && (
                <StepCard
                  step={2}
                  title="Schüler/innen"
                  summary={
                    pStudentMode === 'all' ? `Alle (${students.length})` :
                    pStudentMode === 'individual' ? `${pTargetStudents.length} von ${students.length}` :
                    undefined
                  }
                  isOpen={pOpenStep === 2}
                  onToggle={() => setPOpenStep(prev => prev === 2 ? null : 2)}
                >
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        variant={pStudentMode === 'all' ? 'default' : 'outline'}
                        onClick={() => { setPStudentMode('all'); setPOpenStep(3) }}
                        className="px-4 py-1.5"
                      >
                        <Users className="size-3.5" /> Alle ({students.length})
                      </Button>
                      <Button
                        variant={pStudentMode === 'individual' ? 'default' : 'outline'}
                        onClick={() => { setPStudentMode('individual'); setPSelectedStudentIds(new Set()) }}
                        className="px-4 py-1.5"
                      >
                        <User className="size-3.5" /> Einzelne
                      </Button>
                    </div>
                    {pStudentMode === 'individual' && (
                      <div className="flex flex-wrap gap-2">
                        {students.map(s => (
                          <Button
                            key={s.id}
                            variant={pSelectedStudentIds.has(s.id) ? 'default' : 'outline'}
                            onClick={() => {
                              setPSelectedStudentIds(prev => {
                                const next = new Set(prev)
                                next.has(s.id) ? next.delete(s.id) : next.add(s.id)
                                return next
                              })
                            }}
                            className="px-3 py-1.5"
                          >
                            {s.vorname} {s.nachname}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </StepCard>
              )}

              {/* P-Step 3: Felder + Kommentar */}
              {pSelectedPruefungId && pStudentMode !== null && (
                <StepCard
                  step={3}
                  title="Felder & Kommentar"
                  summary="optional"
                  isOpen={pOpenStep === 3}
                  onToggle={() => setPOpenStep(prev => prev === 3 ? null : 3)}
                >
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <div
                          onClick={() => setPIncludePunkte(v => !v)}
                          className={cn(
                            'size-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer',
                            pIncludePunkte ? 'bg-primary border-primary' : 'border-border',
                          )}
                        >
                          {pIncludePunkte && <Check className="size-2.5 text-primary-foreground stroke-[3]" />}
                        </div>
                        Punkte
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <div
                          onClick={() => setPIncludeNote(v => !v)}
                          className={cn(
                            'size-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer',
                            pIncludeNote ? 'bg-primary border-primary' : 'border-border',
                          )}
                        >
                          {pIncludeNote && <Check className="size-2.5 text-primary-foreground stroke-[3]" />}
                        </div>
                        Note
                      </label>
                    </div>
                    <div className="space-y-4">
                      {pTargetStudents.map(s => {
                        const ergebnis = getPruefungErgebnisse(pSelectedPruefungId!).find(e => e.schuelerId === s.id)
                        const snapshots = ergebnis?.versuchSnapshots ?? []
                        const latestNr = ergebnis?.anzahlVersuche ?? 1
                        const chosenNr = pSelectedVersuchNr[s.id] ?? latestNr
                        return (
                          <div key={s.id} className="space-y-1">
                            {(pTargetStudents.length > 1 || snapshots.length > 0) && (
                              <div className="flex flex-wrap items-center gap-2">
                                {pTargetStudents.length > 1 && (
                                  <span className="text-xs font-medium">{s.vorname} {s.nachname}</span>
                                )}
                                {snapshots.length > 0 && (
                                  <>
                                    {snapshots.map(snap => (
                                      <Button
                                        key={snap.nr}
                                        type="button"
                                        size="sm"
                                        variant={chosenNr === snap.nr ? 'default' : 'outline'}
                                        onClick={() => setPSelectedVersuchNr(prev => ({ ...prev, [s.id]: snap.nr }))}
                                      >
                                        {snap.nr}. Versuch
                                      </Button>
                                    ))}
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant={chosenNr === latestNr ? 'default' : 'outline'}
                                      onClick={() => setPSelectedVersuchNr(prev => ({ ...prev, [s.id]: latestNr }))}
                                    >
                                      {latestNr}. Versuch (aktuell)
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                            <textarea
                              value={pReportKommentare[s.id] ?? ''}
                              onChange={e => setPReportKommentare(prev => ({ ...prev, [s.id]: e.target.value }))}
                              onClick={() => setPPreviewStudentId(s.id)}
                              placeholder="Klicken für Vorschau und Kommentar…"
                              rows={2}
                              readOnly
                              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </StepCard>
              )}

              {/* P-Preview modal */}
              {pPreviewStudentId && pPruefung && pFach && (() => {
                const s = students.find(st => st.id === pPreviewStudentId)!
                const fakeThema = { id: pPruefung.id, name: pPruefung.name, fachId: pFach.id }
                return (
                  <BerichtPreviewModal
                    open={true}
                    onClose={() => setPPreviewStudentId(null)}
                    student={s}
                    klasse={klasse}
                    fach={pFach}
                    thema={fakeThema as never}
                    activeLz={pLernziele}
                    kommentar={pReportKommentare[s.id] ?? ''}
                    onKommentarChange={val => setPReportKommentare(prev => ({ ...prev, [s.id]: val }))}
                  />
                )
              })()}

              {/* P-Download button */}
              {pSelectedPruefungId && pStudentMode !== null && (
                <div className="pt-1">
                  <Button
                    onClick={handlePruefungDownload}
                    disabled={!pCanDownload}
                    className="gap-2 px-5 py-2.5"
                  >
                    {pIsGenerating ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : pTargetStudents.length === 1 ? (
                      <FileText className="size-4" />
                    ) : (
                      <Download className="size-4" />
                    )}
                    {pIsGenerating
                      ? 'Wird erstellt…'
                      : pTargetStudents.length === 1
                        ? 'PDF herunterladen'
                        : `ZIP herunterladen (${pTargetStudents.length} PDFs)`}
                  </Button>
                  {pStudentMode === 'individual' && pTargetStudents.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-2">Bitte mindestens eine/n Schüler/in wählen.</p>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── LERNZIEL-BASIS FLOW ── */}
      {basis === 'lz' && (<>

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
              variant={selectedFachId === f.id ? 'default' : 'outline'}
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
                variant={selectedThemaId === t.id ? 'default' : 'outline'}
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
            variant="ghost"
            onClick={() => setLzOpen(v => !v)}
            className="flex w-full h-auto justify-start rounded-none gap-2 px-4 py-2 text-left hover:bg-accent/20"
          >
            {lzOpen
              ? <ChevronDown className="size-4 text-muted-foreground shrink-0" />
              : <ChevronRight className="size-4 text-muted-foreground shrink-0" />}
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
                    variant="ghost"
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
                      {isIncluded && <Check className="size-2.5 text-primary-foreground stroke-[3]" />}
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
          title="Schüler/innen"
          summary={studentSummary}
          isOpen={openStep === 3}
          onToggle={() => toggleStep(3)}
        >
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant={studentMode === 'all' ? 'default' : 'outline'}
                onClick={() => selectStudentMode('all')}
                className="px-4 py-1.5"
              >
                <Users className="size-3.5" />
                Alle ({students.length})
              </Button>
              <Button
                variant={studentMode === 'individual' ? 'default' : 'outline'}
                onClick={() => selectStudentMode('individual')}
                className="px-4 py-1.5"
              >
                <User className="size-3.5" />
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
                      variant={isSelected ? 'default' : 'outline'}
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
              const themaKommentar = getThemaKommentar(s.id, selectedThemaId)
              const lzKommentare = activeLz
                .map(lz => ({ lz, k: getKommentar(s.id, lz.id) }))
                .filter(({ k }) => !!k)
              const hasInspiration = !!themaKommentar || lzKommentare.length > 0

              return (
                <div key={s.id} className="space-y-2">
                  {targetStudents.length > 1 && (
                    <p className="text-xs font-medium text-foreground">{s.vorname} {s.nachname}</p>
                  )}
                  <textarea
                    value={reportKommentare[s.id] ?? ''}
                    onChange={e => setReportKommentare(prev => ({ ...prev, [s.id]: e.target.value }))}
                    onClick={() => setPreviewStudentId(s.id)}
                    placeholder="Klicken für Vorschau und Kommentar…"
                    rows={3}
                    readOnly
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
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
            themaKommentar={getThemaKommentar(s.id, selectedThemaId!)?.text}
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
            className="gap-2 px-5 py-2.5"
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : targetStudents.length === 1 ? (
              <FileText className="size-4" />
            ) : (
              <Download className="size-4" />
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
            <p className="text-xs text-muted-foreground mt-2">Bitte mindestens eine/n Schüler/in wählen.</p>
          )}
        </div>
      )}

      </>)}

    </div>
  )
}

// ── Step card component ───────────────────────────────────────────────────

function StepCard({
  step,
  title,
  summary,
  isOpen,
  onToggle,
  children,
}: {
  step?: number
  title: string
  summary?: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <Button
        variant="ghost"
        onClick={onToggle}
        className="flex w-full h-auto justify-start rounded-none gap-2 px-4 py-2.5 text-left hover:bg-accent/20"
      >
        {step !== undefined && (
          <span className={cn(
            'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
            isOpen ? 'bg-primary text-primary-foreground' : summary ? 'bg-status-reached text-white' : 'bg-muted text-muted-foreground',
          )}>
            {summary && !isOpen ? '✓' : step}
          </span>
        )}
        {!step && (isOpen
          ? <ChevronDown className="size-4 text-muted-foreground shrink-0" />
          : <ChevronRight className="size-4 text-muted-foreground shrink-0" />)}
        <span className="text-sm font-medium">{title}</span>
        {!isOpen && summary && (
          <span className="ml-auto text-sm text-primary font-medium truncate max-w-[50%]">{summary}</span>
        )}
        {step && isOpen && <ChevronDown className="size-4 text-muted-foreground shrink-0 ml-auto" />}
        {step && !isOpen && !summary && <ChevronRight className="size-4 text-muted-foreground shrink-0 ml-auto" />}
      </Button>
      {isOpen && (
        <div className="px-4 pb-4 pt-3 border-t border-border">
          {children}
        </div>
      )}
    </div>
  )
}
