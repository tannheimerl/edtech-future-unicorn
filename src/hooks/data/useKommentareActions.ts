import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { AssessmentKommentar, ThemaKommentar } from '@/types/domain'
import {
  dbSaveKommentar, dbDeleteKommentar,
  dbSaveThemaKommentar, dbDeleteThemaKommentar,
} from '@/actions/db-write'
import { notifyDbError } from '@/lib/toast'

export function useKommentareActions(
  kommentare: AssessmentKommentar[],
  setKommentare: Dispatch<SetStateAction<AssessmentKommentar[]>>,
  themaKommentare: ThemaKommentar[],
  setThemaKommentare: Dispatch<SetStateAction<ThemaKommentar[]>>,
) {
  const getKommentar = useCallback(
    (studentId: string, lernzielId: string) =>
      kommentare.find((k) => k.studentId === studentId && k.lernzielId === lernzielId),
    [kommentare]
  )

  const getThemaKommentar = useCallback(
    (studentId: string, themaId: string) =>
      themaKommentare.find((k) => k.studentId === studentId && k.themaId === themaId),
    [themaKommentare]
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

  const upsertThemaKommentar = useCallback((studentId: string, themaId: string, text: string) => {
    setThemaKommentare((prev) => {
      const idx = prev.findIndex((k) => k.studentId === studentId && k.themaId === themaId)
      const updated: ThemaKommentar = { studentId, themaId, text, updatedAt: new Date().toISOString() }
      dbSaveThemaKommentar(updated).catch(notifyDbError)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = updated
        return next
      }
      return [...prev, updated]
    })
  }, [setThemaKommentare])

  const deleteThemaKommentar = useCallback((studentId: string, themaId: string) => {
    setThemaKommentare((prev) =>
      prev.filter((k) => !(k.studentId === studentId && k.themaId === themaId))
    )
    dbDeleteThemaKommentar(studentId, themaId).catch(notifyDbError)
  }, [setThemaKommentare])

  return {
    getKommentar,
    getThemaKommentar,
    upsertKommentar,
    deleteKommentar,
    upsertThemaKommentar,
    deleteThemaKommentar,
  }
}
