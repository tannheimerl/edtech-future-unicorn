'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Pencil, Plus, UserRound,
  ChevronDown, ChevronRight, Trash2, Check,
  List, LayoutGrid, Search, Info,
} from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { ClassAnalytics } from '@/components/analytics/ClassAnalytics'
import { LernkontrolleTab } from '@/components/lernkontrolle/LernkontrolleTab'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Modal } from '@/components/shared/Modal'
import { cn } from '@/lib/utils'
import type { Schueler, Lernziel as LernzielType } from '@/types/domain'

// ── Helpers ───────────────────────────────────────────────────────────────

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-teal-100 text-teal-700',
  'bg-sky-100 text-sky-700',
  'bg-orange-100 text-orange-700',
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i)
    hash = hash & hash
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

type SortKey = 'name' | 'pct_desc' | 'pct_asc'

function lzPct(student: Schueler, lzIds: string[]): number {
  if (lzIds.length === 0) return 0
  const reached = lzIds.filter(id => student.lernzielStatus[id] === 'reached').length
  const partial = lzIds.filter(id => student.lernzielStatus[id] === 'partially_reached').length
  return ((reached + partial * 0.5) / lzIds.length) * 100
}

function compPct(student: Schueler, comps: { id: string }[]): number {
  if (comps.length === 0) return 0
  const reached = comps.filter(c => student.competencyStatus[c.id] === 'reached').length
  const partial = comps.filter(c => student.competencyStatus[c.id] === 'partially_reached').length
  return ((reached + partial * 0.5) / comps.length) * 100
}

type ViewMode = 'list' | 'grid'

// ── Student form modal ─────────────────────────────────────────────────────

function SchuelerFormModal({
  open, onOpenChange, initialName = '', onSubmit,
}: {
  open: boolean; onOpenChange: (v: boolean) => void
  initialName?: string; onSubmit: (name: string) => void
}) {
  const [name, setName] = useState(initialName)
  useEffect(() => { if (open) setName(initialName) }, [open, initialName])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim())
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={initialName ? 'Schüler bearbeiten' : 'Neuer Schüler'}
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
          <Label htmlFor="schueler-name">Vorname</Label>
          <Input
            id="schueler-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vorname"
            autoFocus
          />
        </div>
      </form>
    </Modal>
  )
}

// ── Tab switcher ──────────────────────────────────────────────────────────

type Tab = 'schueler' | 'lernkontrolle' | 'analytics' | 'einstellungen'

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: 'schueler', label: 'Schüler' },
    { key: 'lernkontrolle', label: 'Lernkontrolle' },
    { key: 'analytics', label: 'Übersicht' },
    { key: 'einstellungen', label: 'Einstellungen' },
  ]
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-muted w-fit mb-4">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
            active === key
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {label}
        </button>
      ))}
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

// ── Einstellungen tab ─────────────────────────────────────────────────────

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

function EinstellungenTab({ klassId }: { klassId: string }) {
  const router = useRouter()
  const {
    getClass, updateClass, deleteClass,
    faecher, themen, lernziele,
    assignLernzielToKlasse, removeLernzielFromKlasse,
  } = useData()

  const klasse = getClass(klassId)!

  const [nameValue, setNameValue] = useState(klasse.name)
  const [nameSaved, setNameSaved] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [collapsedFaecher, setCollapsedFaecher] = useState<Set<string>>(new Set())
  const [collapsedThemen, setCollapsedThemen] = useState<Set<string>>(new Set())
  const [popupLZ, setPopupLZ] = useState<LernzielType | null>(null)
  const [search, setSearch] = useState('')

  const q = search.trim().toLowerCase()

  const themenByFach = faecher
    .map(f => ({ fach: f, themen: themen.filter(t => t.fachId === f.id) }))
    .filter(f => f.themen.length > 0)

  // Filter: a fach is visible if any child thema or lz matches
  const filteredData = themenByFach
    .map(({ fach, themen: fachThemen }) => {
      const filteredThemen = fachThemen
        .map(thema => {
          const filteredLZ = lernziele.filter(lz => lz.themaId === thema.id &&
            (!q || lz.label.toLowerCase().includes(q) || thema.name.toLowerCase().includes(q) || fach.name.toLowerCase().includes(q))
          )
          return { thema, lz: filteredLZ }
        })
        .filter(({ thema, lz }) => lz.length > 0 || thema.name.toLowerCase().includes(q) || fach.name.toLowerCase().includes(q))
      return { fach, themen: filteredThemen }
    })
    .filter(({ fach, themen: ft }) => ft.length > 0 || fach.name.toLowerCase().includes(q))

  function saveName() {
    if (!nameValue.trim() || nameValue.trim() === klasse.name) return
    updateClass(klassId, nameValue.trim())
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  function toggleLZ(lzId: string) {
    klasse.assignedLernzielIds.includes(lzId)
      ? removeLernzielFromKlasse(klassId, lzId)
      : assignLernzielToKlasse(klassId, lzId)
  }

  function toggleThema(themaLZIds: string[]) {
    const allAssigned = themaLZIds.every(id => klasse.assignedLernzielIds.includes(id))
    if (allAssigned) {
      themaLZIds.forEach(id => removeLernzielFromKlasse(klassId, id))
    } else {
      themaLZIds.forEach(id => { if (!klasse.assignedLernzielIds.includes(id)) assignLernzielToKlasse(klassId, id) })
    }
  }

  function toggleFach(fachId: string) {
    setCollapsedFaecher(prev => { const n = new Set(prev); n.has(fachId) ? n.delete(fachId) : n.add(fachId); return n })
  }

  function toggleThemaCollapse(themaId: string) {
    setCollapsedThemen(prev => { const n = new Set(prev); n.has(themaId) ? n.delete(themaId) : n.add(themaId); return n })
  }

  return (
    <div className="grid grid-cols-[1fr_300px] gap-5 items-start">

      {/* Left — unified tree table */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Lernziele, Themen oder Fächer suchen…"
            className="pl-8 h-8 text-sm"
          />
        </div>

        {themenByFach.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Noch keine Themen im Lernzielkatalog.</p>
            <a href="/lernziele" className="text-xs text-primary hover:underline">Jetzt anlegen →</a>
          </div>
        ) : filteredData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Keine Ergebnisse für „{search}"</p>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            {filteredData.map(({ fach, themen: fachThemen }, fi) => {
              const fachCollapsed = !q && collapsedFaecher.has(fach.id)
              const allFachLZIds = fachThemen.flatMap(({ lz }) => lz.map(l => l.id))
              const fachAssignedCount = allFachLZIds.filter(id => klasse.assignedLernzielIds.includes(id)).length

              return (
                <div key={fach.id} className={cn(fi > 0 && 'border-t border-border')}>
                  {/* Fach row */}
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 cursor-pointer select-none hover:bg-muted/60 transition-colors"
                    onClick={() => toggleFach(fach.id)}
                  >
                    {fachCollapsed
                      ? <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                      : <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                    }
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground flex-1"><Highlight text={fach.name} query={q} /></span>
                    <span className="text-xs text-muted-foreground tabular-nums">{fachAssignedCount}/{allFachLZIds.length} LZ</span>
                  </div>

                  {!fachCollapsed && fachThemen.map(({ thema, lz: themaLZ }) => {
                    const themaLZIds = themaLZ.map(l => l.id)
                    const assignedCount = themaLZIds.filter(id => klasse.assignedLernzielIds.includes(id)).length
                    const allAssigned = themaLZIds.length > 0 && assignedCount === themaLZIds.length
                    const someAssigned = assignedCount > 0 && !allAssigned
                    const themaCollapsed = !q && collapsedThemen.has(thema.id)

                    return (
                      <div key={thema.id} className="border-t border-border/60">
                        {/* Thema row */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-background hover:bg-accent/20 transition-colors">
                          <button
                            onClick={() => toggleThemaCollapse(thema.id)}
                            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {themaCollapsed
                              ? <ChevronRight className="size-3.5" />
                              : <ChevronDown className="size-3.5" />
                            }
                          </button>
                          <button
                            onClick={() => toggleThema(themaLZIds)}
                            className={cn(
                              'flex size-3.5 shrink-0 items-center justify-center rounded border-2 transition-all',
                              allAssigned ? 'border-primary bg-primary' : someAssigned ? 'border-primary bg-primary/20' : 'border-muted-foreground/30 bg-background',
                            )}
                          >
                            {allAssigned && <Check className="size-2 text-white stroke-[3]" />}
                            {someAssigned && <span className="block w-1.5 h-px bg-primary" />}
                          </button>
                          <span className="flex-1 text-xs font-medium text-foreground"><Highlight text={thema.name} query={q} /></span>
                          <span className="text-xs text-muted-foreground tabular-nums shrink-0">{assignedCount}/{themaLZIds.length}</span>
                        </div>

                        {/* LZ rows */}
                        {!themaCollapsed && themaLZ.map(lz => {
                          const isAssigned = klasse.assignedLernzielIds.includes(lz.id)
                          const hasKriterien = (lz.kriterien?.length ?? 0) > 0
                          return (
                            <div
                              key={lz.id}
                              className="flex items-center gap-2 pl-9 pr-3 py-1.5 border-t border-border/40 hover:bg-accent/20 transition-colors group"
                            >
                              <button
                                onClick={() => toggleLZ(lz.id)}
                                className={cn(
                                  'flex size-3.5 shrink-0 items-center justify-center rounded-sm border-2 transition-all',
                                  isAssigned ? 'border-primary bg-primary' : 'border-muted-foreground/30 bg-background',
                                )}
                              >
                                {isAssigned && <Check className="size-2 text-white stroke-[3]" />}
                              </button>
                              <span
                                className={cn('flex-1 text-xs cursor-pointer', isAssigned ? 'text-foreground' : 'text-muted-foreground')}
                                onClick={() => toggleLZ(lz.id)}
                              >
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
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="space-y-4">
        <SettingsCard title="Klassenname">
          <div className="flex gap-2">
            <Input
              value={nameValue}
              onChange={(e) => { setNameValue(e.target.value); setNameSaved(false) }}
              onKeyDown={(e) => e.key === 'Enter' && saveName()}
              placeholder="z. B. 5a"
              className="text-sm h-8"
            />
            <Button
              size="sm"
              onClick={saveName}
              disabled={!nameValue.trim() || nameValue.trim() === klasse.name}
              variant={nameSaved ? 'outline' : 'default'}
              className="shrink-0 h-8"
            >
              {nameSaved ? <><Check className="size-3.5" /> OK</> : 'Speichern'}
            </Button>
          </div>
        </SettingsCard>

        <SettingsCard title="Übersicht">
          <p className="text-xs text-muted-foreground">
            {klasse.assignedLernzielIds.length} Lernziele ausgewählt
          </p>
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
      </div>

      {popupLZ && <LernzielPopup lz={popupLZ} onClose={() => setPopupLZ(null)} />}

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
    getStudentsForClass,
    createStudent,
    updateStudent,
    deleteStudent,
    faecher,
    themen,
    lernziele,
    competencies,
    getThemenForKlasse,
  } = useData()

  const klasse = getClass(klassId)
  const students = getStudentsForClass(klassId)
  const assignedThemen = getThemenForKlasse(klassId)

  const [tab, setTab] = useState<Tab>('schueler')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortOpen, setSortOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Schueler | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Schueler | null>(null)

  const todayStr = new Date().toISOString().slice(0, 10)
  const themaFaelligMap = new Map(themen.map(t => [t.id, t.faelligAm]))
  const assignedLZIds = klasse
    ? lernziele
        .filter(lz => {
          if (!klasse.assignedLernzielIds.includes(lz.id)) return false
          const faellig = themaFaelligMap.get(lz.themaId)
          return !faellig || faellig <= todayStr
        })
        .map(lz => lz.id)
    : []

  const sortedStudents = [...students].sort((a, b) => {
    if (sortKey === 'name') return a.name.localeCompare(b.name, 'de')
    const pa = lzPct(a, assignedLZIds), pb = lzPct(b, assignedLZIds)
    return sortKey === 'pct_desc' ? pb - pa : pa - pb
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
    <div className="mx-auto w-full max-w-7xl px-6 py-5">
      <Breadcrumb
        className="mb-3"
        items={[{ label: 'Klassen', href: '/klassen' }, { label: klasse.name }]}
      />

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{klasse.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {students.length} Schüler
            {assignedThemen.length > 0 && (
              <span className="ml-2 text-muted-foreground/60">
                · {assignedThemen.length} Themen · {lernziele.filter(lz => assignedThemen.some(t => t.id === lz.themaId)).length} Lernziele
              </span>
            )}
          </p>
        </div>
        {(tab === 'schueler') && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            Neuer Schüler
          </Button>
        )}
      </div>

      <TabBar active={tab} onChange={setTab} />

      {/* Schüler tab */}
      {tab === 'schueler' && (
        <>
          {students.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-accent">
                <UserRound className="size-6 text-accent-foreground" />
              </div>
              <div>
                <p className="font-semibold">Noch keine Schüler</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Füge Schüler zu dieser Klasse hinzu.</p>
              </div>
              <Button onClick={() => setCreateOpen(true)}>Ersten Schüler hinzufügen</Button>
            </div>
          )}
          {students.length > 0 && (
            <>
              {/* Sort bar + view toggle */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(o => !o)}
                    className="flex items-center gap-1 text-sm font-medium"
                  >
                    <span className="text-foreground/60">Sortieren:</span>{' '}
                    <span className="text-primary">
                      {([
                        { key: 'name' as SortKey,     label: 'Name' },
                        { key: 'pct_desc' as SortKey, label: '% beste zuerst' },
                        { key: 'pct_asc' as SortKey,  label: '% Förderbedarf' },
                      ]).find(o => o.key === sortKey)?.label}
                    </span>
                    <ChevronDown className="w-4 h-4 text-primary" />
                  </button>
                  {sortOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                      <div className="absolute left-0 top-full mt-1 z-20 bg-background border border-border rounded-xl shadow-lg py-1 min-w-[180px]">
                        {([
                          { key: 'name' as SortKey,     label: 'Name' },
                          { key: 'pct_desc' as SortKey, label: '% beste zuerst' },
                          { key: 'pct_asc' as SortKey,  label: '% Förderbedarf' },
                        ]).map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => { setSortKey(key); setSortOpen(false) }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors"
                          >
                            <span className={cn('w-4 shrink-0', sortKey === key ? 'visible' : 'invisible')}>✓</span>
                            {label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5 shrink-0">
                  {([
                    { mode: 'list' as ViewMode, Icon: List, label: 'Listenansicht' },
                    { mode: 'grid' as ViewMode, Icon: LayoutGrid, label: 'Kachelansicht' },
                  ]).map(({ mode, Icon, label }) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      aria-label={label}
                      className={cn(
                        'p-1 rounded-md transition-all',
                        viewMode === mode
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <Icon className="size-3.5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* List view */}
              {viewMode === 'list' && (
                <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                  {sortedStudents.map((student) => {
                    const cp = compPct(student, competencies)
                    const pctColor = cp >= 75 ? 'text-emerald-600' : cp >= 40 ? 'text-amber-600' : 'text-red-500'
                    const needsSupport = cp < 50
                    const compReached = competencies.filter(c => student.competencyStatus[c.id] === 'reached').length
                    const compPartial = competencies.filter(c => student.competencyStatus[c.id] === 'partially_reached').length
                    const compTotal = competencies.length
                    return (
                      <div
                        key={student.id}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 hover:bg-accent/40 transition-colors cursor-pointer group',
                          needsSupport ? 'border-l-2 border-l-red-400' : 'border-l-2 border-l-transparent',
                        )}
                        onClick={() => router.push(`/klassen/${klassId}/schueler/${student.id}`)}
                      >
                        <Avatar size="sm">
                          <AvatarFallback className={cn('text-xs', getAvatarColor(student.name))}>
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="w-32 shrink-0 text-sm font-medium truncate">{student.name}</p>
                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                          {compTotal > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="flex flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                {compReached > 0 && (
                                  <div className="h-full bg-status-reached transition-all" style={{ width: `${(compReached / compTotal) * 100}%` }} />
                                )}
                                {compPartial > 0 && (
                                  <div className="h-full bg-status-partial transition-all" style={{ width: `${(compPartial / compTotal) * 100}%` }} />
                                )}
                              </div>
                              <span className={cn('text-xs font-semibold tabular-nums w-8 text-right shrink-0', pctColor)}>
                                {Math.round(cp)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Keine Kompetenzen</span>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon-sm" onClick={() => setEditTarget(student)} aria-label="Bearbeiten"><Pencil /></Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(student)} aria-label="Löschen"><Trash2 className="size-3.5" /></Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Grid (tile) view */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-3 xl:grid-cols-4 gap-2">
                  {sortedStudents.map((student) => {
                    const pct = lzPct(student, assignedLZIds)
                    const cp = compPct(student, competencies)
                    const pctColor = pct >= 75 ? 'text-emerald-600' : pct >= 25 ? 'text-amber-600' : 'text-red-500'
                    const barColor = pct >= 75 ? 'bg-emerald-500' : pct >= 25 ? 'bg-amber-400' : 'bg-red-400'
                    const needsSupport = cp < 50
                    return (
                      <div
                        key={student.id}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2 hover:shadow-sm hover:-translate-y-px transition-all cursor-pointer group',
                          needsSupport ? 'border-l-2 border-l-red-400' : 'border-l-2 border-l-transparent',
                        )}
                        onClick={() => router.push(`/klassen/${klassId}/schueler/${student.id}`)}
                      >
                        <Avatar size="sm">
                          <AvatarFallback className={cn('text-xs', getAvatarColor(student.name))}>
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{student.name}</p>
                          {assignedLZIds.length > 0 ? (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
                              </div>
                              <span className={cn('text-xs font-semibold tabular-nums w-7 text-right shrink-0', pctColor)}>
                                {Math.round(pct)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Keine LZ zugewiesen</span>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon-sm" onClick={() => setEditTarget(student)} aria-label="Bearbeiten"><Pencil /></Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(student)} aria-label="Löschen"><Trash2 className="size-3.5" /></Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Lernkontrolle tab */}
      {tab === 'lernkontrolle' && (
        <LernkontrolleTab klassId={klassId} />
      )}

      {/* Analytics tab */}
      {tab === 'analytics' && (
        <ClassAnalytics
          klassId={klassId}
          students={students}
          themen={assignedThemen}
          lernziele={lernziele}
          faecher={faecher}
          competencies={competencies}
        />
      )}

      {/* Einstellungen tab */}
      {tab === 'einstellungen' && (
        <EinstellungenTab klassId={klassId} />
      )}

      {/* Modals */}
      <SchuelerFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(name) => createStudent(klassId, name)}
      />
      <SchuelerFormModal
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null) }}
        initialName={editTarget?.name ?? ''}
        onSubmit={(name) => { if (editTarget) updateStudent(editTarget.id, { name }) }}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Schüler löschen"
        description={`Soll „${deleteTarget?.name}" wirklich aus der Klasse entfernt werden?`}
        confirmLabel="Löschen"
        onConfirm={() => { if (deleteTarget) deleteStudent(deleteTarget.id) }}
      />
    </div>
  )
}
