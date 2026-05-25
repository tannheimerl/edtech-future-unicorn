'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useData } from '@/contexts/DataContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { Section } from '@/components/shared/Section'
import type { Status } from '@/types/domain'
import { STATUS_LABELS, STATUS_CYCLE } from '@/types/domain'
import { cn } from '@/lib/utils'

// ── Helpers ──────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ── Status selector ───────────────────────────────────────────────────────
// Three segmented buttons; the active one matches the current status.

const STATUS_ACTIVE_CLASS: Record<Status, string> = {
  reached: 'bg-foreground text-primary-foreground border-foreground',
  partially_reached: 'bg-secondary text-secondary-foreground border-secondary',
  not_reached: 'bg-muted text-muted-foreground border-border',
}

interface StatusSelectorProps {
  studentId: string
  competencyId: string
  current: Status
}

function StatusSelector({ studentId, competencyId, current }: StatusSelectorProps) {
  const { updateCompetencyStatus } = useData()

  return (
    <div className="flex gap-0.5">
      {STATUS_CYCLE.map((status) => (
        <button
          key={status}
          onClick={() => updateCompetencyStatus(studentId, competencyId, status)}
          className={cn(
            'rounded-sm border px-2 py-0.5 text-xs font-medium transition-all',
            status === current
              ? STATUS_ACTIVE_CLASS[status]
              : 'border-border bg-transparent text-muted-foreground hover:bg-muted'
          )}
        >
          {STATUS_LABELS[status]}
        </button>
      ))}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function SchuelerDetailPage() {
  const { klassId, studentId } = useParams<{ klassId: string; studentId: string }>()
  const router = useRouter()
  const { getClass, getStudent, updateStudent, competencies } = useData()

  const klasse = getClass(klassId)
  const student = getStudent(studentId)

  const [note, setNote] = useState(student?.note ?? '')
  const [noteSaved, setNoteSaved] = useState(true)

  // Sync local note when student changes (e.g. navigating between students)
  useEffect(() => {
    setNote(student?.note ?? '')
    setNoteSaved(true)
  }, [studentId, student?.note])

  const handleNoteSave = () => {
    if (!student) return
    updateStudent(student.id, { note })
    setNoteSaved(true)
  }

  if (!student || !klasse) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-8 text-sm text-muted-foreground">
        Schüler nicht gefunden.{' '}
        <button className="underline" onClick={() => router.push('/klassen')}>
          Zur Übersicht
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        className="mb-6"
        items={[
          { label: 'Klassen', href: '/klassen' },
          { label: klasse.name, href: `/klassen/${klassId}` },
          { label: student.name },
        ]}
      />

      {/* Student header */}
      <div className="mb-8 flex items-center gap-4">
        <Avatar size="lg">
          <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{student.name}</h1>
          <p className="text-sm text-muted-foreground">{klasse.name}</p>
        </div>
      </div>

      <Separator className="mb-2" />

      {/* Notiz */}
      <Section title="Notiz" className="py-8">
        <div className="grid gap-2 max-w-lg">
          <Label htmlFor="student-note">Freitext-Notiz zur Lehrkraft</Label>
          <Textarea
            id="student-note"
            rows={4}
            placeholder="Beobachtungen, Besonderheiten, Förderbedarf …"
            value={note}
            onChange={(e) => {
              setNote(e.target.value)
              setNoteSaved(false)
            }}
          />
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleNoteSave}
              disabled={noteSaved}
            >
              Speichern
            </Button>
            {noteSaved && note !== '' && (
              <span className="text-xs text-muted-foreground">Gespeichert</span>
            )}
          </div>
        </div>
      </Section>

      <Separator className="mb-2" />

      {/* Kompetenzraster */}
      <Section
        title="Kompetenzraster"
        description="Klicke auf einen Status um ihn zu ändern. Änderungen werden sofort gespeichert."
        className="py-8"
      >
        <div className="divide-y divide-border rounded-lg border border-border">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-2 text-xs font-medium text-muted-foreground">
            <span>Kompetenz</span>
            <span>Status</span>
          </div>

          {/* Competency rows */}
          {competencies.map((comp) => {
            const current = student.competencyStatus[comp.id] ?? 'not_reached'
            return (
              <div
                key={comp.id}
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3"
              >
                <span className="text-sm">{comp.label}</span>
                <StatusSelector
                  studentId={student.id}
                  competencyId={comp.id}
                  current={current}
                />
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
