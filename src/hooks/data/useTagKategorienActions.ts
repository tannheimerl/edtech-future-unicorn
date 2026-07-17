import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { TagKategorie, Thema } from '@/types/domain'
import { dbSaveTagKategorie, dbDeleteTagKategorie } from '@/actions/db-write'
import { notifyDbError } from '@/lib/toast'

export function useTagKategorienActions(
  tagKategorien: TagKategorie[],
  setTagKategorien: Dispatch<SetStateAction<TagKategorie[]>>,
  themen: Thema[],
) {
  const createTagKategorie = useCallback((name: string) => {
    const id = crypto.randomUUID()
    const kat: TagKategorie = { id, name }
    setTagKategorien((prev) => [...prev, kat])
    dbSaveTagKategorie(kat).catch(notifyDbError)
  }, [setTagKategorien])

  const updateTagKategorie = useCallback((id: string, name: string) => {
    setTagKategorien((prev) => prev.map((k) => {
      if (k.id !== id) return k
      const updated = { ...k, name }
      dbSaveTagKategorie(updated).catch(notifyDbError)
      return updated
    }))
  }, [setTagKategorien])

  const deleteTagKategorie = useCallback((id: string) => {
    setTagKategorien((prev) => prev.filter((k) => k.id !== id))
    dbDeleteTagKategorie(id).catch(notifyDbError)
  }, [setTagKategorien])

  const getTagWerte = useCallback((kategorieId: string): string[] => {
    const values = new Set<string>()
    themen.forEach((t) => { (t.tags?.[kategorieId] ?? []).forEach((v) => values.add(v)) })
    return Array.from(values).sort()
  }, [themen])

  return {
    createTagKategorie,
    updateTagKategorie,
    deleteTagKategorie,
    getTagWerte,
  }
}
