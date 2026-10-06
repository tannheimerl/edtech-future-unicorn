'use client'

import { Button } from '@/components/ui/button'
import { Modal } from '@/components/shared/Modal'
import { FachZuordnenRow } from '@/components/shared/FachZuordnenRow'
import { normalizeFachName } from '@/lib/fachMatch'
import { NEW_FACH } from '@/lib/lezioImport'
import type { LezioImportState } from '@/hooks/useLezioImport'

/**
 * UI-Teil des Lernziel-Imports: Fächer-Zuordnungs-Maske plus verstecktes
 * File-Input. Immer zusammen mit `useLezioImport` einsetzen — der Hook
 * liefert den kompletten State (`imp`).
 */
export const LezioImportModal = ({ imp }: { imp: LezioImportState }) => {
  const { fileInputRef, handleFileChange } = imp
  return (
    <>
      <Modal
        open={imp.zuordnenOpen}
        onOpenChange={(o) => { if (!o) imp.closeZuordnen() }}
        title="Fächer zuordnen"
        description={`${imp.distinctFaecher.length} ${imp.distinctFaecher.length === 1 ? 'Fach' : 'Fächer'} · ${imp.importItems.length} ${imp.importItems.length === 1 ? 'Lernkontrolle' : 'Lernkontrollen'} importieren. Ordne jedes Fach einem deiner Fächer zu oder lege es neu an:`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={imp.closeZuordnen}>Abbrechen</Button>
            <Button onClick={imp.confirmZuordnen}>Importieren</Button>
          </>
        }
      >
        <div className="flex flex-col divide-y divide-border/40">
          {imp.distinctFaecher.map(({ name, count }) => {
            const key = normalizeFachName(name)
            return (
              <FachZuordnenRow
                key={key}
                importName={name}
                count={count}
                faecher={imp.faecher}
                value={imp.fachChoice[key] ?? NEW_FACH}
                onChange={(v) => imp.setChoice(key, v)}
              />
            )
          })}
        </div>
      </Modal>

      <input
        ref={fileInputRef}
        type="file"
        accept=".lezio,.json,.zip"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  )
}
