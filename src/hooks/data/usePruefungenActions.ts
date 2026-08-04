import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Pruefung, PruefungErgebnis, Schueler } from '@/types/domain'
import {
  dbSavePruefung, dbDeletePruefung,
  dbSavePruefungErgebnis,
  dbSaveLernzielStatus,
} from '@/actions/db-write'
import { notifyDbError } from '@/lib/toast'

export function usePruefungenActions(
  pruefungen: Pruefung[],
  setPruefungen: Dispatch<SetStateAction<Pruefung[]>>,
  pruefungErgebnisse: PruefungErgebnis[],
  setPruefungErgebnisse: Dispatch<SetStateAction<PruefungErgebnis[]>>,
  setStudents: Dispatch<SetStateAction<Schueler[]>>,
) {
  const getPruefungenForKlasse = useCallback(
    (klassId: string) => pruefungen.filter((p) => p.klasseId === klassId),
    [pruefungen]
  )

  const getPruefungErgebnisse = useCallback(
    (pruefungId: string) => pruefungErgebnisse.filter((e) => e.pruefungId === pruefungId),
    [pruefungErgebnisse]
  )

  const createPruefung = useCallback(
    (data: Omit<Pruefung, 'id' | 'createdAt'>): string => {
      const id = crypto.randomUUID()
      const newP: Pruefung = { ...data, id, createdAt: new Date().toISOString() }
      setPruefungen((prev) => [...prev, newP])
      dbSavePruefung(newP).catch(notifyDbError)
      return id
    },
    [setPruefungen]
  )

  const updatePruefung = useCallback(
    (id: string, patch: Partial<Pick<Pruefung, 'name' | 'datum' | 'lernzielIds' | 'typ' | 'status' | 'schuelerIds'>>) => {
      setPruefungen((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          const updated = { ...p, ...patch }
          dbSavePruefung(updated).catch(notifyDbError)
          return updated
        })
      )
    },
    [setPruefungen]
  )

  const deletePruefung = useCallback((id: string) => {
    setPruefungen((prev) => prev.filter((p) => p.id !== id))
    setPruefungErgebnisse((prev) => prev.filter((e) => e.pruefungId !== id))
    dbDeletePruefung(id).catch(notifyDbError)
  }, [setPruefungen, setPruefungErgebnisse])

  const upsertPruefungErgebnis = useCallback(
    (ergebnis: Omit<PruefungErgebnis, 'createdAt'>) => {
      const full: PruefungErgebnis = { ...ergebnis, createdAt: new Date().toISOString() }
      setPruefungErgebnisse((prev) => {
        const idx = prev.findIndex((e) => e.id === ergebnis.id)
        if (idx >= 0) { const next = [...prev]; next[idx] = full; return next }
        return [...prev, full]
      })
      // Also update the official lernziel status for every LZ in this Prüfung if status is set
      if (ergebnis.status) {
        const pruefung = pruefungen.find((p) => p.id === ergebnis.pruefungId)
        if (pruefung) {
          setStudents((prev) =>
            prev.map((s) => {
              if (s.id !== ergebnis.schuelerId) return s
              const statusPatch = Object.fromEntries(
                pruefung.lernzielIds.map((lzId) => [lzId, ergebnis.status!])
              )
              return { ...s, lernzielStatus: { ...s.lernzielStatus, ...statusPatch } }
            })
          )
          for (const lzId of pruefung.lernzielIds) {
            dbSaveLernzielStatus(ergebnis.schuelerId, lzId, ergebnis.status!).catch(notifyDbError)
          }
        }
      }
      dbSavePruefungErgebnis(full).catch(notifyDbError)
    },
    [pruefungen, setPruefungErgebnisse, setStudents]
  )

  return {
    getPruefungenForKlasse,
    getPruefungErgebnisse,
    createPruefung,
    updatePruefung,
    deletePruefung,
    upsertPruefungErgebnis,
  }
}
