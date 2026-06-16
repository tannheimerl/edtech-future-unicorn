'use client'

/*
  ── Backend integration ────────────────────────────────────────────────────────
  Write-through cache: local React state is the source of truth for the UI;
  every mutation also fires a server action to persist the change in Supabase.
  On mount, data is loaded from Supabase (fetchAllData). The context interface
  is unchanged so no view component needs updating.
  ─────────────────────────────────────────────────────────────────────────────
*/

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type {
  Klasse, KlasseBeurteilungSettings, Kompetenz, Schueler, Status, Fach, Thema, Lernziel, LernzielKategorie,
  AssessmentKommentar, ThemaKommentar, Versuch, Lehrperson, LezioExport, LezioExportLernziel,
  Pruefung, PruefungErgebnis,
} from '@/types/domain'
import { SEED_COMPETENCIES } from '@/lib/mock-data'
import { fetchAllData } from '@/actions/db-read'
import {
  dbSaveKlasse, dbDeleteKlasse,
  dbSaveSchueler, dbDeleteSchueler,
  dbSaveLernzielStatus, dbDeleteLernzielStatus,
  dbSaveRilzLernziel, dbDeleteRilzLernziel,
  dbSaveKommentar, dbDeleteKommentar,
  dbSaveThemaKommentar, dbDeleteThemaKommentar,
  dbSaveFach, dbDeleteFach,
  dbSaveThema, dbDeleteThema,
  dbSaveLernziel, dbDeleteLernziel,
  dbSavePruefung, dbDeletePruefung,
  dbSavePruefungErgebnis,
  dbUploadPruefungAnhang, dbDeletePruefungAnhang,
  dbSaveBeurteilungSettings,
} from '@/actions/db-write'

// ── Public interface ─────────────────────────────────────────────────────────

interface DataContextValue {
  // Identity
  currentLpId: string

  // Loading state
  isLoading: boolean

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
  pruefungen: Pruefung[]
  pruefungErgebnisse: PruefungErgebnis[]

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
  updateClass: (id: string, name: string, schuljahr?: string) => void
  deleteClass: (id: string) => void
  updateBeurteilungSettings: (klassId: string, settings: KlasseBeurteilungSettings) => void

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

  // Lernziel status
  updateLernzielStatus: (studentId: string, lernzielId: string, status: Status | undefined) => void

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
  updateThema: (id: string, patch: Partial<Pick<Thema, 'name' | 'faelligAm' | 'typ' | 'standardThemaId' | 'stufe'>>) => void
  deleteThema: (id: string) => void

  // RILZ-Thema assignment to students
  assignRilzThemaToStudent: (studentId: string, rilzThemaId: string) => void
  removeRilzThemaFromStudent: (studentId: string, rilzThemaId: string) => void

  // Lernziel CRUD
  createLernziel: (themaId: string, label: string, kategorie: LernzielKategorie) => void
  updateLernziel: (id: string, patch: Partial<Pick<Lernziel, 'label' | 'kategorie'>>) => void
  deleteLernziel: (id: string) => void
  exportThema: (themaId: string) => void
  exportFach: (fachId: string) => void
  importThema: (file: File, targetFachId?: string) => Promise<void>

  // Prüfungen
  getPruefungenForKlasse: (klassId: string) => Pruefung[]
  getPruefungErgebnisse: (pruefungId: string) => PruefungErgebnis[]
  createPruefung: (data: Omit<Pruefung, 'id' | 'tenantId' | 'createdAt'>) => string
  updatePruefung: (id: string, patch: Partial<Pick<Pruefung, 'name' | 'datum' | 'lernzielIds' | 'maxPunkte'>>) => void
  deletePruefung: (id: string) => void
  upsertPruefungErgebnis: (ergebnis: Omit<PruefungErgebnis, 'tenantId' | 'createdAt'>) => void
  uploadAnhang: (pruefungId: string, schuelerId: string, file: File) => Promise<string | null>
  deleteAnhang: (ergebnisId: string, url: string) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────────

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [classes, setClasses] = useState<Klasse[]>([])
  const [students, setStudents] = useState<Schueler[]>([])
  const [faecher, setFaecher] = useState<Fach[]>([])
  const [themen, setThemen] = useState<Thema[]>([])
  const [lernziele, setLernziele] = useState<Lernziel[]>([])
  const [lehrpersonen, setLehrpersonen] = useState<Lehrperson[]>([])
  const [kommentare, setKommentare] = useState<AssessmentKommentar[]>([])
  const [themaKommentare, setThemaKommentare] = useState<ThemaKommentar[]>([])
  const [pruefungen, setPruefungen] = useState<Pruefung[]>([])
  const [pruefungErgebnisse, setPruefungErgebnisse] = useState<PruefungErgebnis[]>([])
  const competencies = SEED_COMPETENCIES

  // Load all data from Supabase on mount
  useEffect(() => {
    fetchAllData()
      .then((data) => {
        setFaecher(data.faecher)
        setThemen(data.themen)
        setLernziele(data.lernziele)
        setLehrpersonen(data.lehrpersonen)
        setClasses(data.classes)
        setStudents(data.students)
        setKommentare(data.kommentare)
        setThemaKommentare(data.themaKommentare)
        setPruefungen(data.pruefungen)
        setPruefungErgebnisse(data.pruefungErgebnisse)
      })
      .catch((err) => console.error('fetchAllData failed:', err))
      .finally(() => setIsLoading(false))
  }, [])

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
    const newKlasse: Klasse = { id, name, assignedThemaIds: [], lpZuweisungen: [] }
    setClasses((prev) => [...prev, newKlasse])
    dbSaveKlasse(newKlasse)
    return id
  }, [])

  const updateClass = useCallback((id: string, name: string, schuljahr?: string) => {
    setClasses((prev) => prev.map((c) => {
      if (c.id !== id) return c
      const updated = { ...c, name, ...(schuljahr !== undefined && { schuljahr }) }
      dbSaveKlasse(updated)
      return updated
    }))
  }, [])

  const deleteClass = useCallback((id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id))
    setStudents((prev) => prev.filter((s) => s.klassId !== id))
    dbDeleteKlasse(id)
  }, [])

  const updateBeurteilungSettings = useCallback((klassId: string, settings: KlasseBeurteilungSettings) => {
    setClasses((prev) => prev.map((c) =>
      c.id === klassId ? { ...c, beurteilungSettings: settings } : c
    ))
    dbSaveBeurteilungSettings(klassId, settings)
  }, [])

  // ── Student mutations ─────────────────────────────────────────────────

  const createStudent = useCallback((klassId: string, vorname: string, nachname: string) => {
    const competencyStatus = Object.fromEntries(
      SEED_COMPETENCIES.map((c) => [c.id, 'not_reached' as Status])
    )
    const newStudent: Schueler = {
      id: crypto.randomUUID(), klassId, vorname, nachname, note: '',
      competencyStatus, lernzielStatus: {}, rilzFachIds: [], lernzielVersuche: {},
    }
    setStudents((prev) => [...prev, newStudent])
    dbSaveSchueler(newStudent)
  }, [])

  const updateStudent = useCallback(
    (id: string, patch: Partial<Pick<Schueler, 'vorname' | 'nachname' | 'note'>>) => {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s
          const updated = { ...s, ...patch }
          dbSaveSchueler(updated)
          return updated
        })
      )
    },
    []
  )

  const deleteStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
    setKommentare((prev) => prev.filter((k) => k.studentId !== id))
    dbDeleteSchueler(id)
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
        const updated = { ...s, rilzFachIds }
        dbSaveSchueler(updated)
        return updated
      })
    )
  }, [])

  const setBvsa = useCallback((studentId: string, enabled: boolean) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s
        const updated = { ...s, bvsa: enabled }
        dbSaveSchueler(updated)
        return updated
      })
    )
  }, [])

  const addRilzLernziel = useCallback((studentId: string, themaId: string, label: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s
        const lz: import('@/types/domain').RilzLernziel = { id: crypto.randomUUID(), themaId, label, status: 'not_reached' }
        const updated = { ...s, rilzLernziele: [...(s.rilzLernziele ?? []), lz] }
        dbSaveRilzLernziel(studentId, lz)
        return updated
      })
    )
  }, [])

  const updateRilzLernzielStatus = useCallback((studentId: string, lzId: string, status: Status) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s
        const rilzLernziele = (s.rilzLernziele ?? []).map((lz) => lz.id === lzId ? { ...lz, status } : lz)
        const updated = { ...s, rilzLernziele }
        const rlz = rilzLernziele.find((lz) => lz.id === lzId)
        if (rlz) dbSaveRilzLernziel(studentId, rlz)
        return updated
      })
    )
  }, [])

  const updateRilzLernzielLabel = useCallback((studentId: string, lzId: string, label: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s
        const rilzLernziele = (s.rilzLernziele ?? []).map((lz) => lz.id === lzId ? { ...lz, label } : lz)
        const updated = { ...s, rilzLernziele }
        const rlz = rilzLernziele.find((lz) => lz.id === lzId)
        if (rlz) dbSaveRilzLernziel(studentId, rlz)
        return updated
      })
    )
  }, [])

  const deleteRilzLernziel = useCallback((studentId: string, lzId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s
        return { ...s, rilzLernziele: (s.rilzLernziele ?? []).filter((lz) => lz.id !== lzId) }
      })
    )
    dbDeleteRilzLernziel(lzId)
  }, [])

  // ── Status mutations ──────────────────────────────────────────────────

  const updateLernzielStatus = useCallback(
    (studentId: string, lernzielId: string, status: Status | undefined) => {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id !== studentId) return s
          if (status === undefined) {
            const { [lernzielId]: _, ...rest } = s.lernzielStatus
            dbDeleteLernzielStatus(studentId, lernzielId)
            return { ...s, lernzielStatus: rest }
          }
          dbSaveLernzielStatus(studentId, lernzielId, status)
          return { ...s, lernzielStatus: { ...s.lernzielStatus, [lernzielId]: status } }
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
      dbSaveKommentar(updated)
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
    dbDeleteKommentar(studentId, lernzielId)
  }, [])

  const upsertThemaKommentar = useCallback((studentId: string, themaId: string, text: string) => {
    setThemaKommentare((prev) => {
      const idx = prev.findIndex((k) => k.studentId === studentId && k.themaId === themaId)
      const updated: ThemaKommentar = { studentId, themaId, text, updatedAt: new Date().toISOString() }
      dbSaveThemaKommentar(updated)
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
    dbDeleteThemaKommentar(studentId, themaId)
  }, [])

  // ── Thema assignment to Klasse ────────────────────────────────────────

  const assignThemaToKlasse = useCallback((klassId: string, themaId: string) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id !== klassId || c.assignedThemaIds.includes(themaId)) return c
        const updated = { ...c, assignedThemaIds: [...c.assignedThemaIds, themaId] }
        dbSaveKlasse(updated)
        return updated
      })
    )
  }, [])

  const removeThemaFromKlasse = useCallback((klassId: string, themaId: string) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id !== klassId) return c
        const updated = { ...c, assignedThemaIds: c.assignedThemaIds.filter((id) => id !== themaId) }
        dbSaveKlasse(updated)
        return updated
      })
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
        const updated = { ...c, lpZuweisungen }
        dbSaveKlasse(updated)
        return updated
      })
    )
  }, [])

  const removeLpFromKlasse = useCallback((klassId: string, lpId: string) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id !== klassId) return c
        const updated = { ...c, lpZuweisungen: (c.lpZuweisungen ?? []).filter((z) => z.lpId !== lpId) }
        dbSaveKlasse(updated)
        return updated
      })
    )
  }, [])

  // ── Klassenübergabe ───────────────────────────────────────────────────

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
      dbSaveKlasse(newKlasse)

      setStudents((prev) => {
        const cloned = prev
          .filter((s) => s.klassId === vorgaengerKlasseId)
          .map((s) => {
            const ns: Schueler = {
              ...s, id: crypto.randomUUID(), klassId: newKlasseId,
              lernzielStatus: {}, lernzielVersuche: {}, progressHistory: undefined,
            }
            dbSaveSchueler(ns)
            return ns
          })
        return [...prev, ...cloned]
      })
      return newKlasseId
    },
    [classes]
  )

  // ── Fach CRUD ─────────────────────────────────────────────────────────

  const createFach = useCallback((name: string): string => {
    const id = crypto.randomUUID()
    const newFach: Fach = { id, name }
    setFaecher((prev) => [...prev, newFach])
    dbSaveFach(newFach)
    return id
  }, [])

  const updateFach = useCallback((id: string, name: string) => {
    setFaecher((prev) => prev.map((f) => {
      if (f.id !== id) return f
      const updated = { ...f, name }
      dbSaveFach(updated)
      return updated
    }))
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
    setLernziele((prev) => prev.filter((l) => !themenToDelete.has(l.themaId)))
    setClasses((prev) =>
      prev.map((c) => ({
        ...c, assignedThemaIds: c.assignedThemaIds.filter((tid) => !themenToDelete.has(tid)),
      }))
    )
    setFaecher((prev) => prev.filter((f) => f.id !== id))
    dbDeleteFach(id) // cascade in DB handles themen + lernziele
  }, [])

  // ── Thema CRUD ────────────────────────────────────────────────────────

  const createThema = useCallback((fachId: string, name: string, typ?: 'standard' | 'rilz', standardThemaId?: string): string => {
    const id = crypto.randomUUID()
    const newThema: Thema = { id, fachId, name, typ: typ ?? 'standard', standardThemaId }
    setThemen((prev) => [...prev, newThema])
    dbSaveThema(newThema)
    return id
  }, [])

  const updateThema = useCallback((id: string, patch: Partial<Pick<Thema, 'name' | 'faelligAm' | 'typ' | 'standardThemaId' | 'stufe'>>) => {
    setThemen((prev) => prev.map((t) => {
      if (t.id !== id) return t
      const updated = { ...t, ...patch }
      dbSaveThema(updated)
      return updated
    }))
  }, [])

  const deleteThema = useCallback((id: string) => {
    setLernziele((prev) => prev.filter((l) => l.themaId !== id))
    setClasses((prev) =>
      prev.map((c) => ({ ...c, assignedThemaIds: c.assignedThemaIds.filter((tid) => tid !== id) }))
    )
    setThemen((prev) => prev.filter((t) => t.id !== id))
    dbDeleteThema(id)
  }, [])

  // ── RILZ-Thema assignment ─────────────────────────────────────────────

  const assignRilzThemaToStudent = useCallback((studentId: string, rilzThemaId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s
        const current = s.rilzThemaIds ?? []
        if (current.includes(rilzThemaId)) return s
        const updated = { ...s, rilzThemaIds: [...current, rilzThemaId] }
        dbSaveSchueler(updated)
        return updated
      })
    )
  }, [])

  const removeRilzThemaFromStudent = useCallback((studentId: string, rilzThemaId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s
        const updated = { ...s, rilzThemaIds: (s.rilzThemaIds ?? []).filter((id) => id !== rilzThemaId) }
        dbSaveSchueler(updated)
        return updated
      })
    )
  }, [])

  // ── Lernziel CRUD ─────────────────────────────────────────────────────

  const createLernziel = useCallback((themaId: string, label: string, kategorie: LernzielKategorie) => {
    const newLZ: Lernziel = { id: crypto.randomUUID(), themaId, kategorie, label }
    setLernziele((prev) => [...prev, newLZ])
    dbSaveLernziel(newLZ)
  }, [])

  const updateLernziel = useCallback((id: string, patch: Partial<Pick<Lernziel, 'label' | 'kategorie'>>) => {
    setLernziele((prev) => prev.map((l) => {
      if (l.id !== id) return l
      const updated = { ...l, ...patch }
      dbSaveLernziel(updated)
      return updated
    }))
  }, [])

  const deleteLernziel = useCallback((id: string) => {
    setLernziele((prev) => prev.filter((l) => l.id !== id))
    dbDeleteLernziel(id)
  }, [])

  // ── Prüfungen ─────────────────────────────────────────────────────────

  const getPruefungenForKlasse = useCallback(
    (klassId: string) => pruefungen.filter((p) => p.klasseId === klassId),
    [pruefungen]
  )

  const getPruefungErgebnisse = useCallback(
    (pruefungId: string) => pruefungErgebnisse.filter((e) => e.pruefungId === pruefungId),
    [pruefungErgebnisse]
  )

  const createPruefung = useCallback(
    (data: Omit<Pruefung, 'id' | 'tenantId' | 'createdAt'>): string => {
      const id = crypto.randomUUID()
      const newP: Pruefung = { ...data, id, tenantId: '', createdAt: new Date().toISOString() }
      setPruefungen((prev) => [...prev, newP])
      dbSavePruefung(newP)
      return id
    },
    []
  )

  const updatePruefung = useCallback(
    (id: string, patch: Partial<Pick<Pruefung, 'name' | 'datum' | 'lernzielIds' | 'maxPunkte'>>) => {
      setPruefungen((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          const updated = { ...p, ...patch }
          dbSavePruefung(updated)
          return updated
        })
      )
    },
    []
  )

  const deletePruefung = useCallback((id: string) => {
    setPruefungen((prev) => prev.filter((p) => p.id !== id))
    setPruefungErgebnisse((prev) => prev.filter((e) => e.pruefungId !== id))
    dbDeletePruefung(id)
  }, [])

  const upsertPruefungErgebnis = useCallback(
    (ergebnis: Omit<PruefungErgebnis, 'tenantId' | 'createdAt'>) => {
      const full: PruefungErgebnis = { ...ergebnis, tenantId: '', createdAt: new Date().toISOString() }
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
              const updated = { ...s, lernzielStatus: { ...s.lernzielStatus, ...statusPatch } }
              for (const lzId of pruefung.lernzielIds) {
                dbSaveLernzielStatus(ergebnis.schuelerId, lzId, ergebnis.status!)
              }
              return updated
            })
          )
        }
      }
      dbSavePruefungErgebnis(full)
    },
    [pruefungen]
  )

  const uploadAnhang = useCallback(
    async (pruefungId: string, schuelerId: string, file: File): Promise<string | null> => {
      const url = await dbUploadPruefungAnhang(pruefungId, schuelerId, file)
      if (!url) return null
      setPruefungErgebnisse((prev) => {
        const existing = prev.find((e) => e.pruefungId === pruefungId && e.schuelerId === schuelerId)
        if (existing) {
          const updated = { ...existing, anhangUrls: [...existing.anhangUrls, url] }
          dbSavePruefungErgebnis(updated)
          return prev.map((e) => e.id === existing.id ? updated : e)
        }
        const newE: PruefungErgebnis = {
          id: crypto.randomUUID(), pruefungId, schuelerId,
          anzahlVersuche: 1, anhangUrls: [url], tenantId: '', createdAt: new Date().toISOString(),
        }
        dbSavePruefungErgebnis(newE)
        return [...prev, newE]
      })
      return url
    },
    []
  )

  const deleteAnhang = useCallback(
    async (ergebnisId: string, url: string): Promise<void> => {
      await dbDeletePruefungAnhang(url)
      setPruefungErgebnisse((prev) =>
        prev.map((e) => {
          if (e.id !== ergebnisId) return e
          const updated = { ...e, anhangUrls: e.anhangUrls.filter((u) => u !== url) }
          dbSavePruefungErgebnis(updated)
          return updated
        })
      )
    },
    []
  )

  const CURRENT_LP_ID = 'lp1'

  const exportThema = useCallback((themaId: string): void => {
    const thema = themen.find((t) => t.id === themaId)
    if (!thema) return
    const fach = faecher.find((f) => f.id === thema.fachId)
    if (!fach) return
    const exportLZ: LezioExportLernziel[] = lernziele
      .filter((l) => l.themaId === themaId)
      .map(({ kategorie, label, kriterien, beschreibung }) => ({
        kategorie, label,
        ...(kriterien ? { kriterien } : {}),
        ...(beschreibung ? { beschreibung } : {}),
      }))
    const payload: LezioExport = {
      version: '1', exportedAt: new Date().toISOString(), fachName: fach.name,
      thema: { name: thema.name, ...(thema.typ ? { typ: thema.typ } : {}), ...(thema.stufe ? { stufe: thema.stufe } : {}) },
      lernziele: exportLZ,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${thema.name}.lezio`
    a.click()
    URL.revokeObjectURL(url)
  }, [themen, faecher, lernziele])

  const exportFach = useCallback(async (fachId: string): Promise<void> => {
    const fach = faecher.find((f) => f.id === fachId)
    if (!fach) return
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    const fachThemen = themen.filter((t) => t.fachId === fachId)
    for (const thema of fachThemen) {
      const exportLZ: LezioExportLernziel[] = lernziele
        .filter((l) => l.themaId === thema.id)
        .map(({ kategorie, label, kriterien, beschreibung }) => ({
          kategorie, label,
          ...(kriterien ? { kriterien } : {}),
          ...(beschreibung ? { beschreibung } : {}),
        }))
      const payload: LezioExport = {
        version: '1', exportedAt: new Date().toISOString(), fachName: fach.name,
        thema: { name: thema.name, ...(thema.typ ? { typ: thema.typ } : {}), ...(thema.stufe ? { stufe: thema.stufe } : {}) },
        lernziele: exportLZ,
      }
      zip.file(`${thema.name}.lezio`, JSON.stringify(payload, null, 2))
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fach.name}.zip`
    a.click()
    URL.revokeObjectURL(url)
  }, [themen, faecher, lernziele])

  const importThema = useCallback(async (file: File, targetFachId?: string): Promise<void> => {
    const text = await file.text()
    const data = JSON.parse(text) as LezioExport
    if (data.version !== '1' || !data.fachName || !data.thema?.name) {
      throw new Error('Ungültiges Dateiformat')
    }

    let fachId: string
    if (targetFachId) {
      fachId = targetFachId
    } else {
      const existingFach = faecher.find((f) => f.name.toLowerCase() === data.fachName.toLowerCase())
      if (!existingFach) throw new Error('FACH_NOT_FOUND')
      fachId = existingFach.id
    }
    const themaId = crypto.randomUUID()
    const newThema: Thema = {
      id: themaId, fachId, name: data.thema.name,
      typ: data.thema.typ ?? 'standard',
      ...(data.thema.stufe ? { stufe: data.thema.stufe } : {}),
    }
    setThemen((prev) => [...prev, newThema])
    dbSaveThema(newThema)

    if (Array.isArray(data.lernziele) && data.lernziele.length > 0) {
      const newLZ: Lernziel[] = data.lernziele.map((lz) => ({
        id: crypto.randomUUID(), themaId, kategorie: lz.kategorie, label: lz.label,
        ...(lz.kriterien ? { kriterien: lz.kriterien } : {}),
        ...(lz.beschreibung ? { beschreibung: lz.beschreibung } : {}),
      }))
      setLernziele((prev) => [...prev, ...newLZ])
      for (const lz of newLZ) dbSaveLernziel(lz)
    }
  }, [faecher])

  return (
    <DataContext.Provider
      value={{
        currentLpId: CURRENT_LP_ID,
        isLoading,
        classes,
        students,
        competencies,
        faecher,
        themen,
        lernziele,
        lehrpersonen,
        kommentare,
        themaKommentare,
        pruefungen,
        pruefungErgebnisse,
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
        updateBeurteilungSettings,
        createStudent,
        updateStudent,
        deleteStudent,
        setRilzFach,
        setBvsa,
        addRilzLernziel,
        updateRilzLernzielStatus,
        updateRilzLernzielLabel,
        deleteRilzLernziel,
        updateLernzielStatus,
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
        exportThema,
        exportFach,
        importThema,
        getPruefungenForKlasse,
        getPruefungErgebnisse,
        createPruefung,
        updatePruefung,
        deletePruefung,
        upsertPruefungErgebnis,
        uploadAnhang,
        deleteAnhang,
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
