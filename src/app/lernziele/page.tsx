'use client'

import { useEffect, useState } from 'react'
import {
  BookOpen, ChevronDown, ChevronRight, PencilLine, Plus,
  X, Check, GraduationCap, Trash2, Search,
} from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Modal } from '@/components/shared/Modal'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
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

// ── Create Thema modal ────────────────────────────────────────────────────

function CreateThemaModal({ open, onOpenChange, fachId }: {
  open: boolean; onOpenChange: (v: boolean) => void; fachId: string
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
    createThema(fachId, name.trim(), typ, typ === 'rilz' && standardThemaId ? standardThemaId : undefined)
    onOpenChange(false)
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
  const { faecher, themen, lernziele, classes, createFach } = useData()

  const [activeTab, setActiveTab] = useState<string | 'alle'>('alle')
  const [expandedThemen, setExpandedThemen] = useState<Set<string>>(new Set())
  const [collapsedFaecher, setCollapsedFaecher] = useState<Set<string>>(new Set())
  const [fachCreateOpen, setFachCreateOpen] = useState(false)
  const [themaCreateFachId, setThemaCreateFachId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
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

  const hasActiveFilters = activeTab !== 'alle' || zyklusFilter !== 'alle' || typFilter !== 'alle' || q

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
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Fach */}
            <Select
              value={activeTab}
              onValueChange={v => {
                if (!v) return
                if (v === '__new_fach__') { setFachCreateOpen(true) }
                else { setActiveTab(v) }
              }}
            >
              <SelectTrigger className="min-w-[160px] h-10 font-medium">
                <span className="flex items-center gap-2 flex-1 text-left min-w-0">
                  {activeTab !== 'alle' && (
                    <span className={cn('size-2.5 rounded-full shrink-0', getFachColor(activeTab, faecher.map(f => f.id)).dot)} />
                  )}
                  <span className="truncate">
                    {activeTab === 'alle' ? 'Alle Fächer' : faecher.find(f => f.id === activeTab)?.name ?? 'Alle Fächer'}
                  </span>
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Fächer</SelectItem>
                {faecher.map(f => {
                  const fc = getFachColor(f.id, faecher.map(fx => fx.id))
                  return (
                    <SelectItem key={f.id} value={f.id}>
                      <span className="flex items-center gap-2">
                        <span className={cn('size-2 rounded-full shrink-0', fc.dot)} />
                        {f.name}
                      </span>
                    </SelectItem>
                  )
                })}
                <SelectItem value="__new_fach__">
                  <span className="flex items-center gap-2 text-primary">
                    <Plus className="size-3.5" /> Neues Fach
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Zyklus */}
            <Select value={String(zyklusFilter)} onValueChange={v => setZyklusFilter(v === 'alle' ? 'alle' : Number(v))}>
              <SelectTrigger className="min-w-[140px] h-10 font-medium">
                <span className="flex-1 text-left truncate">
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

            {/* Typ */}
            <Select value={typFilter} onValueChange={v => setTypFilter(v as 'alle' | 'standard' | 'rilz')}>
              <SelectTrigger className="min-w-[140px] h-10 font-medium">
                <span className="flex-1 text-left truncate">
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
                onClick={() => { setSearch(''); setZyklusFilter('alle'); setTypFilter('alle'); setActiveTab('alle') }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-3" /> Filter zurücksetzen
              </button>
            )}

            {/* Search — far right */}
            <div className="relative ml-auto min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Thema suchen…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>

            {newThemaFachId && (
              <Button size="sm" onClick={() => setThemaCreateFachId(newThemaFachId)}>
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
                  'rounded-xl border bg-card overflow-hidden shadow-sm border-l-4',
                  fachColor.border,
                )}>
                  {/* Fach header */}
                  <div className={cn('flex items-center gap-2 px-3 py-1.5 select-none', fachColor.bg)}>
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
                                <div className="flex items-center gap-2 px-3 py-2 hover:bg-accent/20 transition-colors">
                                  <button
                                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                    onClick={() => toggleThema(thema.id)}>
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
                                  </button>

                                  {zyklusLabel && (
                                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
                                      {zyklusLabel}
                                    </span>
                                  )}

                                  {stufeLabel && (
                                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
                                      {stufeLabel}
                                    </span>
                                  )}

                                  {assignedClasses.length > 0 && (
                                    <span className="hidden sm:flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary shrink-0 max-w-[90px]">
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
    </div>
  )
}
