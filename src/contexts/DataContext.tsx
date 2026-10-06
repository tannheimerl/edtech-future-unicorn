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
  Klasse, Kompetenz, Schueler, Fach, Lernkontrolle, Lernziel,
  AssessmentKommentar, LernkontrolleKommentar, Lehrperson, Pruefung, PruefungErgebnis,
  BerichtIcons,
} from '@/types/domain'
import { SEED_COMPETENCIES, DEFAULT_BERICHT_ICONS } from '@/types/domain'
import { fetchAllData } from '@/actions/db-read'
import { useKlassenActions } from '@/hooks/data/useKlassenActions'
import { useSchuelerActions } from '@/hooks/data/useSchuelerActions'
import { useKommentareActions } from '@/hooks/data/useKommentareActions'
import { useFaecherLernkontrollenLernzielActions } from '@/hooks/data/useFaecherLernkontrollenLernzielActions'
import { usePruefungenActions } from '@/hooks/data/usePruefungenActions'
import { useEinstellungenActions } from '@/hooks/data/useEinstellungenActions'

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
  lernkontrollen: Lernkontrolle[]
  lernziele: Lernziel[]
  lehrpersonen: Lehrperson[]
  kommentare: AssessmentKommentar[]
  lernkontrolleKommentare: LernkontrolleKommentar[]
  pruefungen: Pruefung[]
  pruefungErgebnisse: PruefungErgebnis[]
  berichtIcons: BerichtIcons
} & ReturnType<typeof useKlassenActions>
  & ReturnType<typeof useSchuelerActions>
  & ReturnType<typeof useKommentareActions>
  & ReturnType<typeof useFaecherLernkontrollenLernzielActions>
  & ReturnType<typeof usePruefungenActions>
  & ReturnType<typeof useEinstellungenActions>

const DataContext = createContext<DataContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────────

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [classes, setClasses] = useState<Klasse[]>([])
  const [students, setStudents] = useState<Schueler[]>([])
  const [faecher, setFaecher] = useState<Fach[]>([])
  const [lernkontrollen, setLernkontrollen] = useState<Lernkontrolle[]>([])
  const [lernziele, setLernziele] = useState<Lernziel[]>([])
  const [lehrpersonen, setLehrpersonen] = useState<Lehrperson[]>([])
  const [kommentare, setKommentare] = useState<AssessmentKommentar[]>([])
  const [lernkontrolleKommentare, setLernkontrolleKommentare] = useState<LernkontrolleKommentar[]>([])
  const [pruefungen, setPruefungen] = useState<Pruefung[]>([])
  const [pruefungErgebnisse, setPruefungErgebnisse] = useState<PruefungErgebnis[]>([])
  const [berichtIcons, setBerichtIcons] = useState<BerichtIcons>(DEFAULT_BERICHT_ICONS)
  const competencies = SEED_COMPETENCIES

  // Reload all data from SQLite into context state. Used on mount and to
  // resync the optimistic UI with the DB after a failed write.
  const reloadData = useCallback(() => {
    return fetchAllData()
      .then((data) => {
        setFaecher(data.faecher)
        setLernkontrollen(data.lernkontrollen)
        setLernziele(data.lernziele)
        setLehrpersonen(data.lehrpersonen)
        setClasses(data.classes)
        setStudents(data.students)
        setKommentare(data.kommentare)
        setLernkontrolleKommentare(data.lernkontrolleKommentare)
        setPruefungen(data.pruefungen)
        setPruefungErgebnisse(data.pruefungErgebnisse)
        setBerichtIcons(data.berichtIcons)
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
  const kommentareActions = useKommentareActions(kommentare, setKommentare, lernkontrolleKommentare, setLernkontrolleKommentare)
  const faecherLernkontrollenLernzielActions = useFaecherLernkontrollenLernzielActions(
    faecher, setFaecher, lernkontrollen, setLernkontrollen, lernziele, setLernziele, reloadData
  )
  const pruefungenActions = usePruefungenActions(pruefungen, setPruefungen, pruefungErgebnisse, setPruefungErgebnisse, setStudents)
  const einstellungenActions = useEinstellungenActions(setBerichtIcons)

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
        lernkontrollen,
        lernziele,
        lehrpersonen,
        kommentare,
        lernkontrolleKommentare,
        pruefungen,
        pruefungErgebnisse,
        berichtIcons,
        ...klassenActions,
        ...schuelerActions,
        ...kommentareActions,
        ...faecherLernkontrollenLernzielActions,
        ...pruefungenActions,
        ...einstellungenActions,
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
