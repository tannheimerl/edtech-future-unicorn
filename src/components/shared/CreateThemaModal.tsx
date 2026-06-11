'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/shared/Modal'
import { cn } from '@/lib/utils'
import type { LernzielKategorie } from '@/types/domain'

export function CreateThemaModal({ open, onOpenChange, fachId, onCreated }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  fachId: string
  onCreated?: (themaId: string) => void
}) {
  const { createThema, updateThema, createLernziel } = useData()
  const [name, setName] = useState('')
  const [typ, setTyp] = useState<'standard' | 'rilz'>('standard')
  const [stufe, setStufe] = useState<number | ''>('')
  const [faelligAm, setFaelligAm] = useState('')
  const [lernziele, setLernziele] = useState<{ id: string; label: string; kategorie: LernzielKategorie }[]>([])
  const [newLzG, setNewLzG] = useState('')
  const [newLzA, setNewLzA] = useState('')

  useEffect(() => {
    if (open) {
      setName('')
      setTyp('standard')
      setStufe('')
      setFaelligAm('')
      setLernziele([])
      setNewLzG('')
      setNewLzA('')
    }
  }, [open])

  function addLzG() {
    if (!newLzG.trim()) return
    setLernziele(prev => [...prev, { id: crypto.randomUUID(), label: newLzG.trim(), kategorie: 'grundlegend' }])
    setNewLzG('')
  }

  function addLzA() {
    if (!newLzA.trim()) return
    setLernziele(prev => [...prev, { id: crypto.randomUUID(), label: newLzA.trim(), kategorie: 'anspruchsvoll' }])
    setNewLzA('')
  }

  function submit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!name.trim()) return
    const id = createThema(fachId, name.trim(), typ)
    updateThema(id, {
      stufe: stufe !== '' ? [stufe as number] : undefined,
      faelligAm: faelligAm || undefined,
    })
    for (const lz of lernziele) {
      createLernziel(id, lz.label, lz.kategorie)
    }
    onCreated?.(id)
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Neues Thema" size="md"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={() => submit()} disabled={!name.trim()}>Erstellen</Button>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-3">
        <div className="grid gap-1.5">
          <Label>Themabezeichnung</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Zahlen & Rechnen" autoFocus />
        </div>

        {/* Typ-Toggle */}
        <div className="grid gap-1.5">
          <Label>Typ</Label>
          <div className="flex rounded-lg border overflow-hidden h-8">
            {(['standard', 'rilz'] as const).map(t => (
              <button key={t} type="button" onClick={() => setTyp(t)}
                className={cn(
                  'flex-1 text-xs font-medium transition-colors',
                  typ === t
                    ? t === 'rilz' ? 'bg-orange-500 text-white' : 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:bg-muted',
                )}>
                {t === 'standard' ? 'Standard' : 'RILZ'}
              </button>
            ))}
          </div>
        </div>

        {/* Schulstufe | Fällig am */}
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label>Schulstufe</Label>
            <select
              value={stufe}
              onChange={(e) => setStufe(e.target.value ? Number(e.target.value) : '')}
              className="h-8 text-xs rounded-lg border border-border bg-background px-2 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">— keine —</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <option key={n} value={n}>Klasse {n}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label>Fällig am <span className="font-normal text-muted-foreground">(opt.)</span></Label>
            <Input type="date" lang="de" value={faelligAm} onChange={e => setFaelligAm(e.target.value)} />
          </div>
        </div>

        {/* Lernziele */}
        <div className="grid gap-1.5">
          <Label>Lernziele</Label>
          <div className="rounded-lg border border-border overflow-hidden divide-y divide-border/40">
            {/* Grundlegend */}
            <div>
              <div className="px-2 py-1 bg-muted/30">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Grundlegend</span>
              </div>
              {lernziele.filter(lz => lz.kategorie === 'grundlegend').map(lz => (
                <div key={lz.id} className="flex items-center gap-2 px-2 py-1.5 border-t border-border/30">
                  <span className="flex-1 text-xs leading-snug">{lz.label}</span>
                  <button
                    type="button"
                    onClick={() => setLernziele(prev => prev.filter(x => x.id !== lz.id))}
                    className="shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors"
                    aria-label="Entfernen"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-muted/10 border-t border-border/30">
                <Input
                  value={newLzG}
                  onChange={e => setNewLzG(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLzG() } }}
                  placeholder="Grundlegendes Lernziel…"
                  className="h-6 text-xs flex-1"
                />
                <Button type="button" size="icon-sm" variant="outline" onClick={addLzG} disabled={!newLzG.trim()}>
                  <Plus className="size-3" />
                </Button>
              </div>
            </div>
            {/* Anspruchsvoll */}
            <div>
              <div className="px-2 py-1 bg-muted/30">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-500">Anspruchsvoll</span>
              </div>
              {lernziele.filter(lz => lz.kategorie === 'anspruchsvoll').map(lz => (
                <div key={lz.id} className="flex items-center gap-2 px-2 py-1.5 border-t border-border/30">
                  <span className="flex-1 text-xs leading-snug">{lz.label}</span>
                  <button
                    type="button"
                    onClick={() => setLernziele(prev => prev.filter(x => x.id !== lz.id))}
                    className="shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors"
                    aria-label="Entfernen"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-muted/10 border-t border-border/30">
                <Input
                  value={newLzA}
                  onChange={e => setNewLzA(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLzA() } }}
                  placeholder="Anspruchsvolles Lernziel…"
                  className="h-6 text-xs flex-1"
                />
                <Button type="button" size="icon-sm" variant="outline" onClick={addLzA} disabled={!newLzA.trim()}>
                  <Plus className="size-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  )
}
