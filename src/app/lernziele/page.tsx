'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
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
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command'
import { cn, getFachColor } from '@/lib/utils'
import type { LernzielKategorie, TagKategorie, Thema } from '@/types/domain'

const BUILTIN_KOLONNEN = [
  { id: 'fach',  label: 'Fach' },
  { id: 'typ',   label: 'Typ' },
  { id: 'stufe', label: 'Schulstufe' },
] as const

const MAX_SPALTEN = 5
const LS_KEY = 'lezio_lz_sichtbare_spalten'

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

// ── FilterSpalte ─────────────────────────────────────────────────────────

function FilterSpalte({
  label, value, options, onChange, onRemove, showSearch,
}: {
  label: string
  value: string
  options: { value: string; label: string; dot?: string }[]
  onChange: (v: string) => void
  onRemove: () => void
  showSearch?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const selectedLabel = options.find(o => o.value === value)?.label ?? `Alle ${label}`
  const selectedDot = options.find(o => o.value === value)?.dot
  const filtered = showSearch && search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  return (
    <div className="flex items-center rounded-full border border-border bg-card text-xs overflow-hidden shrink-0">
      <Popover open={open} onOpenChange={v => { setOpen(v); if (!v) setSearch('') }}>
        <PopoverTrigger className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 hover:bg-accent/30 transition-colors">
          <span className="font-medium text-muted-foreground">{label}</span>
          <span className="text-border">|</span>
          {selectedDot && <span className={cn('size-2 rounded-full shrink-0', selectedDot)} />}
          <span className={cn(value ? 'font-medium text-foreground' : 'text-muted-foreground')}>
            {selectedLabel}
          </span>
          <ChevronDown className="size-3 text-muted-foreground shrink-0" />
        </PopoverTrigger>
        <PopoverContent className="p-1.5 w-52" align="start" side="bottom">
          {showSearch && (
            <div className="px-1 pb-1.5">
              <input
                autoFocus
                placeholder="Suchen…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-xs outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}
          <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto">
            {filtered.map((opt, i) => (
              <Fragment key={opt.value || '__all__'}>
                <button
                  onClick={() => { onChange(opt.value); setOpen(false); setSearch('') }}
                  className={cn(
                    'flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-xs transition-colors text-left',
                    opt.value === value
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted/60 text-foreground'
                  )}
                >
                  {opt.dot
                    ? <span className={cn('size-2.5 rounded-full shrink-0', opt.dot)} />
                    : <span className="size-2.5 shrink-0" />
                  }
                  <span className="flex-1">{opt.label}</span>
                  {opt.value === value && <Check className="size-3 shrink-0 text-primary" />}
                </button>
                {i === 0 && options.length > 1 && !search && (
                  <div className="my-0.5 border-t border-border/40" />
                )}
              </Fragment>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <button
        onClick={onRemove}
        className="flex items-center justify-center px-1.5 py-1.5 hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground border-l border-border/40"
        aria-label={`${label}-Spalte entfernen`}
      >
        <X className="size-3" />
      </button>
    </div>
  )
}

// ── AddSpalteButton ───────────────────────────────────────────────────────

function AddSpalteButton({
  aktiveKolonnen,
  tagKategorien,
  onAdd,
  onNewKategorie,
}: {
  aktiveKolonnen: string[]
  tagKategorien: TagKategorie[]
  onAdd: (id: string) => void
  onNewKategorie: () => void
}) {
  const [open, setOpen] = useState(false)
  const atMax = aktiveKolonnen.length >= MAX_SPALTEN

  const builtinAvailable = BUILTIN_KOLONNEN.filter(k => !aktiveKolonnen.includes(k.id))
  const customAvailable = tagKategorien.filter(k => !aktiveKolonnen.includes(k.id))

  if (atMax) {
    return (
      <span className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50/50 px-2.5 py-1.5 text-xs text-amber-600 font-medium shrink-0">
        <span className="tabular-nums">{MAX_SPALTEN}/{MAX_SPALTEN}</span>
        <span className="text-amber-500/70">Spalten</span>
      </span>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-1 rounded-lg border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors shrink-0">
        <Plus className="size-3" />
        Spalte
        <span className="text-muted-foreground/50 tabular-nums">{aktiveKolonnen.length}/{MAX_SPALTEN}</span>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-52" align="start">
        <Command>
          <CommandList>
            {builtinAvailable.length > 0 && (
              <CommandGroup heading="Standardfelder">
                {builtinAvailable.map(k => (
                  <CommandItem
                    key={k.id}
                    value={k.id}
                    onSelect={() => { onAdd(k.id); setOpen(false) }}
                    className="text-xs"
                  >
                    {k.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {customAvailable.length > 0 && (
              <>
                {builtinAvailable.length > 0 && <CommandSeparator />}
                <CommandGroup heading="Eigene">
                  {customAvailable.map(k => (
                    <CommandItem
                      key={k.id}
                      value={k.id}
                      onSelect={() => { onAdd(k.id); setOpen(false) }}
                      className="text-xs"
                    >
                      {k.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            {builtinAvailable.length === 0 && customAvailable.length === 0 && (
              <div className="py-2 text-xs text-center text-muted-foreground">Alle Kategorien sind aktiv.</div>
            )}
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                value="__new_kategorie__"
                onSelect={() => { onNewKategorie(); setOpen(false) }}
                className="text-xs text-primary"
              >
                <Plus className="size-3 mr-1.5" />
                Neue Kategorie erstellen
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ── Modal Row ─────────────────────────────────────────────────────────────

function ModalRow({ label, displayValue, placeholder, open, onOpenChange, children }: {
  label: string
  displayValue?: string
  placeholder?: string
  open: boolean
  onOpenChange: (v: boolean) => void
  children: React.ReactNode
}) {
  return (
    <div className="w-full min-w-0">
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger className="w-full min-w-0 max-w-full flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2 hover:bg-accent/30 transition-colors text-left">
          <span className="text-xs text-muted-foreground shrink-0 w-16">{label}</span>
          <span className={cn(
            'flex-1 min-w-0 truncate text-xs',
            displayValue ? 'text-foreground font-medium' : 'text-muted-foreground/40'
          )}>
            {displayValue ?? placeholder ?? '—'}
          </span>
          <ChevronDown className="size-3 text-muted-foreground shrink-0" />
        </PopoverTrigger>
        <PopoverContent className="p-1.5 w-52" align="start" side="bottom">
          {children}
        </PopoverContent>
      </Popover>
    </div>
  )
}

// ── Thema Edit Modal ──────────────────────────────────────────────────────

function ThemaEditModal({ themaId, onClose, onRequestDelete }: {
  themaId: string
  onClose: () => void
  onRequestDelete: () => void
}) {
  const {
    themen, faecher, updateThema, exportThema,
    tagKategorien, deleteTagKategorie, getTagWerte, createTagKategorie,
  } = useData()
  const thema = themen.find(t => t.id === themaId)

  const [localName, setLocalName] = useState(thema?.name ?? '')
  const [localFachId, setLocalFachId] = useState(thema?.fachId ?? '')
  const [localTyp, setLocalTyp] = useState<'standard' | 'rilz'>(thema?.typ ?? 'standard')
  const [stufe, setStufe] = useState<number | undefined>(thema?.stufe?.[0])
  const [localTagValues, setLocalTagValues] = useState<Record<string, string>>(
    () => Object.fromEntries(
      Object.entries(thema?.tags ?? {}).map(([k, v]) => [k, Array.isArray(v) ? (v[0] ?? '') : ''])
    )
  )
  const [openRowId, setOpenRowId] = useState<string | null>(null)
  const [tagSearch, setTagSearch] = useState<Record<string, string>>({})
  const [deleteKatId, setDeleteKatId] = useState<string | null>(null)
  const [newKatOpen, setNewKatOpen] = useState(false)

  useEffect(() => {
    if (!thema) return
    setLocalName(thema.name)
    setLocalFachId(thema.fachId)
    setLocalTyp(thema.typ ?? 'standard')
    setStufe(thema.stufe?.[0])
    setLocalTagValues(
      Object.fromEntries(
        Object.entries(thema.tags ?? {}).map(([k, v]) => [k, Array.isArray(v) ? (v[0] ?? '') : ''])
      )
    )
    setOpenRowId(null)
    setTagSearch({})
  }, [themaId])

  if (!thema) return null

  function save() {
    if (!localName.trim()) return
    updateThema(themaId, {
      name: localName.trim(),
      fachId: localFachId,
      typ: localTyp,
      stufe: stufe ? [stufe] : undefined,
      tags: Object.fromEntries(
        Object.entries(localTagValues)
          .filter(([, v]) => v.trim())
          .map(([k, v]) => [k, [v]])
      ),
    })
    onClose()
  }

  function openRow(id: string, isOpen: boolean) {
    setOpenRowId(isOpen ? id : null)
  }

  function setTagValue(katId: string, value: string) {
    setLocalTagValues(prev => ({ ...prev, [katId]: prev[katId] === value ? '' : value }))
    setOpenRowId(null)
    setTagSearch(prev => ({ ...prev, [katId]: '' }))
  }

  function renderSimpleOptions(
    opts: { value: string; label: string }[],
    current: string,
    onSelect: (v: string) => void,
    clearLabel?: string
  ) {
    return (
      <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto">
        {clearLabel && current && (
          <button
            onClick={() => { onSelect(''); setOpenRowId(null) }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted/60 text-left"
          >
            <X className="size-3 shrink-0" />{clearLabel}
          </button>
        )}
        {opts.map(opt => (
          <button
            key={opt.value}
            onClick={() => { onSelect(opt.value); setOpenRowId(null) }}
            className={cn(
              'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors text-left',
              opt.value === current ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/60 text-foreground'
            )}
          >
            {opt.value === current
              ? <Check className="size-3 shrink-0" />
              : <span className="size-3 shrink-0" />
            }
            {opt.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <>
      <Modal
        open
        onOpenChange={(v) => { if (!v) onClose() }}
        title={thema.name}
        size="md"
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
              <Button size="sm" variant="outline" onClick={onClose}>Abbrechen</Button>
              <Button size="sm" onClick={save} disabled={!localName.trim()}>Fertig</Button>
            </div>
          </div>
        }
      >
        <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden space-y-3">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Bezeichnung</Label>
            <Input
              value={localName}
              onChange={e => setLocalName(e.target.value)}
              placeholder="Themabezeichnung"
            />
          </div>

          {/* Dropdown rows */}
          <div className="space-y-1 border-t border-border/40 pt-2">

            {/* Fach — only if multiple Fächer exist */}
            {faecher.length > 1 && (
              <ModalRow
                label="Fach"
                displayValue={faecher.find(f => f.id === localFachId)?.name}
                open={openRowId === 'fach'}
                onOpenChange={v => openRow('fach', v)}
              >
                {renderSimpleOptions(
                  faecher.map(f => ({ value: f.id, label: f.name })),
                  localFachId,
                  setLocalFachId
                )}
              </ModalRow>
            )}

            {/* Typ */}
            <ModalRow
              label="Typ"
              displayValue={localTyp === 'rilz' ? 'RILZ' : 'Standard'}
              open={openRowId === 'typ'}
              onOpenChange={v => openRow('typ', v)}
            >
              {renderSimpleOptions(
                [{ value: 'standard', label: 'Standard' }, { value: 'rilz', label: 'RILZ' }],
                localTyp,
                v => setLocalTyp(v as 'standard' | 'rilz')
              )}
            </ModalRow>

            {/* Schulstufe */}
            <ModalRow
              label="Schulstufe"
              displayValue={stufe ? `Kl. ${stufe}` : undefined}
              placeholder="keine"
              open={openRowId === 'stufe'}
              onOpenChange={v => openRow('stufe', v)}
            >
              {renderSimpleOptions(
                [1,2,3,4,5,6,7,8,9].map(n => ({ value: String(n), label: `Kl. ${n}` })),
                stufe ? String(stufe) : '',
                v => setStufe(v ? Number(v) : undefined),
                'Keine Auswahl'
              )}
            </ModalRow>

            {/* Tag categories — one row each, combobox with create */}
            {tagKategorien.map(kat => {
              const currentVal = localTagValues[kat.id] ?? ''
              const allVals = getTagWerte(kat.id)
              const search = tagSearch[kat.id] ?? ''
              const filtered = search
                ? allVals.filter(v => v.toLowerCase().includes(search.toLowerCase()))
                : allVals
              const canCreate = search.trim() !== '' &&
                !allVals.some(v => v.toLowerCase() === search.trim().toLowerCase())

              return (
                <ModalRow
                  key={kat.id}
                  label={kat.name}
                  displayValue={currentVal || undefined}
                  open={openRowId === kat.id}
                  onOpenChange={v => {
                    openRow(kat.id, v)
                    if (!v) setTagSearch(p => ({ ...p, [kat.id]: '' }))
                  }}
                >
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Suchen oder neu…"
                      value={search}
                      onValueChange={v => setTagSearch(prev => ({ ...prev, [kat.id]: v }))}
                    />
                    <CommandList>
                      <CommandGroup>
                        {currentVal && !search && (
                          <CommandItem value="__clear__" onSelect={() => setTagValue(kat.id, '')}>
                            <X className="size-3 mr-1.5 shrink-0 text-muted-foreground" />
                            <span className="text-muted-foreground text-xs">Auswahl aufheben</span>
                          </CommandItem>
                        )}
                        {filtered.map(v => (
                          <CommandItem key={v} value={v} onSelect={() => setTagValue(kat.id, v)}>
                            {currentVal === v
                              ? <Check className="size-3 mr-1.5 shrink-0 text-primary" />
                              : <span className="size-3 mr-1.5 shrink-0" />
                            }
                            {v}
                          </CommandItem>
                        ))}
                        {canCreate && (
                          <CommandItem
                            value={`__new__${search}`}
                            onSelect={() => setTagValue(kat.id, search.trim())}
                            className="text-primary"
                          >
                            <Plus className="size-3 mr-1.5 shrink-0" />
                            „{search.trim()}" erstellen
                          </CommandItem>
                        )}
                        {filtered.length === 0 && !canCreate && (
                          <CommandItem value="__empty__" disabled>
                            <span className="text-muted-foreground text-xs">Keine Werte vorhanden</span>
                          </CommandItem>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                  <div className="border-t border-border/40 mt-0.5 pt-0.5">
                    <button
                      onClick={() => { setDeleteKatId(kat.id); setOpenRowId(null) }}
                      className="flex items-center gap-1.5 w-full px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <Trash2 className="size-3 shrink-0" />
                      Kategorie löschen
                    </button>
                  </div>
                </ModalRow>
              )
            })}

            {/* Add category */}
            <button
              onClick={() => setNewKatOpen(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 w-full"
            >
              <Plus className="size-3" />
              Kategorie hinzufügen
            </button>
          </div>
        </div>

        <ConfirmDialog
          open={!!deleteKatId}
          onOpenChange={(o) => { if (!o) setDeleteKatId(null) }}
          title="Kategorie löschen"
          description="Soll diese Tag-Kategorie wirklich gelöscht werden? Alle zugewiesenen Werte in den Themen bleiben erhalten, sind aber nicht mehr filterbar."
          confirmLabel="Löschen"
          onConfirm={() => { if (deleteKatId) { deleteTagKategorie(deleteKatId); setDeleteKatId(null) } }}
        />
      </Modal>

      <CreateModal
        open={newKatOpen}
        onOpenChange={setNewKatOpen}
        title="Neue Tag-Kategorie"
        label="Bezeichnung"
        placeholder="z. B. Semester, Lerngruppe …"
        onSubmit={(name) => { createTagKategorie(name) }}
      />
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function LernzielePage() {
  const { faecher, themen, lernziele, students, createFach, exportThema, exportFach, importThema, deleteThema, tagKategorien, createTagKategorie, getTagWerte } = useData()

  const [aktiveKolonnen, setAktiveKolonnen] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '["fach","typ"]') }
    catch { return ['fach', 'typ'] }
  })
  const [kolonnenFilter, setKolonnenFilter] = useState<Record<string, string>>({})
  const [katCreateOpen, setKatCreateOpen] = useState(false)
  const [expandedThemen, setExpandedThemen] = useState<Set<string>>(new Set())
  const [collapsedFaecher, setCollapsedFaecher] = useState<Set<string>>(new Set())
  const [fachCreateOpen, setFachCreateOpen] = useState(false)
  const [themaCreateFachId, setThemaCreateFachId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [importFeedback, setImportFeedback] = useState<{ ok: boolean; msg: string } | null>(null)
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
  const [fachPickerOpen, setFachPickerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editThemaId, setEditThemaId] = useState<string | null>(null)
  const [deleteThemaId, setDeleteThemaId] = useState<string | null>(null)

  function toggleThema(id: string) {
    setExpandedThemen(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function toggleFach(id: string) {
    setCollapsedFaecher(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function handleFachCreated(name: string) {
    const newFachId = createFach(name)
    setFachCreateOpen(false)
    setThemaCreateFachId(newFachId)
  }

  function addKolonne(id: string) {
    if (aktiveKolonnen.length >= MAX_SPALTEN || aktiveKolonnen.includes(id)) return
    const next = [...aktiveKolonnen, id]
    setAktiveKolonnen(next)
    localStorage.setItem(LS_KEY, JSON.stringify(next))
  }

  function removeKolonne(id: string) {
    const next = aktiveKolonnen.filter(k => k !== id)
    setAktiveKolonnen(next)
    localStorage.setItem(LS_KEY, JSON.stringify(next))
    setKolonnenFilter(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  const q = search.trim().toLowerCase()

  const visibleFaecher = kolonnenFilter['fach']
    ? faecher.filter(f => f.id === kolonnenFilter['fach'])
    : faecher

  const tableData = visibleFaecher.map(fach => ({
    fach,
    themen: themen.filter(t => {
      if (t.fachId !== fach.id) return false
      if (q && !t.name.toLowerCase().includes(q)) return false
      for (const colId of aktiveKolonnen) {
        const val = kolonnenFilter[colId] ?? ''
        if (!val) continue
        if (colId === 'typ') {
          if ((t.typ ?? 'standard') !== val) return false
        } else if (colId === 'stufe') {
          if (!(t.stufe ?? []).includes(parseInt(val))) return false
        } else if (colId !== 'fach') {
          if (!(t.tags?.[colId] ?? []).includes(val)) return false
        }
      }
      return true
    }),
  }))
  const hasAnyThemen = tableData.some(d => d.themen.length > 0)
  const newThemaFachId = faecher[0]?.id ?? null

  const hasActiveFilters = q || Object.values(kolonnenFilter).some(v => v !== '')

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

  function renderChips(thema: Thema) {
    const fachIdList = faecher.map(f => f.id)
    return aktiveKolonnen.flatMap((spalteId, idx) => {
      if (spalteId === 'fach') {
        const fach = faecher.find(f => f.id === thema.fachId)
        if (!fach) return []
        const color = getFachColor(thema.fachId, fachIdList)
        return [<span key="fach" className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium', color.bg)}>{fach.name}</span>]
      }
      if (spalteId === 'typ') {
        return thema.typ === 'rilz'
          ? [<span key="typ" className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium bg-orange-100 text-orange-700">RILZ</span>]
          : [<span key="typ" className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground">Standard</span>]
      }
      if (spalteId === 'stufe') {
        if (!thema.stufe?.length) return []
        return [<span key="stufe" className="shrink-0 text-[10px] rounded px-1.5 py-0.5 bg-muted text-muted-foreground">Kl. {thema.stufe[0]}</span>]
      }
      const vals = thema.tags?.[spalteId]
      if (!vals?.length) return []
      return vals.map(v => (
        <span key={`${idx}-${v}`} className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-accent text-accent-foreground">{v}</span>
      ))
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
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {aktiveKolonnen.map(colId => {
              const builtin = BUILTIN_KOLONNEN.find(k => k.id === colId)
              const custom = tagKategorien.find(k => k.id === colId)
              const label = builtin?.label ?? custom?.name ?? colId

              let options: { value: string; label: string; dot?: string }[]
              let showSearch = false

              if (colId === 'fach') {
                const faecherMitThemen = faecher.filter(f => themen.some(t => t.fachId === f.id))
                options = [
                  { value: '', label: 'Alle Fächer' },
                  ...faecherMitThemen.map(f => ({ value: f.id, label: f.name, dot: getFachColor(f.id, faecher.map(x => x.id)).dot })),
                ]
                showSearch = faecherMitThemen.length > 4
              } else if (colId === 'typ') {
                const typenImData = [...new Set(themen.map(t => t.typ).filter(Boolean))] as string[]
                options = [
                  { value: '', label: 'Alle Typen' },
                  ...(typenImData.includes('standard') ? [{ value: 'standard', label: 'Standard' }] : []),
                  ...(typenImData.includes('rilz') ? [{ value: 'rilz', label: 'RILZ' }] : []),
                ]
              } else if (colId === 'stufe') {
                const availableStufen = [...new Set(themen.flatMap(t => t.stufe ?? []))].sort((a, b) => a - b)
                options = [
                  { value: '', label: 'Alle Stufen' },
                  ...availableStufen.map(n => ({ value: String(n), label: `Klasse ${n}` })),
                ]
              } else {
                const vals = getTagWerte(colId)
                options = [
                  { value: '', label: `Alle ${label}` },
                  ...vals.map(v => ({ value: v, label: v })),
                ]
                showSearch = vals.length > 4
              }

              return (
                <FilterSpalte
                  key={colId}
                  label={label}
                  value={kolonnenFilter[colId] ?? ''}
                  options={options}
                  onChange={v => setKolonnenFilter(prev => ({ ...prev, [colId]: v }))}
                  onRemove={() => removeKolonne(colId)}
                  showSearch={showSearch}
                />
              )
            })}

            <AddSpalteButton
              aktiveKolonnen={aktiveKolonnen}
              tagKategorien={tagKategorien}
              onAdd={addKolonne}
              onNewKategorie={() => setKatCreateOpen(true)}
            />

            {hasActiveFilters && (
              <button
                onClick={() => { setSearch(''); setKolonnenFilter({}) }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-3" /> Filter zurücksetzen
              </button>
            )}

          </div>

          {/* Search + Import row */}
          <div className="flex items-center gap-2 mb-6">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Thema suchen…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-8"
              />
            </div>

            <div className="h-5 w-px bg-border" />

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
                                      {renderChips(thema)}
                                    </button>

                                    {/* Rechte Seite: Schüler für RILZ */}
                                    {isRilz && (
                                      <div className="hidden sm:flex shrink-0">
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
                                      </div>
                                    )}

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

      <CreateModal
        open={katCreateOpen} onOpenChange={setKatCreateOpen}
        title="Neue Tag-Kategorie" label="Bezeichnung" placeholder="z. B. Semester, Lerngruppe …"
        onSubmit={(name) => { createTagKategorie(name); setKatCreateOpen(false) }}
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
