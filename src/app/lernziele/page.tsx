'use client'

import { useEffect, useRef, useState } from 'react'
import {
  BookOpen, BookMarked, ChevronDown, ChevronRight, PencilLine, Plus,
  X, Check, Users, GraduationCap, Trash2, Search,
  Calendar, Settings2,
} from 'lucide-react'
import { InfoTooltip } from '@/components/ui/tooltip'
import Link from 'next/link'
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Modal } from '@/components/shared/Modal'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { cn, getFachColor } from '@/lib/utils'
import { KatBadge } from '@/components/shared/KatBadge'
import { LzCountCluster } from '@/components/shared/LzCountCluster'
import type { LernzielKategorie } from '@/types/domain'

// ── Shared helpers ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>
}

// ── Create modal (Fach) ───────────────────────────────────────────────────

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

// ── Create Thema modal ────────────────────────────────────────────────────

function CreateThemaModal({ open, onOpenChange, fachId, onCreated }: {
  open: boolean; onOpenChange: (v: boolean) => void; fachId: string; onCreated?: (themaId: string) => void
}) {
  const { themen, createThema } = useData()
  const [name, setName] = useState('')
  const [typ, setTyp] = useState<'standard' | 'rilz'>('standard')
  const [standardThemaId, setStandardThemaId] = useState('')

  useEffect(() => { if (open) { setName(''); setTyp('standard'); setStandardThemaId('') } }, [open])

  const standardThemenInFach = themen.filter(t => t.fachId === fachId && t.typ !== 'rilz')

  function submit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!name.trim()) return
    const newId = createThema(fachId, name.trim(), typ, typ === 'rilz' && standardThemaId ? standardThemaId : undefined)
    onOpenChange(false)
    if (typ === 'standard') onCreated?.(newId)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Neues Thema" size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={() => submit()} disabled={!name.trim()}>Erstellen</Button>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-3">
        <div className="grid gap-1.5">
          <Label>Themabezeichnung</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Zahlen & Rechnen" autoFocus />
        </div>
        <div className="grid gap-1.5">
          <Label>Typ</Label>
          <div className="flex rounded-lg border overflow-hidden h-8">
            {(['standard', 'rilz'] as const).map(t => (
              <button key={t} type="button" onClick={() => setTyp(t)}
                className={cn(
                  'flex-1 text-xs font-medium transition-colors',
                  typ === t
                    ? t === 'rilz' ? 'bg-orange-500 text-white' : 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:bg-muted',
                )}>
                {t === 'standard' ? 'Standard' : 'RILZ (abgeschwächt)'}
              </button>
            ))}
          </div>
          {typ === 'rilz' && (
            <p className="text-[10px] text-muted-foreground">
              RILZ-Themen enthalten abgeschwächte Lernziele und werden einzelnen Schülern zugewiesen – nicht ganzen Klassen.
            </p>
          )}
        </div>
        {typ === 'rilz' && standardThemenInFach.length > 0 && (
          <div className="grid gap-1.5">
            <Label>Ersetzt Standard-Thema <span className="font-normal text-muted-foreground">(optional)</span></Label>
            <select
              value={standardThemaId}
              onChange={(e) => setStandardThemaId(e.target.value)}
              className="h-8 text-xs rounded-lg border border-border bg-background px-2 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">— Kein Standard-Thema —</option>
              {standardThemenInFach.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}
      </form>
    </Modal>
  )
}

// ── Thema slide-over ──────────────────────────────────────────────────────

function ThemaSlideOver({ themaId, onClose }: { themaId: string | null; onClose: () => void }) {
  const {
    themen, faecher, lernziele, classes, students, getStudentsForClass,
    updateThema, deleteThema,
    assignThemaToKlasse,
    assignRilzThemaToStudent, removeRilzThemaFromStudent,
    publishThemaToLibrary,
  } = useData()

  const thema = themaId ? themen.find(t => t.id === themaId) : undefined
  const fach = thema ? faecher.find(f => f.id === thema.fachId) : undefined
  const themaLZ = themaId ? lernziele.filter(lz => lz.themaId === themaId && lz.source !== 'bibliothek') : []

  const [name, setName] = useState('')
  const [nameSaved, setNameSaved] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pickingKlasse, setPickingKlasse] = useState(false)
  const [pickedKlasseIds, setPickedKlasseIds] = useState<Set<string>>(new Set())
  const [pickedDate, setPickedDate] = useState('')
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null)

  useEffect(() => { setName(thema?.name ?? '') }, [thema?.name])
  useEffect(() => {
    if (!themaId) {
      setPickingKlasse(false)
      setPickedKlasseIds(new Set())
      setPickedDate('')
      setAssignSuccess(null)
    }
  }, [themaId])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const isRilz = thema?.typ === 'rilz'
  const rilzEligible = thema ? students.filter(s => (s.rilzFachIds ?? []).includes(thema.fachId)) : []
  const assignedRilzStudents = thema ? rilzEligible.filter(s => (s.rilzThemaIds ?? []).includes(thema.id)) : []
  const unassignedRilzStudents = thema ? rilzEligible.filter(s => !(s.rilzThemaIds ?? []).includes(thema.id)) : []

  function saveName() {
    if (!themaId || !name.trim() || name === thema?.name) return
    updateThema(themaId, { name: name.trim() })
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  function confirmAssign() {
    if (!themaId || pickedKlasseIds.size === 0) return
    const assignedNames: string[] = []
    for (const id of pickedKlasseIds) {
      const klasse = classes.find(k => k.id === id)
      if (!klasse) continue
      if (!klasse.assignedThemaIds.includes(themaId)) assignThemaToKlasse(klasse.id, themaId)
      assignedNames.push(klasse.name)
    }
    if (pickedDate) updateThema(themaId, { faelligAm: pickedDate })
    setPickingKlasse(false)
    setPickedKlasseIds(new Set())
    setPickedDate('')
    setAssignSuccess(assignedNames.join(', '))
    setTimeout(() => setAssignSuccess(null), 4000)
  }

  function toggleZyklus(z: number) {
    if (!themaId || !thema) return
    const current = thema.zyklus ?? []
    const next = current.includes(z) ? current.filter(v => v !== z) : [...current, z].sort()
    updateThema(themaId, { zyklus: next.length > 0 ? next : undefined })
  }

  function toggleStufe(s: number) {
    if (!themaId || !thema) return
    const current = thema.stufe ?? []
    const next = current.includes(s) ? current.filter(v => v !== s) : [...current, s].sort((a, b) => a - b)
    updateThema(themaId, { stufe: next.length > 0 ? next : undefined })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 transition-opacity duration-200',
          themaId ? 'bg-black/20 pointer-events-auto' : 'bg-transparent pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={cn(
        'fixed inset-y-0 right-0 z-50 flex w-96 flex-col bg-card border-l shadow-2xl transition-transform duration-200',
        themaId ? 'translate-x-0' : 'translate-x-full',
      )}>
        {thema ? (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b bg-muted/20 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {fach?.name} · Thema konfigurieren
                  </p>
                  {isRilz && (
                    <span className="rounded px-1 py-px text-[9px] font-semibold bg-orange-100 text-orange-700">RILZ</span>
                  )}
                </div>
                <p className="text-sm font-semibold leading-tight mt-0.5 truncate">{thema.name}</p>
              </div>
              <button onClick={onClose}
                className="shrink-0 mt-0.5 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto divide-y divide-border">

              {/* Name */}
              <div className="px-5 py-3 space-y-2">
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

              {/* Details: Zyklus & Stufe */}
              <div className="px-5 py-3 space-y-3">
                <SectionLabel>Details</SectionLabel>

                {/* Zyklus */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-medium text-muted-foreground">Zyklus</p>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(z => {
                      const active = thema.zyklus?.includes(z)
                      return (
                        <button key={z} onClick={() => toggleZyklus(z)}
                          className={cn(
                            'rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all',
                            active
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                          )}>
                          Z{z}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Klasse / Stufe */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-medium text-muted-foreground">Klasse</p>
                  <div className="flex flex-wrap gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(s => {
                      const active = thema.stufe?.includes(s)
                      return (
                        <button key={s} onClick={() => toggleStufe(s)}
                          className={cn(
                            'size-7 rounded-lg border text-xs font-semibold transition-all',
                            active
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                          )}>
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Mit Schule teilen */}
              {!isRilz && (
                <div className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium">Mit Schule teilen</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                      {thema.publishedToLibrary
                        ? 'Eine Kopie ist in der Schulbibliothek sichtbar.'
                        : 'Thema in die Schulbibliothek kopieren, damit andere es übernehmen können.'}
                    </p>
                  </div>
                  {thema.publishedToLibrary ? (
                    <span className="flex items-center gap-1 shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                      <Check className="size-3" /> Geteilt
                    </span>
                  ) : (
                    <Button size="sm" variant="outline" className="h-7 shrink-0 text-xs"
                      onClick={() => publishThemaToLibrary(themaId!)}
                      disabled={themaLZ.length === 0}>
                      Teilen
                    </Button>
                  )}
                </div>
              )}

              {/* RILZ students OR Klassen assignment */}
              {isRilz ? (
                <div className="px-5 py-3 space-y-2">
                  <SectionLabel>Zugewiesene Schüler ({assignedRilzStudents.length})</SectionLabel>
                  <p className="text-[10px] text-muted-foreground">
                    Nur Schüler mit RILZ-Status in diesem Fach können zugewiesen werden.
                  </p>
                  {thema.standardThemaId && (() => {
                    const stdThema = themen.find(t => t.id === thema!.standardThemaId)
                    return stdThema ? (
                      <p className="text-[10px] text-muted-foreground">
                        Ersetzt <strong>{stdThema.name}</strong> für zugewiesene Schüler im Lernkontrolle-Tab.
                      </p>
                    ) : null
                  })()}
                  {assignedRilzStudents.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {assignedRilzStudents.map(s => (
                        <span key={s.id} className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200">
                          {s.vorname} {s.nachname}
                          <button onClick={() => removeRilzThemaFromStudent(s.id, themaId!)}
                            className="ml-0.5 hover:text-red-600 transition-colors">
                            <X className="size-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {unassignedRilzStudents.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground">Nicht zugewiesen:</p>
                      <div className="flex flex-wrap gap-1">
                        {unassignedRilzStudents.map(s => (
                          <button key={s.id} onClick={() => assignRilzThemaToStudent(s.id, themaId!)}
                            className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium border border-dashed border-orange-300 text-muted-foreground hover:bg-orange-50 hover:text-orange-700 transition-all">
                            <Plus className="size-2.5" /> {s.vorname} {s.nachname}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    assignedRilzStudents.length === 0 && (
                      <p className="text-[10px] text-muted-foreground/60">
                        Keine Schüler mit RILZ in diesem Fach gefunden. Weise einem Schüler zuerst RILZ in diesem Fach zu.
                      </p>
                    )
                  )}
                </div>
              ) : (
                <div className="px-5 py-3 space-y-2">
                  <SectionLabel>Klassen-Zuordnung</SectionLabel>
                  {assignSuccess && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5">
                      <Check className="size-3 text-emerald-600 shrink-0" />
                      <span className="text-xs text-emerald-700">
                        Erfolgreich zu <strong>{assignSuccess}</strong> hinzugefügt.
                      </span>
                    </div>
                  )}
                  {(() => {
                    const assignedClasses = classes.filter(k => k.assignedThemaIds.includes(thema.id))
                    if (assignedClasses.length === 0) return null
                    return (
                      <div className="flex flex-wrap gap-1">
                        {assignedClasses.map(k => (
                          <span key={k.id} className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                            <Check className="size-2.5" />{k.name}
                          </span>
                        ))}
                      </div>
                    )
                  })()}
                  {pickingKlasse ? (
                    <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2.5">
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Klassen wählen <span className="font-normal normal-case">(mehrere möglich)</span>
                        </p>
                        {(() => {
                          const unassigned = classes.filter(k => !k.assignedThemaIds.includes(thema.id))
                          if (unassigned.length === 0) {
                            return <p className="text-xs text-muted-foreground">Alle Klassen sind bereits zugewiesen.</p>
                          }
                          return (
                            <div className="flex flex-wrap gap-1">
                              {unassigned.map(k => (
                                <button key={k.id}
                                  onClick={() => setPickedKlasseIds(prev => {
                                    const n = new Set(prev); n.has(k.id) ? n.delete(k.id) : n.add(k.id); return n
                                  })}
                                  className={cn(
                                    'flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition-all',
                                    pickedKlasseIds.has(k.id)
                                      ? 'border-primary bg-primary/10 text-primary'
                                      : 'border-border bg-background text-foreground hover:bg-accent',
                                  )}>
                                  {pickedKlasseIds.has(k.id) && <Check className="size-2.5" />}
                                  {k.name}
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                    <Users className="size-2.5" />{getStudentsForClass(k.id).length}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )
                        })()}
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Fälligkeitsdatum <span className="ml-1 font-normal normal-case text-muted-foreground/60">(optional)</span>
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3 text-muted-foreground shrink-0" />
                          <input
                            type="date" lang="de"
                            value={pickedDate}
                            onChange={e => setPickedDate(e.target.value)}
                            className="h-7 text-xs rounded-lg border border-border bg-background px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div className="flex gap-1.5 pt-0.5">
                        <Button size="sm" className="h-7 text-xs" onClick={confirmAssign} disabled={pickedKlasseIds.size === 0}>
                          {pickedKlasseIds.size > 1 ? `${pickedKlasseIds.size} Klassen übernehmen` : 'Übernehmen'}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs"
                          onClick={() => { setPickingKlasse(false); setPickedKlasseIds(new Set()); setPickedDate('') }}>
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="h-7 text-xs"
                      onClick={() => { setPickingKlasse(true); setPickedKlasseIds(new Set()); setPickedDate('') }}
                      disabled={classes.length === 0 || themaLZ.length === 0}>
                      <GraduationCap className="size-3" /> Für Klasse übernehmen
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Danger zone (sticky footer) */}
            <div className="border-t px-5 py-3 bg-red-50/50 flex items-center justify-between gap-4 shrink-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-red-600">
                Thema mit allen {themaLZ.length} Lernzielen dauerhaft löschen
              </p>
              <Button variant="destructive" size="sm" className="h-7 shrink-0" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="size-3" /> Löschen
              </Button>
            </div>
          </>
        ) : null}
      </div>

      {thema && (
        <ConfirmDialog
          open={deleteOpen} onOpenChange={setDeleteOpen}
          title="Thema löschen"
          description={`„${thema.name}" mit allen ${themaLZ.length} Lernzielen dauerhaft löschen?`}
          confirmLabel="Dauerhaft löschen"
          onConfirm={() => { deleteThema(themaId!); onClose() }}
        />
      )}
    </>
  )
}

// ── Thema action menu (popover) ───────────────────────────────────────────

function ThemaActionMenu({
  themaId,
  isRilz,
  publishedToLibrary,
  lzCount,
  onSettings,
  onShare,
  onDelete,
}: {
  themaId: string
  isRilz: boolean
  publishedToLibrary?: boolean
  lzCount: number
  onSettings: () => void
  onShare: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={e => { e.stopPropagation(); setOpen(p => !p) }}
        className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        title="Thema-Optionen"
      >
        <Settings2 className="size-3.5" />
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-xl border border-border bg-card shadow-lg py-1 text-sm"
          onClick={e => e.stopPropagation()}
        >
          <button
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-accent transition-colors"
            onClick={() => { setOpen(false); onSettings() }}
          >
            <Settings2 className="size-3.5 text-muted-foreground" />
            Einstellungen & Klassen
          </button>

          {!isRilz && (
            <button
              className={cn(
                'flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors',
                publishedToLibrary
                  ? 'text-muted-foreground/50 cursor-default'
                  : lzCount === 0
                    ? 'text-muted-foreground/50 cursor-default'
                    : 'hover:bg-accent',
              )}
              onClick={() => {
                if (publishedToLibrary || lzCount === 0) return
                setOpen(false)
                onShare()
              }}
            >
              {publishedToLibrary
                ? <Check className="size-3.5 text-emerald-500" />
                : <svg className="size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              }
              {publishedToLibrary ? 'Bereits geteilt' : 'In Schulkatalog teilen'}
            </button>
          )}

          <div className="border-t border-border/50 my-1" />

          <button
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => { setOpen(false); onDelete() }}
          >
            <Trash2 className="size-3.5" />
            Thema löschen
          </button>
        </div>
      )}
    </div>
  )
}

// ── Inline Lernziel section ───────────────────────────────────────────────

function ThemaLZSection({ themaId }: { themaId: string }) {
  const { lernziele, createLernziel, updateLernziel, deleteLernziel } = useData()
  const themaLZ = lernziele
    .filter(lz => lz.themaId === themaId && lz.source !== 'bibliothek')
    .sort((a, b) => a.kategorie === b.kategorie ? 0 : a.kategorie === 'grundlegend' ? -1 : 1)

  const [newLZ, setNewLZ] = useState('')
  const [newLZKategorie, setNewLZKategorie] = useState<LernzielKategorie>('grundlegend')
  const [editLzId, setEditLzId] = useState<string | null>(null)
  const [editLzLabel, setEditLzLabel] = useState('')
  const [editLzKategorie, setEditLzKategorie] = useState<LernzielKategorie>('grundlegend')
  const [deleteLzId, setDeleteLzId] = useState<string | null>(null)

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
    <div className="border-t border-border/40 bg-muted/10 divide-y divide-border/30">
      {themaLZ.length === 0 && (
        <p className="pl-10 pr-3 py-2 text-[10px] text-muted-foreground/60">Noch keine Lernziele vorhanden.</p>
      )}
      {themaLZ.map((lz, i) => (
        <div key={lz.id} className="group flex items-center gap-2 pl-10 pr-3 py-1.5 hover:bg-accent/20 transition-colors">
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
              <KatBadge kat={lz.kategorie} />
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

      {/* Add new LZ */}
      <div className="pl-10 pr-3 py-2 flex items-center gap-1.5">
        <div className="flex rounded border overflow-hidden shrink-0 h-6">
          {(['grundlegend', 'anspruchsvoll'] as LernzielKategorie[]).map(k => (
            <button key={k} onClick={() => setNewLZKategorie(k)}
              className={cn(
                'px-1.5 text-[9px] font-medium transition-colors',
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
          placeholder="Neues Lernziel eingeben…" className="h-6 text-xs flex-1" />
        <Button size="icon-sm" variant="outline" onClick={addLZ} disabled={!newLZ.trim()}>
          <Plus className="size-3" />
        </Button>
      </div>

      <ConfirmDialog
        open={!!deleteLzId} onOpenChange={(o) => { if (!o) setDeleteLzId(null) }}
        title="Lernziel löschen" description="Soll dieses Lernziel wirklich dauerhaft gelöscht werden?"
        confirmLabel="Löschen"
        onConfirm={() => { if (deleteLzId) deleteLernziel(deleteLzId) }}
      />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function LernzielePage() {
  const { faecher, themen, lernziele, classes, createFach, deleteThema, publishThemaToLibrary } = useData()

  const [activeTab, setActiveTab] = useState<string | 'alle'>('alle')
  const [expandedThemen, setExpandedThemen] = useState<Set<string>>(new Set())
  const [collapsedFaecher, setCollapsedFaecher] = useState<Set<string>>(new Set())
  const [slideOverThemaId, setSlideOverThemaId] = useState<string | null>(null)
  const [editFachId, setEditFachId] = useState<string | null>(null)
  const [fachCreateOpen, setFachCreateOpen] = useState(false)
  const [themaCreateFachId, setThemaCreateFachId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [deleteThemaId, setDeleteThemaId] = useState<string | null>(null)
  const [zyklusFilter, setZyklusFilter] = useState<number | 'alle'>('alle')
  const [typFilter, setTypFilter] = useState<'alle' | 'standard' | 'rilz'>('alle')

  useEffect(() => {
    if (activeTab !== 'alle' && !faecher.find(f => f.id === activeTab)) {
      setActiveTab('alle')
    }
  }, [faecher, activeTab])

  function toggleThema(id: string) {
    setExpandedThemen(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function toggleFach(id: string) {
    setCollapsedFaecher(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function handleFachCreated(name: string) {
    const newFachId = createFach(name)
    setFachCreateOpen(false)
    setActiveTab(newFachId)
    setThemaCreateFachId(newFachId)
  }

  function handleThemaCreated(themaId: string) {
    setThemaCreateFachId(null)
    setSlideOverThemaId(themaId)
  }

  const ownLZ = lernziele.filter(lz => lz.source !== 'bibliothek')
  const personalThemenCount = themen.filter(t => t.autor == null).length
  const q = search.trim().toLowerCase()

  const visibleFaecher = activeTab === 'alle' ? faecher : faecher.filter(f => f.id === activeTab)
  const tableData = visibleFaecher.map(fach => ({
    fach,
    themen: themen.filter(t => {
      if (t.fachId !== fach.id) return false
      if (t.autor != null) return false
      if (q && !t.name.toLowerCase().includes(q)) return false
      if (typFilter === 'standard' && t.typ === 'rilz') return false
      if (typFilter === 'rilz' && t.typ !== 'rilz') return false
      if (zyklusFilter !== 'alle') {
        if (!t.zyklus?.includes(zyklusFilter as number)) return false
      }
      return true
    }),
  }))
  const hasAnyThemen = tableData.some(d => d.themen.length > 0)
  const newThemaFachId = activeTab !== 'alle' ? (activeTab as string) : (faecher[0]?.id ?? null)

  const hasActiveFilters = zyklusFilter !== 'alle' || typFilter !== 'alle' || q

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-3">

      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <BookMarked className="size-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Lernzielkatalog</h1>
            <InfoTooltip
              content={<>
                <strong>Dein persönlicher Katalog</strong> — Verwalte deine eigenen Lernziele nach Fach und Thema. Themen aus der Schulbibliothek übernimmst du im{' '}
                <Link href="/schulkatalog" className="underline hover:text-sky-900">Schulkatalog</Link>.
              </>}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {faecher.length} {faecher.length === 1 ? 'Fach' : 'Fächer'} · {personalThemenCount} Themen · {ownLZ.length} eigene Lernziele
          </p>
        </div>
        <Link href="/schulkatalog"
          className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          Schulkatalog <ChevronRight className="size-3" />
        </Link>
      </div>

      {/* Empty state */}
      {faecher.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-accent">
            <BookOpen className="size-8 text-accent-foreground" />
          </div>
          <div>
            <p className="font-semibold">Noch keine Fächer angelegt</p>
            <p className="mt-1 text-sm text-muted-foreground">Erstelle dein erstes Fach, um Lernziele zu verwalten.</p>
          </div>
          <Button onClick={() => setFachCreateOpen(true)}>Erstes Fach erstellen</Button>
        </div>
      )}

      {faecher.length > 0 && (
        <>
          {/* Tab bar */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1 p-1 rounded-xl bg-muted">
              <button
                onClick={() => setActiveTab('alle')}
                className={cn(
                  'px-3 py-1 rounded-lg text-sm font-medium transition-all',
                  activeTab === 'alle'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}>
                Alle
              </button>
              {faecher.map(fach => {
                const fc = getFachColor(fach.id, faecher.map(f => f.id))
                return (
                <div key={fach.id} className="group relative">
                  <button
                    onClick={() => setActiveTab(fach.id)}
                    className={cn(
                      'px-3 py-1 pr-7 rounded-lg text-sm font-medium transition-all',
                      activeTab === fach.id
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}>
                    <span className={cn('inline-block size-2 rounded-full mr-1.5 align-middle', fc.dot)} />
                    {fach.name}
                  </button>
                  <button
                    onClick={() => setEditFachId(fach.id)}
                    className={cn(
                      'absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 transition-all text-muted-foreground hover:text-primary',
                      activeTab === fach.id
                        ? 'opacity-30 hover:opacity-100'
                        : 'opacity-0 group-hover:opacity-40 hover:!opacity-100',
                    )}
                    aria-label={`${fach.name} konfigurieren`}>
                    <Settings2 className="size-3" />
                  </button>
                </div>
                )
              })}
            </div>
            <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-primary"
              onClick={() => setFachCreateOpen(true)} aria-label="Neues Fach erstellen">
              <Plus className="size-4" />
            </Button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Thema suchen…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>

            <Select value={String(zyklusFilter)} onValueChange={v => setZyklusFilter(v === 'alle' ? 'alle' : Number(v))}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <span className="flex-1 text-left">
                  {zyklusFilter === 'alle' ? 'Alle Zyklen' : `Zyklus ${zyklusFilter}`}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Zyklen</SelectItem>
                <SelectItem value="1">Zyklus 1</SelectItem>
                <SelectItem value="2">Zyklus 2</SelectItem>
                <SelectItem value="3">Zyklus 3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typFilter} onValueChange={v => setTypFilter(v as 'alle' | 'standard' | 'rilz')}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <span className="flex-1 text-left">
                  {typFilter === 'alle' ? 'Alle Typen' : typFilter === 'rilz' ? 'Nur RILZ' : 'Nur Standard'}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Typen</SelectItem>
                <SelectItem value="standard">Nur Standard</SelectItem>
                <SelectItem value="rilz">Nur RILZ</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <button
                onClick={() => { setSearch(''); setZyklusFilter('alle'); setTypFilter('alle') }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-3" /> Filter zurücksetzen
              </button>
            )}

            {newThemaFachId && (
              <Button size="sm" className="ml-auto" onClick={() => setThemaCreateFachId(newThemaFachId)}>
                <Plus className="size-3.5" /> Neues Thema
              </Button>
            )}
          </div>

          {/* Table */}
          {!hasAnyThemen && hasActiveFilters ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Keine Themen entsprechen den gewählten Filtern.
            </p>
          ) : !hasAnyThemen ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-14 text-center">
              <p className="text-sm font-medium text-muted-foreground">Noch keine Themen angelegt</p>
              {newThemaFachId && (
                <Button size="sm" variant="outline" onClick={() => setThemaCreateFachId(newThemaFachId)}>
                  <Plus className="size-3" /> Erstes Thema erstellen
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {tableData.map(({ fach, themen: fachThemen }) => {
                const fachColor = getFachColor(fach.id, faecher.map(f => f.id))
                const fachCollapsed = collapsedFaecher.has(fach.id)
                const fachLZCount = fachThemen.reduce((s, t) => s + lernziele.filter(lz => lz.themaId === t.id && lz.source !== 'bibliothek').length, 0)
                return (
                <div key={fach.id} className={cn(
                  'rounded-2xl border bg-card overflow-hidden shadow-sm border-l-4',
                  fachColor.border,
                )}>
                  {/* Fach header */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 select-none">
                    <button
                      onClick={() => toggleFach(fach.id)}
                      className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                    >
                      {fachCollapsed
                        ? <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                        : <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                      }
                      <span className="text-xs font-semibold uppercase tracking-wider text-foreground flex-1 text-left">
                        {fach.name}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">{fachLZCount} LZ</span>
                    </button>
                    <button
                      onClick={() => setThemaCreateFachId(fach.id)}
                      className="flex items-center justify-center size-5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      aria-label={`Thema in ${fach.name} hinzufügen`}
                    >
                      <Plus className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setEditFachId(fach.id)}
                      className="flex items-center justify-center size-5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      aria-label={`${fach.name} konfigurieren`}
                    >
                      <Settings2 className="size-3.5" />
                    </button>
                  </div>

                  {!fachCollapsed && (
                    <div className="divide-y divide-border/40">
                      {fachThemen.length === 0 ? (
                        <div className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-muted-foreground">
                          Keine Themen entsprechen den Filtern.
                        </div>
                      ) : (
                        <>
                          {fachThemen.map(thema => {
                            const isExpanded = expandedThemen.has(thema.id)
                            const ownLZforThema = lernziele.filter(lz => lz.themaId === thema.id && lz.source !== 'bibliothek')
                            const gCount = ownLZforThema.filter(lz => lz.kategorie === 'grundlegend').length
                            const aCount = ownLZforThema.filter(lz => lz.kategorie === 'anspruchsvoll').length
                            const assignedClasses = classes.filter(k => k.assignedThemaIds.includes(thema.id))
                            const isRilz = thema.typ === 'rilz'
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
                            const zyklusLabel = thema.zyklus?.length
                              ? thema.zyklus.map(z => `Z${z}`).join(' ')
                              : null

                            return (
                              <div key={thema.id}>
                                <div className="group/row flex items-center gap-2 px-3 py-2 hover:bg-accent/20 transition-colors">
                                  <button
                                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                    onClick={() => toggleThema(thema.id)}>
                                    {isExpanded
                                      ? <ChevronDown className="size-3 text-muted-foreground shrink-0" />
                                      : <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                                    }
                                    <span className="text-sm font-medium truncate">{thema.name}</span>
                                    {isRilz && (
                                      <span className="shrink-0 rounded px-1 py-px text-[9px] font-semibold bg-orange-100 text-orange-700">
                                        RILZ
                                      </span>
                                    )}
                                  </button>

                                  <LzCountCluster g={gCount} a={aCount} />

                                  {zyklusLabel && (
                                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground shrink-0">
                                      {zyklusLabel}
                                    </span>
                                  )}

                                  {stufeLabel && (
                                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground shrink-0">
                                      {stufeLabel}
                                    </span>
                                  )}

                                  {assignedClasses.length > 0 && (
                                    <span className="hidden sm:flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary shrink-0 max-w-[90px]">
                                      <GraduationCap className="size-2.5 shrink-0" />
                                      <span className="truncate">
                                        {assignedClasses.slice(0, 2).map(k => k.name).join(' · ')}
                                        {assignedClasses.length > 2 && ` +${assignedClasses.length - 2}`}
                                      </span>
                                    </span>
                                  )}

                                  {thema.faelligAm && (
                                    <span className={cn(
                                      'text-[10px] tabular-nums shrink-0 rounded px-1.5 py-0.5 hidden sm:block',
                                      isOverdue
                                        ? 'bg-rose-100 text-rose-600 font-medium'
                                        : isNearDeadline
                                          ? 'bg-amber-100 text-amber-600'
                                          : 'bg-muted text-muted-foreground',
                                    )}>
                                      {new Date(thema.faelligAm + 'T00:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                                    </span>
                                  )}

                                  <div className="opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0">
                                    <ThemaActionMenu
                                      themaId={thema.id}
                                      isRilz={isRilz}
                                      publishedToLibrary={thema.publishedToLibrary}
                                      lzCount={ownLZforThema.length}
                                      onSettings={() => setSlideOverThemaId(thema.id)}
                                      onShare={() => publishThemaToLibrary(thema.id)}
                                      onDelete={() => setDeleteThemaId(thema.id)}
                                    />
                                  </div>
                                </div>

                                {isExpanded && <ThemaLZSection themaId={thema.id} />}
                              </div>
                            )
                          })}
                          <button
                            onClick={() => setThemaCreateFachId(fach.id)}
                            className="flex w-full items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground/60 hover:text-primary hover:bg-accent/20 transition-colors">
                            <Plus className="size-3" /> Thema hinzufügen
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                )
              })}
            </div>
          )}
        </>
      )}

      <ThemaSlideOver themaId={slideOverThemaId} onClose={() => setSlideOverThemaId(null)} />

      <ConfirmDialog
        open={!!deleteThemaId}
        onOpenChange={o => { if (!o) setDeleteThemaId(null) }}
        title="Thema löschen"
        description={(() => {
          const t = themen.find(th => th.id === deleteThemaId)
          const lzCount = lernziele.filter(lz => lz.themaId === deleteThemaId && lz.source !== 'bibliothek').length
          return t ? `„${t.name}" mit allen ${lzCount} Lernzielen dauerhaft löschen?` : ''
        })()}
        confirmLabel="Dauerhaft löschen"
        onConfirm={() => {
          if (deleteThemaId) {
            if (slideOverThemaId === deleteThemaId) setSlideOverThemaId(null)
            deleteThema(deleteThemaId)
          }
        }}
      />

      {editFachId && (
        <FachModal open fachId={editFachId} onClose={() => setEditFachId(null)} />
      )}

      <CreateModal
        open={fachCreateOpen} onOpenChange={setFachCreateOpen}
        title="Neues Fach" label="Fachbezeichnung" placeholder="z. B. Mathematik"
        onSubmit={handleFachCreated}
      />

      {themaCreateFachId && (
        <CreateThemaModal
          open={!!themaCreateFachId}
          onOpenChange={(o) => { if (!o) setThemaCreateFachId(null) }}
          fachId={themaCreateFachId}
          onCreated={handleThemaCreated}
        />
      )}
    </div>
  )
}
