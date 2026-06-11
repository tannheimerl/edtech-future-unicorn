'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, BookOpen, Check, Plus, Search, Upload } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/shared/Modal'
import { cn } from '@/lib/utils'
import type { LezioExport, Thema } from '@/types/domain'

type Step = 'picker' | 'browse' | 'upload'

const STEP_TITLE: Record<Step, string> = {
  picker: 'Thema hinzufügen',
  browse: 'Aus Lernzielsammlung',
  upload: 'Thema hochladen',
}
const STEP_SIZE: Record<Step, 'xs' | 'sm' | 'md' | 'lg'> = {
  picker: 'xs',
  browse: 'lg',
  upload: 'sm',
}

function ThemaRow({
  thema,
  lzCount,
  selected,
  disabled,
  onToggle,
}: {
  thema: Thema
  lzCount: number
  selected: boolean
  disabled: boolean
  onToggle?: () => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const isOverdue = thema.faelligAm ? thema.faelligAm < today : false
  const daysUntil = thema.faelligAm
    ? Math.ceil((new Date(thema.faelligAm).getTime() - Date.now()) / 86400000)
    : null
  const isNearDeadline = daysUntil !== null && daysUntil >= 0 && daysUntil <= 14
  const stufeLabel = thema.stufe?.length
    ? thema.stufe.length === 1
      ? `Kl. ${thema.stufe[0]}`
      : `Kl. ${Math.min(...thema.stufe)}–${Math.max(...thema.stufe)}`
    : null

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border-2 p-3 transition-all',
        disabled
          ? 'border-border/50 opacity-50 cursor-default'
          : selected
            ? 'cursor-pointer border-primary bg-primary/5'
            : 'cursor-pointer border-border hover:border-primary/40 hover:bg-accent/30',
      )}
      onClick={disabled ? undefined : onToggle}
    >
      <div className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded-sm border-2 transition-all',
        disabled || selected
          ? 'border-primary bg-primary'
          : 'border-muted-foreground/30 bg-background',
      )}>
        {(disabled || selected) && <Check className="size-2.5 text-white stroke-[3]" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{thema.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {disabled ? 'Bereits zugewiesen' : `${lzCount} Lernziel${lzCount !== 1 ? 'e' : ''}`}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {stufeLabel && (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {stufeLabel}
          </span>
        )}
        {thema.faelligAm && (
          <span className={cn(
            'rounded px-1.5 py-0.5 text-[10px] tabular-nums',
            isOverdue
              ? 'bg-rose-100 text-rose-600 font-medium'
              : isNearDeadline
                ? 'bg-amber-100 text-amber-600'
                : 'bg-muted text-muted-foreground',
          )}>
            {new Date(thema.faelligAm + 'T00:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
    </div>
  )
}

export function AddThemenModal({
  open, onOpenChange, fachId, klassId, klasseGrade, assignedThemaIds, onAdd, onCreateNew,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  fachId: string
  klassId: string
  klasseGrade: number
  assignedThemaIds: string[]
  onAdd: (themaIds: string[]) => void
  onCreateNew?: () => void
}) {
  const {
    faecher, themen, lernziele, currentLpId,
    getClass, createThema, updateThema, createLernziel,
  } = useData()

  const klasse = getClass(klassId)

  // ── Step ─────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('picker')

  // ── Browse state ─────────────────────────────────────────────────────────
  const [browseSelected, setBrowseSelected] = useState<Set<string>>(new Set())
  const [browseSearch, setBrowseSearch] = useState('')
  const [browseFach, setBrowseFach] = useState<string>(fachId)

  // ── Upload state ─────────────────────────────────────────────────────────
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadFileName, setUploadFileName] = useState('')

  // Reset all state when modal opens
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!open) return
    setStep('picker')
    setBrowseSelected(new Set())
    setBrowseSearch('')
    setBrowseFach(fachId)
    setUploadError('')
    setUploadLoading(false)
    setUploadFileName('')
  }, [open, fachId])

  // ── Browse helpers ────────────────────────────────────────────────────────
  const baseThemen = themen.filter(t =>
    (!t.typ || t.typ === 'standard') &&
    (!t.autorLpId || t.autorLpId === currentLpId) &&
    (!t.stufe || t.stufe.includes(klasseGrade))
  )

  const filteredThemen = baseThemen.filter(t => {
    if (browseFach !== 'alle' && t.fachId !== browseFach) return false
    if (browseSearch && !t.name.toLowerCase().includes(browseSearch.toLowerCase())) return false
    return true
  })

  const browseAvailable = filteredThemen.filter(t => !assignedThemaIds.includes(t.id))
  const browseAlready = baseThemen.filter(t =>
    assignedThemaIds.includes(t.id) &&
    (browseFach === 'alle' || t.fachId === browseFach)
  )
  const fachesWithAvail = faecher.filter(f => browseAvailable.some(t => t.fachId === f.id))

  function browseLzCount(themaId: string) {
    return lernziele.filter(lz => lz.themaId === themaId).length
  }

  function toggleBrowse(id: string) {
    setBrowseSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  // ── Upload handler ────────────────────────────────────────────────────────
  async function handleUploadFile(file: File) {
    setUploadError('')
    setUploadLoading(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text) as LezioExport
      if (data.version !== '1' || !data.thema?.name) throw new Error('Ungültiges Dateiformat')
      const id = createThema(fachId, data.thema.name, data.thema.typ ?? 'standard')
      updateThema(id, { stufe: data.thema.stufe })
      for (const lz of data.lernziele ?? []) createLernziel(id, lz.label, lz.kategorie)
      onAdd([id])
      onOpenChange(false)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Fehler beim Importieren')
      setUploadLoading(false)
    }
  }

  // ── Footer per step ───────────────────────────────────────────────────────
  function renderFooter() {
    if (step === 'picker') return undefined

    const back = (
      <Button variant="outline" onClick={() => setStep('picker')} disabled={uploadLoading}>
        <ArrowLeft className="size-3.5 mr-1.5" />Zurück
      </Button>
    )

    if (step === 'browse') return (
      <>
        {back}
        <Button onClick={() => { onAdd(Array.from(browseSelected)); onOpenChange(false) }} disabled={browseSelected.size === 0}>
          {browseSelected.size > 0
            ? `${browseSelected.size} Thema${browseSelected.size > 1 ? 'n' : ''} hinzufügen`
            : 'Hinzufügen'}
        </Button>
      </>
    )

    if (step === 'upload') return (
      <>
        {back}
        <Button onClick={() => fileRef.current?.click()} disabled={uploadLoading}>
          {uploadLoading ? 'Importieren…' : 'Datei wählen'}
        </Button>
      </>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={STEP_TITLE[step]}
      size={STEP_SIZE[step]}
      footer={renderFooter()}
    >
      {/* ── Picker ── */}
      {step === 'picker' && (
        <div className="grid gap-2 pt-1 pb-2">
          {([
            { s: 'browse' as Step | 'create', Icon: BookOpen, label: 'Aus Lernzielsammlung', desc: 'Bestehendes Thema zuweisen' },
            { s: 'create', Icon: Plus, label: 'Neu erstellen', desc: 'Eigenes Thema mit Lernzielen' },
            { s: 'upload' as Step | 'create', Icon: Upload, label: 'Hochladen', desc: '.lezio-Datei importieren' },
          ] as { s: Step | 'create'; Icon: React.FC<{ className?: string }>; label: string; desc: string }[]).map(({ s, Icon, label, desc }) => (
            <button
              key={s}
              onClick={() => {
                if (s === 'create') { onCreateNew?.(); onOpenChange(false) }
                else setStep(s)
              }}
              className="flex items-center gap-3 rounded-xl border-2 border-border p-3.5 text-left hover:border-primary/40 hover:bg-accent/20 transition-all"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium leading-snug">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Browse ── */}
      {step === 'browse' && (
        <div className="grid gap-3">
          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-28">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={browseSearch}
                onChange={e => setBrowseSearch(e.target.value)}
                placeholder="Suchen…"
                className="pl-8 h-8 text-xs"
              />
            </div>
            <select
              value={browseFach}
              onChange={e => setBrowseFach(e.target.value)}
              className="h-8 text-xs rounded-lg border border-border bg-background px-2 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="alle">Alle Fächer</option>
              {faecher.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-0.5">
            {browseAvailable.length === 0 && browseAlready.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                {browseSearch ? 'Keine Themen gefunden.' : 'Keine Themen verfügbar.'}
              </p>
            )}

            {browseFach === 'alle' ? (
              fachesWithAvail.map(f => {
                const rows = browseAvailable.filter(t => t.fachId === f.id)
                if (!rows.length) return null
                return (
                  <div key={f.id} className="mb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-0.5 mb-1">{f.name}</p>
                    <div className="space-y-1.5">
                      {rows.map(t => (
                        <ThemaRow key={t.id} thema={t} lzCount={browseLzCount(t.id)} selected={browseSelected.has(t.id)} disabled={false} onToggle={() => toggleBrowse(t.id)} />
                      ))}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="space-y-1.5">
                {browseAvailable.map(t => (
                  <ThemaRow key={t.id} thema={t} lzCount={browseLzCount(t.id)} selected={browseSelected.has(t.id)} disabled={false} onToggle={() => toggleBrowse(t.id)} />
                ))}
              </div>
            )}

            {browseAlready.length > 0 && (
              <div className="pt-2 border-t border-border/60">
                <p className="text-xs text-muted-foreground mb-1.5">Bereits zugewiesen</p>
                <div className="space-y-1.5">
                  {browseAlready.map(t => (
                    <ThemaRow key={t.id} thema={t} lzCount={browseLzCount(t.id)} selected={false} disabled onToggle={undefined} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Upload ── */}
      {step === 'upload' && (
        <div className="grid gap-3 py-1">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadLoading}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-10 text-center hover:border-primary/40 hover:bg-accent/10 transition-all disabled:pointer-events-none disabled:opacity-50"
          >
            <Upload className="size-7 text-muted-foreground/50" />
            {uploadFileName ? (
              <p className="text-sm font-medium">{uploadFileName}</p>
            ) : (
              <>
                <p className="text-sm font-medium">Datei auswählen</p>
                <p className="text-xs text-muted-foreground">.lezio oder .json</p>
              </>
            )}
          </button>
          {uploadError && (
            <p className="text-xs text-destructive text-center">{uploadError}</p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".lezio,.json"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) {
                setUploadFileName(file.name)
                handleUploadFile(file)
              }
              e.target.value = ''
            }}
          />
        </div>
      )}
    </Modal>
  )
}
