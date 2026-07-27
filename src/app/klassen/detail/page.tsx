'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Icon } from "@/components/ui/Icon"
import { useData } from '@/contexts/DataContext'
import { ClassAnalytics } from '@/components/analytics/ClassAnalytics'
import { BeurteilungTab } from '@/components/beurteilung/BeurteilungTab'
import { BerichteTab } from '@/components/berichte/BerichteTab'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableSortHeader, TableEmpty } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { AddThemenModal } from '@/components/shared/AddThemenModal'
import { CreateThemaModal } from '@/components/shared/CreateThemaModal'
import { Modal } from '@/components/shared/Modal'
import { ModalRow } from '@/components/shared/ModalRow'
import { ModalOptionList } from '@/components/shared/ModalOptionList'
import { LernzielEditSection } from '@/components/shared/LernzielEditSection'
import { InputModal } from '@/components/shared/InputModal'
import { EmptyState } from '@/components/shared/EmptyState'
import { PillTabs } from '@/components/shared/PillTabs'
import { SearchBar } from '@/components/shared/SearchBar'
import { GefahrenzoneSettings } from '@/components/einstellungen/GefahrenzoneSettings'
import { cn, getFachColor, scoreColor, scoreBarColor, categoryChipClasses } from '@/lib/utils'
import { todayISO, formatDateCH } from '@/lib/dates'
import { getInitials, getAvatarColor } from '@/lib/avatar-utils'
import { useLezioImport } from '@/hooks/useLezioImport'
import { LezioImportModal } from '@/components/shared/LezioImportModal'
import { themaCountsInStats } from '@/lib/student-kpis'

import type { Schueler, Lernziel as LernzielType, Fach, Thema, RilzLernziel } from '@/types/domain'


const compPct = (student: Schueler, comps: { id: string }[]): number => {
  if (comps.length === 0) return 0
  const reached = comps.filter(c => student.competencyStatus[c.id] === 'reached').length
  const partial = comps.filter(c => student.competencyStatus[c.id] === 'partially_reached').length
  return ((reached + partial * 0.5) / comps.length) * 100
}

// ── Student form modal ─────────────────────────────────────────────────────

const SchuelerFormModal = ({
  open, onOpenChange, initialVorname = '', initialNachname = '', onSubmit,
}: {
  open: boolean; onOpenChange: (v: boolean) => void
  initialVorname?: string; initialNachname?: string
  onSubmit: (vorname: string, nachname: string) => void
}) => {
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
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Abbrechen</Button>
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

type Tab = 'schueler' | 'klassenübersicht' | 'lernziele' | 'beurteilung' | 'berichte' | 'einstellungen'

const TabBar = ({
  active, onChange,
  title, onEditTitle,
}: {
  active: Tab; onChange: (t: Tab) => void
  title: string; onEditTitle: () => void
}) => {
  const tabs: { key: Tab; label: string }[] = [
    { key: 'schueler',         label: 'Schüler' },
    { key: 'beurteilung',      label: 'Beurteilung' },
    { key: 'klassenübersicht', label: 'Statistiken' },
    { key: 'lernziele',        label: 'Lernziele' },
    { key: 'berichte',         label: 'Berichte' },
    { key: 'einstellungen',    label: 'Einstellungen' },
  ]
  return (
    <div className="mb-4">
      {/* Title */}
      <div className="flex items-center gap-2 px-1 py-4 mb-1">
        <span className="text-xl text-muted-foreground">
          Klasse <span className="font-bold text-foreground">{title}</span>
        </span>
        <button
          onClick={onEditTitle}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Klassenname bearbeiten"
        >
          <Icon name="edit_square" size={16} />
        </button>
      </div>

      {/* Tab strip */}
      <div className="overflow-x-auto scrollbar-hide">
        <PillTabs variant="underline" options={tabs} value={active} onChange={onChange} />
      </div>
    </div>
  )
}

// ── Kategorisierung modal (RILZ + BVSA per student) ───────────────────────

const Toggle = ({ on, color = 'bg-primary' }: { on: boolean; color?: string }) => {
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

const SchuelerBearbeitenModal = ({
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
}) => {
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
              variant="secondary"
              onClick={() => setDeleteConfirmOpen(true)}
              className="text-destructive hover:text-destructive/80 hover:bg-destructive/8"
            >
              <Icon name="delete" size={14} />
              Löschen
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>Abbrechen</Button>
              <Button onClick={handleSave}>Speichern</Button>
            </div>
          </div>
        }
      >
        <div className="space-y-2">
          {/* Name fields side by side */}
          <div className="grid grid-cols-2 gap-2">
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

          {/* bVSA card */}
          <div className="rounded-2xl border border-border overflow-hidden bg-muted/20">
            <div
              className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent/30 transition-colors"
              onClick={() => setBvsa(student.id, !student.bvsa)}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">bVSA</p>
                <p className="text-2xs text-muted-foreground leading-tight">Bericht ohne Noten</p>
              </div>
              <Toggle on={!!student.bvsa} color="bg-category-bvsa-fg" />
            </div>
          </div>

          {/* RILZ card */}
          {faecher.length > 0 && (
            <div className="rounded-2xl border border-border overflow-hidden divide-y divide-border/60 bg-muted/20">
              {/* RILZ divider label */}
              <div className="px-3 py-1 bg-muted/40">
                <p className="text-3xs font-semibold uppercase tracking-wider text-muted-foreground">
                  RILZ — Reduzierte Lernziele
                </p>
              </div>

              {/* RILZ per Fach */}
              {faecher.map(fach => {
                const hasRilz = (student.rilzFachIds ?? []).includes(fach.id)
                const fc = getFachColor(fach.id, faecher.map(f => f.id), fach.colorIndex)
                return (
                  <div
                    key={fach.id}
                    className="flex items-center justify-between px-3 py-1.5 cursor-pointer hover:bg-accent/30 transition-colors"
                    onClick={() => setRilzFach(student.id, fach.id, !hasRilz)}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className={cn('size-2 rounded-full shrink-0', fc.dot)} />
                      <span className="text-sm truncate">{fach.name}</span>
                    </span>
                    <Toggle on={hasRilz} color="bg-rilz" />
                  </div>
                )
              })}
            </div>
          )}
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

const Highlight = ({ text, query }: { text: string; query: string }) => {
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

const LernzielPopup = ({ lz, onClose }: { lz: LernzielType; onClose: () => void }) => {
  return (
    <Modal open onOpenChange={(v) => { if (!v) onClose() }} title={lz.label} size="sm">
      {(lz.kriterien?.length ?? 0) === 0 ? (
        <p className="text-sm text-muted-foreground">Keine Kriterien hinterlegt.</p>
      ) : (
        <ul className="space-y-2">
          {lz.kriterien!.map((k, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
              {k}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}

// Bearbeiten-Popup im Klassen-Tab — Format wie die Lernzielsammlung (2 Schritte),
// jedoch ohne Filter-Tags und mit dem klassenspezifischen Feld „Fällig am".
const KlassenThemaEditModal = ({ themaId, klassId, allowRemove, onClose }: {
  themaId: string; klassId: string; allowRemove: boolean; onClose: () => void
}) => {
  const { themen, faecher, updateThema, removeThemaFromKlasse, exportThema } = useData()
  const thema = themen.find(t => t.id === themaId)

  // Step
  const [editStep, setEditStep] = useState<'meta' | 'lernziele'>('meta')

  // Meta state
  const [localName, setLocalName] = useState(thema?.name ?? '')
  const [faelligAm, setFaelligAm] = useState(thema?.faelligAm ?? '')
  const [localFachId, setLocalFachId] = useState(thema?.fachId ?? '')
  const [localTyp, setLocalTyp] = useState<'standard' | 'rilz'>(thema?.typ ?? 'standard')
  const [stufe, setStufe] = useState<number | undefined>(thema?.stufe?.[0])
  const [openRowId, setOpenRowId] = useState<string | null>(null)

  if (!thema) return null

  const save = () => {
    if (!localName.trim()) return
    updateThema(themaId, {
      name: localName.trim(),
      fachId: localFachId,
      typ: localTyp,
      stufe: stufe ? [stufe] : undefined,
      faelligAm: faelligAm || undefined,
    })
    onClose()
  }
  const remove = () => {
    removeThemaFromKlasse(klassId, themaId)
    onClose()
  }

  const openRow = (id: string, isOpen: boolean) => {
    setOpenRowId(isOpen ? id : null)
  }

  return (
    <Modal
      open
      onOpenChange={v => { if (!v) onClose() }}
      title={thema.name}
      size="md"
      footer={
        editStep === 'meta' ? (
          <div className="flex items-center justify-between w-full gap-2">
            {allowRemove ? (
              <button
                onClick={remove}
                className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 transition-colors px-2 py-1 rounded-lg hover:bg-destructive/8"
              >
                <Icon name="delete" size={14} />
                Aus Klasse entfernen
              </button>
            ) : <div />}
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => exportThema(themaId)} aria-label="Exportieren" className="text-muted-foreground">
                <Icon name="download" size={14} />
              </Button>
              <Button variant="secondary" onClick={onClose}>Abbrechen</Button>
              <Button onClick={() => setEditStep('lernziele')} disabled={!localName.trim()}>
                Weiter <Icon name="chevron_right" size={14} className="ml-0.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full gap-2">
            <Button variant="secondary" onClick={() => setEditStep('meta')} className="text-muted-foreground">
              <Icon name="chevron_left" size={14} className="mr-0.5" /> Zurück
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={onClose}>Abbrechen</Button>
              <Button onClick={save} disabled={!localName.trim()}>Fertig</Button>
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

          {/* Fällig am — klassenspezifisch */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Fällig am <span className="font-normal">(opt.)</span></Label>
            <div className="relative">
              <Input
                type="date"
                value={faelligAm}
                onChange={e => setFaelligAm(e.target.value)}
                className="pr-8 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
              <Icon name="calendar_today" size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
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
                <ModalOptionList
                  options={faecher.map(f => ({ value: f.id, label: f.name }))}
                  current={localFachId}
                  onSelect={v => { setLocalFachId(v); setOpenRowId(null) }}
                />
              </ModalRow>
            )}

            {/* Typ */}
            <ModalRow
              label="Typ"
              displayValue={localTyp === 'rilz' ? 'RILZ' : 'Standard'}
              open={openRowId === 'typ'}
              onOpenChange={v => openRow('typ', v)}
            >
              <ModalOptionList
                options={[{ value: 'standard', label: 'Standard' }, { value: 'rilz', label: 'RILZ' }]}
                current={localTyp}
                onSelect={v => { setLocalTyp(v as 'standard' | 'rilz'); setOpenRowId(null) }}
              />
            </ModalRow>

            {/* Schulstufe */}
            <ModalRow
              label="Schulstufe"
              displayValue={stufe ? `Kl. ${stufe}` : undefined}
              placeholder="keine"
              open={openRowId === 'stufe'}
              onOpenChange={v => openRow('stufe', v)}
            >
              <ModalOptionList
                options={[1,2,3,4,5,6,7,8,9].map(n => ({ value: String(n), label: `Kl. ${n}` }))}
                current={stufe ? String(stufe) : ''}
                onSelect={v => { setStufe(v ? Number(v) : undefined); setOpenRowId(null) }}
                clearLabel="Keine Auswahl"
              />
            </ModalRow>
          </div>
        </div>
      )}

      {/* Step 2: Lernziele */}
      {editStep === 'lernziele' && <LernzielEditSection themaId={themaId} />}
    </Modal>
  )
}
const LernzieleTab = ({ klassId }: { klassId: string }) => {
  const {
    getClass,
    faecher, themen, lernziele,
    assignThemaToKlasse, removeThemaFromKlasse,
    createFach, deleteFach, exportThema, exportFach,
    getStudentsForClass,
  } = useData()

  const klasse = getClass(klassId)!
  const klasseGrade = parseInt(klasse.name)
  const today = todayISO()

  const [collapsedFaecher, setCollapsedFaecher] = useState<Set<string>>(new Set())
  const [expandedThemen, setExpandedThemen] = useState<Set<string>>(new Set())

  const [popupLZ, setPopupLZ] = useState<LernzielType | null>(null)
  const [search, setSearch] = useState('')
  const [addFachId, setAddFachId] = useState<string | null>(null)
  const [createNewFachId, setCreateNewFachId] = useState<string | null>(null)
  const [editThema, setEditThema] = useState<{ id: string; allowRemove: boolean } | null>(null)
  const [statsThemaId, setStatsThemaId] = useState<string | null>(null)

  // Fach anlegen / aus Klasse entfernen / leeres Fach löschen
  const [fachCreateOpen, setFachCreateOpen] = useState(false)
  const [removeFachId, setRemoveFachId] = useState<string | null>(null)
  const [deleteEmptyFachId, setDeleteEmptyFachId] = useState<string | null>(null)

  // Import (Fächer-Zuordnungs-Maske wie in der Lernzielsammlung);
  // importierte Themen werden direkt dieser Klasse zugewiesen.
  const lezio = useLezioImport({ onImported: (themaId) => assignThemaToKlasse(klassId, themaId) })

  const toggleThema = (themaId: string) => {
    setExpandedThemen(prev => { const n = new Set(prev); n.has(themaId) ? n.delete(themaId) : n.add(themaId); return n })
  }

  // Alle Standard-Themen eines Fachs aus dieser Klasse abmelden (kein globales Löschen).
  const removeFachFromKlasse = (fachId: string) => {
    themen
      .filter(t => t.fachId === fachId && klasse.assignedThemaIds.includes(t.id))
      .forEach(t => removeThemaFromKlasse(klassId, t.id))
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
    const addEntry = (fachId: string, entry: RilzThemaEntry) => {
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

  const toggleFach = (fachId: string) => {
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
          right={<>
            {lezio.feedback && (
              <span className={cn('self-center text-xs', lezio.feedback.ok ? 'text-status-reached' : 'text-status-not-reached')}>
                {lezio.feedback.msg}
              </span>
            )}
            <span className="self-center text-xs text-muted-foreground tabular-nums shrink-0">
              {`${klasse.assignedThemaIds.length} Themen · ${assignedLzIds.size} Lernziele`}
            </span>
            <Button className="h-auto shrink-0" onClick={lezio.openFileDialog}>
              <Icon name="upload" size={14} /> Importieren
            </Button>
          </>}
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
              const fachThemenCount = fachThemen.length + rilzFachThemen.length
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
                        <Highlight text={fach.name} query={q} />
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">{fachThemenCount} {fachThemenCount === 1 ? 'Thema' : 'Themen'}</span>
                    </button>
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      onClick={e => { e.stopPropagation(); void exportFach(fach.id) }}
                      aria-label={`${fach.name} exportieren`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground"
                    >
                      <Icon name="download" size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      onClick={e => { e.stopPropagation(); setRemoveFachId(fach.id) }}
                      aria-label={`${fach.name} aus Klasse entfernen`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-destructive"
                    >
                      <Icon name="delete" size={14} />
                    </Button>
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
                                  ? <Icon name="expand_more" size={12} className="text-muted-foreground shrink-0" />
                                  : <Icon name="chevron_right" size={12} className="text-muted-foreground shrink-0" />
                                }
                                <span className="text-sm font-medium truncate"><Highlight text={thema.name} query={q} /></span>
                              </button>

                              {thema.faelligAm ? (() => {
                                const active = themaCountsInStats(thema, today)
                                return (
                                  <span
                                    title={active ? undefined : 'Fließt ab dem Fälligkeitsdatum in die Statistik ein'}
                                    className={cn(
                                      'inline-flex items-center gap-1 text-3xs tabular-nums shrink-0 rounded px-1.5 py-0.5',
                                      active ? 'bg-muted text-foreground' : 'bg-muted/50 text-muted-foreground',
                                    )}
                                  >
                                    <Icon name="calendar_today" size={12} />
                                    {formatDateCH(thema.faelligAm, { day: 'numeric', month: 'short' })}
                                  </span>
                                )
                              })() : (
                                <span
                                  title="Fließt erst mit gesetztem Fälligkeitsdatum in die Statistik ein"
                                  className="inline-flex items-center gap-1 text-3xs tabular-nums shrink-0 rounded px-1.5 py-0.5 border border-dashed border-border text-muted-foreground/60"
                                >
                                  <Icon name="calendar_today" size={12} />
                                  kein Datum
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
                                <Icon name="bar_chart" size={14} />
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); setEditThema({ id: thema.id, allowRemove: true }) }}
                                className="shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                                aria-label="Thema bearbeiten"
                              >
                                <Icon name="edit" size={14} />
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); exportThema(thema.id) }}
                                className="shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                                aria-label="Thema herunterladen"
                              >
                                <Icon name="download" size={14} />
                              </button>
                            </div>

                            {statsThemaId === thema.id && (() => {
                              const statsLZ = lernziele.filter(lz => lz.themaId === thema.id)
                              const n = klassStudents.length
                              return (
                                <div className="border-t border-primary/15 bg-primary/5 px-3 py-2 space-y-1.5">
                                  <p className="text-4xs font-semibold uppercase tracking-widest text-primary mb-2">
                                    Statistik — {n} Schüler
                                  </p>
                                  {statsLZ.map(lz => {
                                    const reached = klassStudents.filter(s => s.lernzielStatus[lz.id] === 'reached').length
                                    const partial = klassStudents.filter(s => s.lernzielStatus[lz.id] === 'partially_reached').length
                                    const pct = n === 0 ? 0 : Math.round(((reached + partial * 0.5) / n) * 100)
                                    return (
                                      <div key={lz.id} className="flex items-center gap-2">
                                        <span className={cn(
                                          'shrink-0 rounded px-1 py-0.5 text-4xs font-bold leading-none',
                                          categoryChipClasses(lz.kategorie),
                                        )}>
                                          {lz.kategorie === 'grundlegend' ? 'G' : 'A'}
                                        </span>
                                        <span className="flex-1 text-xs truncate text-foreground">{lz.label}</span>
                                        <span className="text-3xs tabular-nums text-muted-foreground whitespace-nowrap">
                                          <span className="text-status-reached font-medium">{reached}</span>/{n}
                                        </span>
                                        <div className="w-20 shrink-0">
                                          <ProgressBar segments={[{ value: pct, className: 'bg-primary' }]} total={100} size="xs" rounded={false} />
                                        </div>
                                        <span className={cn('text-3xs font-bold tabular-nums w-7 text-right shrink-0', scoreColor(pct))}>
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
                                        <span className={cn('text-3xs font-semibold uppercase tracking-wide',
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
                                                <Icon name="info" size={14} />
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
                                  ? <Icon name="expand_more" size={12} className="text-muted-foreground shrink-0" />
                                  : <Icon name="chevron_right" size={12} className="text-muted-foreground shrink-0" />
                                }
                                <span className="text-sm font-medium truncate">{thema.name}</span>
                                <Badge variant="rilz">
                                  RILZ
                                </Badge>
                                <Badge className="gap-0.5 tabular-nums">
                                  <Icon name="person" size={12} />
                                  {studentCount}
                                </Badge>
                              </button>

                              {thema.faelligAm && (
                                <Badge className="gap-1 tabular-nums">
                                  <Icon name="calendar_today" size={12} />
                                  {formatDateCH(thema.faelligAm, { day: 'numeric', month: 'short' })}
                                </Badge>
                              )}
                              <button
                                onClick={e => { e.stopPropagation(); setEditThema({ id: thema.id, allowRemove: false }) }}
                                className="shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                                aria-label="Thema bearbeiten"
                              >
                                <Icon name="edit" size={14} />
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
                          <Icon name="add" size={12} /> Themen hinzufügen
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Faecher ohne der Klasse zugewiesene Themen:
            - mit grade-passenden Katalog-Themen → „Themen hinzufügen"
            - komplett leer (frisch angelegt) → Platzhalter-Karte im Sammlungs-Layout */}
        {(() => {
          const assignedFachIds = new Set(assignedData.map(d => d.fach.id))
          const unrepresentedFaecher = faecher.filter(f =>
            !assignedFachIds.has(f.id) &&
            (
              themen.some(t =>
                t.fachId === f.id &&
                (!t.typ || t.typ === 'standard') &&
                (!t.stufe || t.stufe.includes(klasseGrade))
              ) ||
              // komplett leeres Fach (kein einziges Thema) → als Platzhalter zeigen
              !themen.some(t => t.fachId === f.id)
            )
          )
          if (unrepresentedFaecher.length === 0) return null
          return (
            <div className="space-y-3">
              {unrepresentedFaecher.map(fach => {
                const fachColor = getFachColor(fach.id, faecher.map(f => f.id), fach.colorIndex)
                const isEmpty = !themen.some(t => t.fachId === fach.id)
                return (
                  <div key={fach.id} className={cn(
                    'rounded-2xl border bg-card overflow-hidden shadow-sm border-l-4',
                    fachColor.border,
                  )}>
                    <div className={cn('group flex items-center gap-2 px-3 py-1.5 select-none', fachColor.bg)}>
                      <span className="text-xs font-semibold uppercase tracking-wider text-foreground flex-1">{fach.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">Keine Themen</span>
                      {isEmpty && (
                        <Button
                          size="icon-sm"
                          variant="secondary"
                          onClick={e => { e.stopPropagation(); setDeleteEmptyFachId(fach.id) }}
                          aria-label={`${fach.name} löschen`}
                          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-destructive"
                        >
                          <Icon name="delete" size={14} />
                        </Button>
                      )}
                    </div>
                    <button
                      onClick={() => setAddFachId(fach.id)}
                      className="flex w-full items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground/60 hover:text-primary hover:bg-accent/20 transition-colors"
                    >
                      <Icon name="add" size={12} /> Thema hinzufügen
                    </button>
                  </div>
                )
              })}
            </div>
          )
        })()}

        {/* Neues Fach — ganz unten (wie in der Lernzielsammlung) */}
        <button
          onClick={() => setFachCreateOpen(true)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border py-2 text-xs text-muted-foreground hover:text-primary hover:bg-accent/20 transition-colors"
        >
          <Icon name="add" size={12} /> Neues Fach
        </button>

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

        {/* Neues Fach anlegen */}
        <InputModal
          open={fachCreateOpen} onOpenChange={setFachCreateOpen}
          title="Neues Fach" label="Fachbezeichnung" placeholder="z. B. Mathematik"
          onSubmit={(name) => { createFach(name); setFachCreateOpen(false) }}
        />

        {/* Fach aus Klasse entfernen */}
        <ConfirmDialog
          open={!!removeFachId}
          onOpenChange={(o) => { if (!o) setRemoveFachId(null) }}
          title="Fach aus Klasse entfernen"
          description="Alle Themen dieses Fachs werden aus dieser Klasse abgemeldet. Fach, Themen und Lernziele bleiben im Katalog und in anderen Klassen erhalten."
          confirmLabel="Entfernen"
          onConfirm={() => { if (removeFachId) { removeFachFromKlasse(removeFachId); setRemoveFachId(null) } }}
        />

        {/* Leeres Fach löschen (datenlos → global) */}
        <ConfirmDialog
          open={!!deleteEmptyFachId}
          onOpenChange={(o) => { if (!o) setDeleteEmptyFachId(null) }}
          title="Fach löschen"
          description="Dieses leere Fach dauerhaft löschen?"
          confirmLabel="Löschen"
          onConfirm={() => { if (deleteEmptyFachId) { deleteFach(deleteEmptyFachId); setDeleteEmptyFachId(null) } }}
        />

        <LezioImportModal imp={lezio} />

      </div>


      {popupLZ && <LernzielPopup lz={popupLZ} onClose={() => setPopupLZ(null)} />}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

const KlasseDetailPage = () => {
  const searchParams = useSearchParams()
  const klassId = searchParams.get('klassId') ?? ''
  const router = useRouter()
  const {
    getClass,
    updateClass,
    deleteClass,
    getStudentsForClass,
    createStudent,
    updateStudent,
    deleteStudent,
    faecher,
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
  const [adminSearch, setAdminSearch] = useState('')
  const [sortCol, setSortCol] = useState<'vorname' | 'nachname' | 'progress'>('vorname')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [editStudentId, setEditStudentId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

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
      <div className="page-container py-8 text-muted-foreground text-sm">
        Klasse nicht gefunden.{' '}
        <Button variant="secondary" className="h-auto border-transparent bg-transparent p-0" onClick={() => router.push('/klassen')}>Zur Übersicht</Button>
      </div>
    )
  }

  return (
    <div className="page-container py-3">
      <div>
        <TabBar
          active={tab}
          onChange={setTab}
          title={klasse.name}
          onEditTitle={() => setEditingName(true)}
        />

        <InputModal
          open={editingName}
          onOpenChange={setEditingName}
          title="Klasse umbenennen"
          label="Klassenname"
          placeholder="z. B. 205"
          initialValue={klasse.name}
          submitLabel="Speichern"
          onSubmit={(name) => updateClass(klassId, name)}
        />
      </div>

      {/* Schüler tab */}
      {tab === 'schueler' && (
        <>
          {students.length === 0 && (
            <EmptyState
              icon={<Icon name="person" size={24} className="text-accent-foreground" />}
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
                  <Button className="h-auto" onClick={() => setCreateOpen(true)}>
                    <Icon name="add" size={14} />
                    Neuer Schüler
                  </Button>
                }
              />

              {/* Admin table */}
              <Table>
                <TableHeader>
                  <TableHead className="w-7 pr-0" />
                  <TableSortHeader
                    active={sortCol === 'vorname'}
                    direction={sortDir}
                    onClick={() => handleSortCol('vorname')}
                    className="w-24"
                  >
                    Vorname
                  </TableSortHeader>
                  <TableSortHeader
                    active={sortCol === 'nachname'}
                    direction={sortDir}
                    onClick={() => handleSortCol('nachname')}
                    className="w-24"
                  >
                    Nachname
                  </TableSortHeader>
                  <TableHead className="w-full">Kategorie</TableHead>
                  <TableSortHeader
                    active={sortCol === 'progress'}
                    direction={sortDir}
                    onClick={() => handleSortCol('progress')}
                    className="w-28"
                  >
                    Fortschritt
                  </TableSortHeader>
                  <TableHead className="w-20" />
                </TableHeader>

                <TableBody>
                  {sortedStudents.length === 0 && (
                    <TableEmpty colSpan={6}>
                      Keine Schüler gefunden für „{adminSearch}"
                    </TableEmpty>
                  )}
                  {sortedStudents.map(student => {
                    const cp = compPct(student, competencies)
                    const pctColor = scoreColor(cp)
                    const barColor = scoreBarColor(cp)
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="pr-0">
                          <Avatar size="sm" className="shrink-0">
                            <AvatarFallback className={cn('text-xs', getAvatarColor(student.vorname + ' ' + student.nachname))}>
                              {getInitials(student.vorname + ' ' + student.nachname)}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>

                        {/* Vorname */}
                        <TableCell>
                          <span className="text-sm font-medium truncate block">{student.vorname}</span>
                        </TableCell>

                        {/* Nachname */}
                        <TableCell>
                          <span className="text-sm text-muted-foreground truncate block">{student.nachname}</span>
                        </TableCell>

                        {/* Kategorie */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                            {(() => {
                              const badges: { key: string; node: React.ReactNode }[] = []
                              if (student.bvsa) badges.push({ key: 'bvsa', node: <Badge variant="bvsa" className="font-semibold">bVSA</Badge> })
                              for (const fachId of student.rilzFachIds ?? []) {
                                const fach = faecher.find(f => f.id === fachId)
                                if (fach) {
                                  const fc = getFachColor(fach.id, faecher.map(f => f.id), fach.colorIndex)
                                  badges.push({ key: fachId, node: <span className={cn('rounded px-1.5 py-0.5 text-3xs font-semibold shrink-0', fc.bg, fc.text)}>RILZ {fach.name}</span> })
                                }
                              }
                              if (badges.length === 0) return null
                              const MAX = 4
                              const overflow = badges.length - MAX
                              return (
                                <>
                                  {badges.slice(0, MAX).map(b => <span key={b.key} className="contents">{b.node}</span>)}
                                  {overflow > 0 && (
                                    <Badge className="font-semibold">+{overflow}</Badge>
                                  )}
                                </>
                              )
                            })()}
                          </div>
                        </TableCell>

                        {/* Mini progress bar */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {competencies.length > 0 ? (
                              <>
                                <div className="flex-1">
                                  <ProgressBar segments={[{ value: cp, className: barColor }]} total={100} size="xs" />
                                </div>
                                <span className={cn('text-3xs font-semibold tabular-nums w-6 text-right shrink-0', pctColor)}>
                                  {Math.round(cp)}%
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="secondary"
                              size="icon-sm"
                              onClick={(e) => { e.stopPropagation(); setEditStudentId(student.id) }}
                              aria-label="Schüler bearbeiten"
                            >
                              <Icon name="edit" size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
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

      {/* Einstellungen tab */}
      {tab === 'einstellungen' && (
        <GefahrenzoneSettings
          klassName={klasse.name}
          onDelete={() => { deleteClass(klassId); router.push('/klassen') }}
        />
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

export default function Page() {
  return (
    <Suspense fallback={null}>
      <KlasseDetailPage />
    </Suspense>
  )
}
