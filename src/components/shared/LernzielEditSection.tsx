'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { cn } from '@/lib/utils'
import { useData } from '@/contexts/DataContext'
import type { Lernziel, LernzielKategorie } from '@/types/domain'

/**
 * Schritt „Lernziele" der Thema-Bearbeitung (Lernzielsammlung und
 * Klassen-Tab): Lernziele nach Kategorie gruppiert anzeigen, inline
 * anlegen, umbenennen, umkategorisieren und löschen.
 */
export const LernzielEditSection = ({ themaId }: { themaId: string }) => {
  const { lernziele, createLernziel, updateLernziel, deleteLernziel } = useData()
  const themaLZ = lernziele.filter(lz => lz.themaId === themaId)
  const grundlegendLZ = themaLZ.filter(lz => lz.kategorie === 'grundlegend')
  const anspruchsvollLZ = themaLZ.filter(lz => lz.kategorie === 'anspruchsvoll')

  const [newLZG, setNewLZG] = useState('')
  const [newLZA, setNewLZA] = useState('')
  const [editLzId, setEditLzId] = useState<string | null>(null)
  const [editLzLabel, setEditLzLabel] = useState('')
  const [editLzKategorie, setEditLzKategorie] = useState<LernzielKategorie>('grundlegend')
  const [deleteLzId, setDeleteLzId] = useState<string | null>(null)

  const addLZG = () => {
    if (!newLZG.trim()) return
    createLernziel(themaId, newLZG.trim(), 'grundlegend')
    setNewLZG('')
  }

  const addLZA = () => {
    if (!newLZA.trim()) return
    createLernziel(themaId, newLZA.trim(), 'anspruchsvoll')
    setNewLZA('')
  }

  const saveLZ = (id: string) => {
    if (!editLzLabel.trim()) return
    updateLernziel(id, { label: editLzLabel.trim(), kategorie: editLzKategorie })
    setEditLzId(null)
  }

  const renderLZRow = (lz: Lernziel, idx: number) => {
    return (
      <div key={lz.id} className="group flex items-center gap-2 py-1.5 hover:bg-accent/20 transition-colors px-1">
        <span className="w-4 shrink-0 text-3xs font-mono text-muted-foreground">{idx + 1}</span>
        {editLzId === lz.id ? (
          <>
            <div className="flex rounded border overflow-hidden shrink-0 h-6">
              {(['grundlegend', 'anspruchsvoll'] as LernzielKategorie[]).map(k => (
                <button key={k} onClick={() => setEditLzKategorie(k)}
                  className={cn(
                    'px-1.5 text-4xs font-medium transition-colors',
                    editLzKategorie === k
                      ? k === 'grundlegend' ? 'bg-category-grundlegend text-white' : 'bg-category-anspruchsvoll text-white'
                      : 'bg-background text-muted-foreground hover:bg-muted',
                  )}>
                  {k === 'grundlegend' ? 'G' : 'A'}
                </button>
              ))}
            </div>
            <Input value={editLzLabel}
              onChange={e => setEditLzLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveLZ(lz.id); if (e.key === 'Escape') setEditLzId(null) }}
              className="h-6 text-xs flex-1 px-1.5" autoFocus />
            <Button size="icon-sm" variant="secondary" onClick={() => saveLZ(lz.id)}>
              <Icon name="check" size={12} className="text-status-reached" />
            </Button>
            <Button size="icon-sm" variant="secondary" onClick={() => setEditLzId(null)}>
              <Icon name="close" size={12} />
            </Button>
          </>
        ) : (
          <>
            <span className="flex-1 text-xs leading-snug">{lz.label}</span>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Button size="icon-sm" variant="secondary"
                onClick={() => { setEditLzId(lz.id); setEditLzLabel(lz.label); setEditLzKategorie(lz.kategorie) }}
                aria-label="Bearbeiten">
                <Icon name="edit" size={12} />
              </Button>
              <Button size="icon-sm" variant="secondary"
                className="text-destructive/70 hover:text-destructive"
                onClick={() => setDeleteLzId(lz.id)} aria-label="Löschen">
                <Icon name="delete" size={12} />
              </Button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden">
      {/* Grundlegend */}
      <div className="border-b border-border/40">
        <div className="py-1 bg-muted/20 px-1">
          <span className="text-3xs font-semibold uppercase tracking-wide text-category-grundlegend-fg">Grundlegend</span>
        </div>
        <div className="divide-y divide-border/30">
          {grundlegendLZ.length === 0 && (
            <p className="py-1.5 px-1 text-3xs text-muted-foreground/50">Noch keine grundlegenden Lernziele.</p>
          )}
          {grundlegendLZ.map((lz, i) => renderLZRow(lz, i))}
        </div>
        <div className="py-1.5 px-1 flex items-center gap-1.5 border-t border-border/30">
          <Input value={newLZG} onChange={e => setNewLZG(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addLZG()}
            placeholder="Grundlegendes Lernziel…" className="h-6 text-xs flex-1" />
          <Button size="icon-sm" variant="secondary" onClick={addLZG} disabled={!newLZG.trim()}>
            <Icon name="add" size={12} />
          </Button>
        </div>
      </div>

      {/* Anspruchsvoll */}
      <div>
        <div className="py-1 bg-muted/20 px-1">
          <span className="text-3xs font-semibold uppercase tracking-wide text-category-anspruchsvoll-fg">Anspruchsvoll</span>
        </div>
        <div className="divide-y divide-border/30">
          {anspruchsvollLZ.length === 0 && (
            <p className="py-1.5 px-1 text-3xs text-muted-foreground/50">Noch keine anspruchsvollen Lernziele.</p>
          )}
          {anspruchsvollLZ.map((lz, i) => renderLZRow(lz, i))}
        </div>
        <div className="py-1.5 px-1 flex items-center gap-1.5 border-t border-border/30">
          <Input value={newLZA} onChange={e => setNewLZA(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addLZA()}
            placeholder="Anspruchsvolles Lernziel…" className="h-6 text-xs flex-1" />
          <Button size="icon-sm" variant="secondary" onClick={addLZA} disabled={!newLZA.trim()}>
            <Icon name="add" size={12} />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteLzId}
        onOpenChange={o => { if (!o) setDeleteLzId(null) }}
        title="Lernziel löschen"
        description="Soll dieses Lernziel wirklich dauerhaft gelöscht werden?"
        confirmLabel="Löschen"
        onConfirm={() => { if (deleteLzId) deleteLernziel(deleteLzId) }}
      />
    </div>
  )
}
