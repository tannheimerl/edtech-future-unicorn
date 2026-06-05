'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  SquarePen, Plus, UserRound,
  ChevronDown, ChevronRight, Trash2, Check,
  List, LayoutGrid, Search, Info, Tag, Trash,
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
import { type LpRolle, LP_ROLLE_LABELS } from '@/types/domain'
import type { Schueler, Lernziel as LernzielType, Fach, Thema } from '@/types/domain'

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

type Tab = 'schueler' | 'klassenübersicht' | 'lernziele' | 'beurteilung' | 'lehrpersonen'

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: 'schueler',         label: 'Schüler' },
    { key: 'klassenübersicht', label: 'Klassenübersicht' },
    { key: 'lernziele',        label: 'Lernziele' },
    { key: 'beurteilung',      label: 'Beurteilung' },
    { key: 'lehrpersonen',     label: 'Lehrpersonen' },
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

function KategorisierungModal({
  open, onOpenChange, studentId, students, faecher, setRilzFach, setBvsa,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  studentId: string | null
  students: Schueler[]
  faecher: Fach[]
  setRilzFach: (studentId: string, fachId: string, enabled: boolean) => void
  setBvsa: (studentId: string, enabled: boolean) => void
}) {
  const student = students.find(s => s.id === studentId)
  if (!student) return null

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={`${student.name} — Kategorisierung`} size="sm">
      <div className="divide-y divide-border">
        {/* BVSA */}
        <div
          className="flex items-center justify-between py-3 cursor-pointer hover:bg-accent/20 rounded px-2 -mx-2"
          onClick={() => setBvsa(student.id, !student.bvsa)}
        >
          <div>
            <p className="text-sm font-medium">BVSA</p>
            <p className="text-xs text-muted-foreground">Besonderer Förderbedarf — erhält Bericht ohne Noten</p>
          </div>
          <Toggle on={!!student.bvsa} color="bg-purple-500" />
        </div>

        {/* RILZ per Fach */}
        {faecher.length > 0 && (
          <div className="pt-3 space-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              RILZ — Reduzierte individuelle Lernziele
            </p>
            {faecher.map(fach => {
              const hasRilz = (student.rilzFachIds ?? []).includes(fach.id)
              return (
                <div
                  key={fach.id}
                  className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-accent/20 cursor-pointer"
                  onClick={() => setRilzFach(student.id, fach.id, !hasRilz)}
                >
                  <span className="text-sm">{fach.name}</span>
                  <Toggle on={hasRilz} color="bg-orange-400" />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
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
  open, onOpenChange, fach, themen: allThemen, lernziele: allLZ, assignedIds, onAdd,
}: {
  open: boolean; onOpenChange: (v: boolean) => void
  fach: Fach; themen: Thema[]; lernziele: LernzielType[]
  assignedIds: string[]; onAdd: (ids: string[]) => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  useEffect(() => { if (open) setSelected(new Set()) }, [open])

  const fachThemen = allThemen
    .filter(t => t.fachId === fach.id)
    .map(t => ({ thema: t, lz: allLZ.filter(lz => lz.themaId === t.id && !assignedIds.includes(lz.id)) }))
    .filter(({ lz }) => lz.length > 0)

  function toggle(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Lernziele hinzufügen — ${fach.name}`}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={() => { onAdd(Array.from(selected)); onOpenChange(false) }} disabled={selected.size === 0}>
            {selected.size > 0 ? `${selected.size} hinzufügen` : 'Hinzufügen'}
          </Button>
        </>
      }
    >
      {fachThemen.length === 0 ? (
        <p className="text-sm text-muted-foreground">Alle Lernziele dieses Fachs sind bereits zugewiesen.</p>
      ) : (
        <div className="space-y-4">
          {fachThemen.map(({ thema, lz }) => (
            <div key={thema.id}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">{thema.name}</p>
              <div className="space-y-0.5">
                {lz.map(l => (
                  <div
                    key={l.id}
                    className="flex items-center gap-2.5 cursor-pointer py-1 px-2 rounded hover:bg-accent/30 transition-colors"
                    onClick={() => toggle(l.id)}
                  >
                    <div className={cn(
                      'flex size-3.5 shrink-0 items-center justify-center rounded-sm border-2 transition-all',
                      selected.has(l.id) ? 'border-primary bg-primary' : 'border-muted-foreground/30 bg-background',
                    )}>
                      {selected.has(l.id) && <Check className="size-2 text-white stroke-[3]" />}
                    </div>
                    <span className={cn(
                      'shrink-0 rounded px-1 text-[9px] font-semibold',
                      l.kategorie === 'grundlegend' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700',
                    )}>
                      {l.kategorie === 'grundlegend' ? 'G' : 'A'}
                    </span>
                    <span className="text-xs text-foreground flex-1">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

function LernzieleTab({ klassId }: { klassId: string }) {
  const {
    getClass, updateClass,
    faecher, themen, lernziele,
    assignLernzielToKlasse, removeLernzielFromKlasse,
  } = useData()

  const klasse = getClass(klassId)!

  const [nameValue, setNameValue] = useState(klasse.name)
  const [nameSaved, setNameSaved] = useState(false)
  const [collapsedFaecher, setCollapsedFaecher] = useState<Set<string>>(new Set())
  const [collapsedThemen, setCollapsedThemen] = useState<Set<string>>(new Set())
  const [popupLZ, setPopupLZ] = useState<LernzielType | null>(null)
  const [search, setSearch] = useState('')
  const [addFachId, setAddFachId] = useState<string | null>(null)

  const q = search.trim().toLowerCase()

  // Only assigned lernziele, grouped by fach/thema, filtered by search
  const assignedData = faecher
    .map(f => ({
      fach: f,
      themen: themen
        .filter(t => t.fachId === f.id)
        .map(t => ({
          thema: t,
          lz: lernziele.filter(lz =>
            lz.themaId === t.id &&
            klasse.assignedLernzielIds.includes(lz.id) &&
            (!q || lz.label.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || f.name.toLowerCase().includes(q))
          ),
        }))
        .filter(({ lz }) => lz.length > 0),
    }))
    .filter(({ themen: ft }) => ft.length > 0)

  // Whether the catalog has any LZ at all
  const catalogHasLZ = lernziele.length > 0

  function saveName() {
    if (!nameValue.trim() || nameValue.trim() === klasse.name) return
    updateClass(klassId, nameValue.trim())
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  function toggleFach(fachId: string) {
    setCollapsedFaecher(prev => { const n = new Set(prev); n.has(fachId) ? n.delete(fachId) : n.add(fachId); return n })
  }

  function toggleThemaCollapse(themaId: string) {
    setCollapsedThemen(prev => { const n = new Set(prev); n.has(themaId) ? n.delete(themaId) : n.add(themaId); return n })
  }

  return (
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

      {/* LZ tree */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Lernziele, Themen oder Fächer suchen…"
              className="pl-8 h-8 text-sm"
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
            {klasse.assignedLernzielIds.length} Lernziele
          </span>
        </div>

        {!catalogHasLZ ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Noch keine Lernziele im Katalog.</p>
            <a href="/lernziele" className="text-xs text-primary hover:underline">Jetzt anlegen →</a>
          </div>
        ) : assignedData.length === 0 && !q ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Noch keine Lernziele für diese Klasse ausgewählt.</p>
            <p className="text-xs text-muted-foreground">Wähle ein Fach und klicke auf <strong>+</strong>, um Lernziele hinzuzufügen.</p>
          </div>
        ) : assignedData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Keine Ergebnisse für „{search}"</p>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            {assignedData.map(({ fach, themen: fachThemen }, fi) => {
              const fachCollapsed = !q && collapsedFaecher.has(fach.id)
              const fachLZCount = fachThemen.reduce((s, { lz }) => s + lz.length, 0)
              const hasUnassignedInFach = lernziele.some(lz => {
                const t = themen.find(t => t.id === lz.themaId)
                return t?.fachId === fach.id && !klasse.assignedLernzielIds.includes(lz.id)
              })

              return (
                <div key={fach.id} className={cn(fi > 0 && 'border-t border-border')}>
                  {/* Fach row */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 select-none">
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
                        className="shrink-0 ml-1 flex items-center justify-center size-5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        aria-label={`Lernziele in ${fach.name} hinzufügen`}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {!fachCollapsed && fachThemen.map(({ thema, lz: themaLZ }) => {
                    const themaCollapsed = !q && collapsedThemen.has(thema.id)

                    return (
                      <div key={thema.id} className="border-t border-border/60">
                        {/* Thema row */}
                        <div
                          className="flex items-center gap-2 px-3 py-1.5 bg-background hover:bg-accent/20 transition-colors cursor-pointer"
                          onClick={() => toggleThemaCollapse(thema.id)}
                        >
                          {themaCollapsed
                            ? <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                            : <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                          }
                          <span className="flex-1 text-xs font-medium text-foreground"><Highlight text={thema.name} query={q} /></span>
                          <span className="text-xs text-muted-foreground tabular-nums shrink-0">{themaLZ.length}</span>
                        </div>

                        {/* LZ rows */}
                        {!themaCollapsed && themaLZ.map(lz => {
                          const hasKriterien = (lz.kriterien?.length ?? 0) > 0
                          return (
                            <div
                              key={lz.id}
                              className="flex items-center gap-2 pl-8 pr-3 py-1.5 border-t border-border/40 hover:bg-accent/20 transition-colors group"
                            >
                              <span className={cn(
                                'shrink-0 rounded px-1 text-[9px] font-semibold',
                                lz.kategorie === 'grundlegend' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700',
                              )}>
                                {lz.kategorie === 'grundlegend' ? 'G' : 'A'}
                              </span>
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
                              <button
                                onClick={() => removeLernzielFromKlasse(klassId, lz.id)}
                                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                aria-label="Lernziel entfernen"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
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

        {/* Faecher with catalog LZ but none assigned yet */}
        {(() => {
          const assignedFachIds = new Set(assignedData.map(d => d.fach.id))
          const unrepresentedFaecher = faecher.filter(f =>
            !assignedFachIds.has(f.id) &&
            themen.some(t => t.fachId === f.id && lernziele.some(lz => lz.themaId === t.id))
          )
          if (unrepresentedFaecher.length === 0) return null
          return (
            <div className="rounded-2xl border border-dashed border-border bg-card overflow-hidden">
              {unrepresentedFaecher.map((fach, fi) => (
                <div key={fach.id} className={cn('flex items-center gap-2 px-3 py-2', fi > 0 && 'border-t border-border/60')}>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex-1">{fach.name}</span>
                  <span className="text-xs text-muted-foreground mr-1">Keine LZ</span>
                  <button
                    onClick={() => setAddFachId(fach.id)}
                    className="flex items-center justify-center size-5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    aria-label={`Lernziele in ${fach.name} hinzufügen`}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )
        })()}

        {/* Add-LZ modal for a fach */}
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
              assignedIds={klasse.assignedLernzielIds}
              onAdd={(ids) => ids.forEach(id => assignLernzielToKlasse(klassId, id))}
            />
          )
        })()}
      </div>

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
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortOpen, setSortOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Schueler | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Schueler | null>(null)
  const [kategorisierungId, setKategorisierungId] = useState<string | null>(null)
  // LP filter: null = all, lpId = only that LP's fächer
  const [activeLpId, setActiveLpId] = useState<string | null>(null)
  // Analytics: running year vs. year-end summary
  const [analyticsMode, setAnalyticsMode] = useState<'laufend' | 'jahresende'>('laufend')

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
      </div>

      {/* LP team strip */}
      {(klasse.lpZuweisungen ?? []).length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="text-xs text-muted-foreground shrink-0">Team:</span>
          {(klasse.lpZuweisungen ?? []).map(z => {
            const lp = lehrpersonen.find(l => l.id === z.lpId)
            if (!lp) return null
            return (
              <span
                key={z.lpId}
                className="rounded-full px-2.5 py-0.5 text-xs font-medium border border-border text-muted-foreground"
              >{lp.name}{z.rolle ? ` · ${LP_ROLLE_LABELS[z.rolle]}` : ''}</span>
            )
          })}
        </div>
      )}

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
              {/* Sort bar + view toggle + add button */}
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
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
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
                  <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="size-3.5" />
                    Neuer Schüler
                  </Button>
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
                        <div className="w-44 shrink-0 flex flex-col gap-0.5 min-w-0">
                          <p className="text-sm font-medium truncate">{student.name}</p>
                          {((student.rilzFachIds?.length ?? 0) > 0 || student.bvsa) && (
                            <div className="flex flex-wrap gap-1">
                              {student.bvsa && (
                                <span className="rounded px-1 py-0 text-[9px] font-semibold bg-purple-100 text-purple-700">BVSA</span>
                              )}
                              {(student.rilzFachIds ?? []).map(fachId => {
                                const fach = faecher.find(f => f.id === fachId)
                                return fach ? (
                                  <span key={fachId} className="rounded px-1 py-0 text-[9px] font-semibold bg-orange-100 text-orange-700" title={`Reduzierte individuelle Lernziele in ${fach.name}`}>
                                    RILZ {fach.name}
                                  </span>
                                ) : null
                              })}
                            </div>
                          )}
                        </div>
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
                          <Button variant="ghost" size="icon-sm" onClick={() => setKategorisierungId(student.id)} aria-label="Kategorisierung"><Tag className="size-3.5" /></Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setEditTarget(student)} aria-label="Bearbeiten"><SquarePen className="size-3.5" /></Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(student)} aria-label="Löschen"><Trash className="size-3.5" /></Button>
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
                          {((student.rilzFachIds?.length ?? 0) > 0 || student.bvsa) && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {student.bvsa && (
                                <span className="rounded px-1 py-0 text-[9px] font-semibold bg-purple-100 text-purple-700">BVSA</span>
                              )}
                              {(student.rilzFachIds ?? []).map(fachId => {
                                const fach = faecher.find(f => f.id === fachId)
                                return fach ? (
                                  <span key={fachId} className="rounded px-1 py-0 text-[9px] font-semibold bg-orange-100 text-orange-700">
                                    RILZ {fach.name}
                                  </span>
                                ) : null
                              })}
                            </div>
                          )}
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
                          <Button variant="ghost" size="icon-sm" onClick={() => setKategorisierungId(student.id)} aria-label="Kategorisierung"><Tag className="size-3.5" /></Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setEditTarget(student)} aria-label="Bearbeiten"><SquarePen className="size-3.5" /></Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(student)} aria-label="Löschen"><Trash className="size-3.5" /></Button>
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
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium shrink-0">Ansicht:</span>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {([
                { key: 'laufend' as const, label: 'Laufendes Jahr' },
                { key: 'jahresende' as const, label: 'Jahresabschluss' },
              ]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setAnalyticsMode(key)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium transition-colors',
                    analyticsMode === key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground hover:bg-muted',
                  )}
                >{label}</button>
              ))}
            </div>
            {analyticsMode === 'jahresende' && (
              <span className="text-xs text-muted-foreground">· Endbeurteilung aller Lernziele</span>
            )}
          </div>
          <ClassAnalytics
            klassId={klassId}
            students={students}
            themen={analyticsMode === 'jahresende' ? assignedThemen.filter(() => true) : assignedThemen}
            lernziele={lernziele}
            faecher={faecher}
            competencies={competencies}
            showTrend={analyticsMode === 'laufend'}
          />
        </div>
      )}

      {/* Lernziele tab */}
      {tab === 'lernziele' && (
        <LernzieleTab klassId={klassId} />
      )}

      {/* Lehrpersonen tab */}
      {tab === 'lehrpersonen' && (
        <LehrpersonenTab klassId={klassId} />
      )}

      {/* Modals */}
      <KategorisierungModal
        open={!!kategorisierungId}
        onOpenChange={(v) => { if (!v) setKategorisierungId(null) }}
        studentId={kategorisierungId}
        students={students}
        faecher={faecher}
        setRilzFach={setRilzFach}
        setBvsa={setBvsa}
      />
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
