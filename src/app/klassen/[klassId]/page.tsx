'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Modal } from '@/components/shared/Modal'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { Schueler, Status } from '@/types/domain'

// ── Helpers ──────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function overallStatus(student: Schueler): Status {
  const values = Object.values(student.competencyStatus)
  if (values.length === 0) return 'not_reached'
  const score = values.reduce(
    (sum, s) => sum + (s === 'reached' ? 2 : s === 'partially_reached' ? 1 : 0),
    0
  )
  const avg = score / (values.length * 2)
  return avg >= 0.75 ? 'reached' : avg >= 0.35 ? 'partially_reached' : 'not_reached'
}

// ── Student form ──────────────────────────────────────────────────────────

interface StudentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialName?: string
  onSubmit: (name: string) => void
}

function SchuelerFormModal({ open, onOpenChange, initialName = '', onSubmit }: StudentFormProps) {
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
      title={initialName ? 'Schüler bearbeiten' : 'Neuer Schüler'}
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
          <Label htmlFor="schueler-name">Name</Label>
          <Input
            id="schueler-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vor- und Nachname"
            autoFocus
          />
        </div>
      </form>
    </Modal>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function KlasseDetailPage() {
  const { klassId } = useParams<{ klassId: string }>()
  const router = useRouter()
  const { getClass, getStudentsForClass, createStudent, updateStudent, deleteStudent } = useData()

  const klasse = getClass(klassId)
  const students = getStudentsForClass(klassId)

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Schueler | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Schueler | null>(null)

  if (!klasse) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-8 text-muted-foreground text-sm">
        Klasse nicht gefunden.{' '}
        <button className="underline" onClick={() => router.push('/klassen')}>
          Zur Übersicht
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        className="mb-6"
        items={[
          { label: 'Klassen', href: '/klassen' },
          { label: klasse.name },
        ]}
      />

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{klasse.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {students.length} Schüler
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <PlusIcon />
          Neuer Schüler
        </Button>
      </div>

      <Separator className="mb-6" />

      {/* Empty state */}
      {students.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
          <p className="text-sm">Noch keine Schüler in dieser Klasse.</p>
          <Button variant="outline" className="mt-4" onClick={() => setCreateOpen(true)}>
            Ersten Schüler hinzufügen
          </Button>
        </div>
      )}

      {/* Student list */}
      {students.length > 0 && (
        <div className="divide-y divide-border rounded-lg border border-border">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer"
              onClick={() => router.push(`/klassen/${klassId}/schueler/${student.id}`)}
            >
              {/* Avatar */}
              <Avatar size="sm">
                <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
              </Avatar>

              {/* Name */}
              <span className="flex-1 text-sm font-medium">{student.name}</span>

              {/* Overall progress */}
              <StatusBadge status={overallStatus(student)} />

              {/* Actions — stop propagation */}
              <div
                className="flex shrink-0 gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditTarget(student)}
                  aria-label="Bearbeiten"
                >
                  <PencilIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDeleteTarget(student)}
                  aria-label="Löschen"
                >
                  <Trash2Icon />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <SchuelerFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(name) => createStudent(klassId, name)}
      />

      {/* Edit modal */}
      <SchuelerFormModal
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null) }}
        initialName={editTarget?.name ?? ''}
        onSubmit={(name) => { if (editTarget) updateStudent(editTarget.id, { name }) }}
      />

      {/* Delete confirm */}
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
