'use client'

import React, { useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { cn, getFachColor } from '@/lib/utils'
import { Plus, Pencil, Trash2, Check } from 'lucide-react'
import type { Schueler, Thema, Status, RilzLernziel } from '@/types/domain'
import { STATUS_CYCLE } from '@/types/domain'

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700', 'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',   'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700', 'bg-teal-100 text-teal-700',
]
function getAvatarColor(name: string) {
  let h = 0; for (const c of name) h = (h << 5) - h + c.charCodeAt(0)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function StatusDot({ status, onClick }: { status: Status; onClick: () => void }) {
  const cfg = {
    reached:          { bg: 'bg-status-reached',  label: 'Erreicht' },
    partially_reached:{ bg: 'bg-status-partial',  label: 'Teilweise' },
    not_reached:      { bg: 'bg-status-not-reached', label: 'Nicht erreicht' },
  }[status]
  return (
    <button
      onClick={onClick}
      title={cfg.label}
      className={cn(
        'size-6 rounded-full shrink-0 border-2 border-white shadow-sm transition-transform hover:scale-110 active:scale-95',
        cfg.bg,
      )}
    />
  )
}

function nextStatus(s: Status): Status {
  const i = STATUS_CYCLE.indexOf(s)
  return STATUS_CYCLE[(i + 1) % STATUS_CYCLE.length]
}

export function AddLzRow({
  onAdd,
}: {
  onAdd: (label: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState('')

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors w-full text-left"
      >
        <Plus className="size-3.5" />
        Lernziel hinzufügen
      </button>
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
      <button
        onClick={confirm}
        className="size-7 rounded flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
      >
        <Check className="size-3.5" />
      </button>
    </div>
  )
}

export function LzRow({
  lz,
  studentId,
}: {
  lz: RilzLernziel
  studentId: string
}) {
  const { updateRilzLernzielStatus, updateRilzLernzielLabel, deleteRilzLernziel } = useData()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(lz.label)

  const confirmEdit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== lz.label) updateRilzLernzielLabel(studentId, lz.id, trimmed)
    else setDraft(lz.label)
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 group hover:bg-muted/20 transition-colors">
      <StatusDot
        status={lz.status}
        onClick={() => updateRilzLernzielStatus(studentId, lz.id, nextStatus(lz.status))}
      />
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            className="w-full text-sm border border-border rounded px-2 py-0.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={confirmEdit}
            onKeyDown={e => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') { setDraft(lz.label); setEditing(false) } }}
          />
        ) : (
          <span className="text-sm leading-snug">{lz.label}</span>
        )}
      </div>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => { setDraft(lz.label); setEditing(true) }}
          className="size-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Pencil className="size-3" />
        </button>
        <button
          onClick={() => deleteRilzLernziel(studentId, lz.id)}
          className="size-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
        >
          <Trash2 className="size-3" />
        </button>
      </div>
    </div>
  )
}

function StudentCard({
  student,
  themen,
}: {
  student: Schueler
  themen: Thema[]
  faecher: { id: string; name: string }[]
}) {
  const { addRilzLernziel, getFachForThema, faecher } = useData()
  const allFachIds = faecher.map(f => f.id)
  const rilzLernziele = student.rilzLernziele ?? []

  const themenMitLz = themen.filter(t => {
    const fach = getFachForThema(t.id)
    return fach && (student.rilzFachIds ?? []).includes(fach.id)
  })

  if (themenMitLz.length === 0) {
    return (
      <div className="text-xs text-muted-foreground px-1">
        Keine RILZ-Fächer für Themen dieser Klasse zugewiesen.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {themenMitLz.map(thema => {
        const fach = getFachForThema(thema.id)
        const themaLz = rilzLernziele.filter(lz => lz.themaId === thema.id)
        const fachColor = fach ? getFachColor(fach.id, allFachIds) : null
        return (
          <div key={thema.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className={cn('flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border border-l-4', fachColor?.border ?? 'border-l-transparent')}>
              {fach && (
                <span className={cn('text-[10px] font-semibold uppercase tracking-wide', fachColor?.text ?? 'text-muted-foreground')}>{fach.name}</span>
              )}
              <span className="text-sm font-medium">{thema.name}</span>
              <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">{themaLz.length} LZ</span>
            </div>
            <div className="divide-y divide-border">
              {themaLz.length === 0 && (
                <p className="px-3 py-2 text-xs text-muted-foreground italic">Noch keine RILZ-Lernziele erfasst.</p>
              )}
              {themaLz.map(lz => (
                <LzRow key={lz.id} lz={lz} studentId={student.id} />
              ))}
              <AddLzRow onAdd={label => addRilzLernziel(student.id, thema.id, label)} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function RilzBeurteilungView({
  rilzStudents,
  themen,
  faecher,
}: {
  rilzStudents: Schueler[]
  themen: Thema[]
  faecher: { id: string; name: string }[]
}) {
  if (rilzStudents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-12 text-center">
        <p className="text-sm font-semibold text-muted-foreground">Keine Schülerinnen oder Schüler mit RILZ in dieser Klasse.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {rilzStudents.map(student => (
        <div key={student.id}>
          {/* Student header */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className={cn(
              'size-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
              getAvatarColor(student.vorname + ' ' + student.nachname),
            )}>
              {getInitials(student.vorname + ' ' + student.nachname)}
            </div>
            <div>
              <p className="text-sm font-semibold">{student.vorname} {student.nachname}</p>
              <div className="flex gap-1 flex-wrap">
                {student.bvsa && (
                  <span className="rounded px-1 py-0 text-[9px] font-semibold bg-purple-100 text-purple-700">BVSA</span>
                )}
                {(student.rilzFachIds ?? []).map(fachId => {
                  const fach = faecher.find(f => f.id === fachId)
                  return fach ? (
                    <span key={fachId} className="rounded px-1 py-0 text-[9px] font-semibold bg-orange-100 text-orange-700">
                      RILZ {fach.name}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          </div>
          <StudentCard student={student} themen={themen} faecher={faecher} />
        </div>
      ))}
    </div>
  )
}
