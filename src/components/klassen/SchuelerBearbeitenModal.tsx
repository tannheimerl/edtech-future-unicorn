'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/shared/Modal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { cn, getFachColor } from '@/lib/utils'
import type { Schueler, Fach } from '@/types/domain'

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

export const SchuelerBearbeitenModal = ({
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

