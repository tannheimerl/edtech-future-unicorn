'use client'

/*
  ── Backend integration ────────────────────────────────────────────────────────
  Write-through cache: local React state is the source of truth for the UI;
  every mutation also fires a query to persist the change in the local SQLite
  database (src/lib/db.ts). On mount, data is loaded from SQLite (fetchAllData).
  The context interface is unchanged so no view component needs updating.

  State lives here; the mutations/queries themselves are split by domain into
  src/hooks/data/*, each taking the relevant state + setters as arguments.
  ─────────────────────────────────────────────────────────────────────────────
*/

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type {
  Klasse, Kompetenz, Schueler, Fach, Thema, Lernziel,
  AssessmentKommentar, ThemaKommentar, Lehrperson, Pruefung, PruefungErgebnis, TagKategorie,
} from '@/types/domain'
import { SEED_COMPETENCIES } from '@/types/domain'
import { fetchAllData } from '@/actions/db-read'
import { useKlassenActions } from '@/hooks/data/useKlassenActions'
import { useSchuelerActions } from '@/hooks/data/useSchuelerActions'
import { useKommentareActions } from '@/hooks/data/useKommentareActions'
import { useFaecherThemenLernzielActions } from '@/hooks/data/useFaecherThemenLernzielActions'
import { usePruefungenActions } from '@/hooks/data/usePruefungenActions'
import { useTagKategorienActions } from '@/hooks/data/useTagKategorienActions'

// ── Public interface ─────────────────────────────────────────────────────────

type DataContextValue = {
  // Loading state
  isLoading: boolean
  loadError: boolean
  reloadData: () => Promise<void>

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
  tagKategorien: TagKategorie[]
} & ReturnType<typeof useKlassenActions>
  & ReturnType<typeof useSchuelerActions>
  & ReturnType<typeof useKommentareActions>
  & Omit<ReturnType<typeof useFaecherThemenLernzielActions>, 'getThemenForKlasse'>
  & ReturnType<typeof usePruefungenActions>
  & ReturnType<typeof useTagKategorienActions>
  & { getThemenForKlasse: (klassId: string) => Thema[] }

const DataContext = createContext<DataContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────────

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
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
  const [tagKategorien, setTagKategorien] = useState<TagKategorie[]>([])
  const competencies = SEED_COMPETENCIES

  // Reload all data from SQLite into context state. Used on mount and to
  // resync the optimistic UI with the DB after a failed write.
  const reloadData = useCallback(() => {
    return fetchAllData()
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
        setTagKategorien(data.tagKategorien)
        setLoadError(false)
      })
      .catch((err) => {
        console.error('fetchAllData failed:', err)
        setLoadError(true)
      })
  }, [])

  // Load all data from SQLite on mount
  useEffect(() => {
    reloadData().finally(() => setIsLoading(false))
  }, [reloadData])

  const klassenActions = useKlassenActions(classes, setClasses, setStudents)
  const schuelerActions = useSchuelerActions(students, setStudents, setKommentare)
  const kommentareActions = useKommentareActions(kommentare, setKommentare, themaKommentare, setThemaKommentare)
  const { getThemenForKlasse: getThemenForKlasseRaw, ...faecherThemenLernzielActions } = useFaecherThemenLernzielActions(
    faecher, setFaecher, themen, setThemen, lernziele, setLernziele, setClasses, reloadData
  )
  const pruefungenActions = usePruefungenActions(pruefungen, setPruefungen, pruefungErgebnisse, setPruefungErgebnisse, setStudents)
  const tagKategorienActions = useTagKategorienActions(tagKategorien, setTagKategorien, themen)

  const getThemenForKlasse = useCallback(
    (klassId: string) => getThemenForKlasseRaw(classes, klassId),
    [getThemenForKlasseRaw, classes]
  )

  return (
    <DataContext.Provider
      value={{
        isLoading,
        loadError,
        reloadData,
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
        tagKategorien,
        ...klassenActions,
        ...schuelerActions,
        ...kommentareActions,
        ...faecherThemenLernzielActions,
        getThemenForKlasse,
        ...pruefungenActions,
        ...tagKategorienActions,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────────────────

export const useData = (): DataContextValue => {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within <DataProvider>')
  return ctx
}
