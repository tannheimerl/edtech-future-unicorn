'use client'

import { useEffect, useRef, useState } from 'react'
import {
  BookOpen, ChevronDown, ChevronRight, Download, PencilLine, Plus,
  Upload, X, Check, GraduationCap, Trash2, Search,
} from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { CreateThemaModal } from '@/components/shared/CreateThemaModal'
import { Modal } from '@/components/shared/Modal'
import { FilterCombobox } from '@/components/shared/FilterCombobox'
import { cn, getFachColor } from '@/lib/utils'
import type { LernzielKategorie } from '@/types/domain'

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

// ── Inline Lernziel section ───────────────────────────────────────────────

function ThemaLZSection({ themaId }: { themaId: string }) {
  const { lernziele, createLernziel, updateLernziel, deleteLernziel, themen, students, classes, addRilzLernziel } = useData()
  const themaLZ = lernziele.filter(lz => lz.themaId === themaId)

  const [newLZG, setNewLZG] = useState('')
  const [newLZA, setNewLZA] = useState('')
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set())
  const [editLzId, setEditLzId] = useState<string | null>(null)
  const [editLzLabel, setEditLzLabel] = useState('')
  const [editLzKategorie, setEditLzKategorie] = useState<LernzielKategorie>('grundlegend')
  const [deleteLzId, setDeleteLzId] = useState<string | null>(null)

  const thema = themen.find(t => t.id === themaId)
  const isRilz = thema?.typ === 'rilz'
  const rilzStudents = isRilz ? students.filter(s => s.rilzFachIds?.includes(thema!.fachId)) : []

  function addLZG() {
    if (!newLZG.trim()) return
    createLernziel(themaId, newLZG.trim(), 'grundlegend')
    selectedStudentIds.forEach(sid => addRilzLernziel(sid, themaId, newLZG.trim()))
    setNewLZG('')
  }

  function addLZA() {
    if (!newLZA.trim()) return
    createLernziel(themaId, newLZA.trim(), 'anspruchsvoll')
    selectedStudentIds.forEach(sid => addRilzLernziel(sid, themaId, newLZA.trim()))
    setNewLZA('')
  }

  function toggleStudent(id: string) {
    setSelectedStudentIds(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function saveLZ(id: string) {
    if (!editLzLabel.trim()) return
    updateLernziel(id, { label: editLzLabel.trim(), kategorie: editLzKategorie })
    setEditLzId(null)
  }

  const grundlegendLZ = themaLZ.filter(lz => lz.kategorie === 'grundlegend')
  const anspruchsvollLZ = themaLZ.filter(lz => lz.kategorie === 'anspruchsvoll')

  function renderLZRow(lz: typeof themaLZ[number], idx: number) {
    return (
      <div key={lz.id} className="group flex items-center gap-2 pl-10 pr-3 py-1.5 hover:bg-accent/20 transition-colors">
        <span className="w-4 shrink-0 text-[10px] font-mono text-muted-foreground">{idx + 1}</span>
        {editLzId === lz.id ? (
          <>
            <div className="flex rounded border overflow-hidden shrink-0 h-6">
              {(['grundlegend', 'anspruchsvoll'] as LernzielKategorie[]).map(k => (
                <button key={k} onClick={() => setEditLzKategorie(k)}
                  className={cn(
                    'px-1.5 text-[9px] font-medium transition-colors',
                    editLzKategorie === k
                      ? k === 'grundlegend' ? 'bg-slate-400 text-white' : 'bg-violet-400 text-white'
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
    )
  }

  return (
    <div className="border-t border-border/40 bg-muted/10">
      {/* Grundlegend */}
      <div className="border-b border-border/40">
        <div className="pl-10 pr-3 py-1 bg-muted/20">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Grundlegend</span>
        </div>
        <div className="divide-y divide-border/30">
          {grundlegendLZ.length === 0 && (
            <p className="pl-10 pr-3 py-1.5 text-[10px] text-muted-foreground/50">Noch keine grundlegenden Lernziele.</p>
          )}
          {grundlegendLZ.map((lz, i) => renderLZRow(lz, i))}
        </div>
        <div className="pl-10 pr-3 py-1.5 flex items-center gap-1.5 border-t border-border/30">
          <Input value={newLZG} onChange={e => setNewLZG(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addLZG()}
            placeholder="Grundlegendes Lernziel…" className="h-6 text-xs flex-1" />
          <Button size="icon-sm" variant="outline" onClick={addLZG} disabled={!newLZG.trim()}>
            <Plus className="size-3" />
          </Button>
        </div>
      </div>

      {/* Anspruchsvoll */}
      <div>
        <div className="pl-10 pr-3 py-1 bg-muted/20">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-500">Anspruchsvoll</span>
        </div>
        <div className="divide-y divide-border/30">
          {anspruchsvollLZ.length === 0 && (
            <p className="pl-10 pr-3 py-1.5 text-[10px] text-muted-foreground/50">Noch keine anspruchsvollen Lernziele.</p>
          )}
          {anspruchsvollLZ.map((lz, i) => renderLZRow(lz, i))}
        </div>
        <div className="pl-10 pr-3 py-1.5 flex items-center gap-1.5 border-t border-border/30">
          <Input value={newLZA} onChange={e => setNewLZA(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addLZA()}
            placeholder="Anspruchsvolles Lernziel…" className="h-6 text-xs flex-1" />
          <Button size="icon-sm" variant="outline" onClick={addLZA} disabled={!newLZA.trim()}>
            <Plus className="size-3" />
          </Button>
        </div>
      </div>

      {/* RILZ student picker */}
      {isRilz && rilzStudents.length > 0 && (
        <div className="border-t border-border/40 pl-10 pr-3 py-2">
          <p className="text-[10px] text-muted-foreground mb-1.5">Direkt zuweisen (optional):</p>
          <div className="flex flex-wrap gap-1.5">
            {classes
              .filter(k => rilzStudents.some(s => s.klassId === k.id))
              .map(klasse => (
                <div key={klasse.id} className="contents">
                  <span className="w-full text-[9px] text-muted-foreground/50 font-medium uppercase tracking-wide mt-0.5">{klasse.name}</span>
                  {rilzStudents
                    .filter(s => s.klassId === klasse.id)
                    .map(s => {
                      const checked = selectedStudentIds.has(s.id)
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleStudent(s.id)}
                          className={cn(
                            'flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] border transition-colors',
                            checked
                              ? 'bg-violet-100 border-violet-400 text-violet-700 dark:bg-violet-900/30 dark:border-violet-600 dark:text-violet-300'
                              : 'border-border text-muted-foreground hover:bg-accent/50',
                          )}
                        >
                          {checked && <Check className="size-2.5 shrink-0" />}
                          {s.vorname} {s.nachname}
                        </button>
                      )
                    })}
                </div>
              ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteLzId} onOpenChange={(o) => { if (!o) setDeleteLzId(null) }}
        title="Lernziel löschen" description="Soll dieses Lernziel wirklich dauerhaft gelöscht werden?"
        confirmLabel="Löschen"
        onConfirm={() => { if (deleteLzId) deleteLernziel(deleteLzId) }}
      />
    </div>
  )
}

// ── Thema Edit Modal ──────────────────────────────────────────────────────

function ThemaEditModal({ themaId, onClose, onRequestDelete }: {
  themaId: string
  onClose: () => void
  onRequestDelete: () => void
}) {
  const { themen, classes, students, currentLpId, updateThema, exportThema, assignThemaToKlasse, removeThemaFromKlasse, assignRilzThemaToStudent, removeRilzThemaFromStudent } = useData()
  const thema = themen.find(t => t.id === themaId)
  const myClasses = classes.filter(k => (k.lpZuweisungen ?? []).some(z => z.lpId === currentLpId))
  const isRilz = thema?.typ === 'rilz'
  const rilzStudents = isRilz ? students.filter(s => s.rilzFachIds?.includes(thema!.fachId)) : []

  const [stufe, setStufe] = useState<number | undefined>(thema?.stufe?.[0])

  useEffect(() => {
    setStufe(thema?.stufe?.[0])
  }, [themaId])

  if (!thema) return null

  function save() {
    updateThema(themaId, { stufe: stufe ? [stufe] : undefined })
    onClose()
  }

  function toggleKlasse(klassId: string) {
    const klasse = classes.find(k => k.id === klassId)
    if (!klasse) return
    if (klasse.assignedThemaIds.includes(themaId)) {
      removeThemaFromKlasse(klassId, themaId)
    } else {
      assignThemaToKlasse(klassId, themaId)
    }
  }

  function toggleStudent(studentId: string) {
    const s = students.find(x => x.id === studentId)
    if (!s) return
    if (s.rilzThemaIds?.includes(themaId)) {
      removeRilzThemaFromStudent(studentId, themaId)
    } else {
      assignRilzThemaToStudent(studentId, themaId)
    }
  }

  return (
    <Modal
      open
      onOpenChange={(v) => { if (!v) onClose() }}
      title={thema.name}
      size="sm"
      footer={
        <div className="flex items-center justify-between w-full gap-2">
          <button
            onClick={onRequestDelete}
            className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 transition-colors px-2 py-1 rounded-lg hover:bg-destructive/8"
          >
            <Trash2 className="size-3.5" />
            Löschen
          </button>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => exportThema(themaId)} aria-label="Exportieren" className="text-muted-foreground">
              <Download className="size-3.5" />
            </Button>
            <Button size="sm" onClick={save}>Fertig</Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Schulstufe */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Schulstufe</Label>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <button
                key={n}
                onClick={() => setStufe(stufe === n ? undefined : n)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium border transition-all',
                  stufe === n
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:bg-accent',
                )}
              >
                Kl. {n}
              </button>
            ))}
          </div>
        </div>

        {/* Klassen / Schüler */}
        {isRilz ? (
          rilzStudents.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Schüler</Label>
              <div className="rounded-xl border border-border overflow-hidden divide-y divide-border/60">
                {rilzStudents.map(s => {
                  const isAssigned = s.rilzThemaIds?.includes(themaId) ?? false
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleStudent(s.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors',
                        isAssigned
                          ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                          : 'hover:bg-accent/50 text-foreground',
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <GraduationCap className="size-3.5 shrink-0" />
                        {s.vorname} {s.nachname}
                      </span>
                      {isAssigned && <Check className="size-3.5 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        ) : (
          myClasses.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Klassen</Label>
              <div className="rounded-xl border border-border overflow-hidden divide-y divide-border/60">
                {myClasses.map(klasse => {
                  const isAssigned = klasse.assignedThemaIds.includes(themaId)
                  return (
                    <button
                      key={klasse.id}
                      onClick={() => toggleKlasse(klasse.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors',
                        isAssigned
                          ? 'bg-primary/10 text-primary hover:bg-primary/20'
                          : 'hover:bg-accent/50 text-foreground',
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <GraduationCap className="size-3.5 shrink-0" />
                        {klasse.name}
                        {klasse.schuljahr && (
                          <span className="text-[10px] text-muted-foreground">{klasse.schuljahr}</span>
                        )}
                      </span>
                      {isAssigned && <Check className="size-3.5 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        )}
      </div>
    </Modal>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function LernzielePage() {
  const { faecher, themen, lernziele, classes, students, currentLpId, createFach, exportThema, exportFach, importThema, deleteThema } = useData()
  const myClasses = classes.filter(k => (k.lpZuweisungen ?? []).some(z => z.lpId === currentLpId))

  const [activeTab, setActiveTab] = useState<string | 'alle'>('alle')
  const [expandedThemen, setExpandedThemen] = useState<Set<string>>(new Set())
  const [collapsedFaecher, setCollapsedFaecher] = useState<Set<string>>(new Set())
  const [fachCreateOpen, setFachCreateOpen] = useState(false)
  const [themaCreateFachId, setThemaCreateFachId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typFilter, setTypFilter] = useState<'alle' | 'standard' | 'rilz'>('alle')
  const [importFeedback, setImportFeedback] = useState<{ ok: boolean; msg: string } | null>(null)
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
  const [fachPickerOpen, setFachPickerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [klasseFilter, setKlasseFilter] = useState<string | 'alle'>('alle')
  const [editThemaId, setEditThemaId] = useState<string | null>(null)
  const [deleteThemaId, setDeleteThemaId] = useState<string | null>(null)

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

  const q = search.trim().toLowerCase()

  const visibleFaecher = activeTab === 'alle' ? faecher : faecher.filter(f => f.id === activeTab)
  const tableData = visibleFaecher.map(fach => ({
    fach,
    themen: themen.filter(t => {
      if (t.fachId !== fach.id) return false
      if (q && !t.name.toLowerCase().includes(q)) return false
      if (typFilter === 'standard' && t.typ === 'rilz') return false
      if (typFilter === 'rilz' && t.typ !== 'rilz') return false
      if (klasseFilter !== 'alle') {
        const selectedKlasse = classes.find(k => k.id === klasseFilter)
        if (!selectedKlasse?.assignedThemaIds.includes(t.id)) return false
      }
      return true
    }),
  }))
  const hasAnyThemen = tableData.some(d => d.themen.length > 0)
  const newThemaFachId = activeTab !== 'alle' ? (activeTab as string) : (faecher[0]?.id ?? null)

  const hasActiveFilters = activeTab !== 'alle' || typFilter !== 'alle' || klasseFilter !== 'alle' || q

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    importThema(file)
      .then(() => {
        setImportFeedback({ ok: true, msg: 'Thema erfolgreich importiert.' })
        setTimeout(() => setImportFeedback(null), 3000)
      })
      .catch((err: Error) => {
        if (err.message === 'FACH_NOT_FOUND') {
          setPendingImportFile(file)
          setFachPickerOpen(true)
        } else {
          setImportFeedback({ ok: false, msg: 'Ungültiges Dateiformat.' })
          setTimeout(() => setImportFeedback(null), 3000)
        }
      })
  }

  function handleFachPicked(fachId: string) {
    if (!pendingImportFile) return
    setFachPickerOpen(false)
    importThema(pendingImportFile, fachId)
      .then(() => {
        setPendingImportFile(null)
        setImportFeedback({ ok: true, msg: 'Thema erfolgreich importiert.' })
        setTimeout(() => setImportFeedback(null), 3000)
      })
      .catch(() => {
        setPendingImportFile(null)
        setImportFeedback({ ok: false, msg: 'Fehler beim Importieren.' })
        setTimeout(() => setImportFeedback(null), 3000)
      })
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">

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
          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <FilterCombobox
              showSearch
              value={activeTab === 'alle' ? '' : activeTab}
              onChange={v => { setActiveTab(v || 'alle') }}
              options={[
                { value: '', label: 'Alle Fächer' },
                ...faecher.map(f => ({ value: f.id, label: f.name, dot: getFachColor(f.id, faecher.map(x => x.id)).dot })),
              ]}
              footerAction={{ label: 'Neues Fach', onSelect: () => setFachCreateOpen(true) }}
            />

            <FilterCombobox
              value={typFilter === 'alle' ? '' : typFilter}
              onChange={v => setTypFilter((v || 'alle') as 'alle' | 'standard' | 'rilz')}
              options={[
                { value: '', label: 'Alle Typen' },
                { value: 'standard', label: 'Nur Standard' },
                { value: 'rilz', label: 'Nur RILZ' },
              ]}
            />

            {myClasses.length > 0 && (
              <FilterCombobox
                showSearch={myClasses.length > 4}
                value={klasseFilter === 'alle' ? '' : klasseFilter}
                onChange={v => setKlasseFilter(v || 'alle')}
                options={[
                  { value: '', label: 'Alle Klassen' },
                  ...myClasses.map(k => ({ value: k.id, label: k.name + (k.schuljahr ? ` (${k.schuljahr})` : '') })),
                ]}
              />
            )}

            {hasActiveFilters && (
              <button
                onClick={() => { setSearch(''); setTypFilter('alle'); setActiveTab('alle'); setKlasseFilter('alle') }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-3" /> Filter zurücksetzen
              </button>
            )}

            <div className="relative ml-auto min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Thema suchen…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="size-3.5" /> Importieren
            </Button>
            {importFeedback && (
              <span className={cn('text-xs', importFeedback.ok ? 'text-emerald-600' : 'text-red-500')}>
                {importFeedback.msg}
              </span>
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
                const fachLZCount = fachThemen.reduce((s, t) => s + lernziele.filter(lz => lz.themaId === t.id).length, 0)
                return (
                  <div key={fach.id} className={cn(
                    'rounded-xl border bg-card overflow-hidden shadow-sm border-l-4',
                    fachColor.border,
                  )}>
                    {/* Fach header */}
                    <div className={cn('group flex items-center gap-2 px-3 py-1.5 select-none', fachColor.bg)}>
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
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={e => { e.stopPropagation(); void exportFach(fach.id) }}
                        aria-label={`${fach.name} exportieren`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground"
                      >
                        <Download className="size-3.5" />
                      </Button>
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
                              const assignedClasses = myClasses.filter(k => k.assignedThemaIds.includes(thema.id))
                              const isRilz = thema.typ === 'rilz'
                              const rilzAssignedStudents = isRilz
                                ? students.filter(s => s.rilzFachIds?.includes(thema.fachId))
                                : []

                              return (
                                <div key={thema.id}>
                                  <div className="group flex items-center gap-2 px-3 py-2 hover:bg-accent/20 transition-colors">
                                    {/* Name inline with Stufe-Chip und RILZ-Badge */}
                                    <button
                                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                      onClick={() => toggleThema(thema.id)}
                                    >
                                      {isExpanded
                                        ? <ChevronDown className="size-3 text-muted-foreground shrink-0" />
                                        : <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                                      }
                                      <span className="text-sm font-medium truncate">{thema.name}</span>
                                      {isRilz && (
                                        <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium bg-orange-100 text-orange-700">
                                          RILZ
                                        </span>
                                      )}
                                      {thema.stufe?.length ? (
                                        <span className="shrink-0 text-[10px] rounded px-1.5 py-0.5 bg-muted text-muted-foreground">
                                          Kl. {thema.stufe[0]}
                                        </span>
                                      ) : null}
                                    </button>

                                    {/* Rechte Seite: Schüler für RILZ, Klassen für Standard */}
                                    <div className="hidden sm:flex shrink-0">
                                      {isRilz ? (
                                        <span className={cn(
                                          'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                                          rilzAssignedStudents.length > 0
                                            ? 'bg-orange-100 text-orange-700'
                                            : 'bg-muted text-muted-foreground',
                                        )}>
                                          <GraduationCap className="size-2.5 shrink-0" />
                                          <span className="ml-0.5 max-w-[120px] truncate">
                                            {rilzAssignedStudents.length > 0
                                              ? rilzAssignedStudents.slice(0, 2).map(s => s.vorname).join(' · ') + (rilzAssignedStudents.length > 2 ? ` +${rilzAssignedStudents.length - 2}` : '')
                                              : 'Kein Schüler'}
                                          </span>
                                        </span>
                                      ) : (
                                        <span className={cn(
                                          'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                                          assignedClasses.length > 0
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-muted text-muted-foreground',
                                        )}>
                                          <GraduationCap className="size-2.5 shrink-0" />
                                          <span className="ml-0.5 max-w-[90px] truncate">
                                            {assignedClasses.length > 0
                                              ? assignedClasses.slice(0, 2).map(k => k.name).join(' · ') + (assignedClasses.length > 2 ? ` +${assignedClasses.length - 2}` : '')
                                              : 'Keine Klasse'}
                                          </span>
                                        </span>
                                      )}
                                    </div>

                                    {/* Actions — hover reveal */}
                                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        onClick={e => { e.stopPropagation(); setEditThemaId(thema.id) }}
                                        aria-label="Thema bearbeiten"
                                      >
                                        <PencilLine className="size-3.5" />
                                      </Button>
                                      <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        className="text-muted-foreground"
                                        onClick={e => { e.stopPropagation(); exportThema(thema.id) }}
                                        aria-label="Thema exportieren"
                                      >
                                        <Download className="size-3" />
                                      </Button>
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
        />
      )}

      {editThemaId && (
        <ThemaEditModal
          themaId={editThemaId}
          onClose={() => setEditThemaId(null)}
          onRequestDelete={() => { setDeleteThemaId(editThemaId); setEditThemaId(null) }}
        />
      )}

      <ConfirmDialog
        open={!!deleteThemaId}
        onOpenChange={(o) => { if (!o) setDeleteThemaId(null) }}
        title="Thema löschen"
        description="Soll dieses Thema und alle zugehörigen Lernziele wirklich dauerhaft gelöscht werden?"
        confirmLabel="Löschen"
        onConfirm={() => { if (deleteThemaId) deleteThema(deleteThemaId) }}
      />

      <Modal
        open={fachPickerOpen}
        onOpenChange={(o) => { if (!o) { setFachPickerOpen(false); setPendingImportFile(null) } }}
        title="Fach auswählen"
        description="Das Fach aus der Importdatei wurde nicht gefunden. Wähle ein bestehendes Fach:"
        size="xs"
      >
        <div className="flex flex-col gap-1">
          {faecher.map(f => {
            const fc = getFachColor(f.id, faecher.map(fx => fx.id))
            return (
              <button
                key={f.id}
                onClick={() => handleFachPicked(f.id)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent text-left transition-colors"
              >
                <span className={cn('size-2 rounded-full shrink-0', fc.dot)} />
                {f.name}
              </button>
            )
          })}
        </div>
      </Modal>

      <input
        ref={fileInputRef}
        type="file"
        accept=".lezio,.json"
        className="hidden"
        onChange={handleImportFile}
      />
    </div>
  )
}
