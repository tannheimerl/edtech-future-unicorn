'use client'

/*
  ── Backend integration point ─────────────────────────────────────────────
  Replace the useState calls and their mutation handlers with API calls
  (fetch / SWR / React Query / server actions). The context interface stays
  unchanged so no view component needs updating.
  ─────────────────────────────────────────────────────────────────────────
*/

import React, { createContext, useCallback, useContext, useState } from 'react'
import type { Klasse, Kompetenz, Schueler, Status } from '@/types/domain'
import { SEED_CLASSES, SEED_COMPETENCIES, SEED_STUDENTS } from '@/lib/mock-data'

// ── Public interface ─────────────────────────────────────────────────────

interface DataContextValue {
  // State
  classes: Klasse[]
  students: Schueler[]
  competencies: Kompetenz[]

  // Queries
  getClass: (id: string) => Klasse | undefined
  getStudent: (id: string) => Schueler | undefined
  getStudentsForClass: (klassId: string) => Schueler[]

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
}

const DataContext = createContext<DataContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = useState<Klasse[]>(SEED_CLASSES)
  const [students, setStudents] = useState<Schueler[]>(SEED_STUDENTS)
  const competencies = SEED_COMPETENCIES // shared catalog, immutable for prototype

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

  // Class mutations
  const createClass = useCallback((name: string) => {
    setClasses((prev) => [...prev, { id: crypto.randomUUID(), name }])
  }, [])

  const updateClass = useCallback((id: string, name: string) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
  }, [])

  const deleteClass = useCallback((id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id))
    setStudents((prev) => prev.filter((s) => s.klassId !== id))
  }, [])

  // Student mutations
  const createStudent = useCallback(
    (klassId: string, name: string) => {
      const competencyStatus = Object.fromEntries(
        SEED_COMPETENCIES.map((c) => [c.id, 'not_reached' as Status])
      )
      setStudents((prev) => [
        ...prev,
        { id: crypto.randomUUID(), klassId, name, note: '', competencyStatus },
      ])
    },
    []
  )

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

  // Competency status mutation
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

  return (
    <DataContext.Provider
      value={{
        classes,
        students,
        competencies,
        getClass,
        getStudent,
        getStudentsForClass,
        createClass,
        updateClass,
        deleteClass,
        createStudent,
        updateStudent,
        deleteStudent,
        updateCompetencyStatus,
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
