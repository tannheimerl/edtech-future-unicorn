'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { Icon } from "@/components/ui/Icon"
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { CreateThemaModal } from '@/components/shared/CreateThemaModal'
import { FilterDropdown } from '@/components/shared/FilterDropdown'
import { InputModal } from '@/components/shared/InputModal'
import { Modal } from '@/components/shared/Modal'
import { ModalRow } from '@/components/shared/ModalRow'
import { EmptyState } from '@/components/shared/EmptyState'
import { ThemaAddPickerModal } from '@/components/shared/ThemaAddPickerModal'
import { FachZuordnenRow } from '@/components/shared/FachZuordnenRow'
import { SearchBar } from '@/components/shared/SearchBar'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command, CommandGroup, CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command'
import { cn, getFachColor } from '@/lib/utils'
import { findExactFachMatch, normalizeFachName, rankFachSuggestions, SUGGEST_THRESHOLD } from '@/lib/fachMatch'
import { readLezioFiles, NEW_FACH, importDoneMsg } from '@/lib/lezioImport'
import type { LernzielKategorie, LezioExport, TagKategorie, Thema } from '@/types/domain'

const BUILTIN_KOLONNEN = [
  { id: 'fach',  label: 'Fach' },
  { id: 'typ',   label: 'Typ' },
  { id: 'stufe', label: 'Schulstufe' },
] as const

const MAX_SPALTEN = 5
const LS_KEY = 'lezio_lz_sichtbare_spalten'

// ── Create modal (Fach) ───────────────────────────────────────────────────

// ── Inline Lernziel section ───────────────────────────────────────────────

const ThemaLZSection = ({ themaId }: { themaId: string }) => {
  const { lernziele } = useData()
  const themaLZ = lernziele.filter(lz => lz.themaId === themaId)
  const grundlegendLZ = themaLZ.filter(lz => lz.kategorie === 'grundlegend')
  const anspruchsvollLZ = themaLZ.filter(lz => lz.kategorie === 'anspruchsvoll')

  return (
    <div className="border-t border-border/40 bg-muted/10">
      {/* Grundlegend */}
      <div className="border-b border-border/40">
        <div className="pl-10 pr-3 py-1 bg-muted/20">
          <span className="text-3xs font-semibold uppercase tracking-wide text-category-grundlegend-fg">Grundlegend</span>
        </div>
        <div className="divide-y divide-border/30">
          {grundlegendLZ.length === 0 && (
            <p className="pl-10 pr-3 py-1.5 text-3xs text-muted-foreground/50">Noch keine grundlegenden Lernziele.</p>
          )}
          {grundlegendLZ.map((lz, i) => (
            <div key={lz.id} className="flex items-center gap-2 pl-10 pr-3 py-1.5">
              <span className="w-4 shrink-0 text-3xs font-mono text-muted-foreground">{i + 1}</span>
              <span className="flex-1 text-xs leading-snug">{lz.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Anspruchsvoll */}
      <div>
        <div className="pl-10 pr-3 py-1 bg-muted/20">
          <span className="text-3xs font-semibold uppercase tracking-wide text-category-anspruchsvoll-fg">Anspruchsvoll</span>
        </div>
        <div className="divide-y divide-border/30">
          {anspruchsvollLZ.length === 0 && (
            <p className="pl-10 pr-3 py-1.5 text-3xs text-muted-foreground/50">Noch keine anspruchsvollen Lernziele.</p>
          )}
          {anspruchsvollLZ.map((lz, i) => (
            <div key={lz.id} className="flex items-center gap-2 pl-10 pr-3 py-1.5">
              <span className="w-4 shrink-0 text-3xs font-mono text-muted-foreground">{i + 1}</span>
              <span className="flex-1 text-xs leading-snug">{lz.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── AddSpalteButton ───────────────────────────────────────────────────────

const AddSpalteButton = ({
  aktiveKolonnen,
  tagKategorien,
  onAdd,
  onNewKategorie,
}: {
  aktiveKolonnen: string[]
  tagKategorien: TagKategorie[]
  onAdd: (id: string) => void
  onNewKategorie: () => void
}) => {
  const [open, setOpen] = useState(false)
  const atMax = aktiveKolonnen.length >= MAX_SPALTEN

  const builtinAvailable = BUILTIN_KOLONNEN.filter(k => !aktiveKolonnen.includes(k.id))
  const customAvailable = tagKategorien.filter(k => !aktiveKolonnen.includes(k.id))

  if (atMax) {
    return (
      <span className="flex items-center gap-1 rounded-full border border-status-partial-fg/25 bg-status-partial-soft px-3 py-1.5 text-xs text-status-partial-fg font-medium shrink-0">
        <span className="tabular-nums">{MAX_SPALTEN}/{MAX_SPALTEN}</span>
        <span className="text-status-partial-fg/70">Spalten</span>
      </span>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors shrink-0">
        <Icon name="add" size={12} />
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
                <Icon name="add" size={12} className="mr-1.5" />
                Neue Kategorie erstellen
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ── Thema Edit Modal ──────────────────────────────────────────────────────

const ThemaEditModal = ({ themaId, onClose, onRequestDelete }: {
  themaId: string
  onClose: () => void
  onRequestDelete: () => void
}) => {
  const {
    themen, faecher, lernziele, updateThema, exportThema,
    tagKategorien, deleteTagKategorie, getTagWerte, createTagKategorie,
    createLernziel, updateLernziel, deleteLernziel,
  } = useData()
  const thema = themen.find(t => t.id === themaId)
  const themaLZ = lernziele.filter(lz => lz.themaId === themaId)

  // Step
  const [editStep, setEditStep] = useState<'meta' | 'lernziele'>('meta')

  // Meta state
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
  const [deleteKatId, setDeleteKatId] = useState<string | null>(null)
  const [addValueKatId, setAddValueKatId] = useState<string | null>(null)
  const [newKatOpen, setNewKatOpen] = useState(false)

  // Lernziele state
  const [newLZG, setNewLZG] = useState('')
  const [newLZA, setNewLZA] = useState('')
  const [editLzId, setEditLzId] = useState<string | null>(null)
  const [editLzLabel, setEditLzLabel] = useState('')
  const [editLzKategorie, setEditLzKategorie] = useState<LernzielKategorie>('grundlegend')
  const [deleteLzId, setDeleteLzId] = useState<string | null>(null)

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
    setEditStep('meta')
  }, [themaId])

  if (!thema) return null

  const save = () => {
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

  const openRow = (id: string, isOpen: boolean) => {
    setOpenRowId(isOpen ? id : null)
  }

  const setTagValue = (katId: string, value: string) => {
    setLocalTagValues(prev => ({ ...prev, [katId]: prev[katId] === value ? '' : value }))
    setOpenRowId(null)
  }

  const renderSimpleOptions = (
    opts: { value: string; label: string }[],
    current: string,
    onSelect: (v: string) => void,
    clearLabel?: string
  ) => {
    return (
      <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto">
        {clearLabel && current && (
          <button
            onClick={() => { onSelect(''); setOpenRowId(null) }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted/60 text-left"
          >
            <Icon name="close" size={12} className="shrink-0" />{clearLabel}
          </button>
        )}
        {opts.map(opt => (
          <button
            key={opt.value}
            onClick={() => { onSelect(opt.value); setOpenRowId(null) }}
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors text-left',
              opt.value === current ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/60 text-foreground'
            )}
          >
            {opt.value === current
              ? <Icon name="check" size={12} className="shrink-0" />
              : <span className="size-3 shrink-0" />
            }
            {opt.label}
          </button>
        ))}
      </div>
    )
  }

  // Lernziele helpers
  const grundlegendLZ = themaLZ.filter(lz => lz.kategorie === 'grundlegend')
  const anspruchsvollLZ = themaLZ.filter(lz => lz.kategorie === 'anspruchsvoll')

  const addLZG = () => {
    if (!newLZG.trim()) return
    createLernziel(themaId, newLZG.trim(), 'grundlegend')
    setNewLZG('')
  }

  const addLZA = () => {
    if (!newLZA.trim()) return
    createLernziel(themaId, newLZA.trim(), 'anspruchsvoll')
    setNewLZA('')
  }

  const saveLZ = (id: string) => {
    if (!editLzLabel.trim()) return
    updateLernziel(id, { label: editLzLabel.trim(), kategorie: editLzKategorie })
    setEditLzId(null)
  }

  const renderLZRow = (lz: (typeof themaLZ)[number], idx: number) => {
    return (
      <div key={lz.id} className="group flex items-center gap-2 py-1.5 hover:bg-accent/20 transition-colors px-1">
        <span className="w-4 shrink-0 text-3xs font-mono text-muted-foreground">{idx + 1}</span>
        {editLzId === lz.id ? (
          <>
            <div className="flex rounded border overflow-hidden shrink-0 h-6">
              {(['grundlegend', 'anspruchsvoll'] as LernzielKategorie[]).map(k => (
                <button key={k} onClick={() => setEditLzKategorie(k)}
                  className={cn(
                    'px-1.5 text-4xs font-medium transition-colors',
                    editLzKategorie === k
                      ? k === 'grundlegend' ? 'bg-category-grundlegend text-white' : 'bg-category-anspruchsvoll text-white'
                      : 'bg-background text-muted-foreground hover:bg-muted',
                  )}>
                  {k === 'grundlegend' ? 'G' : 'A'}
                </button>
              ))}
            </div>
            <Input value={editLzLabel}
              onChange={e => setEditLzLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveLZ(lz.id); if (e.key === 'Escape') setEditLzId(null) }}
              className="h-6 text-xs flex-1 px-1.5" autoFocus />
            <Button size="icon-sm" variant="ghost" onClick={() => saveLZ(lz.id)}>
              <Icon name="check" size={12} className="text-status-reached" />
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={() => setEditLzId(null)}>
              <Icon name="close" size={12} />
            </Button>
          </>
        ) : (
          <>
            <span className="flex-1 text-xs leading-snug">{lz.label}</span>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Button size="icon-sm" variant="ghost"
                onClick={() => { setEditLzId(lz.id); setEditLzLabel(lz.label); setEditLzKategorie(lz.kategorie) }}
                aria-label="Bearbeiten">
                <Icon name="edit" size={12} />
              </Button>
              <Button size="icon-sm" variant="ghost"
                className="text-destructive/70 hover:text-destructive"
                onClick={() => setDeleteLzId(lz.id)} aria-label="Löschen">
                <Icon name="delete" size={12} />
              </Button>
            </div>
          </>
        )}
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
          editStep === 'meta' ? (
            <div className="flex items-center justify-between w-full gap-2">
              <button
                onClick={onRequestDelete}
                className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 transition-colors px-2 py-1 rounded-lg hover:bg-destructive/8"
              >
                <Icon name="delete" size={14} />
                Löschen
              </button>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => exportThema(themaId)} aria-label="Exportieren" className="text-muted-foreground">
                  <Icon name="download" size={14} />
                </Button>
                <Button size="sm" variant="outline" onClick={onClose}>Abbrechen</Button>
                <Button size="sm" onClick={() => setEditStep('lernziele')} disabled={!localName.trim()}>
                  Weiter <Icon name="chevron_right" size={14} className="ml-0.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditStep('meta')} className="text-muted-foreground">
                <Icon name="chevron_left" size={14} className="mr-0.5" /> Zurück
              </Button>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={onClose}>Abbrechen</Button>
                <Button size="sm" onClick={save} disabled={!localName.trim()}>Fertig</Button>
              </div>
            </div>
          )
        }
      >
        {/* Step 1: Meta */}
        {editStep === 'meta' && (
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

              {/* Tag categories — one row each, list with add-value dialog */}
              {tagKategorien.map(kat => {
                const currentVal = localTagValues[kat.id] ?? ''
                const allVals = getTagWerte(kat.id)

                return (
                  <ModalRow
                    key={kat.id}
                    label={kat.name}
                    displayValue={currentVal || undefined}
                    open={openRowId === kat.id}
                    onOpenChange={v => openRow(kat.id, v)}
                  >
                    {renderSimpleOptions(
                      allVals.map(v => ({ value: v, label: v })),
                      currentVal,
                      v => setTagValue(kat.id, v),
                      'Auswahl aufheben',
                    )}
                    <div className="border-t border-border/40 mt-0.5 pt-0.5">
                      <button
                        onClick={() => setAddValueKatId(kat.id)}
                        className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs text-primary hover:bg-primary/5 transition-colors"
                      >
                        <Icon name="add" size={12} className="shrink-0" />
                        Wert hinzufügen
                      </button>
                      <button
                        onClick={() => { setDeleteKatId(kat.id); setOpenRowId(null) }}
                        className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                      >
                        <Icon name="delete" size={12} className="shrink-0" />
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
                <Icon name="add" size={12} />
                Kategorie hinzufügen
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Lernziele */}
        {editStep === 'lernziele' && (
          <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden">
            {/* Grundlegend */}
            <div className="border-b border-border/40">
              <div className="py-1 bg-muted/20 px-1">
                <span className="text-3xs font-semibold uppercase tracking-wide text-category-grundlegend-fg">Grundlegend</span>
              </div>
              <div className="divide-y divide-border/30">
                {grundlegendLZ.length === 0 && (
                  <p className="py-1.5 px-1 text-3xs text-muted-foreground/50">Noch keine grundlegenden Lernziele.</p>
                )}
                {grundlegendLZ.map((lz, i) => renderLZRow(lz, i))}
              </div>
              <div className="py-1.5 px-1 flex items-center gap-1.5 border-t border-border/30">
                <Input value={newLZG} onChange={e => setNewLZG(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addLZG()}
                  placeholder="Grundlegendes Lernziel…" className="h-6 text-xs flex-1" />
                <Button size="icon-sm" variant="outline" onClick={addLZG} disabled={!newLZG.trim()}>
                  <Icon name="add" size={12} />
                </Button>
              </div>
            </div>

            {/* Anspruchsvoll */}
            <div>
              <div className="py-1 bg-muted/20 px-1">
                <span className="text-3xs font-semibold uppercase tracking-wide text-category-anspruchsvoll-fg">Anspruchsvoll</span>
              </div>
              <div className="divide-y divide-border/30">
                {anspruchsvollLZ.length === 0 && (
                  <p className="py-1.5 px-1 text-3xs text-muted-foreground/50">Noch keine anspruchsvollen Lernziele.</p>
                )}
                {anspruchsvollLZ.map((lz, i) => renderLZRow(lz, i))}
              </div>
              <div className="py-1.5 px-1 flex items-center gap-1.5 border-t border-border/30">
                <Input value={newLZA} onChange={e => setNewLZA(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addLZA()}
                  placeholder="Anspruchsvolles Lernziel…" className="h-6 text-xs flex-1" />
                <Button size="icon-sm" variant="outline" onClick={addLZA} disabled={!newLZA.trim()}>
                  <Icon name="add" size={12} />
                </Button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={!!deleteKatId}
          onOpenChange={(o) => { if (!o) setDeleteKatId(null) }}
          title="Kategorie löschen"
          description="Soll diese Tag-Kategorie wirklich gelöscht werden? Alle zugewiesenen Werte in den Themen bleiben erhalten, sind aber nicht mehr filterbar."
          confirmLabel="Löschen"
          onConfirm={() => { if (deleteKatId) { deleteTagKategorie(deleteKatId); setDeleteKatId(null) } }}
        />

        <ConfirmDialog
          open={!!deleteLzId}
          onOpenChange={(o) => { if (!o) setDeleteLzId(null) }}
          title="Lernziel löschen"
          description="Soll dieses Lernziel wirklich dauerhaft gelöscht werden?"
          confirmLabel="Löschen"
          onConfirm={() => { if (deleteLzId) deleteLernziel(deleteLzId) }}
        />
      </Modal>

      <InputModal
        open={newKatOpen}
        onOpenChange={setNewKatOpen}
        title="Neue Tag-Kategorie"
        label="Bezeichnung"
        placeholder="z. B. Semester, Lerngruppe …"
        onSubmit={(name) => { createTagKategorie(name) }}
      />

      <InputModal
        open={!!addValueKatId}
        onOpenChange={(o) => { if (!o) setAddValueKatId(null) }}
        title="Wert hinzufügen"
        label="Wert"
        placeholder="z. B. 1"
        onSubmit={(v) => { if (addValueKatId) setTagValue(addValueKatId, v) }}
      />
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

const LernzielePage = () => {
  const { faecher, themen, lernziele, createFach, exportThema, exportFach, importThemaData, deleteThema, deleteFach, tagKategorien, createTagKategorie, getTagWerte, loadError, reloadData } = useData()

  const [aktiveKolonnen, setAktiveKolonnen] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '["fach","typ"]') }
    catch { return ['fach', 'typ'] }
  })
  const [kolonnenFilter, setKolonnenFilter] = useState<Record<string, string>>({})
  const [katCreateOpen, setKatCreateOpen] = useState(false)
  const [expandedThemen, setExpandedThemen] = useState<Set<string>>(new Set())
  const [collapsedFaecher, setCollapsedFaecher] = useState<Set<string>>(new Set())
  const [fachCreateOpen, setFachCreateOpen] = useState(false)
  const [fachCreateMode, setFachCreateMode] = useState<'withThema' | 'only'>('withThema')
  const [themaCreateFachId, setThemaCreateFachId] = useState<string | null>(null)
  const [themaPickerFachId, setThemaPickerFachId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [importFeedback, setImportFeedback] = useState<{ ok: boolean; msg: string } | null>(null)
  // Mehrfach-Import: geparste Themen + Zuordnungs-Maske für alle distinkten Fächernamen
  const [importItems, setImportItems] = useState<{ source: string; data: LezioExport }[]>([])
  const [distinctFaecher, setDistinctFaecher] = useState<{ name: string; count: number }[]>([])
  const [fachChoice, setFachChoice] = useState<Record<string, string>>({})
  const [fachZuordnenOpen, setFachZuordnenOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editThemaId, setEditThemaId] = useState<string | null>(null)
  const [deleteThemaId, setDeleteThemaId] = useState<string | null>(null)
  const [deleteFachId, setDeleteFachId] = useState<string | null>(null)

  const toggleThema = (id: string) => {
    setExpandedThemen(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const toggleFach = (id: string) => {
    setCollapsedFaecher(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const handleFachCreated = (name: string) => {
    const newFachId = createFach(name)
    setFachCreateOpen(false)
    setThemaCreateFachId(newFachId)
  }

  const handleFachOnlyCreated = (name: string) => {
    createFach(name)
    setFachCreateOpen(false)
  }

  const handlePickerNeuErstellen = () => {
    setThemaCreateFachId(themaPickerFachId)
    setThemaPickerFachId(null)
  }

  const handlePickerImportieren = () => {
    setThemaPickerFachId(null)
    // 50ms defer: Radix Dialog must unmount before native file dialog opens
    setTimeout(() => fileInputRef.current?.click(), 50)
  }

  const addKolonne = (id: string) => {
    if (aktiveKolonnen.length >= MAX_SPALTEN || aktiveKolonnen.includes(id)) return
    const next = [...aktiveKolonnen, id]
    setAktiveKolonnen(next)
    localStorage.setItem(LS_KEY, JSON.stringify(next))
  }

  const removeKolonne = (id: string) => {
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

  const showImportFeedback = (ok: boolean, msg: string) => {
    setImportFeedback({ ok, msg })
    setTimeout(() => setImportFeedback(null), 4000)
  }

  // Importiert alle Themen mit aufgelösten fachIds (normKey → fachId).
  const runImport = (items: { data: LezioExport }[], fachByKey: Record<string, string>) => {
    for (const { data } of items) {
      const fachId = fachByKey[normalizeFachName(data.fachName)]
      if (fachId) importThemaData(data, fachId)
    }
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return

    const { items, errors } = await readLezioFiles(files)
    if (items.length === 0) {
      showImportFeedback(false, 'Keine gültigen Lernziel-Dateien gefunden.')
      return
    }

    // Distinkte Fächernamen sammeln (normalisierter Schlüssel → Anzeigename + Anzahl Themen).
    // Gleiche Bezeichnungen werden zusammengefasst (10× „Mathe" → 1 Eintrag mit count 10).
    const distinctMap = new Map<string, { name: string; count: number }>()
    for (const { data } of items) {
      const key = normalizeFachName(data.fachName)
      const entry = distinctMap.get(key)
      if (entry) entry.count++
      else distinctMap.set(key, { name: data.fachName, count: 1 })
    }
    const distinct = [...distinctMap.values()]

    // Vorbelegung pro Fach: exakter Treffer → dessen Fach; sonst guter Vorschlag; sonst „neu anlegen"
    const choice: Record<string, string> = {}
    for (const { name } of distinct) {
      const key = normalizeFachName(name)
      const exact = findExactFachMatch(name, faecher)
      if (exact) { choice[key] = exact.id; continue }
      const [best] = rankFachSuggestions(name, faecher)
      choice[key] = best && best.score >= SUGGEST_THRESHOLD ? best.fach.id : NEW_FACH
    }

    setImportItems(items)
    setDistinctFaecher(distinct)
    setFachChoice(choice)
    setFachZuordnenOpen(true)
    if (errors > 0) showImportFeedback(false, `${errors} Datei(en) konnten nicht gelesen werden.`)
  }

  const handleZuordnenConfirm = () => {
    const fachByKey: Record<string, string> = {}
    let neueFaecher = 0
    for (const { name } of distinctFaecher) {
      const key = normalizeFachName(name)
      const sel = fachChoice[key]
      if (sel === NEW_FACH) {
        fachByKey[key] = createFach(name)
        neueFaecher++
      } else if (sel) {
        fachByKey[key] = sel
      }
    }
    runImport(importItems, fachByKey)
    const count = importItems.length
    closeZuordnen()
    showImportFeedback(true, importDoneMsg(count, neueFaecher, 0))
  }

  const closeZuordnen = () => {
    setFachZuordnenOpen(false)
    setImportItems([])
    setDistinctFaecher([])
    setFachChoice({})
  }

  const renderChips = (thema: Thema) => {
    const fachIdList = faecher.map(f => f.id)
    return aktiveKolonnen.flatMap((spalteId, idx) => {
      if (spalteId === 'fach') {
        const fach = faecher.find(f => f.id === thema.fachId)
        if (!fach) return []
        const color = getFachColor(thema.fachId, fachIdList, fach?.colorIndex)
        return [<span key="fach" className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-3xs font-medium', color.bg)}>{fach.name}</span>]
      }
      if (spalteId === 'typ') {
        return thema.typ === 'rilz'
          ? [<span key="typ" className="shrink-0 rounded px-1.5 py-0.5 text-3xs font-medium bg-rilz-soft text-rilz-foreground">RILZ</span>]
          : [<span key="typ" className="shrink-0 rounded px-1.5 py-0.5 text-3xs font-medium bg-muted text-muted-foreground">Standard</span>]
      }
      if (spalteId === 'stufe') {
        if (!thema.stufe?.length) return []
        return [<span key="stufe" className="shrink-0 text-3xs rounded px-1.5 py-0.5 bg-muted text-muted-foreground">Kl. {thema.stufe[0]}</span>]
      }
      const vals = thema.tags?.[spalteId]
      if (!vals?.length) return []
      return vals.map(v => (
        <span key={`${idx}-${v}`} className="shrink-0 rounded-full px-1.5 py-0.5 text-3xs font-medium bg-accent text-accent-foreground">{v}</span>
      ))
    })
  }

  return (
    <div className="page-container py-8">

      {/* Empty / load-error state */}
      {faecher.length === 0 && (
        loadError ? (
          <EmptyState
            size="lg"
            icon={<Icon name="cloud_off" size={24} className="text-accent-foreground" />}
            title="Daten konnten nicht geladen werden"
            description="Prüfe deine Internetverbindung und versuche es erneut."
            action={
              <Button variant="outline" onClick={() => reloadData()}>
                Erneut laden
              </Button>
            }
          />
        ) : (
          <EmptyState
            size="lg"
            icon={<Icon name="menu_book" size={24} className="text-accent-foreground" />}
            title="Noch keine Fächer angelegt"
            description="Erstelle dein erstes Fach, um Lernziele zu verwalten."
            action={
              <Button onClick={() => { setFachCreateMode('withThema'); setFachCreateOpen(true) }}>
                Erstes Fach erstellen
              </Button>
            }
          />
        )
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
                  ...faecherMitThemen.map(f => ({ value: f.id, label: f.name, dot: getFachColor(f.id, faecher.map(x => x.id), f.colorIndex).dot })),
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
                <FilterDropdown
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
                <Icon name="close" size={12} /> Filter zurücksetzen
              </button>
            )}

          </div>

          {/* Search + Import row */}
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Thema suchen…"
            className="mb-6"
            right={<>
              {importFeedback && (
                <span className={cn('self-center text-xs', importFeedback.ok ? 'text-status-reached' : 'text-status-not-reached')}>
                  {importFeedback.msg}
                </span>
              )}
              <Button size="sm" className="h-auto" onClick={() => fileInputRef.current?.click()}>
                <Icon name="upload" size={14} /> Importieren
              </Button>
            </>}
          />

          {/* Table */}
          {!hasAnyThemen && hasActiveFilters ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Keine Themen entsprechen den gewählten Filtern.
            </p>
          ) : !hasAnyThemen ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-14 text-center">
              <p className="text-sm font-medium text-muted-foreground">Noch keine Themen angelegt</p>
              {newThemaFachId && (
                <Button size="sm" variant="outline" onClick={() => setThemaPickerFachId(newThemaFachId)}>
                  <Icon name="add" size={12} /> Erstes Thema erstellen
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {tableData.map(({ fach, themen: fachThemen }) => {
                const fachColor = getFachColor(fach.id, faecher.map(f => f.id), fach.colorIndex)
                const fachCollapsed = collapsedFaecher.has(fach.id)
                const fachLZCount = fachThemen.reduce((s, t) => s + lernziele.filter(lz => lz.themaId === t.id).length, 0)
                return (
                  <div key={fach.id} className={cn(
                    'rounded-2xl border bg-card overflow-hidden shadow-sm border-l-4',
                    fachColor.border,
                  )}>
                    {/* Fach header */}
                    <div className={cn('group flex items-center gap-2 px-3 py-1.5 select-none', fachColor.bg)}>
                      <button
                        onClick={() => toggleFach(fach.id)}
                        className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                      >
                        {fachCollapsed
                          ? <Icon name="chevron_right" size={14} className="text-muted-foreground shrink-0" />
                          : <Icon name="expand_more" size={14} className="text-muted-foreground shrink-0" />
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
                        <Icon name="download" size={14} />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={e => { e.stopPropagation(); setDeleteFachId(fach.id) }}
                        aria-label={`${fach.name} löschen`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-destructive"
                      >
                        <Icon name="delete" size={14} />
                      </Button>
                    </div>

                    {!fachCollapsed && (
                      <div className="divide-y divide-border/40">
                        {fachThemen.map(thema => {
                              const isExpanded = expandedThemen.has(thema.id)

                              return (
                                <div key={thema.id}>
                                  <div className="group flex items-center gap-2 px-3 py-2 hover:bg-accent/20 transition-colors">
                                    {/* Name inline with Stufe-Chip und RILZ-Badge */}
                                    <button
                                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                      onClick={() => toggleThema(thema.id)}
                                    >
                                      {isExpanded
                                        ? <Icon name="expand_more" size={12} className="text-muted-foreground shrink-0" />
                                        : <Icon name="chevron_right" size={12} className="text-muted-foreground shrink-0" />
                                      }
                                      <span className="text-sm font-medium truncate">{thema.name}</span>
                                      {renderChips(thema)}
                                    </button>

                                    {/* Actions — hover reveal */}
                                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        onClick={e => { e.stopPropagation(); setEditThemaId(thema.id) }}
                                        aria-label="Thema bearbeiten"
                                      >
                                        <Icon name="edit" size={14} />
                                      </Button>
                                      <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        className="text-muted-foreground"
                                        onClick={e => { e.stopPropagation(); exportThema(thema.id) }}
                                        aria-label="Thema exportieren"
                                      >
                                        <Icon name="download" size={12} />
                                      </Button>
                                    </div>
                                  </div>

                                  {isExpanded && <ThemaLZSection themaId={thema.id} />}
                                </div>
                              )
                            })}

                        {fachThemen.length === 0 && (
                          <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground">
                            {hasActiveFilters ? 'Keine Themen entsprechen den Filtern.' : 'Noch keine Themen angelegt.'}
                          </div>
                        )}

                        <button
                          onClick={() => setThemaPickerFachId(fach.id)}
                          className="flex w-full items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground/60 hover:text-primary hover:bg-accent/20 transition-colors">
                          <Icon name="add" size={12} /> Thema hinzufügen
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Neues Fach — ganz unten in der Lernzielsammlung */}
          <button
            onClick={() => { setFachCreateMode('only'); setFachCreateOpen(true) }}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border py-2 text-xs text-muted-foreground hover:text-primary hover:bg-accent/20 transition-colors"
          >
            <Icon name="add" size={12} /> Neues Fach
          </button>
        </>
      )}

      <InputModal
        open={fachCreateOpen} onOpenChange={setFachCreateOpen}
        title="Neues Fach" label="Fachbezeichnung" placeholder="z. B. Mathematik"
        onSubmit={fachCreateMode === 'only' ? handleFachOnlyCreated : handleFachCreated}
      />

      <InputModal
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

      {themaPickerFachId && (
        <ThemaAddPickerModal
          open={!!themaPickerFachId}
          onOpenChange={(o) => { if (!o) setThemaPickerFachId(null) }}
          fachName={faecher.find(f => f.id === themaPickerFachId)?.name ?? ''}
          onImportieren={handlePickerImportieren}
          onNeuErstellen={handlePickerNeuErstellen}
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
      <ConfirmDialog
        open={!!deleteFachId}
        onOpenChange={(o) => { if (!o) setDeleteFachId(null) }}
        title="Fach löschen"
        description="Soll dieses Fach mit allen zugehörigen Themen und Lernzielen wirklich dauerhaft gelöscht werden?"
        confirmLabel="Löschen"
        onConfirm={() => { if (deleteFachId) { deleteFach(deleteFachId); setDeleteFachId(null) } }}
      />

      <Modal
        open={fachZuordnenOpen}
        onOpenChange={(o) => { if (!o) closeZuordnen() }}
        title="Fächer zuordnen"
        description={`${distinctFaecher.length} ${distinctFaecher.length === 1 ? 'Fach' : 'Fächer'} · ${importItems.length} ${importItems.length === 1 ? 'Thema' : 'Themen'} importieren. Ordne jedes Fach einem deiner Fächer zu oder lege es neu an:`}
        size="md"
      >
        <div className="flex flex-col divide-y divide-border/40">
          {distinctFaecher.map(({ name, count }) => {
            const key = normalizeFachName(name)
            return (
              <FachZuordnenRow
                key={key}
                importName={name}
                count={count}
                faecher={faecher}
                value={fachChoice[key] ?? NEW_FACH}
                onChange={(v) => setFachChoice(prev => ({ ...prev, [key]: v }))}
              />
            )
          })}
        </div>
        <div className="mt-4 flex justify-end gap-2 border-t pt-3">
          <Button variant="outline" size="sm" onClick={closeZuordnen}>Abbrechen</Button>
          <Button size="sm" onClick={handleZuordnenConfirm}>Importieren</Button>
        </div>
      </Modal>

      <input
        ref={fileInputRef}
        type="file"
        accept=".lezio,.json,.zip"
        multiple
        className="hidden"
        onChange={handleImportFile}
      />
    </div>
  )
}

export default LernzielePage
