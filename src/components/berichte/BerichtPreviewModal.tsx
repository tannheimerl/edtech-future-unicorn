'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { generatePdfBlob } from '@/lib/berichtUtils'
import type { SchuelerBerichtPDFProps } from '@/components/berichte/SchuelerBerichtPDF'
import type { Fach, Klasse, Lernziel, Schueler, Thema } from '@/types/domain'

interface Props {
  open: boolean
  onClose: () => void
  student: Schueler
  klasse: Klasse
  fach: Fach
  thema: Thema
  activeLz: Lernziel[]
  kommentar: string
  onKommentarChange: (value: string) => void
  inspirationNotes?: { label: string; text: string }[]
  themaKommentar?: string
}

export function BerichtPreviewModal({
  open,
  onClose,
  student,
  klasse,
  fach,
  thema,
  activeLz,
  kommentar,
  onKommentarChange,
  inspirationNotes,
  themaKommentar,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentUrlRef = useRef<string | null>(null)
  const prevOpenRef = useRef(false)

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current)
    }
  }, [])

  useEffect(() => {
    if (!open) {
      prevOpenRef.current = false
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current)
        currentUrlRef.current = null
        setPreviewUrl(null)
      }
      return
    }

    const justOpened = !prevOpenRef.current
    prevOpenRef.current = true

    if (debounceRef.current) clearTimeout(debounceRef.current)

    const run = async () => {
      setIsLoading(true)
      try {
        const props: SchuelerBerichtPDFProps = {
          studentName: `${student.vorname} ${student.nachname}`,
          klassenName: klasse.name,
          fachName: fach.name,
          themaName: thema.name,
          date: new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }),
          lernziele: activeLz.map(lz => ({
            label: lz.label,
            kategorie: lz.kategorie,
            status: student.lernzielStatus[lz.id] ?? 'not_reached',
          })),
          kommentar: kommentar || undefined,
        }
        const blob = await generatePdfBlob(props)
        const url = URL.createObjectURL(blob)
        if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current)
        currentUrlRef.current = url
        setPreviewUrl(url)
      } finally {
        setIsLoading(false)
      }
    }

    if (justOpened) {
      run()
    } else {
      debounceRef.current = setTimeout(run, 600)
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, kommentar])

  const hasInspiration = !!themaKommentar || (inspirationNotes && inspirationNotes.length > 0)

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-4xl p-0 overflow-hidden h-[85vh] gap-0"
      >
        <div className="grid grid-cols-1 sm:grid-cols-[3fr_2fr] h-full overflow-hidden">
          {/* Left: PDF preview */}
          <div className="relative bg-muted/30 border-b sm:border-b-0 sm:border-r border-border h-[45vh] sm:h-full overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-full"
                style={{ border: 'none' }}
              />
            )}
            {!previewUrl && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Vorschau wird geladen…</p>
              </div>
            )}
          </div>

          {/* Right: Comment input */}
          <div className="flex flex-col gap-3 p-4 overflow-y-auto">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {student.vorname} {student.nachname}
                </p>
                <p className="text-xs text-muted-foreground">{thema.name}</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 hover:bg-accent/50 text-muted-foreground transition-colors shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Kommentar</label>
              <textarea
                value={kommentar}
                onChange={e => onKommentarChange(e.target.value)}
                placeholder="Persönlicher Kommentar für den Elternbericht…"
                rows={6}
                autoFocus
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {hasInspiration && (
              <div className="rounded-md bg-muted/50 px-3 py-2 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Notizen aus der Beurteilung</p>
                {themaKommentar && (
                  <p className="text-xs text-muted-foreground italic">{themaKommentar}</p>
                )}
                {inspirationNotes?.map((n, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    <span className="font-medium not-italic">{n.label}: </span>
                    <span className="italic">{n.text}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
