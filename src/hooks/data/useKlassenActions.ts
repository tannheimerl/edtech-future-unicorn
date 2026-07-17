import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Klasse, KlasseBeurteilungSettings, LpRolle, Schueler } from '@/types/domain'
import { dbSaveKlasse, dbDeleteKlasse, dbSaveSchueler, dbSaveBeurteilungSettings } from '@/actions/db-write'
import { notifyDbError } from '@/lib/toast'

export function useKlassenActions(
  currentLpId: string,
  classes: Klasse[],
  setClasses: Dispatch<SetStateAction<Klasse[]>>,
  setStudents: Dispatch<SetStateAction<Schueler[]>>,
) {
  const getClass = useCallback(
    (id: string) => classes.find((c) => c.id === id),
    [classes]
  )

  const createClass = useCallback((name: string): string => {
    const id = crypto.randomUUID()
    const newKlasse: Klasse = {
      id, name, assignedThemaIds: [],
      // Ersteller direkt als Klassenlehrperson zuweisen, sonst fällt die neue
      // Klasse durch den `myClasses`-Filter (klassen/page.tsx) und bleibt unsichtbar.
      lpZuweisungen: [{ lpId: currentLpId, fachIds: [], rolle: 'klassenlehrperson' }],
    }
    setClasses((prev) => [...prev, newKlasse])
    dbSaveKlasse(newKlasse).catch(notifyDbError)
    return id
  }, [currentLpId, setClasses])

  const updateClass = useCallback((id: string, name: string, schuljahr?: string) => {
    setClasses((prev) => prev.map((c) => {
      if (c.id !== id) return c
      const updated = { ...c, name, ...(schuljahr !== undefined && { schuljahr }) }
      dbSaveKlasse(updated).catch(notifyDbError)
      return updated
    }))
  }, [setClasses])

  const deleteClass = useCallback((id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id))
    setStudents((prev) => prev.filter((s) => s.klassId !== id))
    dbDeleteKlasse(id).catch(notifyDbError)
  }, [setClasses, setStudents])

  const updateBeurteilungSettings = useCallback((klassId: string, settings: KlasseBeurteilungSettings) => {
    setClasses((prev) => prev.map((c) =>
      c.id === klassId ? { ...c, beurteilungSettings: settings } : c
    ))
    dbSaveBeurteilungSettings(klassId, settings).catch(notifyDbError)
  }, [setClasses])

  const assignThemaToKlasse = useCallback((klassId: string, themaId: string) => {
    setClasses((prev) => {
      const alreadyElsewhere = prev.some(
        (c) => c.id !== klassId && c.assignedThemaIds.includes(themaId)
      )
      if (alreadyElsewhere) return prev
      return prev.map((c) => {
        if (c.id !== klassId || c.assignedThemaIds.includes(themaId)) return c
        const updated = { ...c, assignedThemaIds: [...c.assignedThemaIds, themaId] }
        dbSaveKlasse(updated).catch(notifyDbError)
        return updated
      })
    })
  }, [setClasses])

  const removeThemaFromKlasse = useCallback((klassId: string, themaId: string) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id !== klassId) return c
        const updated = { ...c, assignedThemaIds: c.assignedThemaIds.filter((id) => id !== themaId) }
        dbSaveKlasse(updated).catch(notifyDbError)
        return updated
      })
    )
  }, [setClasses])

  const setLpZuweisung = useCallback((klassId: string, lpId: string, fachIds: string[], rolle?: LpRolle) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id !== klassId) return c
        const existing = (c.lpZuweisungen ?? []).filter((z) => z.lpId !== lpId)
        const lpZuweisungen = fachIds.length > 0 || rolle != null
          ? [...existing, { lpId, fachIds, rolle }]
          : existing
        const updated = { ...c, lpZuweisungen }
        dbSaveKlasse(updated).catch(notifyDbError)
        return updated
      })
    )
  }, [setClasses])

  const removeLpFromKlasse = useCallback((klassId: string, lpId: string) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id !== klassId) return c
        const updated = { ...c, lpZuweisungen: (c.lpZuweisungen ?? []).filter((z) => z.lpId !== lpId) }
        dbSaveKlasse(updated).catch(notifyDbError)
        return updated
      })
    )
  }, [setClasses])

  const createFolgeklasse = useCallback(
    (vorgaengerKlasseId: string, neuerName: string, neuesSchuljahr: string): string => {
      const vorgaenger = classes.find((c) => c.id === vorgaengerKlasseId)
      if (!vorgaenger) return ''
      const newKlasseId = crypto.randomUUID()
      const newKlasse: Klasse = {
        ...vorgaenger, id: newKlasseId, name: neuerName,
        schuljahr: neuesSchuljahr, vorgaengerKlasseId: vorgaengerKlasseId,
      }
      setClasses((prev) => [...prev, newKlasse])
      dbSaveKlasse(newKlasse).catch(notifyDbError)

      setStudents((prev) => {
        const cloned = prev
          .filter((s) => s.klassId === vorgaengerKlasseId)
          .map((s) => {
            const ns: Schueler = {
              ...s, id: crypto.randomUUID(), klassId: newKlasseId,
              lernzielStatus: {}, lernzielVersuche: {}, progressHistory: undefined,
            }
            dbSaveSchueler(ns).catch(notifyDbError)
            return ns
          })
        return [...prev, ...cloned]
      })
      return newKlasseId
    },
    [classes, setClasses, setStudents]
  )

  return {
    getClass,
    createClass,
    updateClass,
    deleteClass,
    updateBeurteilungSettings,
    assignThemaToKlasse,
    removeThemaFromKlasse,
    setLpZuweisung,
    removeLpFromKlasse,
    createFolgeklasse,
  }
}
