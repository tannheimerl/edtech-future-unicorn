'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/shared/Modal'

export const InputModal = ({ open, onOpenChange, title, label, placeholder, onSubmit, initialValue = '', submitLabel = 'Erstellen' }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  label: string
  placeholder: string
  onSubmit: (v: string) => void
  initialValue?: string
  submitLabel?: string
}) => {
  const [value, setValue] = useState('')
  useEffect(() => { if (open) setValue(initialValue) }, [open, initialValue])

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!value.trim()) return
    onSubmit(value.trim())
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={() => submit()}>{submitLabel}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-3">
        <div className="grid gap-1.5">
          <Label>{label}</Label>
          <Input value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder} autoFocus />
        </div>
      </form>
    </Modal>
  )
}
