'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/button'
import { SectionBlock } from '@/components/shared/SectionBlock'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { toast } from '@/lib/toast'
import { getDbPath, changeDbPath, importDb, exportDb, resetDbPath } from '@/lib/db-settings'

type DatenbankSettingsProps = {
  /** Refetches app data after the active database connection changes. */
  onDataChanged: () => Promise<void>
}

export const DatenbankSettings = ({ onDataChanged }: DatenbankSettingsProps) => {
  const [path, setPath] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  useEffect(() => {
    getDbPath().then(setPath).catch(() => toast.error('Datenbankpfad konnte nicht gelesen werden.'))
  }, [])

  const runSwitch = async (action: () => Promise<string | null | boolean>, successMessage: string) => {
    setBusy(true)
    try {
      const result = await action()
      if (result === false || result === null) return
      const newPath = await getDbPath()
      setPath(newPath)
      await onDataChanged()
      toast.success(successMessage)
    } catch {
      toast.error('Datenbankvorgang fehlgeschlagen.')
    } finally {
      setBusy(false)
    }
  }

  const handleChangePath = () => runSwitch(changeDbPath, 'Datenbankpfad geändert.')
  const handleImport = () => runSwitch(importDb, 'Datenbank importiert.')
  const handleReset = () => runSwitch(resetDbPath, 'Standardpfad wiederhergestellt.')

  const handleExport = async () => {
    setBusy(true)
    try {
      const dest = await exportDb()
      if (dest) toast.success('Datenbank exportiert.')
    } catch {
      toast.error('Export fehlgeschlagen.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SectionBlock
        title="Datenbank"
        description="Speicherort deiner lokalen Lezio-Datenbank."
        className="mb-6"
      >
        <div className="grid gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
            <Icon name="database" size={16} className="shrink-0 text-muted-foreground" />
            <span className="truncate font-mono text-xs text-foreground" title={path ?? undefined}>
              {path ?? 'Wird geladen…'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled={busy} onClick={handleChangePath}>
              Pfad ändern…
            </Button>
            <Button variant="outline" size="sm" disabled={busy} onClick={() => setImportOpen(true)}>
              Importieren…
            </Button>
            <Button variant="outline" size="sm" disabled={busy} onClick={handleExport}>
              Exportieren…
            </Button>
            <Button variant="outline" size="sm" disabled={busy} onClick={() => setResetOpen(true)}>
              Standardpfad wiederherstellen
            </Button>
          </div>
        </div>
      </SectionBlock>

      <ConfirmDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Datenbank importieren"
        description="Die aktuelle Datenbank wird durch die ausgewählte Datei ersetzt. Alle aktuellen Daten gehen unwiderruflich verloren."
        confirmLabel="Importieren"
        confirmKeyword="importieren"
        onConfirm={handleImport}
      />

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Standardpfad wiederherstellen"
        description="Lezio wechselt zurück zur Standard-Datenbank im Anwendungsordner. Die aktuell verknüpfte Datei bleibt unverändert erhalten."
        confirmLabel="Zurücksetzen"
        requireTyping={false}
        onConfirm={handleReset}
      />
    </>
  )
}
