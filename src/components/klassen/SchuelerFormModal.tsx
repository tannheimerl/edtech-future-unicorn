'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/shared/Modal'

export const SchuelerFormModal = ({
  open, onOpenChange, initialVorname = '', initialNachname = '', onSubmit,
}: {
  open: boolean; onOpenChange: (v: boolean) => void
  initialVorname?: string; initialNachname?: string
  onSubmit: (vorname: string, nachname: string) => void
}) => {
  const [vorname, setVorname] = useState(initialVorname)
  const [nachname, setNachname] = useState(initialNachname)
  useEffect(() => {
    if (open) { setVorname(initialVorname); setNachname(initialNachname) }
  }, [open, initialVorname, initialNachname])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!vorname.trim() && !nachname.trim()) return
    onSubmit(vorname.trim(), nachname.trim())
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
      <form onSubmit={handleSubmit} className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="schueler-vorname">Vorname</Label>
          <Input
            id="schueler-vorname"
            value={vorname}
            onChange={(e) => setVorname(e.target.value)}
            placeholder="Vorname"
            autoFocus
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="schueler-nachname">Nachname</Label>
          <Input
            id="schueler-nachname"
            value={nachname}
            onChange={(e) => setNachname(e.target.value)}
            placeholder="Nachname"
          />
        </div>
      </form>
    </Modal>
  )
}

