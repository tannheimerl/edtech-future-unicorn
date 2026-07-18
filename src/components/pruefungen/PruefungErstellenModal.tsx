'use client'

import { useEffect, useState } from 'react'
import { Icon } from "@/components/ui/Icon"
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { useData } from '@/contexts/DataContext'
import { cn } from '@/lib/utils'
import type { PruefungTyp } from '@/types/domain'
import { PRUEFUNG_TYP_GRUPPEN } from '@/types/domain'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  klassId: string
  onCreated: (pruefungId: string) => void
}

export const PruefungErstellenModal = ({ open, onOpenChange, klassId, onCreated }: Props) => {
  const { getClass, faecher, themen, lernziele, createPruefung, getStudentsForClass } = useData()

  const [step, setStep] = useState(1)

  // Step 1: Inhalt & Struktur
  const [typ, setTyp] = useState<PruefungTyp>('pruefung_schriftlich')
  const [name, setName] = useState('')
  const [beschreibung, setBeschreibung] = useState('')
  const [fachId, setFachId] = useState('')
  const [selectedThemaIds, setSelectedThemaIds] = useState<Set<string>>(new Set())
  const [selectedLzIds, setSelectedLzIds] = useState<Set<string>>(new Set())

  // RILZ
  const [nurRilz, setNurRilz] = useState(false)
  const [rilzSchuelerIds, setRilzSchuelerIds] = useState<string[]>([])

  // Step 2: Bewertung & Termin
  const [datum, setDatum] = useState(() => new Date().toISOString().slice(0, 10))
  const [punkteEnabled, setPunkteEnabled] = useState(false)
  const [noteEnabled, setNoteEnabled] = useState(false)
  const [anhangEnabled, setAnhangEnabled] = useState(false)
  const [maxPunkte, setMaxPunkte] = useState('')

  const klasse = getClass(klassId)
  const assignedThemaIds = klasse?.assignedThemaIds ?? []

  const availableFaecher = faecher.filter((f) =>
    themen.some((t) => t.fachId === f.id && assignedThemaIds.includes(t.id) && t.typ !== 'rilz')
  )

  const filteredThemen = themen.filter(
    (t) => t.fachId === fachId && assignedThemaIds.includes(t.id) && (nurRilz ? true : t.typ !== 'rilz')
  )

  const rilzSchuelerInFach = fachId
    ? getStudentsForClass(klassId).filter((s) => s.rilzFachIds?.includes(fachId))
    : []

  const themenWithLz = filteredThemen
    .filter((t) => selectedThemaIds.has(t.id))
    .map((t) => ({ thema: t, lernziele: lernziele.filter((l) => l.themaId === t.id) }))
    .filter((t) => t.lernziele.length > 0)

  useEffect(() => {
    if (open) {
      setStep(1)
      setTyp('pruefung_schriftlich')
      setName('')
      setBeschreibung('')
      setFachId(availableFaecher[0]?.id ?? '')
      setSelectedThemaIds(new Set())
      setSelectedLzIds(new Set())
      setNurRilz(false)
      setRilzSchuelerIds([])
      setDatum(new Date().toISOString().slice(0, 10))
      setPunkteEnabled(false)
      setNoteEnabled(false)
      setAnhangEnabled(false)
      setMaxPunkte('')
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFachChange = (id: string) => {
    setFachId(id)
    setSelectedThemaIds(new Set())
    setSelectedLzIds(new Set())
  }

  const toggleThemaChip = (themaId: string) => {
    const lzIdsForThema = lernziele.filter((l) => l.themaId === themaId).map((l) => l.id)
    if (selectedThemaIds.has(themaId)) {
      setSelectedThemaIds((prev) => { const n = new Set(prev); n.delete(themaId); return n })
      setSelectedLzIds((prev) => {
        const n = new Set(prev)
        lzIdsForThema.forEach((id) => n.delete(id))
        return n
      })
    } else {
      setSelectedThemaIds((prev) => { const n = new Set(prev); n.add(themaId); return n })
    }
  }

  const toggleLz = (id: string) => {
    setSelectedLzIds((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const toggleAllLzForThema = (lzIds: string[]) => {
    const allSelected = lzIds.every((id) => selectedLzIds.has(id))
    setSelectedLzIds((prev) => {
      const n = new Set(prev)
      lzIds.forEach((id) => allSelected ? n.delete(id) : n.add(id))
      return n
    })
  }

  const canProceedStep1 = name.trim().length > 0 && !!fachId && selectedLzIds.size > 0
    && (!nurRilz || rilzSchuelerIds.length > 0)

  const handleCreate = () => {
    const id = createPruefung({
      klasseId: klassId,
      fachId,
      name: name.trim(),
      typ,
      beschreibung: beschreibung.trim() || undefined,
      status: 'laufend',
      punkteEnabled,
      noteEnabled,
      anhangEnabled,
      datum,
      lernzielIds: Array.from(selectedLzIds),
      ...(punkteEnabled && maxPunkte ? { maxPunkte: Number(maxPunkte) } : {}),
      nurRilz,
      rilzSchuelerIds,
    })
    onOpenChange(false)
    onCreated(id)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={step === 1 ? 'Neue Lernzielkontrolle — Inhalt' : 'Neue Lernzielkontrolle — Bewertung & Termin'}
      size="lg"
      footer={
        step === 1 ? (
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
              Weiter <Icon name="chevron_right" size={16} className="ml-1" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setStep(1)}>
              <Icon name="chevron_left" size={16} className="mr-1" /> Zurück
            </Button>
            <Button onClick={handleCreate}>
              Lernzielkontrolle erstellen
            </Button>
          </>
        )
      }
    >
      {/* ── Step 1: Inhalt & Struktur ───────────────────────────────────────── */}
      {step === 1 && (
        <div className="grid gap-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid gap-1.5">
            <Label htmlFor="prf-typ">Art der Leistung</Label>
            <Select
              id="prf-typ"
              value={typ}
              onChange={(e) => setTyp(e.target.value as PruefungTyp)}
            >
              {PRUEFUNG_TYP_GRUPPEN.map(({ gruppe, optionen }) => (
                <optgroup key={gruppe} label={gruppe}>
                  {optionen.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </div>

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

          <div className="grid gap-1.5">
            <Label htmlFor="prf-beschreibung">Beschreibung (optional)</Label>
            <Textarea
              id="prf-beschreibung"
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              placeholder="Kurze Beschreibung der Aufgabe oder des Leistungsnachweises..."
              rows={2}
              className="field-sizing-fixed resize-none"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Fach</Label>
            <div className="flex flex-wrap gap-2">
              {availableFaecher.map((f) => (
                <Button
                  key={f.id}
                  type="button"
                  variant={fachId === f.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFachChange(f.id)}
                >
                  {f.name}
                </Button>
              ))}
            </div>
          </div>

          {fachId && (
            <div className="grid gap-1.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nurRilz}
                  onChange={e => {
                    setNurRilz(e.target.checked)
                    setRilzSchuelerIds([])
                    setSelectedThemaIds(new Set())
                    setSelectedLzIds(new Set())
                  }}
                  className="shrink-0 accent-rilz"
                />
                <div>
                  <p className="text-sm font-medium leading-none">RILZ-Lernzielkontrolle</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Nur für RILZ-Schüler — individuelle Beurteilung durch Heilpädagogen</p>
                </div>
              </label>
              {nurRilz && rilzSchuelerInFach.length > 0 && (
                <div className="rounded-lg border border-rilz-border bg-rilz-soft p-3 space-y-2">
                  <p className="text-xs font-semibold text-rilz-foreground">RILZ-Schüler auswählen</p>
                  {rilzSchuelerInFach.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rilzSchuelerIds.includes(s.id)}
                        onChange={e => setRilzSchuelerIds(prev =>
                          e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id)
                        )}
                        className="shrink-0 accent-rilz"
                      />
                      <span className="text-sm">{s.vorname} {s.nachname}</span>
                    </label>
                  ))}
                </div>
              )}
              {nurRilz && rilzSchuelerInFach.length === 0 && (
                <p className="text-xs text-muted-foreground rounded-lg border border-border bg-muted/30 px-3 py-2">
                  Keine RILZ-Schüler in diesem Fach gefunden.
                </p>
              )}
            </div>
          )}

          {fachId && filteredThemen.length > 0 && (
            <div className="grid gap-1.5">
              <Label>Thema</Label>
              <div className="flex flex-wrap gap-2">
                {filteredThemen.map((t) => (
                  <Button
                    key={t.id}
                    type="button"
                    variant={selectedThemaIds.has(t.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleThemaChip(t.id)}
                  >
                    {t.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {themenWithLz.length > 0 && (
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label>Lernziele</Label>
                <span className="text-xs text-muted-foreground">
                  {selectedLzIds.size} gewählt
                </span>
              </div>
              <div className="space-y-2">
                {themenWithLz.map(({ thema, lernziele: lzs }) => {
                  const themaLzIds = lzs.map((l) => l.id)
                  const allSelected = themaLzIds.every((id) => selectedLzIds.has(id))
                  const someSelected = themaLzIds.some((id) => selectedLzIds.has(id))
                  return (
                    <div key={thema.id} className="rounded-2xl border border-border overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleAllLzForThema(themaLzIds)}
                        className="flex w-full items-center justify-between gap-2 bg-muted px-3 py-2 text-left text-sm font-semibold hover:bg-accent transition-colors"
                      >
                        <span>{thema.name}</span>
                        <span className={cn(
                          'rounded px-1.5 py-0.5 text-xs',
                          allSelected ? 'bg-primary text-primary-foreground' : someSelected ? 'bg-status-partial-soft text-status-partial-fg' : 'bg-background text-muted-foreground'
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
                                    ? 'bg-category-grundlegend-soft text-category-grundlegend-fg'
                                    : 'bg-category-anspruchsvoll-soft text-category-anspruchsvoll-fg'
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
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Bewertung & Termin ──────────────────────────────────────── */}
      {step === 2 && (
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="prf-datum">Fälligkeitsdatum</Label>
            <Input
              id="prf-datum"
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Was soll bewertet werden?</Label>
            <div className="space-y-2 rounded-lg border border-border p-3">
              {/* Lernzielstatus — immer an, nicht abwählbar */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 size-4 shrink-0 rounded border-2 border-primary bg-primary flex items-center justify-center">
                  <svg className="size-2.5 text-primary-foreground" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5l3 4 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium leading-none flex items-center gap-1.5">
                    Lernzielstatus
                    <Badge className="rounded-full py-px">Standard</Badge>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Erreicht / Teilweise erreicht / Nicht erreicht</p>
                </div>
              </div>
              {([
                { state: punkteEnabled, set: setPunkteEnabled, label: 'Punktezahl', desc: 'Punkte pro Schüler erfassen' },
                { state: noteEnabled,   set: setNoteEnabled,   label: 'Note (1–6)',  desc: 'Schweizer Note vergeben' },
                { state: anhangEnabled, set: setAnhangEnabled, label: 'Anhang',      desc: 'Datei-Upload pro Schüler ermöglichen' },
              ] as const).map(({ state, set, label, desc }) => (
                <label key={label} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state}
                    onChange={e => set(e.target.checked)}
                    className="mt-0.5 shrink-0 accent-primary"
                  />
                  <div>
                    <p className="text-sm font-medium leading-none">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {punkteEnabled && (
            <div className="grid gap-1.5">
              <Label htmlFor="prf-maxpunkte">Max. Punktezahl</Label>
              <Input
                id="prf-maxpunkte"
                type="number"
                min={1}
                value={maxPunkte}
                onChange={(e) => setMaxPunkte(e.target.value)}
                placeholder="z.B. 20"
              />
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
