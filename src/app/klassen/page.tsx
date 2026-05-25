'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Modal } from '@/components/shared/Modal'
import type { Klasse, Status } from '@/types/domain'

// ── Helpers ──────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Aggregate progress bar — uses only foreground / muted-foreground / border tokens
function ClassProgressBar({ klassId }: { klassId: string }) {
  const { getStudentsForClass, competencies } = useData()
  const students = getStudentsForClass(klassId)

  if (students.length === 0) {
    return (
      <div className="h-1.5 w-full rounded-full bg-muted" title="Keine Schüler" />
    )
  }

  const all: Status[] = students.flatMap((s) =>
    competencies.map((c) => s.competencyStatus[c.id] ?? 'not_reached')
  )
  const total = all.length
  const reached = all.filter((s) => s === 'reached').length
  const partial = all.filter((s) => s === 'partially_reached').length

  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-border">
      {/* reached: black */}
      <div
        className="bg-foreground transition-all"
        style={{ width: `${(reached / total) * 100}%` }}
      />
      {/* partially reached: mid-gray */}
      <div
        className="bg-muted-foreground transition-all"
        style={{ width: `${(partial / total) * 100}%` }}
      />
      {/* not reached: light-gray (background of the bar) */}
    </div>
  )
}

// ── Klasse form ───────────────────────────────────────────────────────────

interface KlasseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialName?: string
  onSubmit: (name: string) => void
}

function KlasseFormModal({ open, onOpenChange, initialName = '', onSubmit }: KlasseFormProps) {
  const [name, setName] = useState(initialName)

  useEffect(() => {
    if (open) setName(initialName)
  }, [open, initialName])

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
      title={initialName ? 'Klasse bearbeiten' : 'Neue Klasse'}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
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
      </form>
    </Modal>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function KlassenPage() {
  const router = useRouter()
  const { classes, getStudentsForClass, createClass, updateClass, deleteClass } = useData()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Klasse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Klasse | null>(null)

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      {/* Header row */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Klassen</h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <PlusIcon />
          Neue Klasse
        </Button>
      </div>

      {/* Empty state */}
      {classes.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center text-muted-foreground">
          <p className="text-sm">Noch keine Klassen angelegt.</p>
          <Button variant="outline" className="mt-4" onClick={() => setCreateOpen(true)}>
            Erste Klasse erstellen
          </Button>
        </div>
      )}

      {/* Class grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((klasse) => {
          const students = getStudentsForClass(klasse.id)
          return (
            <Card
              key={klasse.id}
              className="cursor-pointer transition-all hover:ring-foreground/25"
              onClick={() => router.push(`/klassen/${klasse.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{klasse.name}</CardTitle>
                  {/* Stop propagation so icon buttons don't navigate */}
                  <div
                    className="flex shrink-0 gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setEditTarget(klasse)}
                      aria-label="Bearbeiten"
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteTarget(klasse)}
                      aria-label="Löschen"
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {students.length} Schüler{students.length === 1 ? '' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5">
                <ClassProgressBar klassId={klasse.id} />
                <p className="text-xs text-muted-foreground">
                  Lernfortschritt gesamt
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create modal */}
      <KlasseFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(name) => createClass(name)}
      />

      {/* Edit modal */}
      <KlasseFormModal
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null) }}
        initialName={editTarget?.name ?? ''}
        onSubmit={(name) => { if (editTarget) updateClass(editTarget.id, name) }}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Klasse löschen"
        description={`Soll die Klasse „${deleteTarget?.name}" wirklich gelöscht werden? Alle Schüler dieser Klasse werden ebenfalls entfernt.`}
        confirmLabel="Löschen"
        onConfirm={() => { if (deleteTarget) deleteClass(deleteTarget.id) }}
      />
    </div>
  )
}
