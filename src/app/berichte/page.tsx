'use client'

import { useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { cn } from '@/lib/utils'
import { generatePdfBlob, downloadZip, triggerDownload } from '@/lib/berichtUtils'
import type { SchuelerBerichtPDFProps } from '@/components/berichte/SchuelerBerichtPDF'
import { Download, Loader2, FileText, Users, User } from 'lucide-react'

export default function BerichtePage() {
  const { classes, getStudentsForClass, getThemenForKlasse, getLernzieleForThema, getFachForThema, getClass } = useData()

  const [selectedKlasseId, setSelectedKlasseId] = useState<string | null>(null)
  const [selectedThemaId, setSelectedThemaId] = useState<string | null>(null)
  const [studentSelection, setStudentSelection] = useState<'all' | string>('all')
  const [kommentare, setKommentare] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)

  const klasse = selectedKlasseId ? getClass(selectedKlasseId) : null
  const themenForKlasse = selectedKlasseId ? getThemenForKlasse(selectedKlasseId) : []
  const studentsForKlasse = selectedKlasseId ? getStudentsForClass(selectedKlasseId) : []
  const lernzieleForThema = selectedThemaId ? getLernzieleForThema(selectedThemaId) : []
  const thema = themenForKlasse.find((t) => t.id === selectedThemaId)
  const fach = selectedThemaId ? getFachForThema(selectedThemaId) : null

  const targetStudents =
    studentSelection === 'all'
      ? studentsForKlasse
      : studentsForKlasse.filter((s) => s.id === studentSelection)

  function selectKlasse(id: string) {
    setSelectedKlasseId(id)
    setSelectedThemaId(null)
    setStudentSelection('all')
    setKommentare({})
  }

  function selectThema(id: string) {
    setSelectedThemaId(id)
    setStudentSelection('all')
    setKommentare({})
  }

  async function handleDownload() {
    if (!klasse || !thema || targetStudents.length === 0) return
    setIsGenerating(true)
    try {
      const dateStr = new Date().toLocaleDateString('de-CH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      const entries = await Promise.all(
        targetStudents.map(async (student) => {
          const props: SchuelerBerichtPDFProps = {
            studentName: student.name,
            klassenName: klasse.name,
            fachName: fach?.name ?? '',
            themaName: thema.name,
            date: dateStr,
            lernziele: lernzieleForThema.map((lz) => ({
              label: lz.label,
              kategorie: lz.kategorie,
              status: student.lernzielStatus[lz.id] ?? 'not_reached',
            })),
            kommentar: kommentare[student.id] || undefined,
          }
          const blob = await generatePdfBlob(props)
          const safeName = student.name.replace(/\s+/g, '_')
          const safeThema = thema.name.replace(/\s+/g, '_')
          return { filename: `Bericht_${safeName}_${safeThema}.pdf`, blob }
        })
      )
      if (entries.length === 1) {
        triggerDownload(entries[0].blob, entries[0].filename)
      } else {
        const safeKlasse = klasse.name.replace(/\s+/g, '_')
        const safeThema = thema.name.replace(/\s+/g, '_')
        await downloadZip(entries, `Berichte_${safeKlasse}_${safeThema}.zip`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Berichterstellung</h1>
        <p className="text-sm text-muted-foreground mt-1">Lernstandsberichte für Eltern als PDF herunterladen</p>
      </div>

      {/* Schritt 1: Klasse */}
      <section className="space-y-3">
        <StepLabel number={1} label="Klasse wählen" done={!!selectedKlasseId} />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {classes.map((k) => (
            <button
              key={k.id}
              onClick={() => selectKlasse(k.id)}
              className={cn(
                'flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-all',
                selectedKlasseId === k.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-accent/40'
              )}
            >
              <span className="text-sm font-medium">{k.name}</span>
              <span className="text-xs text-muted-foreground">{getStudentsForClass(k.id).length} Schüler/innen</span>
            </button>
          ))}
        </div>
      </section>

      {/* Schritt 2: Thema */}
      {selectedKlasseId && (
        <section className="space-y-3">
          <StepLabel number={2} label="Thema wählen" done={!!selectedThemaId} />
          {themenForKlasse.length === 0 ? (
            <p className="text-sm text-muted-foreground">Dieser Klasse sind noch keine Themen zugewiesen.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {themenForKlasse.map((t) => {
                const f = getFachForThema(t.id)
                return (
                  <button
                    key={t.id}
                    onClick={() => selectThema(t.id)}
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-sm transition-all',
                      selectedThemaId === t.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent/40'
                    )}
                  >
                    {f && <span className="opacity-60 mr-1">{f.name} ·</span>}
                    {t.name}
                  </button>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* Schritt 3: Schüler + Kommentare */}
      {selectedThemaId && (
        <section className="space-y-4">
          <StepLabel number={3} label="Schüler und Kommentare" done={false} />

          {/* Schüler-Auswahl */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Für wen?</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStudentSelection('all')}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-all',
                  studentSelection === 'all'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card hover:border-primary/40'
                )}
              >
                <Users className="size-3.5" />
                Alle Schüler/innen
              </button>
              {studentsForKlasse.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStudentSelection(s.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-all',
                    studentSelection === s.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card hover:border-primary/40'
                  )}
                >
                  <User className="size-3.5" />
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Kommentarfelder */}
          {targetStudents.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Kommentar (optional)
              </p>
              {targetStudents.map((s) => (
                <div key={s.id} className="space-y-1">
                  {targetStudents.length > 1 && (
                    <label className="text-xs font-medium text-foreground">{s.name}</label>
                  )}
                  <textarea
                    value={kommentare[s.id] ?? ''}
                    onChange={(e) => setKommentare((prev) => ({ ...prev, [s.id]: e.target.value }))}
                    placeholder="Persönlicher Kommentar für den Elternbericht…"
                    rows={3}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Download-Button */}
          <div className="pt-2">
            <button
              onClick={handleDownload}
              disabled={isGenerating || targetStudents.length === 0 || lernzieleForThema.length === 0}
              className={cn(
                'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all',
                isGenerating || targetStudents.length === 0 || lernzieleForThema.length === 0
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]'
              )}
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
            </button>
            {lernzieleForThema.length === 0 && selectedThemaId && (
              <p className="text-xs text-muted-foreground mt-2">Dieses Thema hat noch keine Lernziele.</p>
            )}
          </div>
        </section>
      )}
    </main>
  )
}

function StepLabel({ number, label, done }: { number: number; label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'flex size-5 items-center justify-center rounded-full text-xs font-bold',
          done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}
      >
        {number}
      </span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  )
}
