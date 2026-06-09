'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  SquarePen, Plus, UserRound,
  ChevronDown, ChevronRight, Trash2, Check, X,
  Search, Info, Pencil, Calendar, BookMarked,
} from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { ClassAnalytics } from '@/components/analytics/ClassAnalytics'
import { LernkontrolleTab } from '@/components/lernkontrolle/LernkontrolleTab'
import { BerichteTab } from '@/components/berichte/BerichteTab'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Modal } from '@/components/shared/Modal'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn, getFachColor } from '@/lib/utils'
import { getInitials, getAvatarColor } from '@/lib/avatar-utils'
import { KatBadge } from '@/components/shared/KatBadge'
import { LzCountCluster } from '@/components/shared/LzCountCluster'
import { type LpRolle, LP_ROLLE_LABELS } from '@/types/domain'
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

type Tab = 'schueler' | 'klassenübersicht' | 'lernziele' | 'beurteilung' | 'berichte' | 'lehrpersonen'

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: 'schueler',         label: 'Schüler' },
    { key: 'beurteilung',      label: 'Beurteilung' },
    { key: 'klassenübersicht', label: 'Statistiken' },
    { key: 'lernziele',        label: 'Lernziele' },
    { key: 'berichte',         label: 'Berichte' },
    { key: 'lehrpersonen',     label: 'Lehrpersonen' },
  ]
  return (
    <div className="overflow-x-auto scrollbar-hide mb-2">
      <div className="flex gap-1 p-1 rounded-xl bg-muted w-fit min-w-full sm:min-w-0">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'px-3 py-1 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0',
            active === key
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {label}
        </button>
      ))}
      </div>
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
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 transition-colors px-2 py-1 rounded-lg hover:bg-destructive/8"
            >
              <Trash2 className="size-3.5" />
              Löschen
            </button>
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
          <div className="rounded-xl border border-border overflow-hidden divide-y divide-border/60 bg-muted/20">
            {/* BVSA */}
            <div
              className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent/30 transition-colors"
              onClick={() => setBvsa(student.id, !student.bvsa)}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">BVSA</p>
                <p className="text-[11px] text-muted-foreground leading-tight">Bericht ohne Noten</p>
              </div>
              <Toggle on={!!student.bvsa} color="bg-purple-500" />
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
                  <Toggle on={hasRilz} color="bg-orange-400" />
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

function AddLernzieleModal({
  open, onOpenChange, fach, themen: allThemen, lernziele: allLZ, assignedThemaIds, klasseGrade, onAdd,
}: {
  open: boolean; onOpenChange: (v: boolean) => void
  fach: Fach; themen: Thema[]; lernziele: LernzielType[]
  assignedThemaIds: string[]; klasseGrade: number; onAdd: (themaIds: string[]) => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  useEffect(() => { if (open) setSelected(new Set()) }, [open])

  // Only personal (no autor) standard themen for this fach, filtered by grade level
  const fachThemen = allThemen.filter(t =>
    t.fachId === fach.id &&
    (!t.typ || t.typ === 'standard') &&
    t.autor == null &&
    (!t.stufe || t.stufe.includes(klasseGrade))
  )
  const availableThemen = fachThemen.filter(t => !assignedThemaIds.includes(t.id))
  const alreadyAssigned = fachThemen.filter(t => assignedThemaIds.includes(t.id))

  function toggle(themaId: string) {
    setSelected(prev => { const n = new Set(prev); n.has(themaId) ? n.delete(themaId) : n.add(themaId); return n })
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Themen hinzufügen — ${fach.name}`}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={() => { onAdd(Array.from(selected)); onOpenChange(false) }} disabled={selected.size === 0}>
            {selected.size > 0 ? `${selected.size} Thema${selected.size > 1 ? 'n' : ''} hinzufügen` : 'Hinzufügen'}
          </Button>
        </>
      }
    >
      {fachThemen.length === 0 ? (
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Keine Themen für diese Klassenstufe verfügbar.</p>
          <a href="/lernziele" className="text-xs text-primary hover:underline">In «Meine Lernziele» Themen anlegen →</a>
        </div>
      ) : availableThemen.length === 0 ? (
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Alle Themen dieses Fachs sind bereits zugewiesen.</p>
          <a href="/lernziele" className="text-xs text-primary hover:underline">Weitere Themen in «Meine Lernziele» anlegen →</a>
        </div>
      ) : (
        <div className="space-y-2">
          {availableThemen.map(thema => {
            const lzCount = allLZ.filter(lz => lz.themaId === thema.id).length
            const isSelected = selected.has(thema.id)
            return (
              <div
                key={thema.id}
                className={cn(
                  'flex items-center gap-3 cursor-pointer rounded-xl border-2 p-3 transition-all',
                  isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-accent/30',
                )}
                onClick={() => toggle(thema.id)}
              >
                <div className={cn(
                  'flex size-4 shrink-0 items-center justify-center rounded-sm border-2 transition-all',
                  isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30 bg-background',
                )}>
                  {isSelected && <Check className="size-2.5 text-white stroke-[3]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{thema.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {thema.autor && <span>von {thema.autor} · </span>}
                    <span>{lzCount} Lernziel{lzCount !== 1 ? 'e' : ''}</span>
                  </p>
                </div>
              </div>
            )
          })}
          {alreadyAssigned.length > 0 && (
            <div className="pt-2 border-t border-border/60">
              <p className="text-xs text-muted-foreground mb-1.5">Bereits zugewiesen</p>
              {alreadyAssigned.map(thema => (
                <div key={thema.id} className="flex items-center gap-3 rounded-xl border border-border/50 p-3 opacity-50">
                  <div className="flex size-4 shrink-0 items-center justify-center rounded-sm border-2 border-primary bg-primary">
                    <Check className="size-2.5 text-white stroke-[3]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{thema.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Bereits zugewiesen</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}


function LernzieleTab({ klassId }: { klassId: string }) {
  const {
    getClass,
    faecher, themen, lernziele,
    assignThemaToKlasse, removeThemaFromKlasse,
    updateThema,
    getStudentsForClass,
    students: allStudents,
  } = useData()

  const klasse = getClass(klassId)!
  const klasseGrade = parseInt(klasse.name)

  const [collapsedFaecher, setCollapsedFaecher] = useState<Set<string>>(new Set())
  const [expandedThemen, setExpandedThemen] = useState<Set<string>>(new Set())
  const [expandedRilzThemen, setExpandedRilzThemen] = useState<Set<string>>(new Set())
  const [popupLZ, setPopupLZ] = useState<LernzielType | null>(null)
  const [search, setSearch] = useState('')
  const [addFachId, setAddFachId] = useState<string | null>(null)
  const [editDateThemaId, setEditDateThemaId] = useState<string | null>(null)

  function toggleThema(themaId: string) {
    setExpandedThemen(prev => { const n = new Set(prev); n.has(themaId) ? n.delete(themaId) : n.add(themaId); return n })
  }
  function toggleRilzThema(id: string) {
    setExpandedRilzThemen(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
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
  type RilzThemaEntry = { thema: Thema; studentCount: number; lzCount: number; isAdHoc: boolean }
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
      addEntry(thema.fachId, { thema, studentCount: studs.length, lzCount, isAdHoc: false })
    }
    for (const [, { thema, lz, studs }] of adHocMap) {
      addEntry(thema.fachId, { thema, studentCount: studs.length, lzCount: lz.length, isAdHoc: true })
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
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Lernziele, Themen oder Fächer suchen…"
              className="pl-8 h-8 text-sm"
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums shrink-0 ml-auto">
            {`${klasse.assignedThemaIds.length} Themen · ${assignedLzIds.size} Lernziele`}
          </span>
        </div>

        {!catalogHasThemen ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Noch keine Themen im Katalog.</p>
            <a href="/lernziele" className="text-xs text-primary hover:underline">Jetzt anlegen →</a>
          </div>
        ) : assignedData.length === 0 && !q ? (
          <EmptyState
            size="sm"
            title="Noch keine Themen ausgewählt"
            description={<>Wähle ein Fach und klicke auf <strong>+</strong>, um Themen hinzuzufügen.</>}
          />
        ) : assignedData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Keine Ergebnisse für „{search}"</p>
        ) : (
          <div className="space-y-3">
            {assignedData.map(({ fach, themen: fachThemen }) => {
              const fachCollapsed = !q && collapsedFaecher.has(fach.id)
              const fachLZCount = fachThemen.reduce((s, { lz }) => s + lz.length, 0)
              const fachColor = getFachColor(fach.id, faecher.map(f => f.id))
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
                    {hasUnassignedInFach && (
                      <button
                        onClick={() => setAddFachId(fach.id)}
                        className="flex items-center justify-center size-5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        aria-label={`Themen in ${fach.name} hinzufügen`}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {!fachCollapsed && (
                    <div className="divide-y divide-border/40">
                      {fachThemen.map(({ thema, lz: themaLZ }) => {
                        const isExpanded = !!q || expandedThemen.has(thema.id)
                        const today = new Date().toISOString().slice(0, 10)
                        const isDateEditing = editDateThemaId === thema.id
                        const isOverdue = thema.faelligAm ? thema.faelligAm < today : false
                        const daysUntil = thema.faelligAm
                          ? Math.ceil((new Date(thema.faelligAm).getTime() - Date.now()) / 86400000)
                          : null
                        const isNearDeadline = daysUntil !== null && daysUntil >= 0 && daysUntil <= 14
                        const isRilz = thema.typ === 'rilz'

                        // Progress: how many students have all LZ in this thema assessed
                        const totalStudents = klassStudents.filter(s => !s.rilzFachIds?.includes(fach.id) || !isRilz).length
                        const assessedStudents = totalStudents > 0
                          ? klassStudents.filter(s => {
                              if (isRilz && s.rilzFachIds?.includes(fach.id)) return false
                              return themaLZ.every(lz => s.lernzielStatus[lz.id] != null)
                            }).length
                          : 0
                        const allLZ = lernziele.filter(lz => lz.themaId === thema.id)
                        const gCount = allLZ.filter(lz => lz.kategorie === 'grundlegend').length
                        const aCount = allLZ.filter(lz => lz.kategorie === 'anspruchsvoll').length

                        return (
                          <div key={thema.id}>
                            {/* Thema row */}
                            <div className="group/row flex items-center gap-2 px-3 py-2 hover:bg-accent/20 transition-colors">
                              <button
                                className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                onClick={() => toggleThema(thema.id)}
                              >
                                {isExpanded
                                  ? <ChevronDown className="size-3 text-muted-foreground shrink-0" />
                                  : <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                                }
                                <span className="text-sm font-medium truncate"><Highlight text={thema.name} query={q} /></span>
                                {isRilz && (
                                  <span className="shrink-0 rounded px-1 py-px text-[9px] font-semibold bg-orange-100 text-orange-700">RILZ</span>
                                )}
                              </button>

                              {/* Inline meta */}
                              <LzCountCluster g={gCount} a={aCount} />

                              {/* Progress: X/Y bewertet */}
                              {totalStudents > 0 && (
                                <span className="text-[10px] tabular-nums text-muted-foreground shrink-0 hidden sm:block">
                                  {assessedStudents}/{totalStudents}
                                </span>
                              )}

                              {isDateEditing ? (
                                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                  <input
                                    type="date" lang="de"
                                    value={thema.faelligAm ?? ''}
                                    onChange={e => updateThema(thema.id, { faelligAm: e.target.value || undefined })}
                                    className="h-5 text-[10px] rounded border border-border bg-background px-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                    autoFocus
                                  />
                                  {thema.faelligAm && (
                                    <button onClick={() => updateThema(thema.id, { faelligAm: undefined })} className="text-muted-foreground hover:text-destructive" aria-label="Datum entfernen">
                                      <X className="size-3" />
                                    </button>
                                  )}
                                  <button onClick={() => setEditDateThemaId(null)} className="text-muted-foreground hover:text-foreground" aria-label="Schliessen">
                                    <Check className="size-3 text-primary" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={e => { e.stopPropagation(); setEditDateThemaId(thema.id) }}
                                  className={cn(
                                    'flex items-center gap-1 text-[10px] tabular-nums shrink-0 rounded px-1.5 py-0.5 transition-colors',
                                    thema.faelligAm
                                      ? isOverdue
                                        ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                                        : isNearDeadline
                                          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                          : 'bg-muted text-muted-foreground hover:bg-accent'
                                      : 'opacity-0 group-hover/row:opacity-60 text-muted-foreground hover:bg-accent',
                                  )}
                                  aria-label="Fälligkeitsdatum setzen"
                                >
                                  <Calendar className="size-3" />
                                  {thema.faelligAm ? new Date(thema.faelligAm + 'T00:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }) : ''}
                                </button>
                              )}
                              <button
                                onClick={e => { e.stopPropagation(); removeThemaFromKlasse(klassId, thema.id) }}
                                className="shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                aria-label="Thema entfernen"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>

                            {/* Expanded LZ list */}
                            {isExpanded && (
                              <div className="border-t border-border/40 bg-muted/10">
                                {themaLZ.map(lz => {
                                  const hasKriterien = (lz.kriterien?.length ?? 0) > 0
                                  return (
                                    <div key={lz.id} className="flex items-center gap-2 pl-8 pr-3 py-1.5 border-t first:border-t-0 border-border/30 hover:bg-accent/20 transition-colors group">
                                      <KatBadge kat={lz.kategorie} />
                                      <span className="flex-1 text-xs text-foreground">
                                        <Highlight text={lz.label} query={q} />
                                      </span>
                                      {hasKriterien && (
                                        <button
                                          onClick={() => setPopupLZ(lz)}
                                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                                          aria-label="Details anzeigen"
                                        >
                                          <Info className="size-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
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
                  <button
                    onClick={() => setAddFachId(fach.id)}
                    className="flex items-center justify-center size-5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    aria-label={`Themen in ${fach.name} hinzufügen`}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )
        })()}

        {/* Add-Themen modal for a fach */}
        {addFachId && (() => {
          const fach = faecher.find(f => f.id === addFachId)
          if (!fach) return null
          return (
            <AddLernzieleModal
              open
              onOpenChange={(v) => { if (!v) setAddFachId(null) }}
              fach={fach}
              themen={themen}
              lernziele={lernziele}
              assignedThemaIds={klasse.assignedThemaIds}
              klasseGrade={klasseGrade}
              onAdd={(themaIds) => themaIds.forEach(id => assignThemaToKlasse(klassId, id))}
            />
          )
        })()}

      </div>

      {/* RILZ Lernziele section */}
      {rilzData.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50/60 px-4 py-2.5">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-orange-100">
              <span className="text-[10px] font-bold text-orange-600">R</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-orange-700">RILZ – Individuelle Lernziele</p>
              <p className="text-[10px] text-orange-600/70">Reduzierte Lernziele für einzelne Schüler:innen</p>
            </div>
          </div>

          {rilzData.map(({ fach, themen: rilzThemen }) => (
            <div key={fach.id} className="rounded-2xl border border-orange-100 bg-orange-50/30 overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50/60 border-b border-orange-100">
                <span className="text-xs font-semibold text-orange-700">{fach.name}</span>
                <span className="rounded-full bg-orange-100 text-orange-600 text-xs px-1.5 py-0.5">{rilzThemen.length}</span>
              </div>
              <div className="flex flex-wrap gap-2 p-3">
                {rilzThemen.map(({ thema, lzCount, studentCount, isAdHoc }) => {
                  const isExpanded = expandedRilzThemen.has(thema.id)
                  return (
                    <div key={thema.id} className="flex flex-col gap-1.5">
                      <button
                        onClick={() => toggleRilzThema(thema.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-background px-2.5 py-1.5 text-xs hover:bg-orange-50 hover:border-orange-400 transition-all text-left"
                      >
                        <span className="font-medium">{thema.name}</span>
                        <span className="rounded px-1 py-0.5 text-[9px] font-semibold bg-orange-100 text-orange-700">
                          {isAdHoc ? 'RILZ ad-hoc' : 'RILZ'}
                        </span>
                        <span className="tabular-nums text-muted-foreground">· {lzCount}</span>
                        <span className="flex items-center gap-0.5 text-muted-foreground/60">
                          <UserRound className="size-2.5" />
                          {studentCount}
                        </span>
                        {isExpanded
                          ? <ChevronDown className="size-3 text-muted-foreground ml-0.5" />
                          : <ChevronRight className="size-3 text-muted-foreground ml-0.5" />
                        }
                      </button>
                      {isExpanded && (
                        <div className="ml-2 space-y-0.5">
                          {lernziele.filter(lz => lz.themaId === thema.id).map(lz => (
                            <div key={lz.id} className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1">
                              <span className={cn(
                                'rounded px-1 py-0.5 text-[9px] font-semibold shrink-0',
                                lz.kategorie === 'grundlegend' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700',
                              )}>
                                {lz.kategorie === 'grundlegend' ? 'G' : 'A'}
                              </span>
                              <span>{lz.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {popupLZ && <LernzielPopup lz={popupLZ} onClose={() => setPopupLZ(null)} />}
    </div>
  )
}

// ── Lehrpersonen tab ──────────────────────────────────────────────────────

function LehrpersonenTab({ klassId }: { klassId: string }) {
  const router = useRouter()
  const {
    getClass, deleteClass,
    lehrpersonen, setLpZuweisung, removeLpFromKlasse,
    createFolgeklasse,
  } = useData()

  const klasse = getClass(klassId)!

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addLpOpen, setAddLpOpen] = useState(false)

  const assigned = lehrpersonen.filter(lp => (klasse.lpZuweisungen ?? []).some(z => z.lpId === lp.id))
  const hasUnassigned = lehrpersonen.some(lp => !(klasse.lpZuweisungen ?? []).some(z => z.lpId === lp.id))

  return (
    <div className="max-w-md space-y-4">
      <SettingsCard
        title="Lehrpersonen"
        action={
          hasUnassigned ? (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setAddLpOpen(true)}>
              <Plus className="size-3" /> Hinzufügen
            </Button>
          ) : undefined
        }
      >
        {assigned.length === 0 ? (
          <p className="text-xs text-muted-foreground">Noch keine Lehrpersonen zugewiesen.</p>
        ) : (
          <div className="space-y-3">
            {assigned.map(lp => {
              const zuweisung = (klasse.lpZuweisungen ?? []).find(z => z.lpId === lp.id)!
              return (
                <div key={lp.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">{lp.name}</p>
                    {zuweisung.rolle && (
                      <p className="text-[10px] text-muted-foreground">{LP_ROLLE_LABELS[zuweisung.rolle]}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeLpFromKlasse(klassId, lp.id)}
                    className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                  >entfernen</button>
                </div>
              )
            })}
          </div>
        )}
      </SettingsCard>

      <Modal open={addLpOpen} onOpenChange={setAddLpOpen} title="Lehrperson hinzufügen" size="sm">
        <div className="space-y-3">
          {lehrpersonen
            .filter(lp => !(klasse.lpZuweisungen ?? []).some(z => z.lpId === lp.id))
            .map(lp => (
              <div key={lp.id}>
                <p className="text-xs font-medium mb-1.5">{lp.name}</p>
                <div className="flex gap-1.5">
                  {(Object.keys(LP_ROLLE_LABELS) as LpRolle[]).map(rolle => (
                    <button
                      key={rolle}
                      onClick={() => { setLpZuweisung(klassId, lp.id, [], rolle); setAddLpOpen(false) }}
                      className="rounded-full px-2.5 py-1 text-xs font-medium border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                    >{LP_ROLLE_LABELS[rolle]}</button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </Modal>

      <SettingsCard title="Neues Schuljahr">
        <p className="text-xs text-muted-foreground mb-2">
          Erstellt eine Folgeklasse mit allen Schülern. Die bisherige Klasse bleibt als Vorjahr erhalten.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => {
            const newName = window.prompt('Name der neuen Klasse (z.B. 6a):', klasse.name)
            if (!newName?.trim()) return
            const schuljahr = window.prompt('Schuljahr (z.B. 2026/27):', '2026/27')
            if (!schuljahr?.trim()) return
            const newId = createFolgeklasse(klassId, newName.trim(), schuljahr.trim())
            if (newId) router.push(`/klassen/${newId}`)
          }}
        >
          Klassenübergabe starten
        </Button>
      </SettingsCard>

      <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-red-700">Gefahrenzone</h3>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Klasse und alle Schüler dauerhaft löschen.</p>
          <Button variant="destructive" size="sm" className="shrink-0" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-3.5" /> Löschen
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Klasse löschen"
        description={`Soll die Klasse „${klasse.name}" wirklich gelöscht werden? Alle Schüler dieser Klasse werden ebenfalls entfernt.`}
        confirmLabel="Dauerhaft löschen"
        onConfirm={() => { deleteClass(klassId); router.push('/klassen') }}
      />
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
    lehrpersonen,
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
  // LP filter: null = all, lpId = only that LP's fächer
  const [activeLpId, setActiveLpId] = useState<string | null>(null)
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
        <button className="underline" onClick={() => router.push('/klassen')}>Zur Übersicht</button>
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

      {/* Header */}
      <div className="relative mb-2 flex items-center justify-between">
        <div>
          {editingName ? (
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
                className="text-2xl font-bold h-9 w-36 px-2"
                autoFocus
                onKeyDown={(e) => e.key === 'Escape' && setEditingName(false)}
              />
              <Button size="sm" type="submit" disabled={!nameValue.trim()}>Speichern</Button>
              <Button size="sm" variant="outline" type="button" onClick={() => setEditingName(false)}>Abbrechen</Button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{klasse.name}</h1>
              <button
                onClick={() => { setNameValue(klasse.name); setEditingName(true) }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Klassenname bearbeiten"
              >
                <SquarePen className="size-4" />
              </button>
            </div>
          )}
          <p className="mt-0.5 text-sm text-muted-foreground">
            {students.length} Schüler
          </p>
        </div>
      </div>

      <div>
        <TabBar active={tab} onChange={setTab} />
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
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    value={adminSearch}
                    onChange={e => setAdminSearch(e.target.value)}
                    placeholder="Schüler suchen …"
                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="size-3.5" />
                  Neuer Schüler
                </Button>
              </div>

              {/* Admin table */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
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
                    const pctColor = cp >= 75 ? 'text-emerald-600' : cp >= 40 ? 'text-amber-600' : 'text-red-500'
                    const barColor = cp >= 75 ? 'bg-emerald-500' : cp >= 40 ? 'bg-amber-400' : 'bg-red-400'
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
                              if (student.bvsa) badges.push({ key: 'bvsa', node: <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-700 shrink-0">BVSA</span> })
                              for (const fachId of student.rilzFachIds ?? []) {
                                const fach = faecher.find(f => f.id === fachId)
                                if (fach) badges.push({ key: fachId, node: <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-orange-100 text-orange-700 shrink-0">RILZ {fach.name}</span> })
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
        <LernkontrolleTab
          klassId={klassId}
          filterFachIds={
            activeLpId
              ? (klasse.lpZuweisungen ?? []).find(z => z.lpId === activeLpId)?.fachIds
              : undefined
          }
        />
      )}

      {/* Klassenübersicht tab */}
      {tab === 'klassenübersicht' && (
        <div>
          <ClassAnalytics
            klassId={klassId}
            students={students}
            themen={assignedThemen}
            lernziele={lernziele.filter(lz => lz.source !== 'bibliothek')}
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

      {/* Lehrpersonen tab */}
      {tab === 'lehrpersonen' && (
        <LehrpersonenTab klassId={klassId} />
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
