'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, GraduationCap, Users } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/shared/Modal'
import type { Status } from '@/types/domain'

// ── Helpers ───────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Aggregate progress bar
function ClassProgressBar({ klassId }: { klassId: string }) {
  const { getStudentsForClass, competencies } = useData()
  const students = getStudentsForClass(klassId)

  if (students.length === 0) {
    return (
      <div className="h-2 w-full rounded-full bg-muted" title="Keine Schüler" />
    )
  }

  const all: Status[] = students.flatMap((s) =>
    competencies.map((c) => s.competencyStatus[c.id] ?? 'not_reached')
  )
  const total = all.length
  const reached = all.filter((s) => s === 'reached').length
  const partial = all.filter((s) => s === 'partially_reached').length

  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-status-not-reached/15">
      <div
        className="bg-status-reached transition-all"
        style={{ width: `${(reached / total) * 100}%` }}
      />
      <div
        className="bg-status-partial transition-all"
        style={{ width: `${(partial / total) * 100}%` }}
      />
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

// ── Page ──────────────────────────────────────────────────────────────────

export default function KlassenPage() {
  const router = useRouter()
  const { classes, getStudentsForClass, createClass } = useData()

  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-5">
      {/* Header row */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meine Klassen</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {classes.length} {classes.length === 1 ? 'Klasse' : 'Klassen'} insgesamt
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Neue Klasse
        </Button>
      </div>

      {/* Empty state */}
      {classes.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-accent">
            <GraduationCap className="size-8 text-accent-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Noch keine Klassen angelegt</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Erstelle deine erste Klasse und füge Schüler hinzu.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
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
              className="group cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
              onClick={() => router.push(`/klassen/${klasse.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{klasse.name}</CardTitle>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="size-3.5" />
                  <span>{students.length} {students.length === 1 ? 'Schüler' : 'Schüler'}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <ClassProgressBar klassId={klasse.id} />
                <p className="text-xs text-muted-foreground">Lernfortschritt gesamt</p>
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

    </div>
  )
}
