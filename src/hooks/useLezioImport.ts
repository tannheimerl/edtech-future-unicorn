'use client'

import { useRef, useState } from 'react'
import type { LezioExport } from '@/types/domain'
import { useData } from '@/contexts/DataContext'
import { readLezioFiles, NEW_FACH, importDoneMsg } from '@/lib/lezioImport'
import { findExactFachMatch, normalizeFachName, rankFachSuggestions, SUGGEST_THRESHOLD } from '@/lib/fachMatch'

export type LezioImportState = ReturnType<typeof useLezioImport>

/**
 * Kompletter Ablauf des Lernziel-Imports (Lernzielsammlung und Klassen-Tab):
 * Dateien einlesen → distinkte Fächernamen sammeln → Zuordnung vorbelegen →
 * Zuordnungs-Maske bestätigen → Themen importieren.
 *
 * `onImported` wird pro importiertem Thema aufgerufen (z. B. um es direkt
 * einer Klasse zuzuweisen). Rendering übernimmt `<LezioImportModal imp={…}>`.
 */
export const useLezioImport = ({ onImported }: { onImported?: (themaId: string) => void } = {}) => {
  const { faecher, createFach, importLernkontrolleData } = useData()

  const [importItems, setImportItems] = useState<{ source: string; data: LezioExport }[]>([])
  const [distinctFaecher, setDistinctFaecher] = useState<{ name: string; count: number }[]>([])
  const [fachChoice, setFachChoice] = useState<Record<string, string>>({})
  const [zuordnenOpen, setZuordnenOpen] = useState(false)
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showFeedback = (ok: boolean, msg: string) => {
    setFeedback({ ok, msg })
    setTimeout(() => setFeedback(null), 4000)
  }

  const openFileDialog = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return

    const { items, errors } = await readLezioFiles(files)
    if (items.length === 0) {
      showFeedback(false, 'Keine gültigen Lernziel-Dateien gefunden.')
      return
    }

    // Distinkte Fächernamen (normalisierter Schlüssel → Anzeigename + Anzahl Themen).
    // Gleiche Bezeichnungen werden zusammengefasst (10× „Mathe" → 1 Eintrag mit count 10).
    const distinctMap = new Map<string, { name: string; count: number }>()
    for (const { data } of items) {
      const key = normalizeFachName(data.fachName)
      const entry = distinctMap.get(key)
      if (entry) entry.count++
      else distinctMap.set(key, { name: data.fachName, count: 1 })
    }
    const distinct = [...distinctMap.values()]

    // Vorbelegung pro Fach: exakter Treffer → dessen Fach; sonst guter Vorschlag; sonst „neu anlegen"
    const choice: Record<string, string> = {}
    for (const { name } of distinct) {
      const key = normalizeFachName(name)
      const exact = findExactFachMatch(name, faecher)
      if (exact) { choice[key] = exact.id; continue }
      const [best] = rankFachSuggestions(name, faecher)
      choice[key] = best && best.score >= SUGGEST_THRESHOLD ? best.fach.id : NEW_FACH
    }

    setImportItems(items)
    setDistinctFaecher(distinct)
    setFachChoice(choice)
    setZuordnenOpen(true)
    if (errors > 0) showFeedback(false, `${errors} Datei(en) konnten nicht gelesen werden.`)
  }

  const closeZuordnen = () => {
    setZuordnenOpen(false)
    setImportItems([])
    setDistinctFaecher([])
    setFachChoice({})
  }

  const confirmZuordnen = () => {
    const fachByKey: Record<string, string> = {}
    let neueFaecher = 0
    for (const { name } of distinctFaecher) {
      const key = normalizeFachName(name)
      const sel = fachChoice[key]
      if (sel === NEW_FACH) {
        fachByKey[key] = createFach(name)
        neueFaecher++
      } else if (sel) {
        fachByKey[key] = sel
      }
    }
    for (const { data } of importItems) {
      const fachId = fachByKey[normalizeFachName(data.fachName)]
      if (!fachId) continue
      const themaId = importLernkontrolleData(data, fachId)
      onImported?.(themaId)
    }
    const count = importItems.length
    closeZuordnen()
    showFeedback(true, importDoneMsg(count, neueFaecher, 0))
  }

  const setChoice = (key: string, fachId: string) => {
    setFachChoice(prev => ({ ...prev, [key]: fachId }))
  }

  return {
    faecher,
    fileInputRef,
    openFileDialog,
    handleFileChange,
    feedback,
    zuordnenOpen,
    importItems,
    distinctFaecher,
    fachChoice,
    setChoice,
    confirmZuordnen,
    closeZuordnen,
  }
}
