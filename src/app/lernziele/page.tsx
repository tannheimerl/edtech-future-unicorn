'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen, BookMarked, ChevronDown, ChevronRight, PencilLine, Plus,
  X, Check, Users, GraduationCap, Trash2, Calendar, Search,
  Star, Copy, UserRound,
} from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Modal } from '@/components/shared/Modal'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { LernzielKategorie, Lernziel } from '@/types/domain'

// ── Shared helpers ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>
}

function KatBadge({ kat }: { kat: LernzielKategorie }) {
  return (
    <span className={cn(
      'shrink-0 rounded px-1 text-[9px] font-semibold',
      kat === 'grundlegend' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700',
    )}>
      {kat === 'grundlegend' ? 'G' : 'A'}
    </span>
  )
}

// ── Create modal ──────────────────────────────────────────────────────────

function CreateModal({ open, onOpenChange, title, label, placeholder, onSubmit }: {
  open: boolean; onOpenChange: (v: boolean) => void
  title: string; label: string; placeholder: string
  onSubmit: (v: string) => void
}) {
  const [value, setValue] = useState('')
  useEffect(() => { if (open) setValue('') }, [open])

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!value.trim()) return
    onSubmit(value.trim())
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={() => submit()}>Erstellen</Button>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-3">
        <div className="grid gap-1.5">
          <Label>{label}</Label>
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} autoFocus />
        </div>
      </form>
    </Modal>
  )
}

// ── SaveField ─────────────────────────────────────────────────────────────

function SaveField({ label, value, onChange, onSave, saved }: {
  label: string; value: string; onChange: (v: string) => void; onSave: () => void; saved: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSave()} className="h-8 text-sm" />
        <Button size="sm" className="shrink-0 h-8" onClick={onSave}
          disabled={!value.trim()} variant={saved ? 'outline' : 'default'}>
          {saved ? <Check className="size-3.5" /> : 'Speichern'}
        </Button>
      </div>
    </div>
  )
}

// ── Fach modal ────────────────────────────────────────────────────────────

function FachModal({ open, fachId, onClose }: { open: boolean; fachId: string; onClose: () => void }) {
  const { faecher, themen, lernziele, updateFach, deleteFach } = useData()
  const fach = faecher.find(f => f.id === fachId)
  const fachThemen = themen.filter(t => t.fachId === fachId)
  const totalLZ = fachThemen.reduce((n, t) => n + lernziele.filter(lz => lz.themaId === t.id && lz.source !== 'bibliothek').length, 0)

  const [name, setName] = useState(fach?.name ?? '')
  const [saved, setSaved] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => { setName(fach?.name ?? '') }, [fach?.name])

  if (!fach) return null

  function save() {
    if (!name.trim() || name === fach!.name) return
    updateFach(fachId, name.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-5 py-4 border-b bg-muted/20">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fach konfigurieren</p>
            <DialogTitle className="text-base font-semibold">{fach.name}</DialogTitle>
          </DialogHeader>
          <div className="px-5 py-4 space-y-4">
            <div className="space-y-2">
              <SectionLabel>Name</SectionLabel>
              <SaveField label="Fachbezeichnung" value={name}
                onChange={(v) => { setName(v); setSaved(false) }} onSave={save} saved={saved} />
            </div>
            <div className="space-y-2">
              <SectionLabel>Inhalt</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { n: fachThemen.length, label: fachThemen.length === 1 ? 'Thema' : 'Themen' },
                  { n: totalLZ, label: 'eigene Lernziele' },
                ].map(({ n, label }) => (
                  <div key={label} className="rounded-xl bg-muted p-3 text-center">
                    <p className="text-2xl font-bold">{n}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              {fachThemen.length > 0 && (
                <div className="space-y-1 pt-1">
                  {fachThemen.map(t => (
                    <div key={t.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BookOpen className="size-3 shrink-0" />
                      <span className="flex-1 truncate">{t.name}</span>
                      <span className="shrink-0">{lernziele.filter(lz => lz.themaId === t.id && lz.source !== 'bibliothek').length} LZ</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="border-t px-5 py-3 bg-red-50/50 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700 mb-0.5">Gefahrenzone</p>
              <p className="text-xs text-muted-foreground">
                Löscht das Fach mit allen <strong>{fachThemen.length}</strong> Themen und <strong>{totalLZ}</strong> eigenen Lernzielen dauerhaft.
              </p>
            </div>
            <Button variant="destructive" size="sm" className="shrink-0" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-3.5" /> Löschen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={deleteOpen} onOpenChange={setDeleteOpen}
        title="Fach löschen"
        description={`„${fach.name}" mit allen ${fachThemen.length} Themen und ${totalLZ} Lernzielen dauerhaft löschen?`}
        confirmLabel="Dauerhaft löschen"
        onConfirm={() => { deleteFach(fachId); onClose() }}
      />
    </>
  )
}

// ── Thema modal ───────────────────────────────────────────────────────────

function ThemaModal({ open, themaId, onClose }: { open: boolean; themaId: string; onClose: () => void }) {
  const {
    themen, faecher, lernziele, classes, getStudentsForClass,
    updateThema, deleteThema,
    createLernziel, updateLernziel, deleteLernziel,
    assignLernzielToKlasse, removeLernzielFromKlasse,
  } = useData()

  const thema = themen.find(t => t.id === themaId)
  const fach = thema ? faecher.find(f => f.id === thema.fachId) : undefined
  const themaLZ = lernziele.filter(lz => lz.themaId === themaId && lz.source !== 'bibliothek')

  const [name, setName] = useState(thema?.name ?? '')
  const [nameSaved, setNameSaved] = useState(false)
  const [faelligAm, setFaelligAm] = useState(thema?.faelligAm ?? '')
  const [newLZ, setNewLZ] = useState('')
  const [newLZKategorie, setNewLZKategorie] = useState<LernzielKategorie>('grundlegend')
  const [editLzId, setEditLzId] = useState<string | null>(null)
  const [editLzLabel, setEditLzLabel] = useState('')
  const [editLzKategorie, setEditLzKategorie] = useState<LernzielKategorie>('grundlegend')
  const [deleteLzId, setDeleteLzId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => { setName(thema?.name ?? '') }, [thema?.name])
  useEffect(() => { setFaelligAm(thema?.faelligAm ?? '') }, [thema?.faelligAm])

  if (!thema) return null

  const today = new Date().toISOString().slice(0, 10)

  function saveName() {
    if (!name.trim() || name === thema!.name) return
    updateThema(themaId, { name: name.trim() })
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  function updateDate(val: string) {
    setFaelligAm(val)
    updateThema(themaId, { faelligAm: val || undefined })
  }

  function addLZ() {
    if (!newLZ.trim()) return
    createLernziel(themaId, newLZ.trim(), newLZKategorie)
    setNewLZ('')
  }

  function saveLZ(id: string) {
    if (!editLzLabel.trim()) return
    updateLernziel(id, { label: editLzLabel.trim(), kategorie: editLzKategorie })
    setEditLzId(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
        <DialogContent className="sm:max-w-3xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 py-2.5 border-b bg-muted/20">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {fach ? `${fach.name} · Thema konfigurieren` : 'Thema konfigurieren'}
            </p>
            <DialogTitle className="text-sm font-semibold leading-tight">{thema.name}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 divide-x divide-border border-b">
            <div className="px-4 py-2 space-y-1">
              <SectionLabel>Name</SectionLabel>
              <div className="flex gap-1.5">
                <Input value={name}
                  onChange={(e) => { setName(e.target.value); setNameSaved(false) }}
                  onKeyDown={(e) => e.key === 'Enter' && saveName()}
                  className="h-7 text-xs" />
                <Button size="sm" className="h-7 shrink-0 px-2.5 text-xs" onClick={saveName}
                  disabled={!name.trim()} variant={nameSaved ? 'outline' : 'default'}>
                  {nameSaved ? <Check className="size-3" /> : 'OK'}
                </Button>
              </div>
            </div>
            <div className="px-4 py-2 space-y-1">
              <SectionLabel>Fälligkeitsdatum</SectionLabel>
              <div className="flex gap-1.5">
                <Input type="date" lang="de" value={faelligAm}
                  onChange={(e) => updateDate(e.target.value)}
                  className="h-7 text-xs flex-1" />
                {faelligAm && (
                  <Button size="sm" variant="ghost"
                    className="h-7 shrink-0 px-2 text-muted-foreground hover:text-destructive"
                    onClick={() => updateDate('')} aria-label="Datum entfernen">
                    <X className="size-3" />
                  </Button>
                )}
              </div>
              {faelligAm && (
                <p className={cn('text-[10px]', faelligAm > today ? 'text-sky-600' : 'text-emerald-600')}>
                  {faelligAm > today ? 'In der Zukunft' : 'Fälligkeit erreicht — fließt in die Statistik ein'}
                </p>
              )}
            </div>
          </div>

          <div className="px-4 py-2 border-b space-y-1">
            <SectionLabel>Klassen-Zuordnung</SectionLabel>
            {classes.length === 0 ? (
              <p className="text-xs text-muted-foreground">Noch keine Klassen angelegt.</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {classes.map(klasse => {
                  const themaLZIds = themaLZ.map(lz => lz.id)
                  const isAssigned = themaLZIds.length > 0 && themaLZIds.every(id => klasse.assignedLernzielIds.includes(id))
                  const studentCount = getStudentsForClass(klasse.id).length
                  return (
                    <button key={klasse.id}
                      onClick={() => isAssigned
                        ? themaLZIds.forEach(id => removeLernzielFromKlasse(klasse.id, id))
                        : themaLZIds.forEach(id => { if (!klasse.assignedLernzielIds.includes(id)) assignLernzielToKlasse(klasse.id, id) })
                      }
                      className={cn(
                        'flex items-center gap-1.5 rounded-md border px-2 py-1 text-left transition-all',
                        isAssigned ? 'border-primary bg-primary/5' : 'border-border bg-background hover:bg-accent',
                      )}
                    >
                      <div className={cn(
                        'flex size-3 shrink-0 items-center justify-center rounded-sm border-2 transition-all',
                        isAssigned ? 'border-primary bg-primary' : 'border-border bg-background',
                      )}>
                        {isAssigned && <Check className="size-1.5 text-primary-foreground stroke-[4]" />}
                      </div>
                      <span className="text-xs font-medium">{klasse.name}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Users className="size-2.5" />{studentCount}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="px-4 py-2 space-y-2">
            <SectionLabel>Eigene Lernziele — {themaLZ.length}</SectionLabel>
            {(['grundlegend', 'anspruchsvoll'] as LernzielKategorie[]).map((kat) => {
              const katLZ = themaLZ.filter(lz => lz.kategorie === kat)
              return (
                <div key={kat} className="space-y-1">
                  <p className={cn(
                    'text-[10px] font-semibold uppercase tracking-wide px-0.5',
                    kat === 'grundlegend' ? 'text-sky-600' : 'text-amber-600',
                  )}>
                    {kat === 'grundlegend' ? 'Grundlegende Lernziele' : 'Anspruchsvollere Lernziele'}
                    {katLZ.length > 0 && <span className="ml-1 font-normal normal-case">({katLZ.length})</span>}
                  </p>
                  {katLZ.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground/60 pl-0.5">Noch keine vorhanden.</p>
                  ) : (
                    <div className="divide-y divide-border rounded-md border border-border overflow-hidden">
                      {katLZ.map((lz, i) => (
                        <div key={lz.id} className="group flex items-center gap-2 bg-background px-3 py-1">
                          <span className="w-4 shrink-0 text-[10px] font-mono text-muted-foreground">{i + 1}</span>
                          {editLzId === lz.id ? (
                            <>
                              <div className="flex rounded border overflow-hidden shrink-0 h-6">
                                {(['grundlegend', 'anspruchsvoll'] as LernzielKategorie[]).map(k => (
                                  <button key={k} onClick={() => setEditLzKategorie(k)}
                                    className={cn(
                                      'px-1.5 text-[9px] font-medium transition-colors',
                                      editLzKategorie === k
                                        ? k === 'grundlegend' ? 'bg-sky-500 text-white' : 'bg-amber-500 text-white'
                                        : 'bg-background text-muted-foreground hover:bg-muted',
                                    )}>
                                    {k === 'grundlegend' ? 'G' : 'A'}
                                  </button>
                                ))}
                              </div>
                              <Input value={editLzLabel}
                                onChange={(e) => setEditLzLabel(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveLZ(lz.id)
                                  if (e.key === 'Escape') setEditLzId(null)
                                }}
                                className="h-6 text-xs flex-1 px-1.5" autoFocus />
                              <Button size="icon-sm" variant="ghost" onClick={() => saveLZ(lz.id)}>
                                <Check className="size-3 text-emerald-600" />
                              </Button>
                              <Button size="icon-sm" variant="ghost" onClick={() => setEditLzId(null)}>
                                <X className="size-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 text-xs leading-snug">{lz.label}</span>
                              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <Button size="icon-sm" variant="ghost"
                                  onClick={() => { setEditLzId(lz.id); setEditLzLabel(lz.label); setEditLzKategorie(lz.kategorie) }}
                                  aria-label="Bearbeiten">
                                  <PencilLine className="size-3" />
                                </Button>
                                <Button size="icon-sm" variant="ghost"
                                  className="text-red-400 hover:text-red-600"
                                  onClick={() => setDeleteLzId(lz.id)} aria-label="Löschen">
                                  <Trash2 className="size-3" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            <div className="flex gap-1.5 pt-0.5">
              <div className="flex rounded border overflow-hidden shrink-0 h-7">
                {(['grundlegend', 'anspruchsvoll'] as LernzielKategorie[]).map(k => (
                  <button key={k} onClick={() => setNewLZKategorie(k)}
                    className={cn(
                      'px-2 text-[10px] font-medium transition-colors',
                      newLZKategorie === k
                        ? k === 'grundlegend' ? 'bg-sky-500 text-white' : 'bg-amber-500 text-white'
                        : 'bg-background text-muted-foreground hover:bg-muted',
                    )}>
                    {k === 'grundlegend' ? 'G' : 'A'}
                  </button>
                ))}
              </div>
              <Input value={newLZ} onChange={(e) => setNewLZ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLZ()}
                placeholder="Neues Lernziel eingeben…" className="h-7 text-xs" />
              <Button size="sm" className="h-7 shrink-0 px-2.5" variant="outline" onClick={addLZ} disabled={!newLZ.trim()}>
                <Plus className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="border-t px-4 py-2 bg-red-50/50 flex items-center justify-between gap-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-red-600">
              Thema mit allen {themaLZ.length} Lernzielen dauerhaft löschen
            </p>
            <Button variant="destructive" size="sm" className="h-7 shrink-0" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-3" /> Löschen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteLzId} onOpenChange={(o) => { if (!o) setDeleteLzId(null) }}
        title="Lernziel löschen" description="Soll dieses Lernziel wirklich dauerhaft gelöscht werden?"
        confirmLabel="Löschen"
        onConfirm={() => { if (deleteLzId) deleteLernziel(deleteLzId) }}
      />
      <ConfirmDialog
        open={deleteOpen} onOpenChange={setDeleteOpen}
        title="Thema löschen"
        description={`„${thema.name}" mit allen ${themaLZ.length} Lernzielen dauerhaft löschen?`}
        confirmLabel="Dauerhaft löschen"
        onConfirm={() => { deleteThema(themaId); onClose() }}
      />
    </>
  )
}

// ── Thema chip ────────────────────────────────────────────────────────────

function formatChipDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
}

function ThemaChip({ themaId, onClick }: { themaId: string; onClick: () => void }) {
  const { themen, lernziele, classes } = useData()
  const thema = themen.find(t => t.id === themaId)!
  const ownLZ = lernziele.filter(lz => lz.themaId === themaId && lz.source !== 'bibliothek')
  const lzCount = ownLZ.length
  const themaLZIds = ownLZ.map(lz => lz.id)
  const classCount = classes.filter(c => themaLZIds.some(id => c.assignedLernzielIds.includes(id))).length
  const today = new Date().toISOString().slice(0, 10)
  const isFuture = !!(thema.faelligAm && thema.faelligAm > today)

  return (
    <button onClick={onClick} aria-label="Thema konfigurieren"
      className="group flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-left text-xs transition-all hover:border-primary/40 hover:bg-accent/60"
    >
      <span className="font-medium">{thema.name}</span>
      <span className="tabular-nums text-muted-foreground">· {lzCount}</span>
      {thema.faelligAm && (
        <span className={cn('flex items-center gap-0.5', isFuture ? 'text-sky-500' : 'text-emerald-600/70')}>
          <Calendar className="size-2.5" />
          {formatChipDate(thema.faelligAm)}
        </span>
      )}
      {classCount > 0 && (
        <span className="flex items-center gap-0.5 text-muted-foreground/60">
          <GraduationCap className="size-2.5" />
          {classCount}
        </span>
      )}
    </button>
  )
}

// ── Library LZ card ────────────────────────────────────────────────────────

const STUFEN = [3, 4, 5, 6, 7, 8]

function LzCard({
  lz, fachName, themaName,
}: {
  lz: Lernziel; fachName: string; themaName: string
}) {
  const { classes, assignLernzielToKlasse, copyLernzielToEigene } = useData()
  const [pickOpen, setPickOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const isLibrary = lz.source === 'bibliothek'
  const assignedKlassen = classes.filter(k => k.assignedLernzielIds.includes(lz.id))

  function handleCopy() {
    copyLernzielToEigene(lz.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm space-y-2 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{fachName}</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground">{themaName}</span>
            <KatBadge kat={lz.kategorie} />
            {lz.wichtig && (
              <span className="rounded px-1 text-[9px] font-semibold bg-yellow-100 text-yellow-700 flex items-center gap-0.5">
                <Star className="size-2.5" /> Wichtig
              </span>
            )}
            {!isLibrary && (
              <span className="rounded px-1 text-[9px] font-semibold bg-violet-100 text-violet-700">Eigene</span>
            )}
          </div>
          <p className="text-sm font-medium leading-snug">{lz.label}</p>

          {/* Author + description for library items */}
          {isLibrary && (
            <div className="mt-1 space-y-0.5">
              <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <UserRound className="size-2.5 shrink-0" />
                {lz.autor ?? 'Unbekannt'}
                {(lz.stufe?.length ?? 0) > 0 && (
                  <span className="ml-1">· Stufe {lz.stufe!.join(', ')}</span>
                )}
              </p>
              {lz.beschreibung && (
                <p className="text-[10px] text-muted-foreground/80 italic leading-snug">{lz.beschreibung}</p>
              )}
            </div>
          )}
          {!isLibrary && (lz.stufe?.length ?? 0) > 0 && (
            <p className="text-[10px] text-muted-foreground mt-0.5">Stufe {lz.stufe!.join(', ')}</p>
          )}
        </div>
      </div>

      {assignedKlassen.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {assignedKlassen.map(k => (
            <span key={k.id} className="rounded px-1.5 text-[9px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
              <Check className="size-2.5" /> {k.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        {/* Assign to class */}
        <div className="relative flex-1">
          <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={() => setPickOpen(p => !p)}>
            In Klasse übernehmen
          </Button>
          {pickOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setPickOpen(false)} />
              <div className="absolute bottom-full mb-1 left-0 right-0 z-20 bg-background border border-border rounded-xl shadow-lg py-1 min-w-[180px]">
                {classes.length === 0 && (
                  <p className="px-3 py-2 text-xs text-muted-foreground">Keine Klassen vorhanden</p>
                )}
                {classes.map(klasse => {
                  const already = klasse.assignedLernzielIds.includes(lz.id)
                  return (
                    <button key={klasse.id}
                      onClick={() => { assignLernzielToKlasse(klasse.id, lz.id); setPickOpen(false) }}
                      disabled={already}
                      className={cn(
                        'flex items-center gap-2 w-full px-3 py-2 text-xs text-left transition-colors',
                        already ? 'text-muted-foreground cursor-not-allowed' : 'hover:bg-muted',
                      )}
                    >
                      {already ? <Check className="size-3 text-emerald-500 shrink-0" /> : <span className="size-3 shrink-0" />}
                      {klasse.name}
                      {already && <span className="ml-auto text-[9px] text-emerald-600">bereits zugewiesen</span>}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Copy to own */}
        {isLibrary && (
          <Button size="sm" variant="outline" className="h-7 shrink-0 text-xs px-2.5" onClick={handleCopy}>
            {copied
              ? <><Check className="size-3 text-emerald-500" /> Kopiert</>
              : <><Copy className="size-3" /> Kopieren</>
            }
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

type ViewTab = 'eigene' | 'alle'
type EditTarget = { type: 'fach'; id: string } | { type: 'thema'; id: string } | null

export default function LernzielePage() {
  const { faecher, themen, lernziele, createFach, createThema } = useData()

  const [tab, setTab] = useState<ViewTab>('eigene')

  // ── Eigene tab state ──
  const [editing, setEditing] = useState<EditTarget>(null)
  const [expandedFaecher, setExpandedFaecher] = useState<Set<string>>(
    () => new Set(faecher.map(f => f.id)),
  )
  const [fachCreateOpen, setFachCreateOpen] = useState(false)
  const [themaCreateFachId, setThemaCreateFachId] = useState<string | null>(null)

  // ── Alle tab state ──
  const [search, setSearch] = useState('')
  const [stufeFilter, setStufeFilter] = useState<number | null>(null)
  const [fachFilter, setFachFilter] = useState<string | null>(null)
  const [sourceFilter, setSourceFilter] = useState<'alle' | 'eigene' | 'bibliothek'>('alle')

  function toggleFach(id: string) {
    setExpandedFaecher(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  // Only own (non-bibliothek) LZ for catalog counts
  const ownLZ = lernziele.filter(lz => lz.source !== 'bibliothek')
  const totalStats = { faecher: faecher.length, themen: themen.length, lernziele: ownLZ.length }

  // ── Alle tab filtering ──
  const q = search.trim().toLowerCase()

  const filteredAll = useMemo(() => {
    return lernziele.filter(lz => {
      if (sourceFilter === 'eigene' && lz.source === 'bibliothek') return false
      if (sourceFilter === 'bibliothek' && lz.source !== 'bibliothek') return false
      if (fachFilter) {
        const thema = themen.find(t => t.id === lz.themaId)
        if (!thema || thema.fachId !== fachFilter) return false
      }
      if (stufeFilter !== null) {
        if (!(lz.stufe ?? []).includes(stufeFilter)) return false
      }
      if (q) {
        const label = lz.label.toLowerCase()
        const kriterien = (lz.kriterien ?? []).join(' ').toLowerCase()
        const thema = themen.find(t => t.id === lz.themaId)
        const fach = thema ? faecher.find(f => f.id === thema.fachId) : undefined
        const autor = (lz.autor ?? '').toLowerCase()
        if (!label.includes(q) && !kriterien.includes(q) && !thema?.name.toLowerCase().includes(q) && !fach?.name.toLowerCase().includes(q) && !autor.includes(q)) return false
      }
      return true
    })
  }, [lernziele, q, stufeFilter, fachFilter, sourceFilter, themen, faecher])

  const groupedAll = useMemo(() => {
    const byFach: Record<string, { fachName: string; themen: Record<string, { themaName: string; lz: Lernziel[] }> }> = {}
    filteredAll.forEach(lz => {
      const thema = themen.find(t => t.id === lz.themaId)
      if (!thema) return
      const fach = faecher.find(f => f.id === thema.fachId)
      if (!fach) return
      if (!byFach[fach.id]) byFach[fach.id] = { fachName: fach.name, themen: {} }
      if (!byFach[fach.id].themen[thema.id]) byFach[fach.id].themen[thema.id] = { themaName: thema.name, lz: [] }
      byFach[fach.id].themen[thema.id].lz.push(lz)
    })
    return byFach
  }, [filteredAll, themen, faecher])

  const hasStufen = lernziele.some(lz => (lz.stufe?.length ?? 0) > 0)

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-5">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <BookMarked className="size-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Lernzielbibliothek</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {totalStats.faecher} {totalStats.faecher === 1 ? 'Fach' : 'Fächer'} · {totalStats.themen} Themen · {totalStats.lernziele} eigene Lernziele
          </p>
        </div>
        {tab === 'eigene' && (
          <Button onClick={() => setFachCreateOpen(true)}>
            <Plus /> Neues Fach
          </Button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted w-fit mb-5">
        {([
          { key: 'eigene' as ViewTab, label: 'Eigene Lernziele' },
          { key: 'alle' as ViewTab, label: 'Alle Lernziele' },
        ]).map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
              tab === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >{label}</button>
        ))}
      </div>

      {/* ── Eigene tab ── */}
      {tab === 'eigene' && (
        <div className="space-y-3">
          {faecher.length === 0 && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card py-20 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-accent">
                <BookOpen className="size-8 text-accent-foreground" />
              </div>
              <div>
                <p className="font-semibold">Noch keine Fächer angelegt</p>
                <p className="mt-1 text-sm text-muted-foreground">Erstelle dein erstes Fach.</p>
              </div>
              <Button onClick={() => setFachCreateOpen(true)}>Erstes Fach erstellen</Button>
            </div>
          )}

          {faecher.map(fach => {
            const fachThemen = themen.filter(t => t.fachId === fach.id)
            const isExpanded = expandedFaecher.has(fach.id)
            return (
              <div key={fach.id} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="group flex items-center gap-2 px-4 py-3">
                  <button className="flex flex-1 items-center gap-2.5 text-left min-w-0" onClick={() => toggleFach(fach.id)}>
                    {isExpanded
                      ? <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                      : <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                    }
                    <span className="font-semibold truncate">{fach.name}</span>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {fachThemen.length}
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-primary"
                      aria-label="Thema hinzufügen"
                      onClick={() => { setThemaCreateFachId(fach.id); if (!isExpanded) toggleFach(fach.id) }}>
                      <Plus />
                    </Button>
                    <Button variant="ghost" size="icon-xs" className="text-muted-foreground"
                      aria-label="Fach konfigurieren"
                      onClick={() => setEditing({ type: 'fach', id: fach.id })}>
                      <PencilLine />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 px-4 py-3">
                    {fachThemen.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Noch keine Themen.{' '}
                        <button className="text-primary underline" onClick={() => setThemaCreateFachId(fach.id)}>
                          Thema hinzufügen
                        </button>
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {fachThemen.map(thema => (
                          <ThemaChip key={thema.id} themaId={thema.id}
                            onClick={() => setEditing({ type: 'thema', id: thema.id })} />
                        ))}
                        <button onClick={() => setThemaCreateFachId(fach.id)}
                          className="flex items-center gap-1 rounded-lg border border-dashed border-border/70 px-2.5 py-1.5 text-xs text-muted-foreground/60 hover:border-primary/40 hover:text-primary transition-all">
                          <Plus className="size-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Alle tab ── */}
      {tab === 'alle' && (
        <div>
          {/* Filter bar */}
          <div className="flex flex-wrap gap-2 mb-5">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input placeholder="Suche nach Lernzielen, Themen, Autoren …"
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm" />
            </div>

            <div className="flex gap-1.5 flex-wrap items-center">
              <span className="text-xs text-muted-foreground shrink-0">Quelle:</span>
              {([
                { key: 'alle' as const, label: 'Alle' },
                { key: 'eigene' as const, label: 'Eigene' },
                { key: 'bibliothek' as const, label: 'Veröffentlichte' },
              ]).map(({ key, label }) => (
                <button key={key} onClick={() => setSourceFilter(key)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                    sourceFilter === key ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-background text-muted-foreground hover:bg-muted',
                  )}
                >{label}</button>
              ))}
            </div>

            <div className="flex gap-1.5 flex-wrap items-center">
              <span className="text-xs text-muted-foreground shrink-0">Fach:</span>
              <button onClick={() => setFachFilter(null)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                  fachFilter === null ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-background text-muted-foreground hover:bg-muted',
                )}>Alle</button>
              {faecher.map(f => (
                <button key={f.id} onClick={() => setFachFilter(f.id === fachFilter ? null : f.id)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                    fachFilter === f.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-background text-muted-foreground hover:bg-muted',
                  )}>{f.name}</button>
              ))}
            </div>

            {hasStufen && (
              <div className="flex gap-1.5 flex-wrap items-center">
                <span className="text-xs text-muted-foreground shrink-0">Stufe:</span>
                <button onClick={() => setStufeFilter(null)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                    stufeFilter === null ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-background text-muted-foreground hover:bg-muted',
                  )}>Alle</button>
                {STUFEN.map(s => (
                  <button key={s} onClick={() => setStufeFilter(stufeFilter === s ? null : s)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                      stufeFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-background text-muted-foreground hover:bg-muted',
                    )}>{s}. Kl.</button>
                ))}
              </div>
            )}
          </div>

          {filteredAll.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-12 text-center">
              <BookMarked className="size-8 text-muted-foreground/50" />
              <div>
                <p className="font-semibold">Keine Lernziele gefunden</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Versuche einen anderen Suchbegriff oder Filter.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedAll).map(([fachId, { fachName, themen: themenGroup }]) => (
                <div key={fachId}>
                  <h2 className="text-base font-bold mb-4 pb-2 border-b border-border">{fachName}</h2>
                  <div className="space-y-6">
                    {Object.entries(themenGroup).map(([themaId, { themaName, lz: themaLZ }]) => (
                      <div key={themaId}>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">{themaName}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {themaLZ.map(lz => (
                            <LzCard key={lz.id} lz={lz} fachName={fachName} themaName={themaName} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Config modals */}
      {editing?.type === 'fach' && (
        <FachModal open fachId={editing.id} onClose={() => setEditing(null)} />
      )}
      {editing?.type === 'thema' && (
        <ThemaModal open themaId={editing.id} onClose={() => setEditing(null)} />
      )}

      <CreateModal
        open={fachCreateOpen} onOpenChange={setFachCreateOpen}
        title="Neues Fach" label="Fachbezeichnung" placeholder="z. B. Mathematik"
        onSubmit={createFach}
      />
      <CreateModal
        open={!!themaCreateFachId} onOpenChange={(o) => { if (!o) setThemaCreateFachId(null) }}
        title="Neues Thema" label="Themabezeichnung" placeholder="z. B. Zahlen & Rechnen"
        onSubmit={(name) => { if (themaCreateFachId) createThema(themaCreateFachId, name) }}
      />
    </div>
  )
}
