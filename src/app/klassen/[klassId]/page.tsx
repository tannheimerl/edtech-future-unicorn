'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PencilIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { ClassAnalytics } from '@/components/analytics/ClassAnalytics'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Modal } from '@/components/shared/Modal'
import { Section } from '@/components/shared/Section'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils'
import type { Schueler, Status } from '@/types/domain'

// ── Helpers ──────────────────────────────────────────────────────────────

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
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

type Tab = 'schueler' | 'analytics'

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: 'schueler', label: 'Schüler' },
    { key: 'analytics', label: 'Analytics' },
  ]
  return (
    <div className="flex gap-0 border-b border-border mb-6">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
            active === key
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

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
    getThemenForKlasse,
    getFachForThema,
    assignThemaToKlasse,
    removeThemaFromKlasse,
  } = useData()

  const klasse = getClass(klassId)
  const students = getStudentsForClass(klassId)
  const assignedThemen = getThemenForKlasse(klassId)

  const [tab, setTab] = useState<Tab>('schueler')
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Schueler | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Schueler | null>(null)
  const [themaModalOpen, setThemaModalOpen] = useState(false)

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

      <TabBar active={tab} onChange={setTab} />

      {/* Schüler tab */}
      {tab === 'schueler' && (
        <>
          {students.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
              <p className="text-sm">Noch keine Schüler in dieser Klasse.</p>
              <Button variant="outline" className="mt-4" onClick={() => setCreateOpen(true)}>
                Ersten Schüler hinzufügen
              </Button>
            </div>
          )}
          {students.length > 0 && (
            <div className="divide-y divide-border rounded-lg border border-border">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={() => router.push(`/klassen/${klassId}/schueler/${student.id}`)}
                >
                  <Avatar size="sm">
                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm font-medium">{student.name}</span>
                  <StatusBadge status={overallStatus(student)} />
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
        </>
      )}

      {/* Analytics tab */}
      {tab === 'analytics' && (
        <ClassAnalytics
          students={students}
          themen={assignedThemen}
          lernziele={lernziele}
          faecher={faecher}
        />
      )}

      <Separator className="mt-10 mb-2" />

      {/* Themen section */}
      <Section
        title="Themen"
        description="Lernziel-Themen, die für diese Klasse aktiv sind. Schüler werden daran gemessen."
        className="py-8"
      >
        {assignedThemen.length === 0 ? (
          <p className="mb-4 text-sm text-muted-foreground">
            Noch keine Themen zugewiesen.
          </p>
        ) : (
          <div className="mb-4 flex flex-wrap gap-2">
            {assignedThemen.map((thema) => {
              const fach = getFachForThema(thema.id)
              return (
                <div
                  key={thema.id}
                  className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-sm"
                >
                  {fach && (
                    <span className="text-xs text-muted-foreground">{fach.name} /</span>
                  )}
                  <span>{thema.name}</span>
                  <button
                    className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Thema entfernen"
                    onClick={() => removeThemaFromKlasse(klassId, thema.id)}
                  >
                    <XIcon className="size-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
        <Button variant="outline" size="sm" onClick={() => setThemaModalOpen(true)}>
          <PlusIcon />
          Thema hinzufügen
        </Button>
      </Section>

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

      {/* Themen assignment modal */}
      <Modal
        open={themaModalOpen}
        onOpenChange={setThemaModalOpen}
        title="Themen zuweisen"
        size="md"
        footer={
          <Button onClick={() => setThemaModalOpen(false)}>Fertig</Button>
        }
      >
        <p className="mb-4 text-sm text-muted-foreground">
          Aktive Themen sind hervorgehoben. Klicke ein Thema um es hinzuzufügen oder zu entfernen.
        </p>
        {faecher.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Noch keine Themen im Lernzielkatalog.{' '}
            <a href="/lernziele" className="underline">Jetzt anlegen</a>
          </p>
        )}
        <div className="space-y-4">
          {faecher.map((fach) => {
            const fachThemen = themen.filter((t) => t.fachId === fach.id)
            if (fachThemen.length === 0) return null
            return (
              <div key={fach.id}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {fach.name}
                </p>
                <div className="space-y-1">
                  {fachThemen.map((thema) => {
                    const isAssigned = klasse.assignedThemenIds.includes(thema.id)
                    return (
                      <button
                        key={thema.id}
                        className={cn(
                          'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                          isAssigned
                            ? 'bg-foreground text-primary-foreground'
                            : 'hover:bg-muted border border-border'
                        )}
                        onClick={() =>
                          isAssigned
                            ? removeThemaFromKlasse(klassId, thema.id)
                            : assignThemaToKlasse(klassId, thema.id)
                        }
                      >
                        {thema.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </Modal>
    </div>
  )
}
