'use client'

import { useEffect, useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Modal } from '@/components/shared/Modal'
import type { Fach, Thema, Lernziel } from '@/types/domain'

// ── Generic single-field form modal ──────────────────────────────────────

interface FieldModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  label: string
  placeholder: string
  initialValue?: string
  onSubmit: (value: string) => void
}

function FieldModal({ open, onOpenChange, title, label, placeholder, initialValue = '', onSubmit }: FieldModalProps) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    if (open) setValue(initialValue)
  }, [open, initialValue])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!value.trim()) return
    onSubmit(value.trim())
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
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
          <Label>{label}</Label>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            autoFocus
          />
        </div>
      </form>
    </Modal>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function LernzielePage() {
  const {
    faecher, themen, lernziele,
    createFach, updateFach, deleteFach,
    createThema, updateThema, deleteThema,
    createLernziel, updateLernziel, deleteLernziel,
  } = useData()

  const [expandedFaecher, setExpandedFaecher] = useState<Set<string>>(
    () => new Set(faecher.map((f) => f.id))
  )
  const [expandedThemen, setExpandedThemen] = useState<Set<string>>(new Set())

  // Fach modal state
  const [fachCreateOpen, setFachCreateOpen] = useState(false)
  const [fachEditTarget, setFachEditTarget] = useState<Fach | null>(null)
  const [fachDeleteTarget, setFachDeleteTarget] = useState<Fach | null>(null)

  // Thema modal state
  const [themaCreateFachId, setThemaCreateFachId] = useState<string | null>(null)
  const [themaEditTarget, setThemaEditTarget] = useState<Thema | null>(null)
  const [themaDeleteTarget, setThemaDeleteTarget] = useState<Thema | null>(null)

  // Lernziel modal state
  const [lernzielCreateThemaId, setLernzielCreateThemaId] = useState<string | null>(null)
  const [lernzielEditTarget, setLernzielEditTarget] = useState<Lernziel | null>(null)
  const [lernzielDeleteTarget, setLernzielDeleteTarget] = useState<Lernziel | null>(null)

  const toggleFach = (id: string) =>
    setExpandedFaecher((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleThema = (id: string) =>
    setExpandedThemen((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const openThemaCreate = (fachId: string) => {
    setThemaCreateFachId(fachId)
    if (!expandedFaecher.has(fachId)) toggleFach(fachId)
  }

  const openLernzielCreate = (themaId: string) => {
    setLernzielCreateThemaId(themaId)
    if (!expandedThemen.has(themaId)) toggleThema(themaId)
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lernziele</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fächer, Themen und Lernziele verwalten
          </p>
        </div>
        <Button size="sm" onClick={() => setFachCreateOpen(true)}>
          <PlusIcon />
          Neues Fach
        </Button>
      </div>

      <Separator className="mb-6" />

      {/* Empty state */}
      {faecher.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
          <p className="text-sm">Noch keine Fächer angelegt.</p>
          <Button variant="outline" className="mt-4" onClick={() => setFachCreateOpen(true)}>
            Erstes Fach hinzufügen
          </Button>
        </div>
      )}

      {/* Fächer list */}
      <div className="space-y-3">
        {faecher.map((fach) => {
          const fachThemen = themen.filter((t) => t.fachId === fach.id)
          const isExpanded = expandedFaecher.has(fach.id)

          return (
            <div key={fach.id} className="rounded-lg border border-border">
              {/* Fach header row */}
              <div className="flex items-center gap-2 px-4 py-3">
                <button
                  className="flex flex-1 items-center gap-2 text-left"
                  onClick={() => toggleFach(fach.id)}
                >
                  {isExpanded
                    ? <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
                    : <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />}
                  <span className="font-semibold">{fach.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({fachThemen.length} {fachThemen.length === 1 ? 'Thema' : 'Themen'})
                  </span>
                </button>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    variant="ghost" size="icon-sm"
                    aria-label="Thema hinzufügen"
                    onClick={() => openThemaCreate(fach.id)}
                  >
                    <PlusIcon />
                  </Button>
                  <Button
                    variant="ghost" size="icon-sm"
                    aria-label="Fach bearbeiten"
                    onClick={() => setFachEditTarget(fach)}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    variant="ghost" size="icon-sm"
                    aria-label="Fach löschen"
                    onClick={() => setFachDeleteTarget(fach)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>

              {/* Themen */}
              {isExpanded && (
                <div className="border-t border-border">
                  {fachThemen.length === 0 && (
                    <p className="px-10 py-4 text-sm text-muted-foreground">
                      Noch keine Themen.{' '}
                      <button className="underline" onClick={() => openThemaCreate(fach.id)}>
                        Thema hinzufügen
                      </button>
                    </p>
                  )}
                  <div className="divide-y divide-border">
                    {fachThemen.map((thema) => {
                      const themaLernziele = lernziele.filter((l) => l.themaId === thema.id)
                      const isThemaExpanded = expandedThemen.has(thema.id)

                      return (
                        <div key={thema.id}>
                          {/* Thema row */}
                          <div className="flex items-center gap-2 px-10 py-2.5">
                            <button
                              className="flex flex-1 items-center gap-2 text-left"
                              onClick={() => toggleThema(thema.id)}
                            >
                              {isThemaExpanded
                                ? <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
                                : <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" />}
                              <span className="text-sm font-medium">{thema.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({themaLernziele.length} {themaLernziele.length === 1 ? 'Lernziel' : 'Lernziele'})
                              </span>
                            </button>
                            <div className="flex shrink-0 items-center gap-0.5">
                              <Button
                                variant="ghost" size="icon-sm"
                                aria-label="Lernziel hinzufügen"
                                onClick={() => openLernzielCreate(thema.id)}
                              >
                                <PlusIcon />
                              </Button>
                              <Button
                                variant="ghost" size="icon-sm"
                                aria-label="Thema bearbeiten"
                                onClick={() => setThemaEditTarget(thema)}
                              >
                                <PencilIcon />
                              </Button>
                              <Button
                                variant="ghost" size="icon-sm"
                                aria-label="Thema löschen"
                                onClick={() => setThemaDeleteTarget(thema)}
                              >
                                <Trash2Icon />
                              </Button>
                            </div>
                          </div>

                          {/* Lernziele */}
                          {isThemaExpanded && (
                            <div className="border-t border-border/60">
                              {themaLernziele.length === 0 && (
                                <p className="px-16 py-3 text-sm text-muted-foreground">
                                  Noch keine Lernziele.{' '}
                                  <button className="underline" onClick={() => openLernzielCreate(thema.id)}>
                                    Lernziel hinzufügen
                                  </button>
                                </p>
                              )}
                              <div className="divide-y divide-border/60">
                                {themaLernziele.map((lernziel) => (
                                  <div key={lernziel.id} className="flex items-center gap-2 px-16 py-2">
                                    <span className="flex-1 text-sm text-muted-foreground">
                                      {lernziel.label}
                                    </span>
                                    <div className="flex shrink-0 items-center gap-0.5">
                                      <Button
                                        variant="ghost" size="icon-sm"
                                        aria-label="Lernziel bearbeiten"
                                        onClick={() => setLernzielEditTarget(lernziel)}
                                      >
                                        <PencilIcon />
                                      </Button>
                                      <Button
                                        variant="ghost" size="icon-sm"
                                        aria-label="Lernziel löschen"
                                        onClick={() => setLernzielDeleteTarget(lernziel)}
                                      >
                                        <Trash2Icon />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Fach modals ── */}
      <FieldModal
        open={fachCreateOpen}
        onOpenChange={setFachCreateOpen}
        title="Neues Fach"
        label="Name"
        placeholder="z.B. Mathematik"
        onSubmit={createFach}
      />
      <FieldModal
        open={!!fachEditTarget}
        onOpenChange={(open) => { if (!open) setFachEditTarget(null) }}
        title="Fach bearbeiten"
        label="Name"
        placeholder="z.B. Mathematik"
        initialValue={fachEditTarget?.name ?? ''}
        onSubmit={(name) => { if (fachEditTarget) updateFach(fachEditTarget.id, name) }}
      />
      <ConfirmDialog
        open={!!fachDeleteTarget}
        onOpenChange={(open) => { if (!open) setFachDeleteTarget(null) }}
        title="Fach löschen"
        description={`Soll „${fachDeleteTarget?.name}" wirklich gelöscht werden? Alle zugehörigen Themen und Lernziele werden ebenfalls entfernt.`}
        confirmLabel="Löschen"
        onConfirm={() => { if (fachDeleteTarget) deleteFach(fachDeleteTarget.id) }}
      />

      {/* ── Thema modals ── */}
      <FieldModal
        open={!!themaCreateFachId}
        onOpenChange={(open) => { if (!open) setThemaCreateFachId(null) }}
        title="Neues Thema"
        label="Name"
        placeholder="z.B. Zahlen & Rechnen"
        onSubmit={(name) => { if (themaCreateFachId) createThema(themaCreateFachId, name) }}
      />
      <FieldModal
        open={!!themaEditTarget}
        onOpenChange={(open) => { if (!open) setThemaEditTarget(null) }}
        title="Thema bearbeiten"
        label="Name"
        placeholder="z.B. Zahlen & Rechnen"
        initialValue={themaEditTarget?.name ?? ''}
        onSubmit={(name) => { if (themaEditTarget) updateThema(themaEditTarget.id, name) }}
      />
      <ConfirmDialog
        open={!!themaDeleteTarget}
        onOpenChange={(open) => { if (!open) setThemaDeleteTarget(null) }}
        title="Thema löschen"
        description={`Soll „${themaDeleteTarget?.name}" wirklich gelöscht werden? Alle zugehörigen Lernziele werden ebenfalls entfernt.`}
        confirmLabel="Löschen"
        onConfirm={() => { if (themaDeleteTarget) deleteThema(themaDeleteTarget.id) }}
      />

      {/* ── Lernziel modals ── */}
      <FieldModal
        open={!!lernzielCreateThemaId}
        onOpenChange={(open) => { if (!open) setLernzielCreateThemaId(null) }}
        title="Neues Lernziel"
        label="Beschreibung"
        placeholder="z.B. Addieren bis 100"
        onSubmit={(label) => { if (lernzielCreateThemaId) createLernziel(lernzielCreateThemaId, label) }}
      />
      <FieldModal
        open={!!lernzielEditTarget}
        onOpenChange={(open) => { if (!open) setLernzielEditTarget(null) }}
        title="Lernziel bearbeiten"
        label="Beschreibung"
        placeholder="z.B. Addieren bis 100"
        initialValue={lernzielEditTarget?.label ?? ''}
        onSubmit={(label) => { if (lernzielEditTarget) updateLernziel(lernzielEditTarget.id, label) }}
      />
      <ConfirmDialog
        open={!!lernzielDeleteTarget}
        onOpenChange={(open) => { if (!open) setLernzielDeleteTarget(null) }}
        title="Lernziel löschen"
        description={`Soll dieses Lernziel wirklich gelöscht werden?`}
        confirmLabel="Löschen"
        onConfirm={() => { if (lernzielDeleteTarget) deleteLernziel(lernzielDeleteTarget.id) }}
      />
    </div>
  )
}
