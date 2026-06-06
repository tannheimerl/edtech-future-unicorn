'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen, BookMarked, ChevronDown, ChevronRight, PencilLine, Plus,
  X, Check, Users, GraduationCap, Trash2, Search,
  UserRound, Info, Calendar, ArrowRight, Share2, ChevronsUpDown,
} from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Modal } from '@/components/shared/Modal'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'
import type { LernzielKategorie } from '@/types/domain'

const CURRENT_LP = 'Lukas Meier'

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
    themen, faecher, lernziele, classes, students, getStudentsForClass,
    updateThema, deleteThema,
    createLernziel, updateLernziel, deleteLernziel,
    assignThemaToKlasse,
    assignRilzThemaToStudent, removeRilzThemaFromStudent,
    publishThemaToLibrary,
  } = useData()

  const thema = themen.find(t => t.id === themaId)
  const fach = thema ? faecher.find(f => f.id === thema.fachId) : undefined
  const themaLZ = lernziele.filter(lz => lz.themaId === themaId && lz.source !== 'bibliothek')

  const [name, setName] = useState(thema?.name ?? '')
  const [nameSaved, setNameSaved] = useState(false)
  const [newLZ, setNewLZ] = useState('')
  const [newLZKategorie, setNewLZKategorie] = useState<LernzielKategorie>('grundlegend')
  const [editLzId, setEditLzId] = useState<string | null>(null)
  const [editLzLabel, setEditLzLabel] = useState('')
  const [editLzKategorie, setEditLzKategorie] = useState<LernzielKategorie>('grundlegend')
  const [deleteLzId, setDeleteLzId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pickingKlasse, setPickingKlasse] = useState(false)
  const [pickedKlasseId, setPickedKlasseId] = useState<string>('')
  const [pickedDate, setPickedDate] = useState('')
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null)

  useEffect(() => { setName(thema?.name ?? '') }, [thema?.name])

  if (!thema) return null

  const isRilz = thema.typ === 'rilz'
  const rilzEligible = students.filter(s => (s.rilzFachIds ?? []).includes(thema.fachId))
  const assignedRilzStudents = rilzEligible.filter(s => (s.rilzThemaIds ?? []).includes(themaId))
  const unassignedRilzStudents = rilzEligible.filter(s => !(s.rilzThemaIds ?? []).includes(themaId))

  function saveName() {
    if (!name.trim() || name === thema!.name) return
    updateThema(themaId, { name: name.trim() })
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
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

  function confirmAssign() {
    const klasse = classes.find(k => k.id === pickedKlasseId)
    if (!klasse) return
    if (!klasse.assignedThemaIds.includes(themaId)) assignThemaToKlasse(klasse.id, themaId)
    if (pickedDate) updateThema(themaId, { faelligAm: pickedDate })
    const klasseName = klasse.name
    setPickingKlasse(false)
    setPickedKlasseId('')
    setPickedDate('')
    setAssignSuccess(klasseName)
    setTimeout(() => setAssignSuccess(null), 4000)
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

          <div className="px-4 py-2 border-b space-y-1">
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

          {!isRilz && (
            <div className="px-4 py-2 border-b flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium">Mit Schule teilen</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {thema.publishedToLibrary
                    ? 'Eine Kopie ist in der Schulbibliothek sichtbar.'
                    : 'Dieses Thema in die Schulbibliothek kopieren, damit andere Lehrpersonen es übernehmen können.'}
                </p>
              </div>
              {thema.publishedToLibrary ? (
                <span className="flex items-center gap-1 shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                  <Check className="size-3" /> Geteilt
                </span>
              ) : (
                <Button size="sm" variant="outline" className="h-7 shrink-0 text-xs"
                  onClick={() => publishThemaToLibrary(themaId)}
                  disabled={themaLZ.length === 0}
                >
                  <Share2 className="size-3" /> Teilen
                </Button>
              )}
            </div>
          )}

          {isRilz ? (
            <div className="px-4 py-2 border-b space-y-2">
              <SectionLabel>Zugewiesene Schüler ({assignedRilzStudents.length})</SectionLabel>

              {thema.standardThemaId && (() => {
                const stdThema = themen.find(t => t.id === thema.standardThemaId)
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
                      {s.name}
                      <button onClick={() => removeRilzThemaFromStudent(s.id, themaId)} className="ml-0.5 hover:text-red-600 transition-colors">
                        <X className="size-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {unassignedRilzStudents.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground">Schüler mit RILZ in diesem Fach:</p>
                  <div className="flex flex-wrap gap-1">
                    {unassignedRilzStudents.map(s => (
                      <button key={s.id} onClick={() => assignRilzThemaToStudent(s.id, themaId)}
                        className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium border border-dashed border-orange-300 text-muted-foreground hover:bg-orange-50 hover:text-orange-700 transition-all">
                        <Plus className="size-2.5" /> {s.name}
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
            <div className="px-4 py-2 border-b space-y-2">
              <SectionLabel>Klassen-Zuordnung</SectionLabel>

              {assignSuccess && (
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5">
                  <Check className="size-3 text-emerald-600 shrink-0" />
                  <span className="text-xs text-emerald-700">
                    Thema <strong>{thema.name}</strong> wurde erfolgreich zu Klasse <strong>{assignSuccess}</strong> hinzugefügt.
                  </span>
                </div>
              )}

              {(() => {
                const assignedClasses = classes.filter(k => k.assignedThemaIds.includes(themaId))
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
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Klasse wählen</p>
                    {(() => {
                      const unassigned = classes.filter(k => !k.assignedThemaIds.includes(themaId))
                      if (unassigned.length === 0) {
                        return <p className="text-xs text-muted-foreground">Alle Klassen sind bereits zugewiesen.</p>
                      }
                      return (
                        <div className="flex flex-wrap gap-1">
                          {unassigned.map(k => (
                            <button key={k.id}
                              onClick={() => setPickedKlasseId(k.id)}
                              className={cn(
                                'flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition-all',
                                pickedKlasseId === k.id
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border bg-background text-foreground hover:bg-accent',
                              )}
                            >
                              {pickedKlasseId === k.id && <Check className="size-2.5" />}
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
                      Fälligkeitsdatum
                      <span className="ml-1 font-normal normal-case text-muted-foreground/60">(optional)</span>
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3 text-muted-foreground shrink-0" />
                      <input
                        type="date"
                        lang="de"
                        value={pickedDate}
                        onChange={e => setPickedDate(e.target.value)}
                        className="h-7 text-xs rounded-lg border border-border bg-background px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-1.5 pt-0.5">
                    <Button size="sm" className="h-7 text-xs" onClick={confirmAssign} disabled={!pickedKlasseId}>
                      Übernehmen
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setPickingKlasse(false); setPickedKlasseId(''); setPickedDate('') }}>
                      Abbrechen
                    </Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="outline" className="h-7 text-xs"
                  onClick={() => { setPickingKlasse(true); setPickedKlasseId(''); setPickedDate('') }}
                  disabled={classes.length === 0 || themaLZ.length === 0}
                >
                  <GraduationCap className="size-3" /> Für Klasse übernehmen
                </Button>
              )}
            </div>
          )}

          <div className="px-4 py-2 space-y-2">
            <SectionLabel>{isRilz ? `RILZ-Lernziele — ${themaLZ.length}` : `Eigene Lernziele — ${themaLZ.length}`}</SectionLabel>
            {themaLZ.length === 0 ? (
              <p className="text-[10px] text-muted-foreground/60 pl-0.5">Noch keine vorhanden.</p>
            ) : (
              <div className="divide-y divide-border rounded-md border border-border overflow-hidden">
                {[...themaLZ].sort((a, b) => a.kategorie === b.kategorie ? 0 : a.kategorie === 'grundlegend' ? -1 : 1).map((lz, i) => (
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
              </div>
            )}
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

// ── Thema chip ────────────────────────────────────────────────────────────

function ThemaChip({ themaId, onClick }: { themaId: string; onClick: () => void }) {
  const { themen, lernziele, classes } = useData()
  const thema = themen.find(t => t.id === themaId)!
  const ownLZ = lernziele.filter(lz => lz.themaId === themaId && lz.source !== 'bibliothek')
  const lzCount = ownLZ.length
  const classCount = classes.filter(c => c.assignedThemaIds.includes(themaId)).length

  return (
    <button onClick={onClick} aria-label="Thema konfigurieren"
      className={cn(
        'group flex items-center gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-left text-xs transition-all hover:bg-accent/60',
        thema.typ === 'rilz'
          ? 'border-orange-200 hover:border-orange-400'
          : 'border-border hover:border-primary/40',
      )}
    >
      <span className="font-medium">{thema.name}</span>
      {thema.typ === 'rilz' && (
        <span className="rounded px-1 py-0.5 text-[9px] font-semibold bg-orange-100 text-orange-700">RILZ</span>
      )}
      <span className="tabular-nums text-muted-foreground">· {lzCount}</span>
      {classCount > 0 && (
        <span className="flex items-center gap-0.5 text-muted-foreground/60">
          <GraduationCap className="size-2.5" />
          {classCount}
        </span>
      )}
    </button>
  )
}

// ── Schulkatalog: ThemaCard ───────────────────────────────────────────────

function ThemaCard({
  themaId,
  onCopy,
  copiedNewId,
  onShowEigene,
}: {
  themaId: string
  onCopy: (newId: string) => void
  copiedNewId: string | null
  onShowEigene: () => void
}) {
  const { themen, lernziele, copyThemaToEigene } = useData()
  const [expanded, setExpanded] = useState(false)

  const thema = themen.find(t => t.id === themaId)
  if (!thema) return null

  const themaLZ = lernziele.filter(l => l.themaId === themaId && l.source !== 'bibliothek')
  const previewLZ = themaLZ.slice(0, 3)
  const stufeLabel = thema.stufe?.length
    ? `Kl. ${Math.min(...thema.stufe)}–${Math.max(...thema.stufe)}`
    : null

  const done = copiedNewId != null

  function handleUebernehmen() {
    const newId = copyThemaToEigene(themaId)
    if (newId) onCopy(newId)
  }

  return (
    <div className={cn(
      'rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md',
      done && 'border-emerald-200 bg-emerald-50/30',
    )}>
      <div className="px-3.5 pt-3 pb-2.5 space-y-2">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-snug">{thema.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-[10px] text-muted-foreground">
                {themaLZ.length} {themaLZ.length === 1 ? 'Lernziel' : 'Lernziele'}
              </span>
              {stufeLabel && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                  {stufeLabel}
                </span>
              )}
            </div>
          </div>
          {done ? (
            <span className="flex items-center gap-1 shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-medium text-emerald-700">
              <Check className="size-2.5" /> Übernommen
            </span>
          ) : (
            <Button size="sm" className="h-7 shrink-0 text-xs px-2.5" onClick={handleUebernehmen}>
              <Plus className="size-3" /> Übernehmen
            </Button>
          )}
        </div>

        {done && (
          <button onClick={onShowEigene} className="flex items-center gap-1 text-[10px] text-emerald-600 hover:underline w-fit">
            <ArrowRight className="size-3" /> In eigene Lernziele anzeigen
          </button>
        )}

        {themaLZ.length > 0 && (
          <div>
            <div className="space-y-0.5">
              {previewLZ.map(lz => (
                <div key={lz.id} className="flex items-center gap-1.5">
                  <KatBadge kat={lz.kategorie} />
                  <p className="text-[11px] text-muted-foreground leading-snug truncate">{lz.label}</p>
                </div>
              ))}
            </div>
            {themaLZ.length > 3 && (
              <button
                onClick={() => setExpanded(p => !p)}
                className="flex items-center gap-0.5 mt-1 text-[10px] text-muted-foreground/60 hover:text-primary transition-colors"
              >
                {expanded ? (
                  <><ChevronDown className="size-3" /> Weniger anzeigen</>
                ) : (
                  <><ChevronRight className="size-3" /> {themaLZ.length - 3} weitere Lernziele</>
                )}
              </button>
            )}
            {expanded && themaLZ.slice(3).map(lz => (
              <div key={lz.id} className="flex items-center gap-1.5 mt-0.5">
                <KatBadge kat={lz.kategorie} />
                <p className="text-[11px] text-muted-foreground leading-snug truncate">{lz.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Schulkatalog: LehrpersonSection ──────────────────────────────────────

function LehrpersonSection({
  autor,
  themaIds,
  copiedMap,
  onCopy,
  defaultOpen,
  onShowEigene,
}: {
  autor: string
  themaIds: string[]
  copiedMap: Map<string, string>
  onCopy: (themaId: string, newId: string) => void
  defaultOpen: boolean
  onShowEigene: () => void
}) {
  const [open, setOpen] = useState(defaultOpen)
  const isMe = autor === CURRENT_LP

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <button
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setOpen(p => !p)}
      >
        {open
          ? <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          : <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
        }
        <UserRound className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="font-semibold flex-1 truncate">{autor}</span>
        {isMe && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">Ich</span>
        )}
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {themaIds.length}
        </span>
      </button>
      {open && (
        <div className="border-t bg-muted/10 px-4 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {themaIds.map(tid => (
            <ThemaCard
              key={tid}
              themaId={tid}
              copiedNewId={copiedMap.get(tid) ?? null}
              onCopy={(newId) => onCopy(tid, newId)}
              onShowEigene={onShowEigene}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

type ViewTab = 'eigene' | 'schulkatalog'
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

  // ── Schulkatalog tab state ──
  const [search, setSearch] = useState('')
  const [selectedFachId, setSelectedFachId] = useState<string | 'alle'>('alle')
  const [stufeFilter, setStufeFilter] = useState<number | 'alle'>('alle')
  const [autorFilter, setAutorFilter] = useState<'alle' | string>('alle')
  const [autorOpen, setAutorOpen] = useState(false)
  const [copiedMap, setCopiedMap] = useState<Map<string, string>>(new Map())

  function toggleFach(id: string) {
    setExpandedFaecher(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function handleFachCreated(name: string) {
    const newFachId = createFach(name)
    setExpandedFaecher(prev => new Set([...prev, newFachId]))
    setFachCreateOpen(false)
    setThemaCreateFachId(newFachId)
  }

  function handleThemaCreated(themaId: string) {
    setThemaCreateFachId(null)
    setEditing({ type: 'thema', id: themaId })
  }

  const ownLZ = lernziele.filter(lz => lz.source !== 'bibliothek')
  const personalThemenCount = themen.filter(t => t.autor == null).length
  const totalStats = { faecher: faecher.length, themen: personalThemenCount, lernziele: ownLZ.length }

  // ── Schulkatalog computed ──
  const libraryThemen = useMemo(
    () => themen.filter(t => t.autor != null && t.typ !== 'rilz'),
    [themen],
  )

  const allAutors = useMemo(() => {
    const names = Array.from(new Set(libraryThemen.map(t => t.autor!)))
    return names.sort((a, b) => {
      if (a === CURRENT_LP) return -1
      if (b === CURRENT_LP) return 1
      return a.localeCompare(b)
    })
  }, [libraryThemen])

  const allStufen = useMemo(() => {
    const grades = new Set<number>()
    for (const t of libraryThemen) {
      for (const s of (t.stufe ?? [])) grades.add(s)
    }
    return Array.from(grades).sort((a, b) => a - b)
  }, [libraryThemen])

  const q = search.trim().toLowerCase()

  const filteredThemen = useMemo(() => {
    return libraryThemen.filter(t => {
      if (selectedFachId !== 'alle' && t.fachId !== selectedFachId) return false
      if (q && !t.name.toLowerCase().includes(q)) return false
      if (autorFilter !== 'alle') {
        const target = autorFilter === 'ich' ? CURRENT_LP : autorFilter
        if (t.autor !== target) return false
      }
      if (stufeFilter !== 'alle') {
        if (t.stufe && !t.stufe.includes(stufeFilter as number)) return false
      }
      return true
    })
  }, [libraryThemen, selectedFachId, q, autorFilter, stufeFilter])

  const byAutor = useMemo(() => {
    const map: Map<string, string[]> = new Map()
    for (const t of filteredThemen) {
      const a = t.autor!
      if (!map.has(a)) map.set(a, [])
      map.get(a)!.push(t.id)
    }
    return map
  }, [filteredThemen])

  const sortedAutors = useMemo(() => {
    const keys = Array.from(byAutor.keys())
    return keys.sort((a, b) => {
      if (a === CURRENT_LP) return -1
      if (b === CURRENT_LP) return 1
      return a.localeCompare(b)
    })
  }, [byAutor])

  function handleCopy(sourceThemaId: string, newThemaId: string) {
    setCopiedMap(prev => new Map(prev).set(sourceThemaId, newThemaId))
  }

  const totalLibraryCount = libraryThemen.length

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-5">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <BookMarked className="size-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Lernziele</h1>
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
          { key: 'schulkatalog' as ViewTab, label: 'Schulkatalog' },
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
          <div className="flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50/60 px-3.5 py-2.5">
            <Info className="size-3.5 text-sky-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-sky-700/80 leading-relaxed">
              <strong>Deine persönliche Sammlung</strong> — Hier verwaltest du deine eigenen Lernziele. Nur diese kannst du Klassen zuordnen. Themen aus der Schulbibliothek übernimmst du zuerst, um sie hier zu bearbeiten.
            </p>
          </div>

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

          {faecher.length > 0 && (
            <div className="flex items-center justify-end">
              <button onClick={() => setTab('schulkatalog')}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                Themen aus dem Schulkatalog übernehmen <ArrowRight className="size-3" />
              </button>
            </div>
          )}

          {faecher.map(fach => {
            const fachThemen = themen.filter(t => t.fachId === fach.id && t.autor == null)
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
                  <div className={cn(
                    'flex shrink-0 items-center gap-0.5 transition-opacity',
                    fachThemen.length === 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                  )}>
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
                      <div className="flex flex-col items-center gap-2 py-5 text-center rounded-xl border border-dashed border-border/60">
                        <p className="text-xs font-medium text-muted-foreground">Noch keine Themen in {fach.name}</p>
                        <Button size="sm" variant="outline" onClick={() => setThemaCreateFachId(fach.id)}>
                          <Plus className="size-3" /> Erstes Thema erstellen
                        </Button>
                      </div>
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

      {/* ── Schulkatalog tab ── */}
      {tab === 'schulkatalog' && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {totalLibraryCount} {totalLibraryCount === 1 ? 'Thema' : 'Themen'} von {new Set(libraryThemen.map(t => t.autor)).size} Lehrpersonen — übernimm Themen in deine eigene Sammlung
          </p>

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Thema suchen …"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>

            <Select value={selectedFachId} onValueChange={v => setSelectedFachId(v ?? 'alle')}>
              <SelectTrigger className="w-[140px] h-9 text-sm">
                <span className="flex flex-1 text-left text-sm">
                  {selectedFachId === 'alle' ? 'Alle Fächer' : (faecher.find(f => f.id === selectedFachId)?.name ?? 'Fach')}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Fächer</SelectItem>
                {faecher.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {allStufen.length > 0 && (
              <Select
                value={String(stufeFilter)}
                onValueChange={v => setStufeFilter(!v || v === 'alle' ? 'alle' : Number(v))}
              >
                <SelectTrigger className="w-[130px] h-9 text-sm">
                  <span className="flex flex-1 text-left text-sm">
                    {stufeFilter === 'alle' ? 'Alle Stufen' : `${stufeFilter}. Klasse`}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle Stufen</SelectItem>
                  {allStufen.map(s => (
                    <SelectItem key={s} value={String(s)}>{s}. Klasse</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Popover open={autorOpen} onOpenChange={setAutorOpen}>
              <PopoverTrigger className={cn(buttonVariants({ variant: 'outline' }), 'w-[190px] h-9 justify-between text-sm font-normal')}>
                <span className="truncate">
                  {autorFilter === 'alle' ? 'Alle Lehrpersonen'
                    : autorFilter === 'ich' ? 'Ich'
                    : autorFilter}
                </span>
                <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0">
                <Command>
                  <CommandInput placeholder="Lehrperson suchen…" className="h-9" />
                  <CommandList>
                    <CommandEmpty>Keine Treffer.</CommandEmpty>
                    <CommandItem value="alle" onSelect={() => { setAutorFilter('alle'); setAutorOpen(false) }}>
                      <Check className={cn('mr-2 size-4', autorFilter === 'alle' ? 'opacity-100' : 'opacity-0')} />
                      Alle Lehrpersonen
                    </CommandItem>
                    <CommandItem value="ich" onSelect={() => { setAutorFilter('ich'); setAutorOpen(false) }}>
                      <Check className={cn('mr-2 size-4', autorFilter === 'ich' ? 'opacity-100' : 'opacity-0')} />
                      Ich
                    </CommandItem>
                    {allAutors.filter(a => a !== CURRENT_LP).map(name => (
                      <CommandItem key={name} value={name} onSelect={() => { setAutorFilter(name); setAutorOpen(false) }}>
                        <Check className={cn('mr-2 size-4', autorFilter === name ? 'opacity-100' : 'opacity-0')} />
                        {name}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Content */}
          {filteredThemen.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-12 text-center">
              <BookMarked className="size-8 text-muted-foreground/50" />
              <div>
                <p className="font-semibold">Keine Themen gefunden</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Versuche einen anderen Suchbegriff oder Filter.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {byAutor.has(CURRENT_LP) && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">Meine früheren Themen</p>
                  <LehrpersonSection
                    autor={CURRENT_LP}
                    themaIds={byAutor.get(CURRENT_LP)!}
                    copiedMap={copiedMap}
                    onCopy={handleCopy}
                    defaultOpen={true}
                    onShowEigene={() => setTab('eigene')}
                  />
                </div>
              )}

              {sortedAutors.filter(a => a !== CURRENT_LP).length > 0 && (
                <div>
                  {byAutor.has(CURRENT_LP) && (
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 mt-4">Andere Lehrpersonen</p>
                  )}
                  <div className="space-y-2">
                    {sortedAutors.filter(a => a !== CURRENT_LP).map(autor => (
                      <LehrpersonSection
                        key={autor}
                        autor={autor}
                        themaIds={byAutor.get(autor)!}
                        copiedMap={copiedMap}
                        onCopy={handleCopy}
                        defaultOpen={false}
                        onShowEigene={() => setTab('eigene')}
                      />
                    ))}
                  </div>
                </div>
              )}
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
        onSubmit={handleFachCreated}
      />
      {themaCreateFachId && (
        <CreateThemaModal
          open={!!themaCreateFachId} onOpenChange={(o) => { if (!o) setThemaCreateFachId(null) }}
          fachId={themaCreateFachId}
          onCreated={handleThemaCreated}
        />
      )}
    </div>
  )
}
