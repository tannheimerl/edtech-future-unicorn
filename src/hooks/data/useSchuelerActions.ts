import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type {
  AssessmentKommentar, Schueler, Status, Versuch,
} from '@/types/domain'
import { SEED_COMPETENCIES } from '@/types/domain'
import {
  dbSaveSchueler, dbDeleteSchueler,
  dbSaveLernzielStatus, dbDeleteLernzielStatus,
} from '@/actions/db-write'
import { notifyDbError } from '@/lib/toast'

export function useSchuelerActions(
  students: Schueler[],
  setStudents: Dispatch<SetStateAction<Schueler[]>>,
  setKommentare: Dispatch<SetStateAction<AssessmentKommentar[]>>,
) {
  const getStudent = useCallback(
    (id: string) => students.find((s) => s.id === id),
    [students]
  )
  const getStudentsForClass = useCallback(
    (klassId: string) => students.filter((s) => s.klassId === klassId),
    [students]
  )
  const getVersuche = useCallback(
    (student: Schueler, lernzielId: string): Versuch[] =>
      student.lernzielVersuche?.[lernzielId] ?? [],
    []
  )

  const createStudent = useCallback((
    klassId: string,
    vorname: string,
    nachname: string,
    patch?: Partial<Pick<Schueler, 'bvsa' | 'rilzFachIds'>>,
  ) => {
    const competencyStatus = Object.fromEntries(
      SEED_COMPETENCIES.map((c) => [c.id, 'not_reached' as Status])
    )
    const newStudent: Schueler = {
      id: crypto.randomUUID(), klassId, vorname, nachname, note: '',
      competencyStatus, lernzielStatus: {}, rilzFachIds: [], lernzielVersuche: {},
      ...patch,
    }
    setStudents((prev) => [...prev, newStudent])
    dbSaveSchueler(newStudent).catch(notifyDbError)
  }, [setStudents])

  const updateStudent = useCallback(
    (id: string, patch: Partial<Pick<Schueler, 'vorname' | 'nachname' | 'note'>>) => {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s
          const updated = { ...s, ...patch }
          dbSaveSchueler(updated).catch(notifyDbError)
          return updated
        })
      )
    },
    [setStudents]
  )

  const deleteStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
    setKommentare((prev) => prev.filter((k) => k.studentId !== id))
    dbDeleteSchueler(id).catch(notifyDbError)
  }, [setStudents, setKommentare])

  const setRilzFach = useCallback((studentId: string, fachId: string, enabled: boolean) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s
        const current = s.rilzFachIds ?? []
        const rilzFachIds = enabled
          ? current.includes(fachId) ? current : [...current, fachId]
          : current.filter((id) => id !== fachId)
        const updated = { ...s, rilzFachIds }
        dbSaveSchueler(updated).catch(notifyDbError)
        return updated
      })
    )
  }, [setStudents])

  const setBvsa = useCallback((studentId: string, enabled: boolean) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s
        const updated = { ...s, bvsa: enabled }
        dbSaveSchueler(updated).catch(notifyDbError)
        return updated
      })
    )
  }, [setStudents])

  const updateLernzielStatus = useCallback(
    (studentId: string, lernzielId: string, status: Status | undefined) => {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id !== studentId) return s
          if (status === undefined) {
            const { [lernzielId]: _, ...rest } = s.lernzielStatus
            dbDeleteLernzielStatus(studentId, lernzielId).catch(notifyDbError)
            return { ...s, lernzielStatus: rest }
          }
          dbSaveLernzielStatus(studentId, lernzielId, status).catch(notifyDbError)
          return { ...s, lernzielStatus: { ...s.lernzielStatus, [lernzielId]: status } }
        })
      )
    },
    [setStudents]
  )

  return {
    getStudent,
    getStudentsForClass,
    getVersuche,
    createStudent,
    updateStudent,
    deleteStudent,
    setRilzFach,
    setBvsa,
    updateLernzielStatus,
  }
}
