'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { cn } from '@/lib/utils'

type GefahrenzoneSettingsProps = {
  klassName: string
  onDelete: () => void
}

export const GefahrenzoneSettings = ({ klassName, onDelete }: GefahrenzoneSettingsProps) => {
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div
      className={cn(
        'max-w-2xl rounded-2xl border border-status-not-reached/30 bg-status-not-reached-soft p-4 shadow-sm',
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon name="warning" size={16} className="text-status-not-reached-fg" />
        <h6 className="text-status-not-reached-fg">Gefahrenzone</h6>
      </div>
      <p className="mb-3 text-xs text-status-not-reached-fg/80">
        Diese Aktion kann nicht rückgängig gemacht werden.
      </p>
      <div className="flex items-center justify-between gap-4 rounded-lg border border-status-not-reached/20 bg-card/60 px-3 py-2.5">
        <div>
          <p className="text-sm font-medium text-foreground">Klasse löschen</p>
          <p className="text-xs text-muted-foreground">
            Löscht „{klassName}" und alle zugehörigen Schüler dauerhaft.
          </p>
        </div>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          <Icon name="delete" size={16} />
          Klasse löschen
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Klasse löschen"
        description={`Alle Schüler von „${klassName}" werden ebenfalls entfernt.`}
        confirmLabel="Löschen"
        onConfirm={onDelete}
      />
    </div>
  )
}
