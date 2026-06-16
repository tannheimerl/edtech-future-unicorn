'use client'

import { useEffect, useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useData } from '@/contexts/DataContext'
import { cn } from '@/lib/utils'
import type { Lernziel, Thema } from '@/types/domain'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  klassId: string
  onCreated: (pruefungId: string) => void
}

export function PruefungErstellenModal({ open, onOpenChange, klassId, onCreated }: Props) {
  const { getClass, faecher, themen, lernziele, createPruefung, currentLpId } = useData()

  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [datum, setDatum] = useState(() => new Date().toISOString().slice(0, 10))
  const [fachId, setFachId] = useState('')
  const [maxPunkte, setMaxPunkte] = useState('')
  const [selectedLzIds, setSelectedLzIds] = useState<Set<string>>(new Set())

  const klasse = getClass(klassId)
  const assignedThemaIds = klasse?.assignedThemaIds ?? []

  const availableFaecher = faecher.filter((f) => {
    return themen.some((t) => t.fachId === f.id && assignedThemaIds.includes(t.id) && t.typ !== 'rilz')
  })

  const filteredThemen: Thema[] = themen.filter(
    (t) => t.fachId === fachId && assignedThemaIds.includes(t.id) && t.typ !== 'rilz'
  )

  const themenWithLz: { thema: Thema; lernziele: Lernziel[] }[] = filteredThemen.map((t) => ({
    thema: t,
    lernziele: lernziele.filter((l) => l.themaId === t.id),
  })).filter((t) => t.lernziele.length > 0)

  useEffect(() => {
    if (open) {
      setStep(1)
      setName('')
      setDatum(new Date().toISOString().slice(0, 10))
      setFachId(availableFaecher[0]?.id ?? '')
      setMaxPunkte('')
      setSelectedLzIds(new Set())
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLz = (id: string) => {
    setSelectedLzIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleThema = (themaLzIds: string[]) => {
    const allSelected = themaLzIds.every((id) => selectedLzIds.has(id))
    setSelectedLzIds((prev) => {
      const next = new Set(prev)
      themaLzIds.forEach((id) => allSelected ? next.delete(id) : next.add(id))
      return next
    })
  }

  const canProceedStep1 = name.trim().length > 0 && datum && fachId
  const canCreate = selectedLzIds.size > 0

  const handleCreate = () => {
    const id = createPruefung({
      klasseId: klassId,
      fachId,
      name: name.trim(),
      datum,
      lernzielIds: Array.from(selectedLzIds),
      ...(maxPunkte ? { maxPunkte: Number(maxPunkte) } : {}),
      erstelltVonId: currentLpId,
    })
    onOpenChange(false)
    onCreated(id)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={step === 1 ? 'Neue Prüfung — Details' : 'Neue Prüfung — Lernziele'}
      size="lg"
      footer={
        step === 1 ? (
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
              Weiter <ChevronRight className="ml-1 size-4" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="mr-1 size-4" /> Zurück
            </Button>
            <Button onClick={handleCreate} disabled={!canCreate}>
              Prüfung erstellen
            </Button>
          </>
        )
      }
    >
      {step === 1 && (
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="prf-name">Bezeichnung</Label>
            <Input
              id="prf-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Lernkontrolle Zahlenraum"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="prf-datum">Datum</Label>
              <Input
                id="prf-datum"
                type="date"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="prf-maxpunkte">Max. Punkte (optional)</Label>
              <Input
                id="prf-maxpunkte"
                type="number"
                min={1}
                value={maxPunkte}
                onChange={(e) => setMaxPunkte(e.target.value)}
                placeholder="z.B. 20"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Fach</Label>
            <div className="flex flex-wrap gap-2">
              {availableFaecher.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFachId(f.id)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                    fachId === f.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:bg-accent'
                  )}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <p className="text-sm text-muted-foreground">
            {selectedLzIds.size} Lernziel{selectedLzIds.size !== 1 ? 'e' : ''} ausgewählt
          </p>
          {themenWithLz.map(({ thema, lernziele: lzs }) => {
            const themaIds = lzs.map((l) => l.id)
            const allSelected = themaIds.every((id) => selectedLzIds.has(id))
            const someSelected = themaIds.some((id) => selectedLzIds.has(id))
            return (
              <div key={thema.id} className="rounded-xl border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleThema(themaIds)}
                  className="flex w-full items-center justify-between gap-2 bg-muted px-3 py-2 text-left text-sm font-semibold hover:bg-accent transition-colors"
                >
                  <span>{thema.name}</span>
                  <span className={cn(
                    'rounded px-1.5 py-0.5 text-xs',
                    allSelected ? 'bg-primary text-primary-foreground' : someSelected ? 'bg-amber-100 text-amber-700' : 'bg-background text-muted-foreground'
                  )}>
                    {allSelected ? 'Alle' : someSelected ? 'Teilweise' : 'Keine'}
                  </span>
                </button>
                <ul className="divide-y divide-border">
                  {lzs.map((lz) => (
                    <li key={lz.id}>
                      <label className="flex cursor-pointer items-start gap-3 px-3 py-2 hover:bg-accent/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedLzIds.has(lz.id)}
                          onChange={() => toggleLz(lz.id)}
                          className="mt-0.5 shrink-0 accent-primary"
                        />
                        <span className="flex-1 text-sm">
                          {lz.label}
                          <span className={cn(
                            'ml-2 rounded px-1 py-0.5 text-xs',
                            lz.kategorie === 'grundlegend'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-violet-100 text-violet-700'
                          )}>
                            {lz.kategorie === 'grundlegend' ? 'G' : 'A'}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}
