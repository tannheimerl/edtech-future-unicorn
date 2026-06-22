'use client'

import { useState } from 'react'
import { Plus, CalendarDays, BookOpen, ChevronLeft, ClipboardList, Trash2, RotateCcw } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PruefungErstellenModal } from '@/components/pruefungen/PruefungErstellenModal'
import { BeurteilungGrid } from './BeurteilungGrid'
import { LernkontrolleTab } from '@/components/lernkontrolle/LernkontrolleTab'
import { cn } from '@/lib/utils'

interface Props {
  klassId: string
}

export function BeurteilungTab({ klassId }: Props) {
  const {
    getClass, getPruefungenForKlasse, getPruefungErgebnisse,
    getStudentsForClass, faecher, deletePruefung, updatePruefung,
  } = useData()

  const klasse = getClass(klassId)

  const pruefungen = getPruefungenForKlasse(klassId).sort(
    (a, b) => b.datum.localeCompare(a.datum)
  )
  const students = getStudentsForClass(klassId)

  const [mode, setMode] = useState<'pruefung' | 'frei'>('pruefung')
  const [activePruefungId, setActivePruefungId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [filterFachId, setFilterFachId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'alle' | 'laufend' | 'abgeschlossen'>('alle')

  if (activePruefungId && !pruefungen.some(p => p.id === activePruefungId)) {
    setActivePruefungId(null)
  }

  const activePruefung = activePruefungId ? pruefungen.find(p => p.id === activePruefungId) : null

  const pruefungenFachIds = new Set(pruefungen.map(p => p.fachId))
  const filterableFaecher = faecher.filter(f => pruefungenFachIds.has(f.id))

  const filteredPruefungen = pruefungen
    .filter(p => filterFachId === null || p.fachId === filterFachId)
    .filter(p => filterStatus === 'alle' || p.status === filterStatus)

  // ── Shared header ─────────────────────────────────────────────────────────
  const header = (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        {activePruefungId ? (
          <nav className="flex items-center gap-1.5 text-sm">
            <button
              onClick={() => setActivePruefungId(null)}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="size-4" />
              Beurteilung
            </button>
            <span className="text-muted-foreground/40">/</span>
            <span className="font-semibold text-foreground">{activePruefung?.name}</span>
          </nav>
        ) : (
          <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5 text-xs">
            <button
              onClick={() => setMode('pruefung')}
              className={cn(
                'rounded-md px-3 py-1 font-medium transition-all',
                mode === 'pruefung' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Lernzielkontrollen
            </button>
            <button
              onClick={() => setMode('frei')}
              className={cn(
                'rounded-md px-3 py-1 font-medium transition-all',
                mode === 'frei' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Freie Beurteilung
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {mode === 'pruefung' && !activePruefungId && (
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="size-4" /> Neue Lernzielkontrolle
          </Button>
        )}
      </div>
    </div>
  )

  // ── Freie Beurteilung ─────────────────────────────────────────────────────
  if (mode === 'frei') {
    return (
      <div className="space-y-4">
        {header}
        <LernkontrolleTab klassId={klassId} />
      </div>
    )
  }

  // ── Detailansicht: Prüfungs-Grid ─────────────────────────────────────────
  if (activePruefungId) {
    return (
      <div className="space-y-4">
        {header}
        <BeurteilungGrid pruefungId={activePruefungId} klassId={klassId} />
        <ConfirmDialog
          open={confirmDeleteId !== null}
          onOpenChange={v => { if (!v) setConfirmDeleteId(null) }}
          title="Lernzielkontrolle löschen?"
          description="Alle Ergebnisse dieser Lernzielkontrolle werden unwiderruflich gelöscht."
          confirmLabel="Löschen"
          onConfirm={() => {
            if (confirmDeleteId) { deletePruefung(confirmDeleteId); setConfirmDeleteId(null); setActivePruefungId(null) }
          }}
        />
      </div>
    )
  }

  // ── Listenansicht ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {header}

      {/* Filter-Leiste */}
      {pruefungen.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {filterableFaecher.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Fach:</span>
              <div className="flex flex-wrap gap-1">
                {[{ id: null, name: 'Alle' }, ...filterableFaecher].map(f => (
                  <button
                    key={f.id ?? 'alle'}
                    type="button"
                    onClick={() => setFilterFachId(f.id)}
                    className={cn(
                      'rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors',
                      filterFachId === f.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-accent',
                    )}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Status:</span>
            <div className="flex gap-1">
              {(['alle', 'laufend', 'abgeschlossen'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterStatus(s)}
                  className={cn(
                    'rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors capitalize',
                    filterStatus === s
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:bg-accent',
                  )}
                >
                  {s === 'alle' ? 'Alle' : s === 'laufend' ? 'Laufend' : 'Abgeschlossen'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Karten-Grid oder EmptyState */}
      {pruefungen.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-6 text-muted-foreground" />}
          title="Noch keine Lernzielkontrollen"
          description="Erstelle eine Lernzielkontrolle aus den Lernzielen dieser Klasse."
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Plus className="size-4" /> Neue Lernzielkontrolle
            </Button>
          }
        />
      ) : filteredPruefungen.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Keine Lernzielkontrollen für die gewählten Filter.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPruefungen.map(p => {
            const ergebnisse = getPruefungErgebnisse(p.id)
            const relevantStudents = p.nurRilz
              ? students.filter(s => p.rilzSchuelerIds.includes(s.id))
              : students.filter(s => !s.rilzFachIds?.includes(p.fachId))
            const rilzExcluded = p.nurRilz ? 0 : students.filter(s => s.rilzFachIds?.includes(p.fachId)).length
            const bewertet = relevantStudents.filter(s =>
              ergebnisse.some(e => e.schuelerId === s.id && e.abgeschlossen)
            ).length
            const fach = faecher.find(f => f.id === p.fachId)
            const pct = relevantStudents.length > 0 ? Math.round((bewertet / relevantStudents.length) * 100) : 0
            const pending2nd = ergebnisse.filter(e =>
              relevantStudents.some(s => s.id === e.schuelerId) &&
              e.zweiterVersuchAusstehend && (e.anzahlVersuche ?? 1) < 2
            ).length
            const pending3rd = ergebnisse.filter(e =>
              relevantStudents.some(s => s.id === e.schuelerId) &&
              e.zweiterVersuchAusstehend && (e.anzahlVersuche ?? 1) >= 2
            ).length
            const open1st = relevantStudents.filter(s => {
              const e = ergebnisse.find(er => er.schuelerId === s.id)
              return !e?.abgeschlossen && !e?.zweiterVersuchAusstehend
            }).length
            return (
              <div
                key={p.id}
                className="group relative flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md cursor-pointer"
                onClick={() => setActivePruefungId(p.id)}
              >
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setConfirmDeleteId(p.id) }}
                  className="absolute right-3 top-3 hidden size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:flex transition-colors"
                  title="Lernzielkontrolle löschen"
                >
                  <Trash2 className="size-3.5" />
                </button>

                <div className="flex items-start justify-between gap-2 pr-6">
                  <p className="font-semibold leading-tight">{p.name}</p>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      updatePruefung(p.id, { status: p.status === 'laufend' ? 'abgeschlossen' : 'laufend' })
                    }}
                    className={cn(
                      'shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
                      p.status === 'abgeschlossen'
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
                    )}
                  >
                    {p.status === 'abgeschlossen' ? 'Abgeschlossen' : 'Laufend'}
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    {new Date(p.datum).toLocaleDateString('de-CH')}
                  </span>
                  {fach && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="size-3.5" />
                      {fach.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{p.lernzielIds.length} Lernziel{p.lernzielIds.length !== 1 ? 'e' : ''}</span>
                  {p.maxPunkte != null && <span>· max. {p.maxPunkte} Pkt.</span>}
                </div>
                <div className="space-y-0.5">
                  {p.status === 'laufend' && open1st > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>{open1st} 1. Versuch offen</span>
                    </div>
                  )}
                  {pending2nd > 0 && (
                    <div className="flex items-center gap-1 text-xs font-medium text-amber-700">
                      <RotateCcw className="size-3" />
                      <span>{pending2nd} 2. Versuch ausstehend</span>
                    </div>
                  )}
                  {pending3rd > 0 && (
                    <div className="flex items-center gap-1 text-xs font-medium text-amber-700">
                      <RotateCcw className="size-3" />
                      <span>{pending3rd} 3. Versuch ausstehend</span>
                    </div>
                  )}
                </div>

                <div className="mt-1 space-y-0.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {bewertet}/{relevantStudents.length} abgeschlossen
                      {rilzExcluded > 0 && <span className="ml-1 text-orange-600">· {rilzExcluded} RILZ</span>}
                    </span>
                    <span className={pct === 100 ? 'text-emerald-600 font-medium' : ''}>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn('h-full rounded-full transition-all', pct === 100 ? 'bg-emerald-500' : 'bg-primary')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <PruefungErstellenModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        klassId={klassId}
        onCreated={id => setActivePruefungId(id)}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={v => { if (!v) setConfirmDeleteId(null) }}
        title="Lernzielkontrolle löschen?"
        description="Alle Ergebnisse dieser Lernzielkontrolle werden unwiderruflich gelöscht."
        confirmLabel="Löschen"
        onConfirm={() => {
          if (confirmDeleteId) { deletePruefung(confirmDeleteId); setConfirmDeleteId(null) }
        }}
      />
    </div>
  )
}
