'use client'

import { useState } from 'react'
import { Plus, CalendarDays, BookOpen, ChevronLeft, ClipboardList, Trash2 } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PruefungErstellenModal } from '@/components/pruefungen/PruefungErstellenModal'
import { BeurteilungGrid } from './BeurteilungGrid'
import { BeurteilungSettingsPanel } from './BeurteilungSettingsPanel'
import { LernkontrolleTab } from '@/components/lernkontrolle/LernkontrolleTab'
import { cn } from '@/lib/utils'
import type { KlasseBeurteilungSettings } from '@/types/domain'

const DEFAULT_SETTINGS: KlasseBeurteilungSettings = {
  punkteEnabled: false,
  noteEnabled: false,
  anhangEnabled: false,
}

interface Props {
  klassId: string
}

export function BeurteilungTab({ klassId }: Props) {
  const {
    getClass, getPruefungenForKlasse, getPruefungErgebnisse,
    getStudentsForClass, faecher, deletePruefung,
  } = useData()

  const klasse = getClass(klassId)
  const settings = klasse?.beurteilungSettings ?? DEFAULT_SETTINGS

  const pruefungen = getPruefungenForKlasse(klassId).sort(
    (a, b) => b.datum.localeCompare(a.datum)
  )
  const students = getStudentsForClass(klassId)

  const [mode, setMode] = useState<'pruefung' | 'frei'>('pruefung')
  // null = Listenansicht, string = Detailansicht
  const [activePruefungId, setActivePruefungId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  if (activePruefungId && !pruefungen.some(p => p.id === activePruefungId)) {
    setActivePruefungId(null)
  }

  const activePruefung = activePruefungId ? pruefungen.find(p => p.id === activePruefungId) : null

  // ── Shared header ─────────────────────────────────────────────────────────
  const header = (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        {/* Breadcrumb (nur in Detailansicht) */}
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
          /* Toggle (nur in Listenansicht / frei) */
          <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5 text-xs">
            <button
              onClick={() => setMode('pruefung')}
              className={cn(
                'rounded-md px-3 py-1 font-medium transition-all',
                mode === 'pruefung' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Prüfungs-Modus
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
        <BeurteilungSettingsPanel klassId={klassId} settings={settings} />
        {mode === 'pruefung' && !activePruefungId && (
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="size-4" /> Neue Prüfung
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
        <BeurteilungGrid pruefungId={activePruefungId} klassId={klassId} settings={settings} />
        <ConfirmDialog
          open={confirmDeleteId !== null}
          onOpenChange={v => { if (!v) setConfirmDeleteId(null) }}
          title="Prüfung löschen?"
          description="Alle Ergebnisse dieser Prüfung werden unwiderruflich gelöscht."
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

      {/* Karten-Grid oder EmptyState */}
      {pruefungen.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-6 text-muted-foreground" />}
          title="Noch keine Prüfungen"
          description="Erstelle eine Prüfung aus den Lernzielen dieser Klasse."
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Plus className="size-4" /> Neue Prüfung
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pruefungen.map(p => {
            const ergebnisse = getPruefungErgebnisse(p.id)
            const bewertet = students.filter(s =>
              ergebnisse.some(e => e.schuelerId === s.id && e.status)
            ).length
            const fach = faecher.find(f => f.id === p.fachId)
            const pct = students.length > 0 ? Math.round((bewertet / students.length) * 100) : 0
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
                  title="Prüfung löschen"
                >
                  <Trash2 className="size-3.5" />
                </button>

                <p className="font-semibold pr-6 leading-tight">{p.name}</p>

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

                <div className="mt-1 space-y-0.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{bewertet}/{students.length} bewertet</span>
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
        title="Prüfung löschen?"
        description="Alle Ergebnisse dieser Prüfung werden unwiderruflich gelöscht."
        confirmLabel="Löschen"
        onConfirm={() => {
          if (confirmDeleteId) { deletePruefung(confirmDeleteId); setConfirmDeleteId(null) }
        }}
      />
    </div>
  )
}
