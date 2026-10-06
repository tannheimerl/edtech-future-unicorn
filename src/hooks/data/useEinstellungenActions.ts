import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { BerichtIcon, BerichtIcons, Status } from '@/types/domain'
import { DEFAULT_BERICHT_ICONS } from '@/types/domain'
import { dbSaveBerichtIcon, dbDeleteBerichtIcon } from '@/actions/db-write'
import { notifyDbError } from '@/lib/toast'

export function useEinstellungenActions(
  setBerichtIcons: Dispatch<SetStateAction<BerichtIcons>>,
) {
  const setBerichtIcon = useCallback((status: Status, icon: BerichtIcon) => {
    setBerichtIcons((prev) => ({ ...prev, [status]: icon }))
    dbSaveBerichtIcon(status, icon).catch(notifyDbError)
  }, [setBerichtIcons])

  // Zeile löschen statt den Default zu schreiben: so folgt ein zurückgesetzter
  // Status weiterhin DEFAULT_BERICHT_ICONS, auch wenn der sich später ändert.
  const resetBerichtIcon = useCallback((status: Status) => {
    setBerichtIcons((prev) => ({ ...prev, [status]: DEFAULT_BERICHT_ICONS[status] }))
    dbDeleteBerichtIcon(status).catch(notifyDbError)
  }, [setBerichtIcons])

  return { setBerichtIcon, resetBerichtIcon }
}
