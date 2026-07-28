'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/shared/Modal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { SchuelerFields } from '@/components/klassen/SchuelerFields'
import type { Schueler, Fach } from '@/types/domain'

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
        <SchuelerFields
          vorname={vorname}
          nachname={nachname}
          onVornameChange={setVorname}
          onNachnameChange={setNachname}
          bvsa={!!student.bvsa}
          onBvsaChange={(v) => setBvsa(student.id, v)}
          rilzFachIds={student.rilzFachIds ?? []}
          onRilzFachToggle={(fachId, enabled) => setRilzFach(student.id, fachId, enabled)}
          faecher={faecher}
        />
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

