'use client'

import { useEffect, useState } from 'react'
import {
  BookOpen, ChevronDown, ChevronRight, PencilLine, Plus,
  X, Check, Users, GraduationCap, Trash2, Calendar,
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

// ── Inline save field ─────────────────────────────────────────────────────

function SaveField({ label, value, onChange, onSave, saved }: {
  label: string; value: string; onChange: (v: string) => void; onSave: () => void; saved: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
          className="h-8 text-sm"
        />
        <Button
          size="sm" className="shrink-0 h-8" onClick={onSave}
          disabled={!value.trim()}
          variant={saved ? 'outline' : 'default'}
        >
          {saved ? <Check className="size-3.5" /> : 'Speichern'}
        </Button>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>
  )
}

// ── Fach modal ────────────────────────────────────────────────────────────

function FachModal({ open, fachId, onClose }: { open: boolean; fachId: string; onClose: () => void }) {
  const { faecher, themen, lernziele, updateFach, deleteFach } = useData()
  const fach = faecher.find(f => f.id === fachId)
  const fachThemen = themen.filter(t => t.fachId === fachId)
  const totalLZ = fachThemen.reduce((n, t) => n + lernziele.filter(lz => lz.themaId === t.id).length, 0)

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
              <SaveField
                label="Fachbezeichnung"
                value={name}
                onChange={(v) => { setName(v); setSaved(false) }}
                onSave={save}
                saved={saved}
              />
            </div>

            <div className="space-y-2">
              <SectionLabel>Inhalt</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { n: fachThemen.length, label: fachThemen.length === 1 ? 'Thema' : 'Themen' },
                  { n: totalLZ, label: 'Lernziele' },
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
                      <span className="shrink-0">{lernziele.filter(lz => lz.themaId === t.id).length} LZ</span>
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
                Löscht das Fach mit allen <strong>{fachThemen.length}</strong> Themen und <strong>{totalLZ}</strong> Lernzielen dauerhaft.
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
  const themaLZ = lernziele.filter(lz => lz.themaId === themaId)

  const [name, setName] = useState(thema?.name ?? '')
  const [nameSaved, setNameSaved] = useState(false)
  const [faelligAm, setFaelligAm] = useState(thema?.faelligAm ?? '')
  const [newLZ, setNewLZ] = useState('')
  const [editLzId, setEditLzId] = useState<string | null>(null)
  const [editLzLabel, setEditLzLabel] = useState('')
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
    createLernziel(themaId, newLZ.trim())
    setNewLZ('')
  }

  function saveLZ(id: string) {
    if (!editLzLabel.trim()) return
    updateLernziel(id, editLzLabel.trim())
    setEditLzId(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
        <DialogContent className="sm:max-w-3xl p-0 gap-0 overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-4 py-2.5 border-b bg-muted/20">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {fach ? `${fach.name} · Thema konfigurieren` : 'Thema konfigurieren'}
            </p>
            <DialogTitle className="text-sm font-semibold leading-tight">{thema.name}</DialogTitle>
          </DialogHeader>

          {/* Row 1: Name + Fälligkeitsdatum */}
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

          {/* Row 2: Klassen-Zuordnung */}
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

          {/* Row 3: Lernziele */}
          <div className="px-4 py-2 space-y-1.5">
            <SectionLabel>Lernziele — {themaLZ.length}</SectionLabel>
            {themaLZ.length === 0 ? (
              <p className="text-xs text-muted-foreground">Noch keine Lernziele vorhanden.</p>
            ) : (
              <div className="divide-y divide-border rounded-md border border-border overflow-hidden">
                {themaLZ.map((lz, i) => (
                  <div key={lz.id} className="group flex items-center gap-2 bg-background px-3 py-1">
                    <span className="w-4 shrink-0 text-[10px] font-mono text-muted-foreground">{i + 1}</span>
                    {editLzId === lz.id ? (
                      <>
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
                            onClick={() => { setEditLzId(lz.id); setEditLzLabel(lz.label) }}
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
            <div className="flex gap-1.5">
              <Input value={newLZ}
                onChange={(e) => setNewLZ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLZ()}
                placeholder="Neues Lernziel eingeben…"
                className="h-7 text-xs" />
              <Button size="sm" className="h-7 shrink-0 px-2.5" variant="outline" onClick={addLZ} disabled={!newLZ.trim()}>
                <Plus className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Gefahrenzone */}
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
        title="Lernziel löschen"
        description="Soll dieses Lernziel wirklich dauerhaft gelöscht werden?"
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
  const lzCount = lernziele.filter(lz => lz.themaId === themaId).length
  const themaLZIds = lernziele.filter(lz => lz.themaId === themaId).map(lz => lz.id)
  const classCount = classes.filter(c => themaLZIds.some(id => c.assignedLernzielIds.includes(id))).length
  const today = new Date().toISOString().slice(0, 10)
  const isFuture = !!(thema.faelligAm && thema.faelligAm > today)

  return (
    <button
      onClick={onClick}
      aria-label="Thema konfigurieren"
      className="group flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-left text-xs transition-all hover:border-primary/40 hover:bg-accent/60"
    >
      <span className="font-medium">{thema.name}</span>
      <span className="tabular-nums text-muted-foreground">· {lzCount}</span>
      {thema.faelligAm && (
        <span className={cn(
          'flex items-center gap-0.5',
          isFuture ? 'text-sky-500' : 'text-emerald-600/70',
        )}>
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

// ── Page ──────────────────────────────────────────────────────────────────

type EditTarget = { type: 'fach'; id: string } | { type: 'thema'; id: string } | null

export default function LernzielePage() {
  const { faecher, themen, lernziele, createFach, createThema } = useData()

  const [editing, setEditing] = useState<EditTarget>(null)
  const [expandedFaecher, setExpandedFaecher] = useState<Set<string>>(
    () => new Set(faecher.map(f => f.id)),
  )
  const [fachCreateOpen, setFachCreateOpen] = useState(false)
  const [themaCreateFachId, setThemaCreateFachId] = useState<string | null>(null)

  function toggleFach(id: string) {
    setExpandedFaecher(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const totalStats = {
    faecher: faecher.length,
    themen: themen.length,
    lernziele: lernziele.length,
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-5">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lernzielkatalog</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {totalStats.faecher} {totalStats.faecher === 1 ? 'Fach' : 'Fächer'}
            {' · '}{totalStats.themen} Themen
            {' · '}{totalStats.lernziele} Lernziele
          </p>
        </div>
        <Button onClick={() => setFachCreateOpen(true)}>
          <Plus /> Neues Fach
        </Button>
      </div>

      {/* Catalog */}
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
            <div
              key={fach.id}
              className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
            >
              {/* Fach header */}
              <div className="group flex items-center gap-2 px-4 py-3">
                <button
                  className="flex flex-1 items-center gap-2.5 text-left min-w-0"
                  onClick={() => toggleFach(fach.id)}
                >
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
                  <Button
                    variant="ghost" size="icon-xs"
                    className="text-muted-foreground hover:text-primary"
                    aria-label="Thema hinzufügen"
                    onClick={() => {
                      setThemaCreateFachId(fach.id)
                      if (!isExpanded) toggleFach(fach.id)
                    }}
                  >
                    <Plus />
                  </Button>
                  <Button
                    variant="ghost" size="icon-xs"
                    className="text-muted-foreground"
                    aria-label="Fach konfigurieren"
                    onClick={() => setEditing({ type: 'fach', id: fach.id })}
                  >
                    <PencilLine />
                  </Button>
                </div>
              </div>

              {/* Themen chips */}
              {isExpanded && (
                <div className="border-t border-border bg-muted/20 px-4 py-3">
                  {fachThemen.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Noch keine Themen.{' '}
                      <button
                        className="text-primary underline"
                        onClick={() => setThemaCreateFachId(fach.id)}
                      >
                        Thema hinzufügen
                      </button>
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {fachThemen.map(thema => (
                        <ThemaChip
                          key={thema.id}
                          themaId={thema.id}
                          onClick={() => setEditing({ type: 'thema', id: thema.id })}
                        />
                      ))}
                      <button
                        onClick={() => setThemaCreateFachId(fach.id)}
                        className="flex items-center gap-1 rounded-lg border border-dashed border-border/70 px-2.5 py-1.5 text-xs text-muted-foreground/60 hover:border-primary/40 hover:text-primary transition-all"
                      >
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

      {/* Config modals */}
      {editing?.type === 'fach' && (
        <FachModal open fachId={editing.id} onClose={() => setEditing(null)} />
      )}
      {editing?.type === 'thema' && (
        <ThemaModal open themaId={editing.id} onClose={() => setEditing(null)} />
      )}

      {/* Create modals */}
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
