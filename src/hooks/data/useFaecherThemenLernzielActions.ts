import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type {
  Fach, Klasse, LezioExport, LezioExportLernziel, Lernziel, LernzielKategorie, Thema,
} from '@/types/domain'
import {
  dbSaveFach, dbDeleteFach,
  dbSaveThema, dbDeleteThema,
  dbSaveLernziel, dbDeleteLernziel,
} from '@/actions/db-write'
import { notifyDbError } from '@/lib/toast'
import { findExactFachMatch } from '@/lib/fachMatch'
import { parseLezio } from '@/lib/lezioImport'

export function useFaecherThemenLernzielActions(
  faecher: Fach[],
  setFaecher: Dispatch<SetStateAction<Fach[]>>,
  themen: Thema[],
  setThemen: Dispatch<SetStateAction<Thema[]>>,
  lernziele: Lernziel[],
  setLernziele: Dispatch<SetStateAction<Lernziel[]>>,
  setClasses: Dispatch<SetStateAction<Klasse[]>>,
  reloadData: () => Promise<void>,
) {
  const getThemenForKlasse = useCallback(
    (classes: Klasse[], klassId: string) => {
      const klasse = classes.find((c) => c.id === klassId)
      if (!klasse) return []
      return themen.filter((t) => klasse.assignedThemaIds.includes(t.id))
    },
    [themen]
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

  const createFach = useCallback((name: string): string => {
    const id = crypto.randomUUID()
    const newFach: Fach = { id, name }
    setFaecher((prev) => [...prev, newFach])
    dbSaveFach(newFach).catch(notifyDbError)
    return id
  }, [setFaecher])

  const updateFach = useCallback((id: string, name: string) => {
    setFaecher((prev) => prev.map((f) => {
      if (f.id !== id) return f
      const updated = { ...f, name }
      dbSaveFach(updated).catch(notifyDbError)
      return updated
    }))
  }, [setFaecher])

  const updateFachColor = useCallback((id: string, colorIndex: number | null) => {
    setFaecher((prev) => prev.map((f) => {
      if (f.id !== id) return f
      const updated = { ...f, colorIndex: colorIndex ?? undefined }
      dbSaveFach(updated).catch(notifyDbError)
      return updated
    }))
  }, [setFaecher])

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
    dbDeleteFach(id).catch(notifyDbError) // cascade in DB handles themen + lernziele
  }, [setThemen, setLernziele, setClasses, setFaecher])

  const createThema = useCallback((fachId: string, name: string, typ?: 'standard' | 'rilz', standardThemaId?: string): string => {
    const id = crypto.randomUUID()
    const newThema: Thema = { id, fachId, name, typ: typ ?? 'standard', standardThemaId }
    setThemen((prev) => [...prev, newThema])
    dbSaveThema(newThema).catch(notifyDbError)
    return id
  }, [setThemen])

  const updateThema = useCallback((id: string, patch: Partial<Pick<Thema, 'name' | 'fachId' | 'faelligAm' | 'typ' | 'standardThemaId' | 'stufe' | 'tags'>>) => {
    setThemen((prev) => prev.map((t) => {
      if (t.id !== id) return t
      const updated = { ...t, ...patch }
      dbSaveThema(updated).catch(notifyDbError)
      return updated
    }))
  }, [setThemen])

  const deleteThema = useCallback((id: string) => {
    setLernziele((prev) => prev.filter((l) => l.themaId !== id))
    setClasses((prev) =>
      prev.map((c) => ({ ...c, assignedThemaIds: c.assignedThemaIds.filter((tid) => tid !== id) }))
    )
    setThemen((prev) => prev.filter((t) => t.id !== id))
    dbDeleteThema(id).catch(() => {
      notifyDbError()
      reloadData() // optimistic removal war falsch → DB-Wahrheit wiederherstellen
    })
  }, [setLernziele, setClasses, setThemen, reloadData])

  const createLernziel = useCallback((themaId: string, label: string, kategorie: LernzielKategorie) => {
    const newLZ: Lernziel = { id: crypto.randomUUID(), themaId, kategorie, label }
    setLernziele((prev) => [...prev, newLZ])
    dbSaveLernziel(newLZ).catch(notifyDbError)
  }, [setLernziele])

  const updateLernziel = useCallback((id: string, patch: Partial<Pick<Lernziel, 'label' | 'kategorie'>>) => {
    setLernziele((prev) => prev.map((l) => {
      if (l.id !== id) return l
      const updated = { ...l, ...patch }
      dbSaveLernziel(updated).catch(notifyDbError)
      return updated
    }))
  }, [setLernziele])

  const deleteLernziel = useCallback((id: string) => {
    setLernziele((prev) => prev.filter((l) => l.id !== id))
    dbDeleteLernziel(id).catch(notifyDbError)
  }, [setLernziele])

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

  // Legt aus bereits geparsten Importdaten ein Thema + Lernziele unter dem aufgelösten Fach an.
  // Kein Matching – die fachId muss vom Aufrufer aufgelöst sein (Einzel- und Batch-Import).
  // Gibt die ID des neu angelegten Themas zurück (z. B. um es direkt einer Klasse zuzuweisen).
  const importThemaData = useCallback((data: LezioExport, fachId: string): string => {
    const themaId = crypto.randomUUID()
    const newThema: Thema = {
      id: themaId, fachId, name: data.thema.name,
      typ: data.thema.typ ?? 'standard',
      ...(data.thema.stufe ? { stufe: data.thema.stufe } : {}),
    }
    setThemen((prev) => [...prev, newThema])
    dbSaveThema(newThema).catch(notifyDbError)

    if (Array.isArray(data.lernziele) && data.lernziele.length > 0) {
      const newLZ: Lernziel[] = data.lernziele.map((lz) => ({
        id: crypto.randomUUID(), themaId, kategorie: lz.kategorie, label: lz.label,
        ...(lz.kriterien ? { kriterien: lz.kriterien } : {}),
        ...(lz.beschreibung ? { beschreibung: lz.beschreibung } : {}),
      }))
      setLernziele((prev) => [...prev, ...newLZ])
      for (const lz of newLZ) dbSaveLernziel(lz).catch(notifyDbError)
    }
    return themaId
  }, [setThemen, setLernziele])

  const importThema = useCallback(async (file: File, targetFachId?: string): Promise<void> => {
    const data = parseLezio(await file.text())

    let fachId: string
    if (targetFachId) {
      fachId = targetFachId
    } else {
      const existingFach = findExactFachMatch(data.fachName, faecher)
      if (!existingFach) throw new Error('FACH_NOT_FOUND')
      fachId = existingFach.id
    }
    importThemaData(data, fachId)
  }, [faecher, importThemaData])

  return {
    getThemenForKlasse,
    getLernzieleForThema,
    getFachForThema,
    createFach,
    updateFach,
    updateFachColor,
    deleteFach,
    createThema,
    updateThema,
    deleteThema,
    createLernziel,
    updateLernziel,
    deleteLernziel,
    exportThema,
    exportFach,
    importThema,
    importThemaData,
  }
}
