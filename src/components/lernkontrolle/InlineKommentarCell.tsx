'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

// Inline editierbarer Thema-Kommentar in der Beurteilungs-Tabelle.
export const InlineKommentarCell = ({
  studentId,
  themaId,
}: {
  studentId: string
  themaId: string
}) => {
  const { getThemaKommentar, upsertThemaKommentar, deleteThemaKommentar } = useData()
  const kommentar = getThemaKommentar(studentId, themaId)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(kommentar?.text ?? '')
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing) taRef.current?.focus()
  }, [editing])

  useEffect(() => {
    if (!editing) setDraft(kommentar?.text ?? '')
  }, [kommentar?.text, editing])

  const save = () => {
    const trimmed = draft.trim()
    if (trimmed) upsertThemaKommentar(studentId, themaId, trimmed)
    else deleteThemaKommentar(studentId, themaId)
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setDraft(kommentar?.text ?? ''); setEditing(false) }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save() }
  }

  if (editing) {
    return (
      <Textarea
        ref={taRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        rows={2}
        className="min-h-0 field-sizing-fixed resize-none border-ring px-2 py-1 text-xs leading-snug"
        placeholder="Kommentar zur Prüfung …"
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={cn(
        'w-full text-left rounded-md px-2 py-0.5 text-xs leading-snug transition-colors min-h-8',
        kommentar
          ? 'text-foreground hover:bg-muted/60'
          : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/40 italic',
      )}
    >
      {kommentar ? kommentar.text : '+ Kommentar'}
    </button>
  )
}
