'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  SquarePen, Plus, UserRound,
  ChevronDown, ChevronRight, Trash2,
  Info, Pencil, PencilLine, Calendar, BookMarked, BarChart2,
} from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { ClassAnalytics } from '@/components/analytics/ClassAnalytics'
import { BeurteilungTab } from '@/components/beurteilung/BeurteilungTab'
import { BerichteTab } from '@/components/berichte/BerichteTab'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { AddThemenModal } from '@/components/shared/AddThemenModal'
import { CreateThemaModal } from '@/components/shared/CreateThemaModal'
import { Modal } from '@/components/shared/Modal'
import { EmptyState } from '@/components/shared/EmptyState'
import { PillTabs } from '@/components/shared/PillTabs'
import { SearchBar } from '@/components/shared/SearchBar'
import { cn, getFachColor, scoreColor, categoryChipClasses } from '@/lib/utils'
import { getInitials, getAvatarColor } from '@/lib/avatar-utils'

import type { Schueler, Lernziel as LernzielType, Fach, Thema, RilzLernziel } from '@/types/domain'


function compPct(student: Schueler, comps: { id: string }[]): number {
  if (comps.length === 0) return 0
  const reached = comps.filter(c => student.competencyStatus[c.id] === 'reached').length
  const partial = comps.filter(c => student.competencyStatus[c.id] === 'partially_reached').length
  return ((reached + partial * 0.5) / comps.length) * 100
}

// ── Student form modal ─────────────────────────────────────────────────────

function SchuelerFormModal({
  open, onOpenChange, initialVorname = '', initialNachname = '', onSubmit,
}: {
  open: boolean; onOpenChange: (v: boolean) => void
  initialVorname?: string; initialNachname?: string
  onSubmit: (vorname: string, nachname: string) => void
}) {
  const [vorname, setVorname] = useState(initialVorname)
  const [nachname, setNachname] = useState(initialNachname)
  useEffect(() => {
    if (open) { setVorname(initialVorname); setNachname(initialNachname) }
  }, [open, initialVorname, initialNachname])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!vorname.trim() && !nachname.trim()) return
    onSubmit(vorname.trim(), nachname.trim())
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Neuer Schüler"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={() => handleSubmit()}>Speichern</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="schueler-vorname">Vorname</Label>
          <Input
            id="schueler-vorname"
            value={vorname}
            onChange={(e) => setVorname(e.target.value)}
            placeholder="Vorname"
            autoFocus
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="schueler-nachname">Nachname</Label>
          <Input
            id="schueler-nachname"
            value={nachname}
            onChange={(e) => setNachname(e.target.value)}
            placeholder="Nachname"
          />
        </div>
      </form>
    </Modal>
  )
}

// ── Tab switcher ──────────────────────────────────────────────────────────

type Tab = 'schueler' | 'klassenübersicht' | 'lernziele' | 'beurteilung' | 'berichte'

function TabBar({
  active, onChange,
  title, editingTitle, onEditTitle, editNode,
}: {
  active: Tab; onChange: (t: Tab) => void
  title: string; editingTitle: boolean; onEditTitle: () => void; editNode: React.ReactNode
}) {
  const tabs: { key: Tab; label: string }[] = [
    { key: 'schueler',         label: 'Schüler' },
    { key: 'beurteilung',      label: 'Beurteilung' },
    { key: 'klassenübersicht', label: 'Statistiken' },
    { key: 'lernziele',        label: 'Lernziele' },
    { key: 'berichte',         label: 'Berichte' },
  ]
  const leading = editingTitle ? (
    <div className="flex items-center pr-2 mr-1 border-r border-border shrink-0">
      {editNode}
    </div>
  ) : (
    <span className="flex items-center gap-1 pl-1 pr-3 mr-1 border-r border-border shrink-0">
      <span className="text-sm font-semibold whitespace-nowrap">{title}</span>
      <button
        onClick={onEditTitle}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Klassenname bearbeiten"
      >
        <SquarePen className="size-3.5" />
      </button>
    </span>
  )
  return (
    <div className="overflow-x-auto scrollbar-hide mb-2">
      <PillTabs options={tabs} value={active} onChange={onChange} leading={leading} />
    </div>
  )
}

// ── Settings card wrapper ──────────────────────────────────────────────────

function SettingsCard({ title, children, action }: {
  title: string; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

// ── Kategorisierung modal (RILZ + BVSA per student) ───────────────────────

function Toggle({ on, color = 'bg-primary' }: { on: boolean; color?: string }) {
  return (
    <div className={cn(
      'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors pointer-events-none',
      on ? color : 'bg-muted',
    )}>
      <span className={cn(
        'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
        on ? 'translate-x-4' : 'translate-x-0',
      )} />
    </div>
  )
}

function SchuelerBearbeitenModal({
  open, onOpenChange, studentId, students, faecher, setRilzFach, setBvsa, updateStudent, deleteStudent,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  studentId: string | null
  students: Schueler[]
  faecher: Fach[]
  setRilzFach: (studentId: string, fachId: string, enabled: boolean) => void
  setBvsa: (studentId: string, enabled: boolean) => void
  updateStudent: (id: string, patch: Partial<Pick<Schueler, 'vorname' | 'nachname'>>) => void
  deleteStudent: (id: string) => void
}) {
  const [vorname, setVorname] = useState('')
  const [nachname, setNachname] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const student = students.find(s => s.id === studentId)

  useEffect(() => {
    if (open && student) {
      setVorname(student.vorname)
      setNachname(student.nachname)
    }
  }, [open, studentId])

  if (!student) return null

  const handleSave = () => {
    if (vorname.trim() || nachname.trim()) {
      updateStudent(student.id, { vorname: vorname.trim(), nachname: nachname.trim() })
    }
    onOpenChange(false)
  }

  return (
    <>
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title="Schüler bearbeiten"
        size="sm"
        footer={
          <div className="flex items-center justify-between w-full gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              className="text-destructive hover:text-destructive/80 hover:bg-destructive/8"
            >
              <Trash2 className="size-3.5" />
              Löschen
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Abbrechen</Button>
              <Button size="sm" onClick={handleSave}>Speichern</Button>
            </div>
          </div>
        }
      >
        <div className="space-y-2.5">
          {/* Name fields side by side */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label htmlFor="edit-vorname" className="text-xs text-muted-foreground">Vorname</Label>
              <Input
                id="edit-vorname"
                value={vorname}
                onChange={e => setVorname(e.target.value)}
                placeholder="Vorname"
                className="h-8 text-sm"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-nachname" className="text-xs text-muted-foreground">Nachname</Label>
              <Input
                id="edit-nachname"
                value={nachname}
                onChange={e => setNachname(e.target.value)}
                placeholder="Nachname"
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Toggles card */}
          <div className="rounded-2xl border border-border overflow-hidden divide-y divide-border/60 bg-muted/20">
            {/* BVSA */}
            <div
              className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent/30 transition-colors"
              onClick={() => setBvsa(student.id, !student.bvsa)}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">BVSA</p>
                <p className="text-[11px] text-muted-foreground leading-tight">Bericht ohne Noten</p>
              </div>
              <Toggle on={!!student.bvsa} color="bg-category-bvsa-fg" />
            </div>

            {/* RILZ divider label */}
            {faecher.length > 0 && (
              <div className="px-3 py-1 bg-muted/40">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  RILZ — Reduzierte Lernziele
                </p>
              </div>
            )}

            {/* RILZ per Fach */}
            {faecher.map(fach => {
              const hasRilz = (student.rilzFachIds ?? []).includes(fach.id)
              return (
                <div
                  key={fach.id}
                  className="flex items-center justify-between px-3 py-1.5 cursor-pointer hover:bg-accent/30 transition-colors"
                  onClick={() => setRilzFach(student.id, fach.id, !hasRilz)}
                >
                  <span className="text-sm">{fach.name}</span>
                  <Toggle on={hasRilz} color="bg-rilz" />
                </div>
              )
            })}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Schüler löschen"
        description={`Soll „${student.vorname} ${student.nachname}" wirklich aus der Klasse entfernt werden?`}
        confirmLabel="Löschen"
        onConfirm={() => { deleteStudent(student.id); onOpenChange(false) }}
      />
    </>
  )
}

// ── Lernziele tab ─────────────────────────────────────────────────────────

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-200 text-amber-900 rounded-sm px-px">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

function LernzielPopup({ lz, onClose }: { lz: LernzielType; onClose: () => void }) {
  return (
    <Modal open onOpenChange={(v) => { if (!v) onClose() }} title={lz.label} size="sm">
      {(lz.kriterien?.length ?? 0) === 0 ? (
        <p className="text-sm text-muted-foreground">Keine Kriterien hinterlegt.</p>
      ) : (
        <ul className="space-y-2">
          {lz.kriterien!.map((k, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <span className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
              {k}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}

function KlassenThemaEditModal({ themaId, klassId, allowRemove, onClose }: {
  themaId: string; klassId: string; allowRemove: boolean; onClose: () => void
}) {
  const { themen, updateThema, removeThemaFromKlasse } = useData()
  const thema = themen.find(t => t.id === themaId)!
  const [name, setName] = useState(thema.name)
  const [faelligAm, setFaelligAm] = useState(thema.faelligAm ?? '')

  function save() {
    updateThema(themaId, { name: name.trim() || thema.name, faelligAm: faelligAm || undefined })
    onClose()
  }
  function remove() {
    removeThemaFromKlasse(klassId, themaId)
    onClose()
  }

  return (
    <Modal open onOpenChange={v => !v && onClose()} title="Thema bearbeiten" size="sm"
      footer={
        <div className="flex w-full items-center gap-2">
          {allowRemove && (
            <Button variant="outline" className="text-destructive hover:text-destructive border-destructive/30" onClick={remove}>
              Aus Klasse entfernen
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={save} disabled={!name.trim()}>Speichern</Button>
        </div>
      }
    >
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label>Themabezeichnung</Label>
          <Input value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>
        <div className="grid gap-1.5">
          <Label>Fällig am <span className="font-normal text-muted-foreground">(opt.)</span></Label>
          <div className="relative">
            <Input
              type="date"
              value={faelligAm}
              onChange={e => setFaelligAm(e.target.value)}
              className="pr-8 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
            <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>
    </Modal>
  )
}

function LernzieleTab({ klassId }: { klassId: string }) {
  const {
    getClass,
    faecher, themen, lernziele,
    assignThemaToKlasse, removeThemaFromKlasse,
    getStudentsForClass,
  } = useData()

  const klasse = getClass(klassId)!
  const klasseGrade = parseInt(klasse.name)

  const [collapsedFaecher, setCollapsedFaecher] = useState<Set<string>>(new Set())
  const [expandedThemen, setExpandedThemen] = useState<Set<string>>(new Set())

  const [popupLZ, setPopupLZ] = useState<LernzielType | null>(null)
  const [search, setSearch] = useState('')
  const [addFachId, setAddFachId] = useState<string | null>(null)
  const [createNewFachId, setCreateNewFachId] = useState<string | null>(null)
  const [editThema, setEditThema] = useState<{ id: string; allowRemove: boolean } | null>(null)
  const [statsThemaId, setStatsThemaId] = useState<string | null>(null)

  function toggleThema(themaId: string) {
    setExpandedThemen(prev => { const n = new Set(prev); n.has(themaId) ? n.delete(themaId) : n.add(themaId); return n })
  }

  const q = search.trim().toLowerCase()

  // Derive all assigned lernziel IDs from assigned themen (standard only)
  const assignedLzIds = useMemo(
    () => new Set(lernziele.filter(lz => klasse.assignedThemaIds.includes(lz.themaId)).map(lz => lz.id)),
    [klasse.assignedThemaIds, lernziele]
  )

  // Assigned standard themen, grouped by fach, filtered by search
  const assignedData = faecher
    .map(f => ({
      fach: f,
      themen: themen
        .filter(t => t.fachId === f.id && (!t.typ || t.typ === 'standard') && klasse.assignedThemaIds.includes(t.id))
        .map(t => ({
          thema: t,
          lz: lernziele.filter(lz =>
            lz.themaId === t.id &&
            (!q || lz.label.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || f.name.toLowerCase().includes(q))
          ),
        }))
        .filter(({ lz, thema }) => !q || lz.length > 0 || thema.name.toLowerCase().includes(q) || f.name.toLowerCase().includes(q))
        .sort((a, b) => {
          if (!a.thema.faelligAm && !b.thema.faelligAm) return 0
          if (!a.thema.faelligAm) return 1
          if (!b.thema.faelligAm) return -1
          return a.thema.faelligAm.localeCompare(b.thema.faelligAm)
        }),
    }))
    .filter(({ themen: ft }) => ft.length > 0)

  // Whether the catalog has any standard themen at all
  const catalogHasThemen = themen.some(t => (!t.typ || t.typ === 'standard') && t.autor == null)

  // RILZ data: library + ad-hoc RILZ themen of students in this class, grouped by Fach
  type RilzThemaEntry = { thema: Thema; studentCount: number; lzCount: number; isAdHoc: boolean; lz: RilzLernziel[] }
  const rilzData = useMemo(() => {
    const students = getStudentsForClass(klassId)

    const libraryMap = new Map<string, { thema: Thema; studs: Schueler[] }>()
    const adHocMap = new Map<string, { thema: Thema; lz: RilzLernziel[]; studs: Schueler[] }>()

    for (const s of students) {
      for (const tid of s.rilzThemaIds ?? []) {
        const t = themen.find(th => th.id === tid)
        if (!t) continue
        if (!libraryMap.has(tid)) libraryMap.set(tid, { thema: t, studs: [] })
        libraryMap.get(tid)!.studs.push(s)
      }
      const adHocThemaIds = new Set((s.rilzLernziele ?? []).map(rl => rl.themaId))
      for (const tid of adHocThemaIds) {
        const t = themen.find(th => th.id === tid)
        if (!t) continue
        if (!adHocMap.has(tid)) adHocMap.set(tid, { thema: t, lz: [], studs: [] })
        const entry = adHocMap.get(tid)!
        entry.lz.push(...(s.rilzLernziele ?? []).filter(rl => rl.themaId === tid))
        entry.studs.push(s)
      }
    }

    const byFach = new Map<string, { fach: Fach; themen: RilzThemaEntry[] }>()
    function addEntry(fachId: string, entry: RilzThemaEntry) {
      const fach = faecher.find(f => f.id === fachId)
      if (!fach) return
      if (!byFach.has(fachId)) byFach.set(fachId, { fach, themen: [] })
      byFach.get(fachId)!.themen.push(entry)
    }

    for (const [, { thema, studs }] of libraryMap) {
      const lzCount = lernziele.filter(lz => lz.themaId === thema.id).length
      addEntry(thema.fachId, { thema, studentCount: studs.length, lzCount, isAdHoc: false, lz: [] })
    }
    for (const [, { thema, lz, studs }] of adHocMap) {
      addEntry(thema.fachId, { thema, studentCount: studs.length, lzCount: lz.length, isAdHoc: true, lz })
    }

    return [...byFach.values()]
  }, [getStudentsForClass, klassId, themen, lernziele, faecher])

  function toggleFach(fachId: string) {
    setCollapsedFaecher(prev => { const n = new Set(prev); n.has(fachId) ? n.delete(fachId) : n.add(fachId); return n })
  }

  return (
    <div className="space-y-4">

      {/* LZ tree */}
      <div className="space-y-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Lernziele, Themen oder Fächer suchen…"
          right={
            <span className="self-center text-xs text-muted-foreground tabular-nums shrink-0">
              {`${klasse.assignedThemaIds.length} Themen · ${assignedLzIds.size} Lernziele`}
            </span>
          }
        />

        {!catalogHasThemen ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Noch keine Themen im Katalog.</p>
            <a href="/lernziele" className="text-xs text-primary hover:underline">Jetzt anlegen →</a>
          </div>
        ) : assignedData.length === 0 && rilzData.length === 0 && !q ? (
          <EmptyState
            size="sm"
            title="Noch keine Themen ausgewählt"
            description={<>Wähle ein Fach und klicke auf <strong>+</strong>, um Themen hinzuzufügen.</>}
          />
        ) : assignedData.length === 0 && rilzData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Keine Ergebnisse für „{search}"</p>
        ) : (
          <div className="space-y-3">
            {faecher.map(fach => {
              const stdEntry = assignedData.find(d => d.fach.id === fach.id)
              const rilzFachThemen = (rilzData.find(d => d.fach.id === fach.id)?.themen ?? [])
                .filter(({ thema }) => !q || thema.name.toLowerCase().includes(q) || fach.name.toLowerCase().includes(q))
              const fachThemen = stdEntry?.themen ?? []
              if (fachThemen.length === 0 && rilzFachThemen.length === 0) return null

              const fachCollapsed = !q && collapsedFaecher.has(fach.id)
              const fachLZCount = fachThemen.reduce((s, { lz }) => s + lz.length, 0)
              const fachColor = getFachColor(fach.id, faecher.map(f => f.id), fach.colorIndex)
              const hasUnassignedInFach = themen.some(t =>
                t.fachId === fach.id &&
                (!t.typ || t.typ === 'standard') &&
                t.autor == null &&
                (!t.stufe || t.stufe.includes(klasseGrade)) &&
                !klasse.assignedThemaIds.includes(t.id)
              )
              const klassStudents = getStudentsForClass(klassId)

              return (
                <div key={fach.id} className={cn(
                  'rounded-2xl border bg-card overflow-hidden shadow-sm border-l-4',
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
                        <Highlight text={fach.name} query={q} />
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">{fachLZCount} LZ</span>
                    </button>
                  </div>

                  {!fachCollapsed && (
                    <div className="divide-y divide-border/40">
                      {fachThemen.map(({ thema, lz: themaLZ }) => {
                        const isExpanded = !!q || expandedThemen.has(thema.id)
                        return (
                          <div key={thema.id}>
                            <div className="group/row flex items-center gap-2 pl-3 pr-2 py-2 hover:bg-accent/20 transition-colors">
                              <button
                                className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                onClick={() => toggleThema(thema.id)}
                              >
                                {isExpanded
                                  ? <ChevronDown className="size-3 text-muted-foreground shrink-0" />
                                  : <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                                }
                                <span className="text-sm font-medium truncate"><Highlight text={thema.name} query={q} /></span>
                              </button>

                              {thema.faelligAm && (
                                <span className="inline-flex items-center gap-1 text-[10px] tabular-nums shrink-0 rounded px-1.5 py-0.5 bg-muted text-muted-foreground">
                                  <Calendar className="size-3" />
                                  {new Date(thema.faelligAm + 'T00:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                              <button
                                onClick={e => { e.stopPropagation(); setStatsThemaId(id => id === thema.id ? null : thema.id) }}
                                className={cn(
                                  'shrink-0 transition-opacity',
                                  statsThemaId === thema.id
                                    ? 'opacity-100 text-primary'
                                    : 'opacity-0 group-hover/row:opacity-100 text-muted-foreground hover:text-primary',
                                )}
                                aria-label="Statistiken anzeigen"
                              >
                                <BarChart2 className="size-3.5" />
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); setEditThema({ id: thema.id, allowRemove: true }) }}
                                className="shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                                aria-label="Thema bearbeiten"
                              >
                                <PencilLine className="size-3.5" />
                              </button>
                            </div>

                            {statsThemaId === thema.id && (() => {
                              const statsLZ = lernziele.filter(lz => lz.themaId === thema.id)
                              const n = klassStudents.length
                              return (
                                <div className="border-t border-primary/15 bg-primary/5 px-3 py-2.5 space-y-1.5">
                                  <p className="text-[9px] font-semibold uppercase tracking-widest text-primary mb-2">
                                    Statistik — {n} Schüler
                                  </p>
                                  {statsLZ.map(lz => {
                                    const reached = klassStudents.filter(s => s.lernzielStatus[lz.id] === 'reached').length
                                    const partial = klassStudents.filter(s => s.lernzielStatus[lz.id] === 'partially_reached').length
                                    const pct = n === 0 ? 0 : Math.round(((reached + partial * 0.5) / n) * 100)
                                    return (
                                      <div key={lz.id} className="flex items-center gap-2">
                                        <span className={cn(
                                          'shrink-0 rounded px-1 py-0.5 text-[8px] font-bold leading-none',
                                          categoryChipClasses(lz.kategorie),
                                        )}>
                                          {lz.kategorie === 'grundlegend' ? 'G' : 'A'}
                                        </span>
                                        <span className="flex-1 text-xs truncate text-foreground">{lz.label}</span>
                                        <span className="text-[10px] tabular-nums text-muted-foreground whitespace-nowrap">
                                          <span className="text-status-reached font-medium">{reached}</span>/{n}
                                        </span>
                                        <div className="w-20 bg-muted h-1.5 shrink-0">
                                          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className={cn('text-[10px] font-bold tabular-nums w-7 text-right shrink-0', scoreColor(pct))}>
                                          {pct}%
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            })()}

                            {isExpanded && (
                              <div className="border-t border-border/40 bg-muted/10">
                                {(['grundlegend', 'anspruchsvoll'] as const).map(kat => {
                                  const lzInKat = themaLZ.filter(lz => lz.kategorie === kat)
                                  if (lzInKat.length === 0) return null
                                  return (
                                    <div key={kat} className="border-b border-border/40 last:border-b-0">
                                      <div className="pl-8 pr-3 py-1 bg-muted/20">
                                        <span className={cn('text-[10px] font-semibold uppercase tracking-wide',
                                          kat === 'grundlegend' ? 'text-category-grundlegend-fg' : 'text-category-anspruchsvoll-fg')}>
                                          {kat === 'grundlegend' ? 'Grundlegend' : 'Anspruchsvoll'}
                                        </span>
                                      </div>
                                      <div className="divide-y divide-border/30">
                                        {lzInKat.map(lz => (
                                          <div key={lz.id} className="flex items-center gap-2 pl-8 pr-3 py-1.5 hover:bg-accent/20 transition-colors group">
                                            <span className="flex-1 text-xs text-foreground">
                                              <Highlight text={lz.label} query={q} />
                                            </span>
                                            {(lz.kriterien?.length ?? 0) > 0 && (
                                              <button
                                                onClick={() => setPopupLZ(lz)}
                                                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                                                aria-label="Details anzeigen"
                                              >
                                                <Info className="size-3.5" />
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}

                      {rilzFachThemen.map(({ thema, studentCount, isAdHoc, lz: adHocLz }) => {
                        const rilzKey = thema.id + '-rilz'
                        const isExpanded = !!q || expandedThemen.has(rilzKey)
                        const libLz = !isAdHoc ? lernziele.filter(lz => lz.themaId === thema.id) : []

                        return (
                          <div key={rilzKey}>
                            <div className="group/row flex items-center gap-2 px-3 py-2 hover:bg-accent/20 transition-colors">
                              <button
                                className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                onClick={() => toggleThema(rilzKey)}
                              >
                                {isExpanded
                                  ? <ChevronDown className="size-3 text-muted-foreground shrink-0" />
                                  : <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                                }
                                <span className="text-sm font-medium truncate">{thema.name}</span>
                                <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-rilz-soft text-rilz-foreground shrink-0">
                                  RILZ
                                </span>
                                <span className="inline-flex items-center gap-0.5 text-[10px] tabular-nums rounded px-1.5 py-0.5 bg-muted text-muted-foreground shrink-0">
                                  <UserRound className="size-3" />
                                  {studentCount}
                                </span>
                              </button>

                              {thema.faelligAm && (
                                <span className="inline-flex items-center gap-1 text-[10px] tabular-nums shrink-0 rounded px-1.5 py-0.5 bg-muted text-muted-foreground">
                                  <Calendar className="size-3" />
                                  {new Date(thema.faelligAm + 'T00:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                              <button
                                onClick={e => { e.stopPropagation(); setEditThema({ id: thema.id, allowRemove: false }) }}
                                className="shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                                aria-label="Thema bearbeiten"
                              >
                                <PencilLine className="size-3.5" />
                              </button>
                            </div>

                            {isExpanded && (
                              <div className="border-t border-border/40 bg-muted/10">
                                {isAdHoc
                                  ? adHocLz.map(lz => (
                                      <div key={lz.id} className="flex items-center gap-2 pl-8 pr-3 py-1.5 border-t first:border-t-0 border-border/30 text-xs text-foreground">
                                        {lz.label}
                                      </div>
                                    ))
                                  : libLz.map(lz => (
                                      <div key={lz.id} className="flex items-center gap-2 pl-8 pr-3 py-1.5 border-t first:border-t-0 border-border/30 hover:bg-accent/20 transition-colors">
                                        <span className="flex-1 text-xs text-foreground">{lz.label}</span>
                                      </div>
                                    ))
                                }
                              </div>
                            )}
                          </div>
                        )
                      })}

                      {hasUnassignedInFach && (
                        <button
                          onClick={() => setAddFachId(fach.id)}
                          className="flex w-full items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground/60 hover:text-primary hover:bg-accent/20 transition-colors"
                        >
                          <Plus className="size-3" /> Themen hinzufügen
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Faecher with standard themen (grade-filtered) but none assigned yet */}
        {(() => {
          const assignedFachIds = new Set(assignedData.map(d => d.fach.id))
          const unrepresentedFaecher = faecher.filter(f =>
            !assignedFachIds.has(f.id) &&
            themen.some(t =>
              t.fachId === f.id &&
              (!t.typ || t.typ === 'standard') &&
              (!t.stufe || t.stufe.includes(klasseGrade))
            )
          )
          if (unrepresentedFaecher.length === 0) return null
          return (
            <div className="rounded-2xl border border-dashed border-border bg-card overflow-hidden">
              {unrepresentedFaecher.map((fach, fi) => (
                <div key={fach.id} className={cn('flex items-center gap-2 px-3 py-2', fi > 0 && 'border-t border-border/60')}>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex-1">{fach.name}</span>
                  <span className="text-xs text-muted-foreground mr-1">Keine Themen</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAddFachId(fach.id)}
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                    aria-label={`Themen in ${fach.name} hinzufügen`}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )
        })()}

        {/* Add-Themen modal for a fach */}
        {addFachId && (
          <AddThemenModal
            open
            onOpenChange={(v) => { if (!v) setAddFachId(null) }}
            fachId={addFachId}
            klassId={klassId}
            klasseGrade={klasseGrade}
            assignedThemaIds={klasse.assignedThemaIds}
            onAdd={(themaIds) => themaIds.forEach(id => assignThemaToKlasse(klassId, id))}
            onCreateNew={() => { setCreateNewFachId(addFachId); setAddFachId(null) }}
          />
        )}

        {createNewFachId && (
          <CreateThemaModal
            open
            onOpenChange={(v) => { if (!v) setCreateNewFachId(null) }}
            fachId={createNewFachId}
            onCreated={(id) => assignThemaToKlasse(klassId, id)}
          />
        )}

        {editThema && (
          <KlassenThemaEditModal
            themaId={editThema.id}
            klassId={klassId}
            allowRemove={editThema.allowRemove}
            onClose={() => setEditThema(null)}
          />
        )}

      </div>


      {popupLZ && <LernzielPopup lz={popupLZ} onClose={() => setPopupLZ(null)} />}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function KlasseDetailPage() {
  const { klassId } = useParams<{ klassId: string }>()
  const router = useRouter()
  const {
    getClass,
    updateClass,
    getStudentsForClass,
    createStudent,
    updateStudent,
    deleteStudent,
    faecher,
    themen,
    lernziele,
    competencies,
    getThemenForKlasse,
    setRilzFach,
    setBvsa,
  } = useData()

  const klasse = getClass(klassId)
  const students = getStudentsForClass(klassId)
  const assignedThemen = getThemenForKlasse(klassId)

  const [tab, setTab] = useState<Tab>('schueler')
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [adminSearch, setAdminSearch] = useState('')
  const [sortCol, setSortCol] = useState<'vorname' | 'nachname' | 'progress'>('vorname')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [editStudentId, setEditStudentId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const todayStr = new Date().toISOString().slice(0, 10)
  const themaFaelligMap = new Map(themen.map(t => [t.id, t.faelligAm]))
  const assignedLZIds = klasse
    ? lernziele
        .filter(lz => {
          if (!klasse.assignedThemaIds.includes(lz.themaId)) return false
          const faellig = themaFaelligMap.get(lz.themaId)
          return !faellig || faellig <= todayStr
        })
        .map(lz => lz.id)
    : []

  const handleSortCol = (col: 'vorname' | 'nachname' | 'progress') => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const sortedStudents = [...students]
    .filter(s => !adminSearch.trim() || (s.vorname + ' ' + s.nachname).toLowerCase().includes(adminSearch.trim().toLowerCase()))
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortCol === 'vorname') return dir * a.vorname.localeCompare(b.vorname, 'de')
      if (sortCol === 'nachname') return dir * a.nachname.localeCompare(b.nachname, 'de')
      return dir * (compPct(a, competencies) - compPct(b, competencies))
    })

  if (!klasse) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-8 text-muted-foreground text-sm">
        Klasse nicht gefunden.{' '}
        <Button variant="link" className="h-auto p-0" onClick={() => router.push('/klassen')}>Zur Übersicht</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-3">
      <div>
        <Breadcrumb
          className="mb-2"
          items={[{ label: 'Klassen', href: '/klassen' }, { label: klasse.name }]}
        />
      </div>

      <div>
        <TabBar
          active={tab}
          onChange={setTab}
          title={klasse.name}
          editingTitle={editingName}
          onEditTitle={() => { setNameValue(klasse.name); setEditingName(true) }}
          editNode={
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (nameValue.trim()) updateClass(klassId, nameValue.trim())
                setEditingName(false)
              }}
            >
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                className="h-7 w-28 px-2 text-sm font-semibold"
                autoFocus
                onKeyDown={(e) => e.key === 'Escape' && setEditingName(false)}
              />
              <Button size="sm" type="submit" disabled={!nameValue.trim()}>Speichern</Button>
              <Button size="sm" variant="outline" type="button" onClick={() => setEditingName(false)}>Abbrechen</Button>
            </form>
          }
        />
      </div>

      {/* Schüler tab */}
      {tab === 'schueler' && (
        <>
          {students.length === 0 && (
            <EmptyState
              icon={<UserRound className="size-6 text-accent-foreground" />}
              title="Noch keine Schüler"
              description="Füge Schüler zu dieser Klasse hinzu."
              action={<Button onClick={() => setCreateOpen(true)}>Ersten Schüler hinzufügen</Button>}
            />
          )}
          {students.length > 0 && (
            <>
              {/* Toolbar */}
              <SearchBar
                value={adminSearch}
                onChange={setAdminSearch}
                placeholder="Schüler suchen …"
                className="mb-2"
                right={
                  <Button size="sm" className="h-auto" onClick={() => setCreateOpen(true)}>
                    <Plus className="size-3.5" />
                    Neuer Schüler
                  </Button>
                }
              />

              {/* Admin table */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                {/* Column headers */}
                <div className="flex items-center gap-3 px-3 py-1.5 bg-muted/40 border-b border-border text-xs text-muted-foreground font-medium select-none">
                  <div className="size-7 shrink-0" />
                  {([
                    { col: 'vorname' as const, label: 'Vorname', w: 'w-24' },
                    { col: 'nachname' as const, label: 'Nachname', w: 'w-24' },
                  ] as const).map(({ col, label, w }) => (
                    <button
                      key={col}
                      onClick={() => handleSortCol(col)}
                      className={cn('flex items-center gap-0.5 shrink-0', w, 'hover:text-foreground transition-colors')}
                    >
                      {label}
                      {sortCol === col
                        ? sortDir === 'asc'
                          ? <ChevronDown className="size-3 text-primary" />
                          : <ChevronDown className="size-3 text-primary rotate-180" />
                        : <ChevronDown className="size-3 opacity-30" />}
                    </button>
                  ))}
                  <div className="flex-1 text-xs text-muted-foreground">Kategorie</div>
                  <button
                    onClick={() => handleSortCol('progress')}
                    className="flex items-center gap-0.5 w-20 shrink-0 hover:text-foreground transition-colors"
                  >
                    Fortschritt
                    {sortCol === 'progress'
                      ? sortDir === 'asc'
                        ? <ChevronDown className="size-3 text-primary" />
                        : <ChevronDown className="size-3 text-primary rotate-180" />
                      : <ChevronDown className="size-3 opacity-30" />}
                  </button>
                  <div className="w-14 shrink-0" />
                </div>

                {/* Empty search result */}
                {sortedStudents.length === 0 && (
                  <p className="text-sm text-muted-foreground px-4 py-6 text-center">
                    Keine Schüler gefunden für „{adminSearch}"
                  </p>
                )}

                {/* Student rows */}
                <div className="divide-y divide-border">
                  {sortedStudents.map(student => {
                    const cp = compPct(student, competencies)
                    const pctColor = cp >= 75 ? 'text-status-reached' : cp >= 40 ? 'text-status-partial' : 'text-status-not-reached'
                    const barColor = cp >= 75 ? 'bg-status-reached' : cp >= 40 ? 'bg-status-partial' : 'bg-status-not-reached'
                    return (
                      <div key={student.id}>
                        {/* Main row */}
                        <div
                          className="flex items-center gap-3 px-3 py-1.5 hover:bg-accent/30 transition-colors cursor-pointer"
                          onClick={() => router.push(`/klassen/${klassId}/schueler/${student.id}`)}
                        >
                          <Avatar size="sm" className="shrink-0">
                            <AvatarFallback className={cn('text-xs', getAvatarColor(student.vorname + ' ' + student.nachname))}>
                              {getInitials(student.vorname + ' ' + student.nachname)}
                            </AvatarFallback>
                          </Avatar>

                          {/* Vorname */}
                          <div className="w-24 shrink-0">
                            <span className="text-sm font-medium truncate">{student.vorname}</span>
                          </div>

                          {/* Nachname */}
                          <div className="w-24 shrink-0">
                            <span className="text-sm text-muted-foreground truncate block">{student.nachname}</span>
                          </div>

                          {/* Kategorie cell */}
                          <div className="flex-1 flex items-center gap-1.5 py-0.5 min-w-0 overflow-hidden">
                            {(() => {
                              const badges: { key: string; node: React.ReactNode }[] = []
                              if (student.bvsa) badges.push({ key: 'bvsa', node: <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-category-bvsa-soft text-category-bvsa-fg shrink-0">BVSA</span> })
                              for (const fachId of student.rilzFachIds ?? []) {
                                const fach = faecher.find(f => f.id === fachId)
                                if (fach) badges.push({ key: fachId, node: <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-rilz-soft text-rilz-foreground shrink-0">RILZ {fach.name}</span> })
                              }
                              if (badges.length === 0) return null
                              const MAX = 4
                              const overflow = badges.length - MAX
                              return (
                                <>
                                  {badges.slice(0, MAX).map(b => <span key={b.key} className="contents">{b.node}</span>)}
                                  {overflow > 0 && (
                                    <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-muted text-muted-foreground shrink-0">+{overflow}</span>
                                  )}
                                </>
                              )
                            })()}
                          </div>

                          {/* Mini progress bar */}
                          <div className="w-20 shrink-0 flex items-center gap-1.5">
                            {competencies.length > 0 ? (
                              <>
                                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${cp}%` }} />
                                </div>
                                <span className={cn('text-[10px] font-semibold tabular-nums w-6 text-right shrink-0', pctColor)}>
                                  {Math.round(cp)}%
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="w-14 shrink-0 flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => { e.stopPropagation(); setEditStudentId(student.id) }}
                              aria-label="Schüler bearbeiten"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          </div>
                        </div>

                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Beurteilung tab */}
      {tab === 'beurteilung' && (
        <BeurteilungTab klassId={klassId} />
      )}

      {/* Klassenübersicht tab */}
      {tab === 'klassenübersicht' && (
        <div>
          <ClassAnalytics
            klassId={klassId}
            students={students}
            themen={assignedThemen}
            lernziele={lernziele}
            faecher={faecher}
          />
        </div>
      )}

      {/* Lernziele tab */}
      {tab === 'lernziele' && (
        <LernzieleTab klassId={klassId} />
      )}

      {/* Berichte tab */}
      {tab === 'berichte' && (
        <BerichteTab klassId={klassId} />
      )}

      {/* Modals */}
      <SchuelerBearbeitenModal
        open={editStudentId !== null}
        onOpenChange={(v) => { if (!v) setEditStudentId(null) }}
        studentId={editStudentId}
        students={students}
        faecher={faecher}
        setRilzFach={setRilzFach}
        setBvsa={setBvsa}
        updateStudent={updateStudent}
        deleteStudent={(id) => { deleteStudent(id); setEditStudentId(null) }}
      />
      <SchuelerFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(vorname, nachname) => createStudent(klassId, vorname, nachname)}
      />
    </div>
  )
}
