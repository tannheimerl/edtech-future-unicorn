'use client'

/*
  ── Backend integration point ─────────────────────────────────────────────
  Replace the useState calls and their mutation handlers with API calls
  (fetch / SWR / React Query / server actions). The context interface stays
  unchanged so no view component needs updating.
  ─────────────────────────────────────────────────────────────────────────
*/

import React, { createContext, useCallback, useContext, useState } from 'react'
import type {
  Klasse, Kompetenz, Schueler, Status, Fach, Thema, Lernziel, LernzielKategorie,
  AssessmentKommentar, ThemaKommentar, Versuch, Lehrperson,
} from '@/types/domain'
import {
  SEED_CLASSES,
  SEED_COMPETENCIES,
  SEED_STUDENTS,
  SEED_FAECHER,
  SEED_THEMEN,
  SEED_LERNZIELE,
  SEED_LERNZIELE_BIBLIOTHEK,
  SEED_LERNZIELE_RILZ,
  SEED_LEHRPERSONEN,
  SEED_KOMMENTARE,
} from '@/lib/mock-data'

// ── Public interface ─────────────────────────────────────────────────────

interface DataContextValue {
  // Identity
  currentLpId: string

  // State
  classes: Klasse[]
  students: Schueler[]
  competencies: Kompetenz[]
  faecher: Fach[]
  themen: Thema[]
  lernziele: Lernziel[]
  lehrpersonen: Lehrperson[]
  kommentare: AssessmentKommentar[]
  themaKommentare: ThemaKommentar[]

  // Queries
  getClass: (id: string) => Klasse | undefined
  getStudent: (id: string) => Schueler | undefined
  getStudentsForClass: (klassId: string) => Schueler[]
  getThemenForKlasse: (klassId: string) => Thema[]
  getLernzieleForThema: (themaId: string) => Lernziel[]
  getFachForThema: (themaId: string) => Fach | undefined
  getKommentar: (studentId: string, lernzielId: string) => AssessmentKommentar | undefined
  getThemaKommentar: (studentId: string, themaId: string) => ThemaKommentar | undefined
  getVersuche: (student: Schueler, lernzielId: string) => Versuch[]

  // Class CRUD
  createClass: (name: string) => string
  updateClass: (id: string, name: string) => void
  deleteClass: (id: string) => void

  // Student CRUD
  createStudent: (klassId: string, vorname: string, nachname: string) => void
  updateStudent: (id: string, patch: Partial<Pick<Schueler, 'vorname' | 'nachname' | 'note'>>) => void
  deleteStudent: (id: string) => void

  // RILZ & BVSA
  setRilzFach: (studentId: string, fachId: string, enabled: boolean) => void
  setBvsa: (studentId: string, enabled: boolean) => void

  // RILZ individual Lernziele
  addRilzLernziel: (studentId: string, themaId: string, label: string) => void
  updateRilzLernzielStatus: (studentId: string, lzId: string, status: Status) => void
  updateRilzLernzielLabel: (studentId: string, lzId: string, label: string) => void
  deleteRilzLernziel: (studentId: string, lzId: string) => void

  // Competency status
  updateCompetencyStatus: (studentId: string, competencyId: string, status: Status) => void

  // Lernziel status
  updateLernzielStatus: (studentId: string, lernzielId: string, status: Status | undefined) => void

  // Versuche (multiple attempts)
  addVersuch: (studentId: string, lernzielId: string, status: Status, withHelp?: boolean) => void

  // Kommentare
  upsertKommentar: (studentId: string, lernzielId: string, text: string) => void
  deleteKommentar: (studentId: string, lernzielId: string) => void
  upsertThemaKommentar: (studentId: string, themaId: string, text: string) => void
  deleteThemaKommentar: (studentId: string, themaId: string) => void

  // Thema assignment to Klasse
  assignThemaToKlasse: (klassId: string, themaId: string) => void
  removeThemaFromKlasse: (klassId: string, themaId: string) => void

  // LP assignments to Klasse
  setLpZuweisung: (klassId: string, lpId: string, fachIds: string[], rolle?: import('@/types/domain').LpRolle) => void
  removeLpFromKlasse: (klassId: string, lpId: string) => void

  // Klassenübergabe
  createFolgeklasse: (vorgaengerKlasseId: string, neuerName: string, neuesSchuljahr: string) => string

  // Fach CRUD
  createFach: (name: string) => string
  updateFach: (id: string, name: string) => void
  deleteFach: (id: string) => void

  // Thema CRUD
  createThema: (fachId: string, name: string, typ?: 'standard' | 'rilz', standardThemaId?: string) => string
  updateThema: (id: string, patch: Partial<Pick<Thema, 'name' | 'faelligAm' | 'typ' | 'standardThemaId' | 'stufe' | 'zyklus'>>) => void
  deleteThema: (id: string) => void

  // RILZ-Thema assignment to students
  assignRilzThemaToStudent: (studentId: string, rilzThemaId: string) => void
  removeRilzThemaFromStudent: (studentId: string, rilzThemaId: string) => void

  // Lernziel CRUD
  createLernziel: (themaId: string, label: string, kategorie: LernzielKategorie) => void
  updateLernziel: (id: string, patch: Partial<Pick<Lernziel, 'label' | 'kategorie'>>) => void
  deleteLernziel: (id: string) => void
  copyLernzielToEigene: (lzId: string) => string | undefined
  copyThemaToEigene: (themaId: string, targetFachId?: string) => string | undefined
  publishThemaToLibrary: (themaId: string) => void
}

const DataContext = createContext<DataContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = useState<Klasse[]>(SEED_CLASSES)
  const [students, setStudents] = useState<Schueler[]>(SEED_STUDENTS)
  const [faecher, setFaecher] = useState<Fach[]>(SEED_FAECHER)
  const [themen, setThemen] = useState<Thema[]>(SEED_THEMEN)
  const [lernziele, setLernziele] = useState<Lernziel[]>([...SEED_LERNZIELE, ...SEED_LERNZIELE_RILZ, ...SEED_LERNZIELE_BIBLIOTHEK])
  const [kommentare, setKommentare] = useState<AssessmentKommentar[]>(SEED_KOMMENTARE)
  const [themaKommentare, setThemaKommentare] = useState<ThemaKommentar[]>([])
  const competencies = SEED_COMPETENCIES
  const lehrpersonen = SEED_LEHRPERSONEN

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
      return themen.filter((t) => klasse.assignedThemaIds.includes(t.id))
    },
    [classes, themen]
  )
  const getLernzieleForThema = useCallback(
    (themaId: string) =>
      lernziele
        .filter((l) => l.themaId === themaId)
        .sort((a, b) => {
          if (a.kategorie === b.kategorie) return 0
          return a.kategorie === 'grundlegend' ? -1 : 1
        }),
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

  const getVersuche = useCallback(
    (student: Schueler, lernzielId: string): Versuch[] =>
      student.lernzielVersuche?.[lernzielId] ?? [],
    []
  )

  // ── Class mutations ───────────────────────────────────────────────────

  const createClass = useCallback((name: string): string => {
    const id = crypto.randomUUID()
    setClasses((prev) => [...prev, { id, name, assignedThemaIds: [], lpZuweisungen: [] }])
    return id
  }, [])

  const updateClass = useCallback((id: string, name: string) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
  }, [])

  const deleteClass = useCallback((id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id))
    setStudents((prev) => prev.filter((s) => s.klassId !== id))
  }, [])

  // ── Student mutations ─────────────────────────────────────────────────

  const createStudent = useCallback((klassId: string, vorname: string, nachname: string) => {
    const competencyStatus = Object.fromEntries(
      SEED_COMPETENCIES.map((c) => [c.id, 'not_reached' as Status])
    )
    setStudents((prev) => [
      ...prev,
      { id: crypto.randomUUID(), klassId, vorname, nachname, note: '', competencyStatus, lernzielStatus: {}, rilzFachIds: [], lernzielVersuche: {} },
    ])
  }, [])

  const updateStudent = useCallback(
    (id: string, patch: Partial<Pick<Schueler, 'vorname' | 'nachname' | 'note'>>) => {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
      )
    },
    []
  )

  const deleteStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
    setKommentare((prev) => prev.filter((k) => k.studentId !== id))
  }, [])

  // ── RILZ & BVSA ──────────────────────────────────────────────────────

  const setRilzFach = useCallback((studentId: string, fachId: string, enabled: boolean) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s
        const current = s.rilzFachIds ?? []
        const rilzFachIds = enabled
          ? current.includes(fachId) ? current : [...current, fachId]
          : current.filter((id) => id !== fachId)
        return { ...s, rilzFachIds }
      })
    )
  }, [])

  const setBvsa = useCallback((studentId: string, enabled: boolean) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, bvsa: enabled } : s))
    )
  }, [])

  const addRilzLernziel = useCallback((studentId: string, themaId: string, label: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s
        const lz: import('@/types/domain').RilzLernziel = { id: crypto.randomUUID(), themaId, label, status: 'not_reached' }
        return { ...s, rilzLernziele: [...(s.rilzLernziele ?? []), lz] }
      })
    )
  }, [])

  const updateRilzLernzielStatus = useCallback((studentId: string, lzId: string, status: Status) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s
        return { ...s, rilzLernziele: (s.rilzLernziele ?? []).map(lz => lz.id === lzId ? { ...lz, status } : lz) }
      })
    )
  }, [])

  const updateRilzLernzielLabel = useCallback((studentId: string, lzId: string, label: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s
        return { ...s, rilzLernziele: (s.rilzLernziele ?? []).map(lz => lz.id === lzId ? { ...lz, label } : lz) }
      })
    )
  }, [])

  const deleteRilzLernziel = useCallback((studentId: string, lzId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s
        return { ...s, rilzLernziele: (s.rilzLernziele ?? []).filter(lz => lz.id !== lzId) }
      })
    )
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
    (studentId: string, lernzielId: string, status: Status | undefined) => {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id !== studentId) return s
          if (status === undefined) {
            const { [lernzielId]: _, ...rest } = s.lernzielStatus
            return { ...s, lernzielStatus: rest }
          }
          return { ...s, lernzielStatus: { ...s.lernzielStatus, [lernzielId]: status } }
        })
      )
    },
    []
  )

  // ── Versuche ─────────────────────────────────────────────────────────

  const addVersuch = useCallback(
    (studentId: string, lernzielId: string, status: Status, withHelp?: boolean) => {
      const versuch: Versuch = { date: new Date().toISOString().slice(0, 10), status, withHelp }
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id !== studentId) return s
          const prev_versuche = s.lernzielVersuche ?? {}
          const existing = prev_versuche[lernzielId] ?? []
          const lernzielVersuche = { ...prev_versuche, [lernzielId]: [...existing, versuch] }
          // Keep lernzielStatus in sync with latest attempt
          const lernzielStatus = { ...s.lernzielStatus, [lernzielId]: status }
          return { ...s, lernzielVersuche, lernzielStatus }
        })
      )
    },
    []
  )

  // ── Kommentare ────────────────────────────────────────────────────────

  const upsertKommentar = useCallback((studentId: string, lernzielId: string, text: string) => {
    setKommentare((prev) => {
      const existing = prev.findIndex((k) => k.studentId === studentId && k.lernzielId === lernzielId)
      const updated: AssessmentKommentar = { studentId, lernzielId, text, createdAt: new Date().toISOString() }
      if (existing >= 0) {
        const next = [...prev]
        next[existing] = updated
        return next
      }
      return [...prev, updated]
    })
  }, [])

  const deleteKommentar = useCallback((studentId: string, lernzielId: string) => {
    setKommentare((prev) =>
      prev.filter((k) => !(k.studentId === studentId && k.lernzielId === lernzielId))
    )
  }, [])

  const upsertThemaKommentar = useCallback((studentId: string, themaId: string, text: string) => {
    setThemaKommentare((prev) => {
      const idx = prev.findIndex((k) => k.studentId === studentId && k.themaId === themaId)
      const updated: ThemaKommentar = { studentId, themaId, text, updatedAt: new Date().toISOString() }
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = updated
        return next
      }
      return [...prev, updated]
    })
  }, [])

  const deleteThemaKommentar = useCallback((studentId: string, themaId: string) => {
    setThemaKommentare((prev) =>
      prev.filter((k) => !(k.studentId === studentId && k.themaId === themaId))
    )
  }, [])

  // ── Thema assignment to Klasse ────────────────────────────────────────

  const assignThemaToKlasse = useCallback((klassId: string, themaId: string) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === klassId && !c.assignedThemaIds.includes(themaId)
          ? { ...c, assignedThemaIds: [...c.assignedThemaIds, themaId] }
          : c
      )
    )
  }, [])

  const removeThemaFromKlasse = useCallback((klassId: string, themaId: string) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === klassId
          ? { ...c, assignedThemaIds: c.assignedThemaIds.filter((id) => id !== themaId) }
          : c
      )
    )
  }, [])

  // ── LP Zuweisungen ────────────────────────────────────────────────────

  const setLpZuweisung = useCallback((klassId: string, lpId: string, fachIds: string[], rolle?: import('@/types/domain').LpRolle) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id !== klassId) return c
        const existing = (c.lpZuweisungen ?? []).filter((z) => z.lpId !== lpId)
        const lpZuweisungen = fachIds.length > 0 || rolle != null
          ? [...existing, { lpId, fachIds, rolle }]
          : existing
        return { ...c, lpZuweisungen }
      })
    )
  }, [])

  const removeLpFromKlasse = useCallback((klassId: string, lpId: string) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === klassId
          ? { ...c, lpZuweisungen: (c.lpZuweisungen ?? []).filter((z) => z.lpId !== lpId) }
          : c
      )
    )
  }, [])

  // ── Klassenübergabe ───────────────────────────────────────────────────

  const createFolgeklasse = useCallback(
    (vorgaengerKlasseId: string, neuerName: string, neuesSchuljahr: string): string => {
      const vorgaenger = classes.find((c) => c.id === vorgaengerKlasseId)
      if (!vorgaenger) return ''
      const newKlasseId = crypto.randomUUID()
      setClasses((prev) => [
        ...prev,
        {
          ...vorgaenger,
          id: newKlasseId,
          name: neuerName,
          schuljahr: neuesSchuljahr,
          vorgaengerKlasseId: vorgaengerKlasseId,
        },
      ])
      // Clone all students into the new class
      setStudents((prev) => {
        const klassStudents = prev.filter((s) => s.klassId === vorgaengerKlasseId)
        const cloned = klassStudents.map((s) => ({
          ...s,
          id: crypto.randomUUID(),
          klassId: newKlasseId,
          // Reset current status — history carries over
          lernzielStatus: {},
          lernzielVersuche: {},
          progressHistory: undefined,
        }))
        return [...prev, ...cloned]
      })
      return newKlasseId
    },
    [classes]
  )

  // ── Fach CRUD ─────────────────────────────────────────────────────────

  const createFach = useCallback((name: string): string => {
    const id = crypto.randomUUID()
    setFaecher((prev) => [...prev, { id, name }])
    return id
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
        assignedThemaIds: c.assignedThemaIds.filter((id) => !themenToDelete.has(id)),
      }))
    )
    setFaecher((prev) => prev.filter((f) => f.id !== id))
  }, [])

  // ── Thema CRUD ────────────────────────────────────────────────────────

  const createThema = useCallback((fachId: string, name: string, typ?: 'standard' | 'rilz', standardThemaId?: string): string => {
    const id = crypto.randomUUID()
    setThemen((prev) => [...prev, { id, fachId, name, typ: typ ?? 'standard', standardThemaId }])
    return id
  }, [])

  const updateThema = useCallback((id: string, patch: Partial<Pick<Thema, 'name' | 'faelligAm' | 'typ' | 'standardThemaId' | 'stufe' | 'zyklus'>>) => {
    setThemen((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }, [])

  const deleteThema = useCallback((id: string) => {
    setLernziele((prev) => prev.filter((l) => l.themaId !== id))
    setClasses((prev) =>
      prev.map((c) => ({
        ...c,
        assignedThemaIds: c.assignedThemaIds.filter((tid) => tid !== id),
      }))
    )
    setThemen((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ── RILZ-Thema assignment ─────────────────────────────────────────────

  const assignRilzThemaToStudent = useCallback((studentId: string, rilzThemaId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s
        const current = s.rilzThemaIds ?? []
        if (current.includes(rilzThemaId)) return s
        return { ...s, rilzThemaIds: [...current, rilzThemaId] }
      })
    )
  }, [])

  const removeRilzThemaFromStudent = useCallback((studentId: string, rilzThemaId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, rilzThemaIds: (s.rilzThemaIds ?? []).filter((id) => id !== rilzThemaId) }
          : s
      )
    )
  }, [])

  // ── Lernziel CRUD ─────────────────────────────────────────────────────

  const createLernziel = useCallback((themaId: string, label: string, kategorie: LernzielKategorie) => {
    setLernziele((prev) => [...prev, { id: crypto.randomUUID(), themaId, kategorie, label }])
  }, [])

  const updateLernziel = useCallback((id: string, patch: Partial<Pick<Lernziel, 'label' | 'kategorie'>>) => {
    setLernziele((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }, [])

  const deleteLernziel = useCallback((id: string) => {
    setLernziele((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const copyLernzielToEigene = useCallback((lzId: string): string | undefined => {
    const lz = lernziele.find((l) => l.id === lzId)
    if (!lz) return undefined
    const newId = crypto.randomUUID()
    const { source, autor, beschreibung, stufe, ...rest } = lz
    setLernziele((prev) => [...prev, { ...rest, id: newId, source: 'eigene' }])
    return newId
  }, [lernziele])

  const copyThemaToEigene = useCallback((themaId: string, targetFachId?: string): string | undefined => {
    const thema = themen.find((t) => t.id === themaId)
    if (!thema) return undefined
    const newThemaId = crypto.randomUUID()
    const { autor, ...themaRest } = thema
    setThemen((prev) => [...prev, { ...themaRest, id: newThemaId, fachId: targetFachId ?? thema.fachId }])
    const sourceLZ = lernziele.filter((l) => l.themaId === themaId)
    const clonedLZ = sourceLZ.map((lz) => {
      const { source, autor: lzAutor, beschreibung, stufe, ...lzRest } = lz
      return { ...lzRest, id: crypto.randomUUID(), themaId: newThemaId, source: 'eigene' as const }
    })
    setLernziele((prev) => [...prev, ...clonedLZ])
    return newThemaId
  }, [themen, lernziele])

  const CURRENT_LP_ID = 'lp1'
  const CURRENT_LP_NAME = 'Lukas Meier'

  const publishThemaToLibrary = useCallback((themaId: string): void => {
    const thema = themen.find((t) => t.id === themaId)
    if (!thema || thema.autor != null) return
    const newThemaId = crypto.randomUUID()
    setThemen((prev) => [
      ...prev.map((t) => t.id === themaId ? { ...t, publishedToLibrary: true } : t),
      { ...thema, id: newThemaId, autor: CURRENT_LP_NAME, publishedToLibrary: undefined },
    ])
    const sourceLZ = lernziele.filter((l) => l.themaId === themaId)
    const libraryLZ = sourceLZ.map((lz) => ({
      ...lz,
      id: crypto.randomUUID(),
      themaId: newThemaId,
      source: 'bibliothek' as const,
      autor: CURRENT_LP_NAME,
    }))
    setLernziele((prev) => [...prev, ...libraryLZ])
  }, [themen, lernziele])

  return (
    <DataContext.Provider
      value={{
        currentLpId: CURRENT_LP_ID,
        classes,
        students,
        competencies,
        faecher,
        themen,
        lernziele,
        lehrpersonen,
        kommentare,
        themaKommentare,
        getClass,
        getStudent,
        getStudentsForClass,
        getThemenForKlasse,
        getLernzieleForThema,
        getFachForThema,
        getKommentar,
        getThemaKommentar,
        getVersuche,
        createClass,
        updateClass,
        deleteClass,
        createStudent,
        updateStudent,
        deleteStudent,
        setRilzFach,
        setBvsa,
        addRilzLernziel,
        updateRilzLernzielStatus,
        updateRilzLernzielLabel,
        deleteRilzLernziel,
        updateCompetencyStatus,
        updateLernzielStatus,
        addVersuch,
        upsertKommentar,
        deleteKommentar,
        upsertThemaKommentar,
        deleteThemaKommentar,
        assignThemaToKlasse,
        removeThemaFromKlasse,
        setLpZuweisung,
        removeLpFromKlasse,
        createFolgeklasse,
        createFach,
        updateFach,
        deleteFach,
        createThema,
        updateThema,
        deleteThema,
        assignRilzThemaToStudent,
        removeRilzThemaFromStudent,
        createLernziel,
        updateLernziel,
        deleteLernziel,
        copyLernzielToEigene,
        copyThemaToEigene,
        publishThemaToLibrary,
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
