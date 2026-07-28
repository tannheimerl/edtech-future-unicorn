'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/shared/Modal'
import { SchuelerFields } from '@/components/klassen/SchuelerFields'
import type { Fach } from '@/types/domain'

export const SchuelerFormModal = ({
  open, onOpenChange, initialVorname = '', initialNachname = '', faecher, onSubmit,
}: {
  open: boolean; onOpenChange: (v: boolean) => void
  initialVorname?: string; initialNachname?: string
  faecher: Fach[]
  onSubmit: (vorname: string, nachname: string, patch: { bvsa: boolean; rilzFachIds: string[] }) => void
}) => {
  const [vorname, setVorname] = useState(initialVorname)
  const [nachname, setNachname] = useState(initialNachname)
  const [bvsa, setBvsa] = useState(false)
  const [rilzFachIds, setRilzFachIds] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setVorname(initialVorname)
      setNachname(initialNachname)
      setBvsa(false)
      setRilzFachIds([])
    }
  }, [open, initialVorname, initialNachname])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!vorname.trim() && !nachname.trim()) return
    onSubmit(vorname.trim(), nachname.trim(), { bvsa, rilzFachIds })
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Neuer Schüler"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={() => handleSubmit()}>Speichern</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <SchuelerFields
          vorname={vorname}
          nachname={nachname}
          onVornameChange={setVorname}
          onNachnameChange={setNachname}
          bvsa={bvsa}
          onBvsaChange={setBvsa}
          rilzFachIds={rilzFachIds}
          onRilzFachToggle={(fachId, enabled) =>
            setRilzFachIds((prev) =>
              enabled ? [...prev, fachId] : prev.filter((id) => id !== fachId)
            )
          }
          faecher={faecher}
        />
      </form>
    </Modal>
  )
}
