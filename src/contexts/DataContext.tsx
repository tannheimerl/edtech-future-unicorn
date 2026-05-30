'use client'

/*
  ── Backend integration point ─────────────────────────────────────────────
  Replace the useState calls and their mutation handlers with API calls
  (fetch / SWR / React Query / server actions). The context interface stays
  unchanged so no view component needs updating.
  ─────────────────────────────────────────────────────────────────────────
*/

import React, { createContext, useCallback, useContext, useState } from 'react'
import type { Klasse, Kompetenz, Schueler, Status, Fach, Thema, Lernziel } from '@/types/domain'
import {
  SEED_CLASSES,
  SEED_COMPETENCIES,
  SEED_STUDENTS,
  SEED_FAECHER,
  SEED_THEMEN,
  SEED_LERNZIELE,
} from '@/lib/mock-data'

// ── Public interface ─────────────────────────────────────────────────────

interface DataContextValue {
  // State
  classes: Klasse[]
  students: Schueler[]
  competencies: Kompetenz[]
  faecher: Fach[]
  themen: Thema[]
  lernziele: Lernziel[]

  // Queries
  getClass: (id: string) => Klasse | undefined
  getStudent: (id: string) => Schueler | undefined
  getStudentsForClass: (klassId: string) => Schueler[]
  getThemenForKlasse: (klassId: string) => Thema[]
  getLernzieleForThema: (themaId: string) => Lernziel[]
  getFachForThema: (themaId: string) => Fach | undefined

  // Class CRUD
  createClass: (name: string) => void
  updateClass: (id: string, name: string) => void
  deleteClass: (id: string) => void

  // Student CRUD
  createStudent: (klassId: string, name: string) => void
  updateStudent: (id: string, patch: Partial<Pick<Schueler, 'name' | 'note'>>) => void
  deleteStudent: (id: string) => void

  // Competency status
  updateCompetencyStatus: (studentId: string, competencyId: string, status: Status) => void

  // Lernziel status
  updateLernzielStatus: (studentId: string, lernzielId: string, status: Status) => void

  // Lernziel assignment to Klasse
  assignLernzielToKlasse: (klassId: string, lernzielId: string) => void
  removeLernzielFromKlasse: (klassId: string, lernzielId: string) => void

  // Fach CRUD
  createFach: (name: string) => void
  updateFach: (id: string, name: string) => void
  deleteFach: (id: string) => void

  // Thema CRUD
  createThema: (fachId: string, name: string) => void
  updateThema: (id: string, patch: Partial<Pick<Thema, 'name' | 'faelligAm'>>) => void
  deleteThema: (id: string) => void

  // Lernziel CRUD
  createLernziel: (themaId: string, label: string) => void
  updateLernziel: (id: string, label: string) => void
  deleteLernziel: (id: string) => void
}

const DataContext = createContext<DataContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = useState<Klasse[]>(SEED_CLASSES)
  const [students, setStudents] = useState<Schueler[]>(SEED_STUDENTS)
  const [faecher, setFaecher] = useState<Fach[]>(SEED_FAECHER)
  const [themen, setThemen] = useState<Thema[]>(SEED_THEMEN)
  const [lernziele, setLernziele] = useState<Lernziel[]>(SEED_LERNZIELE)
  const competencies = SEED_COMPETENCIES

  // ── Queries ──────────────────────────────────────────────────────────

  const getClass = useCallback(
    (id: string) => classes.find((c) => c.id === id),
    [classes]
  )
  const getStudent = useCallback(
    (id: string) => students.find((s) => s.id === id),
    [students]
  )
  const getStudentsForClass = useCallback(
    (klassId: string) => students.filter((s) => s.klassId === klassId),
    [students]
  )
  const getThemenForKlasse = useCallback(
    (klassId: string) => {
      const klasse = classes.find((c) => c.id === klassId)
      if (!klasse) return []
      const assignedLzSet = new Set(klasse.assignedLernzielIds)
      return themen.filter((t) =>
        lernziele.some((lz) => lz.themaId === t.id && assignedLzSet.has(lz.id))
      )
    },
    [classes, themen, lernziele]
  )
  const getLernzieleForThema = useCallback(
    (themaId: string) => lernziele.filter((l) => l.themaId === themaId),
    [lernziele]
  )
  const getFachForThema = useCallback(
    (themaId: string) => {
      const thema = themen.find((t) => t.id === themaId)
      if (!thema) return undefined
      return faecher.find((f) => f.id === thema.fachId)
    },
    [themen, faecher]
  )

  // ── Class mutations ───────────────────────────────────────────────────

  const createClass = useCallback((name: string) => {
    setClasses((prev) => [...prev, { id: crypto.randomUUID(), name, assignedLernzielIds: [] }])
  }, [])

  const updateClass = useCallback((id: string, name: string) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
  }, [])

  const deleteClass = useCallback((id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id))
    setStudents((prev) => prev.filter((s) => s.klassId !== id))
  }, [])

  // ── Student mutations ─────────────────────────────────────────────────

  const createStudent = useCallback((klassId: string, name: string) => {
    const competencyStatus = Object.fromEntries(
      SEED_COMPETENCIES.map((c) => [c.id, 'not_reached' as Status])
    )
    setStudents((prev) => [
      ...prev,
      { id: crypto.randomUUID(), klassId, name, note: '', competencyStatus, lernzielStatus: {} },
    ])
  }, [])

  const updateStudent = useCallback(
    (id: string, patch: Partial<Pick<Schueler, 'name' | 'note'>>) => {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
      )
    },
    []
  )

  const deleteStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
  }, [])

  // ── Status mutations ──────────────────────────────────────────────────

  const updateCompetencyStatus = useCallback(
    (studentId: string, competencyId: string, status: Status) => {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? { ...s, competencyStatus: { ...s.competencyStatus, [competencyId]: status } }
            : s
        )
      )
    },
    []
  )

  const updateLernzielStatus = useCallback(
    (studentId: string, lernzielId: string, status: Status) => {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? { ...s, lernzielStatus: { ...s.lernzielStatus, [lernzielId]: status } }
            : s
        )
      )
    },
    []
  )

  // ── Lernziel assignment ───────────────────────────────────────────────

  const assignLernzielToKlasse = useCallback((klassId: string, lernzielId: string) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === klassId && !c.assignedLernzielIds.includes(lernzielId)
          ? { ...c, assignedLernzielIds: [...c.assignedLernzielIds, lernzielId] }
          : c
      )
    )
  }, [])

  const removeLernzielFromKlasse = useCallback((klassId: string, lernzielId: string) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === klassId
          ? { ...c, assignedLernzielIds: c.assignedLernzielIds.filter((id) => id !== lernzielId) }
          : c
      )
    )
  }, [])

  // ── Fach CRUD ─────────────────────────────────────────────────────────

  const createFach = useCallback((name: string) => {
    setFaecher((prev) => [...prev, { id: crypto.randomUUID(), name }])
  }, [])

  const updateFach = useCallback((id: string, name: string) => {
    setFaecher((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)))
  }, [])

  const deleteFach = useCallback((id: string) => {
    const themenToDelete = new Set<string>()
    setThemen((prev) => {
      const remaining = prev.filter((t) => {
        if (t.fachId === id) { themenToDelete.add(t.id); return false }
        return true
      })
      return remaining
    })
    const lzToDelete = new Set<string>()
    setLernziele((prev) => {
      const remaining = prev.filter((l) => {
        if (themenToDelete.has(l.themaId)) { lzToDelete.add(l.id); return false }
        return true
      })
      return remaining
    })
    setClasses((prev) =>
      prev.map((c) => ({
        ...c,
        assignedLernzielIds: c.assignedLernzielIds.filter((id) => !lzToDelete.has(id)),
      }))
    )
    setFaecher((prev) => prev.filter((f) => f.id !== id))
  }, [])

  // ── Thema CRUD ────────────────────────────────────────────────────────

  const createThema = useCallback((fachId: string, name: string) => {
    setThemen((prev) => [...prev, { id: crypto.randomUUID(), fachId, name }])
  }, [])

  const updateThema = useCallback((id: string, patch: Partial<Pick<Thema, 'name' | 'faelligAm'>>) => {
    setThemen((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }, [])

  const deleteThema = useCallback((id: string) => {
    let lzIds: string[] = []
    setLernziele((prev) => {
      lzIds = prev.filter((l) => l.themaId === id).map((l) => l.id)
      return prev.filter((l) => l.themaId !== id)
    })
    setClasses((prev) =>
      prev.map((c) => ({
        ...c,
        assignedLernzielIds: c.assignedLernzielIds.filter((lid) => !lzIds.includes(lid)),
      }))
    )
    setThemen((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ── Lernziel CRUD ─────────────────────────────────────────────────────

  const createLernziel = useCallback((themaId: string, label: string) => {
    setLernziele((prev) => [...prev, { id: crypto.randomUUID(), themaId, label }])
  }, [])

  const updateLernziel = useCallback((id: string, label: string) => {
    setLernziele((prev) => prev.map((l) => (l.id === id ? { ...l, label } : l)))
  }, [])

  const deleteLernziel = useCallback((id: string) => {
    setLernziele((prev) => prev.filter((l) => l.id !== id))
  }, [])

  return (
    <DataContext.Provider
      value={{
        classes,
        students,
        competencies,
        faecher,
        themen,
        lernziele,
        getClass,
        getStudent,
        getStudentsForClass,
        getThemenForKlasse,
        getLernzieleForThema,
        getFachForThema,
        createClass,
        updateClass,
        deleteClass,
        createStudent,
        updateStudent,
        deleteStudent,
        updateCompetencyStatus,
        updateLernzielStatus,
        assignLernzielToKlasse,
        removeLernzielFromKlasse,
        createFach,
        updateFach,
        deleteFach,
        createThema,
        updateThema,
        deleteThema,
        createLernziel,
        updateLernziel,
        deleteLernziel,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────────────────

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within <DataProvider>')
  return ctx
}
