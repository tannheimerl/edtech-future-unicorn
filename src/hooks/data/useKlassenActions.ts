import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Klasse, Schueler } from '@/types/domain'
import { dbSaveKlasse, dbDeleteKlasse, dbSaveSchueler } from '@/actions/db-write'
import { notifyDbError } from '@/lib/toast'

export function useKlassenActions(
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
    const newKlasse: Klasse = { id, name }
    setClasses((prev) => [...prev, newKlasse])
    dbSaveKlasse(newKlasse).catch(notifyDbError)
    return id
  }, [setClasses])

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
    createFolgeklasse,
  }
}
