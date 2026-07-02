'use client'

import { useEffect, useState } from 'react'
import { Icon } from "@/components/ui/Icon"
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/shared/Modal'
import { ModalRow } from '@/components/shared/ModalRow'
import { InputModal } from '@/components/shared/InputModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { cn } from '@/lib/utils'
import type { LernzielKategorie } from '@/types/domain'

export const CreateThemaModal = ({ open, onOpenChange, fachId, onCreated }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  fachId: string
  onCreated?: (themaId: string) => void
}) => {
  const {
    faecher, tagKategorien, getTagWerte, createTagKategorie, deleteTagKategorie,
    createThema, updateThema, createLernziel,
  } = useData()

  const [step, setStep] = useState<'meta' | 'lernziele'>('meta')

  // Meta state
  const [name, setName] = useState('')
  const [localFachId, setLocalFachId] = useState(fachId)
  const [typ, setTyp] = useState<'standard' | 'rilz'>('standard')
  const [stufe, setStufe] = useState<number | undefined>()
  const [localTagValues, setLocalTagValues] = useState<Record<string, string>>({})
  const [openRowId, setOpenRowId] = useState<string | null>(null)
  const [deleteKatId, setDeleteKatId] = useState<string | null>(null)
  const [addValueKatId, setAddValueKatId] = useState<string | null>(null)
  const [newKatOpen, setNewKatOpen] = useState(false)

  // Lernziele state
  const [lernziele, setLernziele] = useState<{ id: string; label: string; kategorie: LernzielKategorie }[]>([])
  const [newLzG, setNewLzG] = useState('')
  const [newLzA, setNewLzA] = useState('')

  useEffect(() => {
    if (open) {
      setStep('meta')
      setName('')
      setLocalFachId(fachId)
      setTyp('standard')
      setStufe(undefined)
      setLocalTagValues({})
      setOpenRowId(null)
      setLernziele([])
      setNewLzG('')
      setNewLzA('')
    }
  }, [open, fachId])

  const openRow = (id: string, isOpen: boolean) => {
    setOpenRowId(isOpen ? id : null)
  }

  const setTagValue = (katId: string, value: string) => {
    setLocalTagValues(prev => ({ ...prev, [katId]: prev[katId] === value ? '' : value }))
    setOpenRowId(null)
  }

  const renderSimpleOptions = (
    opts: { value: string; label: string }[],
    current: string,
    onSelect: (v: string) => void,
    clearLabel?: string
  ) => {
    return (
      <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto">
        {clearLabel && current && (
          <button
            onClick={() => { onSelect(''); setOpenRowId(null) }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted/60 text-left"
          >
            <Icon name="close" size={12} className="shrink-0" />{clearLabel}
          </button>
        )}
        {opts.map(opt => (
          <button
            key={opt.value}
            onClick={() => { onSelect(opt.value); setOpenRowId(null) }}
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors text-left',
              opt.value === current ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/60 text-foreground'
            )}
          >
            {opt.value === current
              ? <Icon name="check" size={12} className="shrink-0" />
              : <span className="size-3 shrink-0" />
            }
            {opt.label}
          </button>
        ))}
      </div>
    )
  }

  const addLzG = () => {
    if (!newLzG.trim()) return
    setLernziele(prev => [...prev, { id: crypto.randomUUID(), label: newLzG.trim(), kategorie: 'grundlegend' }])
    setNewLzG('')
  }

  const addLzA = () => {
    if (!newLzA.trim()) return
    setLernziele(prev => [...prev, { id: crypto.randomUUID(), label: newLzA.trim(), kategorie: 'anspruchsvoll' }])
    setNewLzA('')
  }

  const submit = () => {
    if (!name.trim()) return
    const id = createThema(localFachId, name.trim(), typ)
    updateThema(id, {
      stufe: stufe ? [stufe] : undefined,
      tags: Object.fromEntries(
        Object.entries(localTagValues)
          .filter(([, v]) => v.trim())
          .map(([k, v]) => [k, [v]])
      ),
    })
    for (const lz of lernziele) {
      createLernziel(id, lz.label, lz.kategorie)
    }
    onCreated?.(id)
    onOpenChange(false)
  }

  const grundlegendLZ = lernziele.filter(lz => lz.kategorie === 'grundlegend')
  const anspruchsvollLZ = lernziele.filter(lz => lz.kategorie === 'anspruchsvoll')

  return (
    <>
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title="Neues Thema"
        size="md"
        footer={
          step === 'meta' ? (
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
              <Button onClick={() => setStep('lernziele')} disabled={!name.trim()}>
                Weiter <Icon name="chevron_right" size={14} className="ml-0.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full gap-2">
              <Button variant="ghost" onClick={() => setStep('meta')} className="text-muted-foreground">
                <Icon name="chevron_left" size={14} className="mr-0.5" /> Zurück
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                <Button onClick={submit} disabled={!name.trim()}>Erstellen</Button>
              </div>
            </div>
          )
        }
      >
        {/* Step 1: Meta */}
        {step === 'meta' && (
          <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Bezeichnung</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="z. B. Zahlen & Rechnen"
                autoFocus
              />
            </div>

            <div className="space-y-1 border-t border-border/40 pt-2">
              {/* Fach — only if multiple Fächer exist */}
              {faecher.length > 1 && (
                <ModalRow
                  label="Fach"
                  displayValue={faecher.find(f => f.id === localFachId)?.name}
                  open={openRowId === 'fach'}
                  onOpenChange={v => openRow('fach', v)}
                >
                  {renderSimpleOptions(
                    faecher.map(f => ({ value: f.id, label: f.name })),
                    localFachId,
                    setLocalFachId
                  )}
                </ModalRow>
              )}

              {/* Typ */}
              <ModalRow
                label="Typ"
                displayValue={typ === 'rilz' ? 'RILZ' : 'Standard'}
                open={openRowId === 'typ'}
                onOpenChange={v => openRow('typ', v)}
              >
                {renderSimpleOptions(
                  [{ value: 'standard', label: 'Standard' }, { value: 'rilz', label: 'RILZ' }],
                  typ,
                  v => setTyp(v as 'standard' | 'rilz')
                )}
              </ModalRow>

              {/* Schulstufe */}
              <ModalRow
                label="Schulstufe"
                displayValue={stufe ? `Kl. ${stufe}` : undefined}
                placeholder="keine"
                open={openRowId === 'stufe'}
                onOpenChange={v => openRow('stufe', v)}
              >
                {renderSimpleOptions(
                  [1,2,3,4,5,6,7,8,9].map(n => ({ value: String(n), label: `Kl. ${n}` })),
                  stufe ? String(stufe) : '',
                  v => setStufe(v ? Number(v) : undefined),
                  'Keine Auswahl'
                )}
              </ModalRow>

              {/* Tag categories */}
              {tagKategorien.map(kat => {
                const currentVal = localTagValues[kat.id] ?? ''
                const allVals = getTagWerte(kat.id)

                return (
                  <ModalRow
                    key={kat.id}
                    label={kat.name}
                    displayValue={currentVal || undefined}
                    open={openRowId === kat.id}
                    onOpenChange={v => openRow(kat.id, v)}
                  >
                    {renderSimpleOptions(
                      allVals.map(v => ({ value: v, label: v })),
                      currentVal,
                      v => setTagValue(kat.id, v),
                      'Auswahl aufheben',
                    )}
                    <div className="border-t border-border/40 mt-0.5 pt-0.5">
                      <button
                        onClick={() => setAddValueKatId(kat.id)}
                        className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs text-primary hover:bg-primary/5 transition-colors"
                      >
                        <Icon name="add" size={12} className="shrink-0" />
                        Wert hinzufügen
                      </button>
                      <button
                        onClick={() => { setDeleteKatId(kat.id); setOpenRowId(null) }}
                        className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                      >
                        <Icon name="delete" size={12} className="shrink-0" />
                        Kategorie löschen
                      </button>
                    </div>
                  </ModalRow>
                )
              })}

              {/* Add category */}
              <button
                onClick={() => setNewKatOpen(true)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 w-full"
              >
                <Icon name="add" size={12} />
                Kategorie hinzufügen
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Lernziele */}
        {step === 'lernziele' && (
          <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden">
            {/* Grundlegend */}
            <div className="border-b border-border/40">
              <div className="px-1 py-1 bg-muted/20">
                <span className="text-3xs font-semibold uppercase tracking-wide text-category-grundlegend-fg">Grundlegend</span>
              </div>
              {grundlegendLZ.length === 0 && (
                <p className="px-1 py-1.5 text-3xs text-muted-foreground/50">Noch keine grundlegenden Lernziele.</p>
              )}
              {grundlegendLZ.map(lz => (
                <div key={lz.id} className="flex items-center gap-2 px-1 py-1.5 border-t border-border/30">
                  <span className="flex-1 text-xs leading-snug">{lz.label}</span>
                  <button
                    onClick={() => setLernziele(prev => prev.filter(x => x.id !== lz.id))}
                    className="shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors"
                    aria-label="Entfernen"
                  >
                    <Icon name="delete" size={12} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-1.5 px-1 py-1.5 border-t border-border/30">
                <Input value={newLzG} onChange={e => setNewLzG(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLzG() } }}
                  placeholder="Grundlegendes Lernziel…" className="h-6 text-xs flex-1" />
                <Button size="icon-sm" variant="outline" onClick={addLzG} disabled={!newLzG.trim()}>
                  <Icon name="add" size={12} />
                </Button>
              </div>
            </div>

            {/* Anspruchsvoll */}
            <div>
              <div className="px-1 py-1 bg-muted/20">
                <span className="text-3xs font-semibold uppercase tracking-wide text-category-anspruchsvoll-fg">Anspruchsvoll</span>
              </div>
              {anspruchsvollLZ.length === 0 && (
                <p className="px-1 py-1.5 text-3xs text-muted-foreground/50">Noch keine anspruchsvollen Lernziele.</p>
              )}
              {anspruchsvollLZ.map(lz => (
                <div key={lz.id} className="flex items-center gap-2 px-1 py-1.5 border-t border-border/30">
                  <span className="flex-1 text-xs leading-snug">{lz.label}</span>
                  <button
                    onClick={() => setLernziele(prev => prev.filter(x => x.id !== lz.id))}
                    className="shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors"
                    aria-label="Entfernen"
                  >
                    <Icon name="delete" size={12} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-1.5 px-1 py-1.5 border-t border-border/30">
                <Input value={newLzA} onChange={e => setNewLzA(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLzA() } }}
                  placeholder="Anspruchsvolles Lernziel…" className="h-6 text-xs flex-1" />
                <Button size="icon-sm" variant="outline" onClick={addLzA} disabled={!newLzA.trim()}>
                  <Icon name="add" size={12} />
                </Button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={!!deleteKatId}
          onOpenChange={(o) => { if (!o) setDeleteKatId(null) }}
          title="Kategorie löschen"
          description="Soll diese Tag-Kategorie wirklich gelöscht werden? Alle zugewiesenen Werte in den Themen bleiben erhalten, sind aber nicht mehr filterbar."
          confirmLabel="Löschen"
          onConfirm={() => { if (deleteKatId) { deleteTagKategorie(deleteKatId); setDeleteKatId(null) } }}
        />
      </Modal>

      <InputModal
        open={newKatOpen}
        onOpenChange={setNewKatOpen}
        title="Neue Tag-Kategorie"
        label="Bezeichnung"
        placeholder="z. B. Semester, Lerngruppe …"
        onSubmit={(name) => { createTagKategorie(name) }}
      />

      <InputModal
        open={!!addValueKatId}
        onOpenChange={(o) => { if (!o) setAddValueKatId(null) }}
        title="Wert hinzufügen"
        label="Wert"
        placeholder="z. B. 1"
        onSubmit={(v) => { if (addValueKatId) setTagValue(addValueKatId, v) }}
      />
    </>
  )
}
