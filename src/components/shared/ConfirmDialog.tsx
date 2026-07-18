'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from './Modal'

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  /** Wort, das zur Bestätigung eingetippt werden muss. Default: 'löschen' */
  confirmKeyword?: string
  /** Tippbestätigung erzwingen. Default: true */
  requireTyping?: boolean
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Bestätigen',
  onConfirm,
  confirmKeyword = 'löschen',
  requireTyping = true,
}: ConfirmDialogProps) => {
  const [typed, setTyped] = useState('')

  const matches = typed.trim().toLowerCase() === confirmKeyword.toLowerCase()

  const close = () => {
    setTyped('')
    onOpenChange(false)
  }

  const handleConfirm = () => {
    onConfirm()
    close()
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => { if (!o) close(); else onOpenChange(o) }}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={close}>
            Abbrechen
          </Button>
          <Button
            variant="destructive"
            disabled={requireTyping && !matches}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="grid gap-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        {requireTyping && (
          <>
            <p className="text-sm text-muted-foreground">
              Tippe <span className="font-semibold text-foreground">„{confirmKeyword}"</span> ein, um dauerhaft zu löschen.
            </p>
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={confirmKeyword}
              autoFocus
            />
          </>
        )}
      </div>
    </Modal>
  )
}
