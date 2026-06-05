'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useData } from '@/contexts/DataContext'
import { StudentVerlauf } from '@/components/analytics/StudentVerlauf'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import type { Status } from '@/types/domain'
import { STATUS_LABELS, STATUS_CYCLE } from '@/types/domain'
import { cn } from '@/lib/utils'

// ── Helpers ───────────────────────────────────────────────────────────────

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-teal-100 text-teal-700',
  'bg-sky-100 text-sky-700',
  'bg-orange-100 text-orange-700',
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i)
    hash = hash & hash
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// ── Fach KPI card ─────────────────────────────────────────────────────────

const FACH_COLORS: Record<string, string> = {
  Deutsch:     '#6366f1',
  Mathematik:  '#f59e0b',
  NMG:         '#10b981',
  Französisch: '#ec4899',
}
const FACH_BG: Record<string, string> = {
  Deutsch:     'bg-indigo-50 border-indigo-100',
  Mathematik:  'bg-amber-50 border-amber-100',
  NMG:         'bg-emerald-50 border-emerald-100',
  Französisch: 'bg-pink-50 border-pink-100',
}

function FachKpiCard({
  name,
  pct,
  reached,
  partial,
  total,
  gPct,
  gReached,
  gTotal,
  aPct,
  aReached,
  aTotal,
}: {
  name: string
  pct: number
  reached: number
  partial: number
  total: number
  gPct: number
  gReached: number
  gTotal: number
  aPct: number
  aReached: number
  aTotal: number
}) {
  const color = FACH_COLORS[name] ?? '#6366f1'
  const bgCls = FACH_BG[name] ?? 'bg-slate-50 border-slate-100'
  const reachedPct = total > 0 ? (reached / total) * 100 : 0
  const partialPct = total > 0 ? (partial / total) * 100 : 0

  return (
    <div className={cn('rounded-xl border px-4 py-3 min-w-[140px] shadow-sm', bgCls)}>
      <p className="text-xs font-medium text-muted-foreground mb-1">{name}</p>
      <p className="text-2xl font-bold tabular-nums leading-none" style={{ color }}>
        {pct}%
      </p>
      <div className="mt-2.5 flex h-1.5 w-full overflow-hidden rounded-full bg-black/10">
        <div className="h-full rounded-l-full transition-all" style={{ width: `${reachedPct}%`, background: color }} />
        <div className="h-full transition-all" style={{ width: `${partialPct}%`, background: color, opacity: 0.4 }} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground tabular-nums">
        {reached} / {total} erreicht
      </p>
      {(gTotal > 0 || aTotal > 0) && (
        <div className="mt-2.5 space-y-1.5 border-t border-black/[0.06] pt-2">
          {gTotal > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 rounded px-1 text-[8px] font-bold bg-sky-100 text-sky-700">G</span>
              <div className="flex-1 flex h-1 overflow-hidden rounded-full bg-black/10">
                <div className="h-full transition-all" style={{ width: `${(gReached / gTotal) * 100}%`, background: color }} />
              </div>
              <span className="text-[10px] tabular-nums text-muted-foreground w-7 text-right shrink-0">{gPct}%</span>
            </div>
          )}
          {aTotal > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 rounded px-1 text-[8px] font-bold bg-amber-100 text-amber-700">A</span>
              <div className="flex-1 flex h-1 overflow-hidden rounded-full bg-black/10">
                <div className="h-full transition-all" style={{ width: `${(aReached / aTotal) * 100}%`, background: color }} />
              </div>
              <span className="text-[10px] tabular-nums text-muted-foreground w-7 text-right shrink-0">{aPct}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Status selector ───────────────────────────────────────────────────────

const STATUS_ACTIVE_CLASS: Record<Status, string> = {
  reached:           'bg-emerald-500 text-white border-transparent shadow-sm',
  partially_reached: 'bg-amber-400 text-white border-transparent shadow-sm',
  not_reached:       'bg-red-400 text-white border-transparent shadow-sm',
}

interface StatusSelectorProps {
  studentId: string
  itemId: string
  current: Status
  onUpdate: (studentId: string, itemId: string, status: Status) => void
}

function StatusSelector({ studentId, itemId, current, onUpdate }: StatusSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {STATUS_CYCLE.map((status) => (
        <button
          key={status}
          onClick={() => onUpdate(studentId, itemId, status)}
          className={cn(
            'whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
            status === current
              ? STATUS_ACTIVE_CLASS[status]
              : 'border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {STATUS_LABELS[status]}
        </button>
      ))}
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────

function SectionBlock({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function SchuelerDetailPage() {
  const { klassId, studentId } = useParams<{ klassId: string; studentId: string }>()
  const router = useRouter()
  const {
    getClass,
    getStudent,
    updateStudent,
    updateLernzielStatus,
    setRilzFach,
    setBvsa,
    getThemenForKlasse,
    getLernzieleForThema,
    getFachForThema,
    faecher,
    lernziele,
    kommentare,
    getVersuche,
  } = useData()

  const klasse = getClass(klassId)
  const student = getStudent(studentId)
  const assignedThemen = getThemenForKlasse(klassId)

  const [note, setNote] = useState(student?.note ?? '')
  const [noteSaved, setNoteSaved] = useState(true)
  const [lzKatFilter, setLzKatFilter] = useState<'all' | 'grundlegend' | 'anspruchsvoll'>('all')

  useEffect(() => {
    setNote(student?.note ?? '')
    setNoteSaved(true)
  }, [studentId, student?.note])

  const handleNoteSave = () => {
    if (!student) return
    updateStudent(student.id, { note })
    setNoteSaved(true)
  }

  if (!student || !klasse) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-8 text-sm text-muted-foreground">
        Schüler nicht gefunden.{' '}
        <button className="underline text-primary" onClick={() => router.push('/klassen')}>
          Zur Übersicht
        </button>
      </div>
    )
  }

  // ── KPI computation per Fach ─────────────────────────────────────────────
  const fachKpis = faecher
    .map((fach) => {
      const fachThemen = assignedThemen.filter((t) => t.fachId === fach.id)
      const fachLZ = fachThemen.flatMap((t) => getLernzieleForThema(t.id))
      if (fachLZ.length === 0) return null
      const ids = fachLZ.map((lz) => lz.id)
      const reached = ids.filter((id) => student.lernzielStatus[id] === 'reached').length
      const partial = ids.filter((id) => student.lernzielStatus[id] === 'partially_reached').length
      const total = ids.length
      const pct = Math.round(((reached + partial * 0.5) / total) * 100)
      // G/A split
      const gIds = fachLZ.filter(lz => lz.kategorie === 'grundlegend').map(lz => lz.id)
      const aIds = fachLZ.filter(lz => lz.kategorie === 'anspruchsvoll').map(lz => lz.id)
      const gReached = gIds.filter(id => student.lernzielStatus[id] === 'reached').length
      const aReached = aIds.filter(id => student.lernzielStatus[id] === 'reached').length
      const gPartial = gIds.filter(id => student.lernzielStatus[id] === 'partially_reached').length
      const aPartial = aIds.filter(id => student.lernzielStatus[id] === 'partially_reached').length
      const gPct = gIds.length ? Math.round(((gReached + gPartial * 0.5) / gIds.length) * 100) : 0
      const aPct = aIds.length ? Math.round(((aReached + aPartial * 0.5) / aIds.length) * 100) : 0
      return { name: fach.name, pct, reached, partial, total, gPct, gReached, gTotal: gIds.length, aPct, aReached, aTotal: aIds.length }
    })
    .filter((k): k is NonNullable<typeof k> => k !== null)

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-5">
      <Breadcrumb
        className="mb-4"
        items={[
          { label: 'Klassen', href: '/klassen' },
          { label: klasse.name, href: `/klassen/${klassId}` },
          { label: student.name },
        ]}
      />

      {/* Header: identity + KPIs */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            <AvatarFallback className={cn('text-sm font-semibold', getAvatarColor(student.name))}>
              {getInitials(student.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{student.name}</h1>
            <div className="flex items-center flex-wrap gap-1.5 mt-0.5">
              <span className="text-sm text-muted-foreground">{klasse.name}</span>
              {student.bvsa && (
                <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-700">BVSA</span>
              )}
              {(student.rilzFachIds ?? []).map(fachId => {
                const fach = faecher.find(f => f.id === fachId)
                return fach ? (
                  <span key={fachId} className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-orange-100 text-orange-700">
                    RILZ {fach.name}
                  </span>
                ) : null
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-3">
          {fachKpis.length > 0 && fachKpis.map((k) => (
            <FachKpiCard key={k.name} {...k} />
          ))}
          <Link
            href={`/klassen/${klassId}/schueler/${studentId}/bericht`}
            className="self-end rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
          >
            Bericht erstellen
          </Link>
        </div>
      </div>

      <div className="space-y-5">

        {/* Row 1 — Verlauf chart + Notiz/Kompetenzen */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px] items-start">

          {/* Verlauf */}
          <SectionBlock title="Verlauf" description="Fortschritt über die Zeit">
            <StudentVerlauf
              student={student}
              assignedThemen={assignedThemen}
              lernziele={lernziele}
              faecher={faecher}
            />
          </SectionBlock>

          {/* Notiz + Kompetenzen */}
          <div className="space-y-4">
            <SectionBlock title="Notiz">
              <div className="grid gap-2">
                <Textarea
                  id="student-note"
                  rows={4}
                  placeholder="Beobachtungen, Besonderheiten, Förderbedarf …"
                  value={note}
                  onChange={(e) => { setNote(e.target.value); setNoteSaved(false) }}
                />
                <div className="flex items-center gap-3">
                  <Button size="sm" onClick={handleNoteSave} disabled={noteSaved}>Speichern</Button>
                  {noteSaved && note !== '' && (
                    <span className="text-xs text-muted-foreground">Gespeichert</span>
                  )}
                </div>
              </div>
            </SectionBlock>

            <SectionBlock title="RILZ & BVSA" description="Besondere Förderung und Beurteilungsstatus">
              <div className="space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={student.bvsa ?? false}
                    onChange={(e) => setBvsa(student.id, e.target.checked)}
                    className="rounded border-border h-3.5 w-3.5 accent-purple-600"
                  />
                  <div>
                    <span className="text-xs font-medium">BVSA</span>
                    <p className="text-[10px] text-muted-foreground">Bericht auch ohne Noten in einzelnen Fächern</p>
                  </div>
                </label>
                <div className="border-t border-border pt-2.5 space-y-2">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Reduzierte Lernziele (RILZ)</p>
                  {faecher.map(fach => {
                    const active = (student.rilzFachIds ?? []).includes(fach.id)
                    return (
                      <label key={fach.id} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={(e) => setRilzFach(student.id, fach.id, e.target.checked)}
                          className="rounded border-border h-3.5 w-3.5 accent-orange-500"
                        />
                        <span className="text-xs">{fach.name}</span>
                        {active && (
                          <span className="rounded px-1 py-0 text-[9px] font-semibold bg-orange-100 text-orange-700">RILZ</span>
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>
            </SectionBlock>

          </div>
        </div>

        {/* Row 2 — Lernziele full width */}
        <SectionBlock title="Lernziele" description="Zugewiesene Themen dieser Klasse">
          {assignedThemen.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Noch keine Themen zugewiesen.{' '}
              <a href={`/klassen/${klassId}`} className="underline text-primary">Themen zuweisen</a>
            </p>
          ) : (
            <div className="space-y-5">
              {/* Kategorie-Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium shrink-0">Kategorie:</span>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  {([
                    { k: 'all' as const, label: 'Alle' },
                    { k: 'grundlegend' as const, label: 'Grundlegend' },
                    { k: 'anspruchsvoll' as const, label: 'Anspruchsvoll' },
                  ]).map(({ k, label }) => (
                    <button
                      key={k}
                      onClick={() => setLzKatFilter(k)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium transition-colors',
                        lzKatFilter === k
                          ? k === 'grundlegend' ? 'bg-sky-500 text-white'
                            : k === 'anspruchsvoll' ? 'bg-amber-500 text-white'
                            : 'bg-primary text-primary-foreground'
                          : 'bg-card text-muted-foreground hover:bg-muted',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {assignedThemen.map((thema) => {
                const allThemaLernziele = getLernzieleForThema(thema.id)
                const fach = getFachForThema(thema.id)
                const hasRilz = fach ? (student.rilzFachIds ?? []).includes(fach.id) : false
                // For RILZ fächer: only show grundlegend, regardless of category filter
                const applicableLZ = hasRilz
                  ? allThemaLernziele.filter(lz => lz.kategorie === 'grundlegend')
                  : allThemaLernziele
                const themaLernziele = lzKatFilter === 'all'
                  ? applicableLZ
                  : applicableLZ.filter(lz => lz.kategorie === lzKatFilter)
                if (themaLernziele.length === 0) return null
                return (
                  <div key={thema.id}>
                    <div className="mb-2 flex items-baseline gap-1.5 flex-wrap">
                      {fach && (
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {fach.name}
                        </span>
                      )}
                      <h3 className="text-sm font-semibold">{thema.name}</h3>
                      {hasRilz && (
                        <span className="rounded px-1 py-0 text-[9px] font-semibold bg-orange-100 text-orange-700">RILZ – nur Grundlegend</span>
                      )}
                    </div>
                    {themaLernziele.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Keine Lernziele vorhanden.</p>
                    ) : (
                      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                        {themaLernziele.map((lz) => {
                          const current = student.lernzielStatus[lz.id] ?? 'not_reached'
                          return (
                            <div key={lz.id} className="flex items-center justify-between gap-4 px-3 py-2.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className={cn(
                                  'shrink-0 rounded px-1 text-[9px] font-semibold',
                                  lz.kategorie === 'grundlegend'
                                    ? 'bg-sky-100 text-sky-700'
                                    : 'bg-amber-100 text-amber-700',
                                )}>
                                  {lz.kategorie === 'grundlegend' ? 'G' : 'A'}
                                </span>
                                <span className="text-sm leading-snug">{lz.label}</span>
                              </div>
                              <StatusSelector
                                studentId={student.id}
                                itemId={lz.id}
                                current={current}
                                onUpdate={updateLernzielStatus}
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </SectionBlock>

        {/* Kommentare */}
        {(() => {
          const studentKommentare = kommentare.filter(k => k.studentId === student.id)
          if (studentKommentare.length === 0) return null
          return (
            <SectionBlock title="Kommentare" description="Aus der Lernkontrolle">
              <div className="space-y-2">
                {studentKommentare.map(k => {
                  const lz = lernziele.find(l => l.id === k.lernzielId)
                  const thema = lz ? assignedThemen.find(t => t.id === lz.themaId) : null
                  const fach = thema ? getFachForThema(thema.id) : null
                  return (
                    <div key={`${k.studentId}-${k.lernzielId}`} className="rounded-lg border border-border bg-muted/20 px-3 py-2 space-y-0.5">
                      <p className="text-[10px] text-muted-foreground">
                        {fach?.name && <span className="font-medium">{fach.name} · </span>}
                        {lz?.label}
                      </p>
                      <p className="text-sm leading-snug">{k.text}</p>
                    </div>
                  )
                })}
              </div>
            </SectionBlock>
          )
        })()}

        {/* Versuche summary */}
        {(() => {
          const lzWithMultipleVersuche = lernziele
            .filter(lz => {
              const versuche = getVersuche(student, lz.id)
              return versuche.length >= 2
            })
          if (lzWithMultipleVersuche.length === 0) return null
          return (
            <SectionBlock title="Mehrere Versuche" description="Lernziele die mehr als einen Versuch benötigten">
              <div className="space-y-2">
                {lzWithMultipleVersuche.map(lz => {
                  const versuche = getVersuche(student, lz.id)
                  const thema = assignedThemen.find(t => t.id === lz.themaId)
                  const fach = thema ? getFachForThema(thema.id) : null
                  return (
                    <div key={lz.id} className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                      <p className="text-[10px] text-muted-foreground mb-1">
                        {fach?.name && <span className="font-medium">{fach.name} · </span>}
                        {lz.label}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {versuche.map((v, i) => (
                          <span key={i} className={cn(
                            'rounded px-1.5 py-0.5 text-[9px] font-semibold',
                            v.status === 'reached' ? 'bg-emerald-100 text-emerald-700'
                            : v.status === 'partially_reached' ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700',
                          )}>
                            {i + 1}. {v.status === 'reached' ? 'Erreicht' : v.status === 'partially_reached' ? 'Teilweise' : 'Nicht err.'} {v.date}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </SectionBlock>
          )
        })()}
      </div>
    </div>
  )
}
