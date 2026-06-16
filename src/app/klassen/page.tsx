'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Users, TrendingUp, AlertTriangle, MoreHorizontal, Trash2, Pencil } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/shared/Modal'
import { EmptyState } from '@/components/shared/EmptyState'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { sv } from '@/lib/utils'
import type { Status } from '@/types/domain'

// ── Helpers ───────────────────────────────────────────────────────────────

function isSpecial(s: { bvsa?: boolean; rilzFachIds?: string[] }): boolean {
  return !!(s.bvsa || s.rilzFachIds?.length)
}

// ── Klasse stats ──────────────────────────────────────────────────────────

function KlasseStats({ klassId }: { klassId: string }) {
  const { getClass, getStudentsForClass, getThemenForKlasse, lernziele } = useData()
  const klasse = getClass(klassId)
  const students = getStudentsForClass(klassId)

  if (students.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="size-3" />
        <span>Keine Schüler</span>
      </div>
    )
  }

  const today = new Date().toISOString().slice(0, 10)
  const classThemen = getThemenForKlasse(klassId).filter(t =>
    !t.faelligAm || t.faelligAm <= today
  )
  const allLZ = classThemen.flatMap(t => lernziele.filter(lz => lz.themaId === t.id))
  const allLZIds = allLZ.map(lz => lz.id)

  const regularStudents = students.filter(s => !isSpecial(s))

  let avgScore = 0
  let atRisk = 0
  let excellent = 0

  if (allLZIds.length > 0 && regularStudents.length > 0) {
    const scores = regularStudents.map(s => {
      const applicable = allLZ.filter(lz => {
        if (lz.kategorie !== 'anspruchsvoll') return true
        if (!s.rilzFachIds?.length) return true
        const thema = classThemen.find(t => t.id === lz.themaId)
        return !thema || !s.rilzFachIds.includes(thema.fachId)
      })
      if (applicable.length === 0) return 0
      return (applicable.reduce((sum, lz) => sum + sv(s.lernzielStatus[lz.id] ?? 'not_reached'), 0) / applicable.length) * 100
    })
    avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    atRisk = scores.filter(sc => sc < 25).length
    excellent = scores.filter(sc => sc >= 75).length
  }

  const reached = allLZIds.reduce((sum, id) =>
    sum + regularStudents.filter(s => s.lernzielStatus[id] === 'reached').length, 0)
  const partial = allLZIds.reduce((sum, id) =>
    sum + regularStudents.filter(s => s.lernzielStatus[id] === 'partially_reached').length, 0)
  const total = allLZIds.length * (regularStudents.length || 1)

  const rp = total > 0 ? (reached / total) * 100 : 0
  const pp = total > 0 ? (partial / total) * 100 : 0

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/70">
          {rp > 0 && <div className="bg-status-reached transition-all" style={{ width: `${rp}%` }} />}
          {pp > 0 && <div className="bg-status-partial transition-all" style={{ width: `${pp}%` }} />}
        </div>
      </div>

      {/* Metric row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-muted/60 rounded-md px-2.5 py-2 text-center ring-1 ring-border/40">
          <p className="text-[10px] font-mono uppercase tracking-normal leading-none text-muted-foreground mb-0.5">Ø Score</p>
          <p className={`text-base font-bold tabular-nums ${avgScore >= 75 ? 'text-status-reached' : avgScore >= 25 ? 'text-status-partial' : 'text-status-not-reached'}`}>
            {allLZIds.length > 0 ? `${avgScore}%` : '—'}
          </p>
        </div>
        <div className="bg-muted/60 rounded-md px-2.5 py-2 text-center ring-1 ring-border/40">
          <p className="text-[10px] font-mono uppercase tracking-normal leading-none text-muted-foreground mb-0.5">Sehr gut</p>
          <p className="text-base font-bold tabular-nums text-status-reached">{excellent}</p>
        </div>
        <div className="bg-muted/60 rounded-md px-2.5 py-2 text-center ring-1 ring-border/40">
          <p className="text-[10px] font-mono uppercase tracking-normal leading-none text-muted-foreground mb-0.5">Förderbedarf</p>
          <p className={`text-base font-bold tabular-nums ${atRisk > 0 ? 'text-status-not-reached' : 'text-muted-foreground'}`}>{atRisk}</p>
        </div>
      </div>
    </div>
  )
}

// ── Klasse form ───────────────────────────────────────────────────────────

const SCHULJAHR_OPTIONS = (() => {
  const y = new Date().getFullYear()
  return [-1, 0, 1, 2].map(d => `${y + d}/${String(y + d + 1).slice(2)}`)
})()

interface KlasseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialName?: string
  initialSchuljahr?: string
  onSubmit: (name: string, schuljahr: string) => void
}

function KlasseFormModal({ open, onOpenChange, initialName = '', initialSchuljahr = '', onSubmit }: KlasseFormProps) {
  const [name, setName] = useState(initialName)
  const [schuljahr, setSchuljahr] = useState(initialSchuljahr)

  useEffect(() => {
    if (open) { setName(initialName); setSchuljahr(initialSchuljahr) }
  }, [open, initialName, initialSchuljahr])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim(), schuljahr.trim())
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={initialName ? 'Klasse bearbeiten' : 'Neue Klasse'}
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
          <Label htmlFor="klasse-name">Klassenname</Label>
          <Input
            id="klasse-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z. B. 5a"
            autoFocus
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Schuljahr</Label>
          <div className="flex flex-wrap gap-1.5">
            {SCHULJAHR_OPTIONS.map(j => (
              <button
                key={j}
                type="button"
                onClick={() => setSchuljahr(j)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-all ${
                  schuljahr === j
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                {j}
              </button>
            ))}
          </div>
          <Input
            value={schuljahr}
            onChange={(e) => setSchuljahr(e.target.value)}
            placeholder="z. B. 2025/26"
            className="text-sm"
          />
        </div>
      </form>
    </Modal>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function KlassenPage() {
  const router = useRouter()
  const { classes, currentLpId, getStudentsForClass, createClass, updateClass, deleteClass } = useData()
  const myClasses = classes.filter(k => (k.lpZuweisungen ?? []).some(z => z.lpId === currentLpId))
  const [createOpen, setCreateOpen] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<{ id: string; name: string; schuljahr?: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleteInput, setDeleteInput] = useState('')

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">

      {/* Empty state */}
      {myClasses.length === 0 && (
        <div>
          <EmptyState
            size="lg"
            icon={<Users className="size-6 text-accent-foreground" />}
            title="Noch keine Klassen angelegt"
            description="Erstelle deine erste Klasse und füge Schüler hinzu."
            action={<Button onClick={() => setCreateOpen(true)}>Erste Klasse erstellen</Button>}
          />
        </div>
      )}

      {/* Class grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {myClasses.map((klasse) => {
          const students = getStudentsForClass(klasse.id)
          return (
            <div
              key={klasse.id}
              className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-all duration-150 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
              onClick={() => router.push(`/klassen/${klasse.id}`)}
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h2 className="text-base font-bold tracking-tight">{klasse.name}</h2>
                  {klasse.schuljahr && (
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{klasse.schuljahr}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center gap-1 text-xs font-semibold text-primary/70 bg-accent rounded-md px-2 py-1">
                    <Users className="size-3" />
                    <span className="tabular-nums font-medium">{students.length}</span>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Popover
                      open={openMenuId === klasse.id}
                      onOpenChange={(isOpen: boolean) => setOpenMenuId(isOpen ? klasse.id : null)}
                    >
                      <PopoverTrigger
                        className="flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground"
                        aria-label="Optionen"
                      >
                        <MoreHorizontal className="size-4" />
                      </PopoverTrigger>
                      <PopoverContent align="end" side="bottom" className="w-44 p-1">
                        <button
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
                          onClick={() => {
                            setOpenMenuId(null)
                            setEditTarget({ id: klasse.id, name: klasse.name, schuljahr: klasse.schuljahr })
                          }}
                        >
                          <Pencil className="size-3.5" />
                          Bearbeiten
                        </button>
                        <hr className="my-1 border-border" />
                        <button
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={() => {
                            setOpenMenuId(null)
                            setDeleteTarget({ id: klasse.id, name: klasse.name })
                          }}
                        >
                          <Trash2 className="size-3.5" />
                          Klasse löschen
                        </button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 -mx-4 mb-3" />
              {/* Stats */}
              <KlasseStats klassId={klasse.id} />
            </div>
          )
        })}

        {/* Add new class card */}
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center justify-center size-10 rounded-md bg-muted/80 hover:bg-muted transition-colors"
        >
          <Plus className="size-5 text-muted-foreground" />
        </button>
      </div>

      {/* Create modal */}
      <KlasseFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(name) => { const id = createClass(name); router.push(`/klassen/${id}`) }}
      />

      {/* Edit modal */}
      <KlasseFormModal
        open={editTarget !== null}
        onOpenChange={(open) => { if (!open) setEditTarget(null) }}
        initialName={editTarget?.name}
        initialSchuljahr={editTarget?.schuljahr}
        onSubmit={(name, schuljahr) => {
          if (!editTarget) return
          updateClass(editTarget.id, name, schuljahr || undefined)
          setEditTarget(null)
        }}
      />

      {/* Delete confirmation modal */}
      <Modal
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteInput('') } }}
        title="Klasse löschen"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => { setDeleteTarget(null); setDeleteInput('') }}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              disabled={deleteInput !== deleteTarget?.name}
              onClick={() => {
                if (!deleteTarget) return
                deleteClass(deleteTarget.id)
                setDeleteTarget(null)
                setDeleteInput('')
              }}
            >
              Löschen
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          <p className="text-sm text-muted-foreground">
            Tippe <span className="font-semibold text-foreground">„{deleteTarget?.name}"</span> ein, um die Klasse dauerhaft zu löschen. Alle Schüler werden ebenfalls entfernt.
          </p>
          <Input
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
            placeholder={deleteTarget?.name ?? ''}
            autoFocus
          />
        </div>
      </Modal>

    </div>
  )
}
