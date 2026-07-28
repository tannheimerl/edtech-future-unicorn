import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { AssessmentKommentar, LernkontrolleKommentar } from '@/types/domain'
import {
  dbSaveKommentar, dbDeleteKommentar,
  dbSaveLernkontrolleKommentar, dbDeleteLernkontrolleKommentar,
} from '@/actions/db-write'
import { notifyDbError } from '@/lib/toast'

export function useKommentareActions(
  kommentare: AssessmentKommentar[],
  setKommentare: Dispatch<SetStateAction<AssessmentKommentar[]>>,
  lernkontrolleKommentare: LernkontrolleKommentar[],
  setLernkontrolleKommentare: Dispatch<SetStateAction<LernkontrolleKommentar[]>>,
) {
  const getKommentar = useCallback(
    (studentId: string, lernzielId: string) =>
      kommentare.find((k) => k.studentId === studentId && k.lernzielId === lernzielId),
    [kommentare]
  )

  const getLernkontrolleKommentar = useCallback(
    (studentId: string, lernkontrolleId: string) =>
      lernkontrolleKommentare.find((k) => k.studentId === studentId && k.lernkontrolleId === lernkontrolleId),
    [lernkontrolleKommentare]
  )

  const upsertKommentar = useCallback((studentId: string, lernzielId: string, text: string) => {
    setKommentare((prev) => {
      const existing = prev.findIndex((k) => k.studentId === studentId && k.lernzielId === lernzielId)
      const updated: AssessmentKommentar = { studentId, lernzielId, text, createdAt: new Date().toISOString() }
      dbSaveKommentar(updated).catch(notifyDbError)
      if (existing >= 0) {
        const next = [...prev]
        next[existing] = updated
        return next
      }
      return [...prev, updated]
    })
  }, [setKommentare])

  const deleteKommentar = useCallback((studentId: string, lernzielId: string) => {
    setKommentare((prev) =>
      prev.filter((k) => !(k.studentId === studentId && k.lernzielId === lernzielId))
    )
    dbDeleteKommentar(studentId, lernzielId).catch(notifyDbError)
  }, [setKommentare])

  const upsertLernkontrolleKommentar = useCallback((studentId: string, lernkontrolleId: string, text: string) => {
    setLernkontrolleKommentare((prev) => {
      const idx = prev.findIndex((k) => k.studentId === studentId && k.lernkontrolleId === lernkontrolleId)
      const updated: LernkontrolleKommentar = { studentId, lernkontrolleId, text, updatedAt: new Date().toISOString() }
      dbSaveLernkontrolleKommentar(updated).catch(notifyDbError)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = updated
        return next
      }
      return [...prev, updated]
    })
  }, [setLernkontrolleKommentare])

  const deleteLernkontrolleKommentar = useCallback((studentId: string, lernkontrolleId: string) => {
    setLernkontrolleKommentare((prev) =>
      prev.filter((k) => !(k.studentId === studentId && k.lernkontrolleId === lernkontrolleId))
    )
    dbDeleteLernkontrolleKommentar(studentId, lernkontrolleId).catch(notifyDbError)
  }, [setLernkontrolleKommentare])

  return {
    getKommentar,
    getLernkontrolleKommentar,
    upsertKommentar,
    deleteKommentar,
    upsertLernkontrolleKommentar,
    deleteLernkontrolleKommentar,
  }
}
