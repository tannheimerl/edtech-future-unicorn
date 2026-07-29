'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/toast'
import { createNewDb, loadExistingDb } from '@/lib/db-settings'

type FirstRunDbSetupProps = {
  /** Called once the user has picked a database location. */
  onConfigured: () => void
}

// Forces a database location choice on first launch — there is no default
// path, so the app can't proceed until this resolves.
export const FirstRunDbSetup = ({ onConfigured }: FirstRunDbSetupProps) => {
  const [busy, setBusy] = useState(false)

  const pick = async (action: () => Promise<string | null>) => {
    setBusy(true)
    try {
      const result = await action()
      if (result) onConfigured()
    } catch {
      toast.error('Datenbank konnte nicht eingerichtet werden.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Datenbank einrichten</DialogTitle>
          <DialogDescription>
            Wähle, wo Lezio deine Daten speichern soll, bevor du loslegst.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <Button disabled={busy} onClick={() => pick(createNewDb)}>
            Neue Datenbank anlegen…
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => pick(loadExistingDb)}
          >
            Bestehende Datenbank laden…
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
