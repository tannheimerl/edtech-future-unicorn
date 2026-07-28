import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type {
  Fach, LezioExport, LezioExportLernziel, Lernkontrolle, Lernziel, LernzielKategorie,
} from '@/types/domain'
import {
  dbSaveFach, dbDeleteFach,
  dbSaveLernkontrolle, dbDeleteLernkontrolle,
  dbSaveLernziel, dbDeleteLernziel,
} from '@/actions/db-write'
import { notifyDbError } from '@/lib/toast'
import { findExactFachMatch } from '@/lib/fachMatch'
import { parseLezio } from '@/lib/lezioImport'

export function useFaecherLernkontrollenLernzielActions(
  faecher: Fach[],
  setFaecher: Dispatch<SetStateAction<Fach[]>>,
  lernkontrollen: Lernkontrolle[],
  setLernkontrollen: Dispatch<SetStateAction<Lernkontrolle[]>>,
  lernziele: Lernziel[],
  setLernziele: Dispatch<SetStateAction<Lernziel[]>>,
  reloadData: () => Promise<void>,
) {
  const getLernzieleForLernkontrolle = useCallback(
    (lernkontrolleId: string) =>
      lernziele
        .filter((l) => l.lernkontrolleId === lernkontrolleId)
        .sort((a, b) => {
          if (a.kategorie === b.kategorie) return 0
          return a.kategorie === 'grundlegend' ? -1 : 1
        }),
    [lernziele]
  )
  const getFachForLernkontrolle = useCallback(
    (lernkontrolleId: string) => {
      const lernkontrolle = lernkontrollen.find((t) => t.id === lernkontrolleId)
      if (!lernkontrolle) return undefined
      return faecher.find((f) => f.id === lernkontrolle.fachId)
    },
    [lernkontrollen, faecher]
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
    const lernkontrollenToDelete = new Set<string>()
    setLernkontrollen((prev) => {
      const remaining = prev.filter((t) => {
        if (t.fachId === id) { lernkontrollenToDelete.add(t.id); return false }
        return true
      })
      return remaining
    })
    setLernziele((prev) => prev.filter((l) => !lernkontrollenToDelete.has(l.lernkontrolleId)))
    setFaecher((prev) => prev.filter((f) => f.id !== id))
    dbDeleteFach(id).catch(notifyDbError) // cascade in DB handles lernkontrollen + lernziele
  }, [setLernkontrollen, setLernziele, setFaecher])

  const createLernkontrolle = useCallback((fachId: string, name: string, typ?: 'standard' | 'rilz', standardLernkontrolleId?: string): string => {
    const id = crypto.randomUUID()
    const newLernkontrolle: Lernkontrolle = { id, fachId, name, typ: typ ?? 'standard', standardLernkontrolleId }
    setLernkontrollen((prev) => [...prev, newLernkontrolle])
    dbSaveLernkontrolle(newLernkontrolle).catch(notifyDbError)
    return id
  }, [setLernkontrollen])

  const updateLernkontrolle = useCallback((id: string, patch: Partial<Pick<Lernkontrolle, 'name' | 'fachId' | 'faelligAm' | 'typ' | 'standardLernkontrolleId' | 'stufe'>>) => {
    setLernkontrollen((prev) => prev.map((t) => {
      if (t.id !== id) return t
      const updated = { ...t, ...patch }
      dbSaveLernkontrolle(updated).catch(notifyDbError)
      return updated
    }))
  }, [setLernkontrollen])

  const deleteLernkontrolle = useCallback((id: string) => {
    setLernziele((prev) => prev.filter((l) => l.lernkontrolleId !== id))
    setLernkontrollen((prev) => prev.filter((t) => t.id !== id))
    dbDeleteLernkontrolle(id).catch(() => {
      notifyDbError()
      reloadData() // optimistic removal war falsch → DB-Wahrheit wiederherstellen
    })
  }, [setLernziele, setLernkontrollen, reloadData])

  const createLernziel = useCallback((lernkontrolleId: string, label: string, kategorie: LernzielKategorie) => {
    const newLZ: Lernziel = { id: crypto.randomUUID(), lernkontrolleId, kategorie, label }
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

  const exportLernkontrolle = useCallback((lernkontrolleId: string): void => {
    const lernkontrolle = lernkontrollen.find((t) => t.id === lernkontrolleId)
    if (!lernkontrolle) return
    const fach = faecher.find((f) => f.id === lernkontrolle.fachId)
    if (!fach) return
    const exportLZ: LezioExportLernziel[] = lernziele
      .filter((l) => l.lernkontrolleId === lernkontrolleId)
      .map(({ kategorie, label, kriterien, beschreibung }) => ({
        kategorie, label,
        ...(kriterien ? { kriterien } : {}),
        ...(beschreibung ? { beschreibung } : {}),
      }))
    const payload: LezioExport = {
      version: '1', exportedAt: new Date().toISOString(), fachName: fach.name,
      lernkontrolle: { name: lernkontrolle.name, ...(lernkontrolle.typ ? { typ: lernkontrolle.typ } : {}), ...(lernkontrolle.stufe ? { stufe: lernkontrolle.stufe } : {}) },
      lernziele: exportLZ,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${lernkontrolle.name}.lezio`
    a.click()
    URL.revokeObjectURL(url)
  }, [lernkontrollen, faecher, lernziele])

  const exportFach = useCallback(async (fachId: string): Promise<void> => {
    const fach = faecher.find((f) => f.id === fachId)
    if (!fach) return
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    const fachLernkontrollen = lernkontrollen.filter((t) => t.fachId === fachId)
    for (const lernkontrolle of fachLernkontrollen) {
      const exportLZ: LezioExportLernziel[] = lernziele
        .filter((l) => l.lernkontrolleId === lernkontrolle.id)
        .map(({ kategorie, label, kriterien, beschreibung }) => ({
          kategorie, label,
          ...(kriterien ? { kriterien } : {}),
          ...(beschreibung ? { beschreibung } : {}),
        }))
      const payload: LezioExport = {
        version: '1', exportedAt: new Date().toISOString(), fachName: fach.name,
        lernkontrolle: { name: lernkontrolle.name, ...(lernkontrolle.typ ? { typ: lernkontrolle.typ } : {}), ...(lernkontrolle.stufe ? { stufe: lernkontrolle.stufe } : {}) },
        lernziele: exportLZ,
      }
      zip.file(`${lernkontrolle.name}.lezio`, JSON.stringify(payload, null, 2))
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fach.name}.zip`
    a.click()
    URL.revokeObjectURL(url)
  }, [lernkontrollen, faecher, lernziele])

  // Legt aus bereits geparsten Importdaten eine Lernkontrolle + Lernziele unter dem aufgelösten Fach an.
  // Kein Matching – die fachId muss vom Aufrufer aufgelöst sein (Einzel- und Batch-Import).
  const importLernkontrolleData = useCallback((data: LezioExport, fachId: string): string => {
    const lernkontrolleId = crypto.randomUUID()
    const newLernkontrolle: Lernkontrolle = {
      id: lernkontrolleId, fachId, name: data.lernkontrolle.name,
      typ: data.lernkontrolle.typ ?? 'standard',
      ...(data.lernkontrolle.stufe ? { stufe: data.lernkontrolle.stufe } : {}),
    }
    setLernkontrollen((prev) => [...prev, newLernkontrolle])
    dbSaveLernkontrolle(newLernkontrolle).catch(notifyDbError)

    if (Array.isArray(data.lernziele) && data.lernziele.length > 0) {
      const newLZ: Lernziel[] = data.lernziele.map((lz) => ({
        id: crypto.randomUUID(), lernkontrolleId, kategorie: lz.kategorie, label: lz.label,
        ...(lz.kriterien ? { kriterien: lz.kriterien } : {}),
        ...(lz.beschreibung ? { beschreibung: lz.beschreibung } : {}),
      }))
      setLernziele((prev) => [...prev, ...newLZ])
      for (const lz of newLZ) dbSaveLernziel(lz).catch(notifyDbError)
    }
    return lernkontrolleId
  }, [setLernkontrollen, setLernziele])

  const importLernkontrolle = useCallback(async (file: File, targetFachId?: string): Promise<void> => {
    const data = parseLezio(await file.text())

    let fachId: string
    if (targetFachId) {
      fachId = targetFachId
    } else {
      const existingFach = findExactFachMatch(data.fachName, faecher)
      if (!existingFach) throw new Error('FACH_NOT_FOUND')
      fachId = existingFach.id
    }
    importLernkontrolleData(data, fachId)
  }, [faecher, importLernkontrolleData])

  return {
    getLernzieleForLernkontrolle,
    getFachForLernkontrolle,
    createFach,
    updateFach,
    updateFachColor,
    deleteFach,
    createLernkontrolle,
    updateLernkontrolle,
    deleteLernkontrolle,
    createLernziel,
    updateLernziel,
    deleteLernziel,
    exportLernkontrolle,
    exportFach,
    importLernkontrolle,
    importLernkontrolleData,
  }
}
