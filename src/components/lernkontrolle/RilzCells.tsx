'use client'

import { useState } from 'react'
import { Icon } from "@/components/ui/Icon"
import { useData } from '@/contexts/DataContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Status, RilzLernziel } from '@/types/domain'
import { STATUS_CYCLE } from '@/types/domain'

// Inline "add RILZ Lernziel" row shown beneath each ad-hoc theme group
export const AddLzRow = ({
  onAdd,
}: {
  onAdd: (label: string) => void
}) => {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState('')

  if (!editing) {
    return (
      <Button
        variant="secondary"
        onClick={() => setEditing(true)}
        className="gap-1.5 px-3 py-2 h-auto text-muted-foreground hover:text-foreground w-full justify-start"
      >
        <Icon name="add" size={14} />
        Lernziel hinzufügen
      </Button>
    )
  }

  const confirm = () => {
    const trimmed = label.trim()
    if (trimmed) { onAdd(trimmed); setLabel('') }
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <input
        autoFocus
        className="flex-1 text-sm border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        placeholder="Lernziel beschreiben …"
        value={label}
        onChange={e => setLabel(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') { setEditing(false); setLabel('') } }}
      />
      <Button
        variant="default"
        size="icon-sm"
        onClick={confirm}
        className="size-7 shrink-0"
      >
        <Icon name="check" size={14} />
      </Button>
    </div>
  )
}

// Square status cell for RILZ Lernziele — cycles without undefined
export const RilzStatusCell = ({
  status,
  onSelect,
}: {
  status: Status
  onSelect: (s: Status) => void
}) => {
  const next = (s: Status): Status => {
    return STATUS_CYCLE[(STATUS_CYCLE.indexOf(s) + 1) % STATUS_CYCLE.length]
  }
  return (
    <div className="flex justify-center">
      <button
        onClick={() => onSelect(next(status))}
        title={
          status === 'reached' ? 'Erreicht'
          : status === 'partially_reached' ? 'Teilweise erreicht'
          : 'Nicht erreicht'
        }
        className={cn(
          'w-7 h-7 rounded-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer',
          status === 'reached'           ? 'bg-status-reached-soft text-status-reached-fg' :
          status === 'partially_reached' ? 'bg-status-partial-soft text-status-partial-fg' :
                                           'bg-status-not-reached-soft text-status-not-reached-fg',
        )}
      >
        {status === 'reached'           && <Icon name="check" size={12} weight={600} />}
        {status === 'partially_reached' && <Icon name="remove" size={12} weight={600} />}
        {status === 'not_reached'       && <Icon name="close" size={12} weight={600} />}
      </button>
    </div>
  )
}

// Editable column header for a RILZ Lernziel
export const RilzLzHeader = ({ lz, studentId }: { lz: RilzLernziel; studentId: string }) => {
  const { updateRilzLernzielLabel, deleteRilzLernziel } = useData()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(lz.label)

  const confirm = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== lz.label) updateRilzLernzielLabel(studentId, lz.id, trimmed)
    else setDraft(lz.label)
    setEditing(false)
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between gap-0.5">
        <Badge variant="rilz" size="sm">
          RILZ
        </Badge>
        <Button
          variant="secondary"
          size="icon-xs"
          onClick={() => deleteRilzLernziel(studentId, lz.id)}
          className="size-3.5 text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 shrink-0"
          title="Lernziel löschen"
        >
          <Icon name="close" size={10} />
        </Button>
      </div>
      {editing ? (
        <input
          autoFocus
          className="w-full text-2xs border border-border rounded px-1 py-0.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={confirm}
          onKeyDown={e => {
            if (e.key === 'Enter') confirm()
            if (e.key === 'Escape') { setDraft(lz.label); setEditing(false) }
          }}
        />
      ) : (
        <span
          className="text-2xs font-medium text-foreground leading-snug cursor-pointer hover:text-rilz-foreground"
          onClick={() => { setDraft(lz.label); setEditing(true) }}
          title="Klicken zum Bearbeiten"
        >
          {lz.label}
        </span>
      )}
    </div>
  )
}
