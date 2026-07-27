'use client'

/*
  Gemeinsame Bausteine von ClassAnalytics und StudentAnalytics:
  Filter-Typen, KPI-Kacheln, Sektions-Label und der aggregierte
  Lernziel-Statusbalken.
*/

import { cn } from '@/lib/utils'
import { SegmentedControl } from '@/components/shared/SegmentedControl'
import { ProgressBar } from '@/components/shared/ProgressBar'

// ── Filter types ───────────────────────────────────────────────────────────

export type KatFilter = 'all' | 'grundlegend' | 'anspruchsvoll'
export type StatView = 'gesamt' | 'fach' | 'thema' | 'pruefungen'

export const KAT_LABELS: Record<KatFilter, string> = {
  all: 'G + A',
  grundlegend: 'Grundlegend',
  anspruchsvoll: 'Anspruchsvoll',
}

export const VIEW_OPTIONS: { key: StatView; label: string }[] = [
  { key: 'gesamt', label: 'Gesamt' },
  { key: 'fach', label: 'Fach' },
  { key: 'thema', label: 'Thema' },
  { key: 'pruefungen', label: 'Lernzielkontrollen' },
]

// ── Filter bar ─────────────────────────────────────────────────────────────

export const FilterBar = ({ katFilter, onKatChange }: {
  katFilter: KatFilter
  onKatChange: (k: KatFilter) => void
}) => {
  return (
    <SegmentedControl<KatFilter>
      label="Lernziel-Kategorie"
      value={katFilter}
      onChange={onKatChange}
      options={[
        { key: 'all', label: KAT_LABELS.all },
        { key: 'grundlegend', label: KAT_LABELS.grundlegend, activeClass: 'bg-category-grundlegend text-white hover:bg-category-grundlegend/90' },
        { key: 'anspruchsvoll', label: KAT_LABELS.anspruchsvoll, activeClass: 'bg-category-anspruchsvoll text-white hover:bg-category-anspruchsvoll/90' },
      ]}
    />
  )
}

// ── Section label ──────────────────────────────────────────────────────────

export const SectionLabel = ({ label }: { label: string }) => {
  return (
    <div className="pb-1 border-b border-border/40">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">{label}</span>
    </div>
  )
}

// ── KPI tile ───────────────────────────────────────────────────────────────

export const KpiTile = ({ label, value, sub, valueClass }: {
  label: string
  value: string | number
  sub?: string
  valueClass?: string
}) => {
  return (
    <div className="bg-card border border-border rounded-md px-4 py-3">
      <p className="text-3xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">{label}</p>
      <p className={cn('text-2xl font-bold tabular-nums tracking-tight leading-none', valueClass ?? 'text-foreground')}>
        {value}
      </p>
      {sub && <p className="text-3xs text-muted-foreground/70 mt-1.5 leading-tight">{sub}</p>}
    </div>
  )
}

// ── LZ aggregate status bar ────────────────────────────────────────────────

export const LZStatusBar = ({ reached, partial, notReached }: {
  reached: number; partial: number; notReached: number
}) => (
  <ProgressBar
    size="sm"
    rounded={false}
    segments={[
      { value: reached, className: 'bg-status-reached' },
      { value: partial, className: 'bg-status-partial' },
      { value: notReached, className: 'bg-status-none-soft' },
    ]}
    legend={[
      { label: `${reached} erreicht`, className: 'bg-status-reached' },
      { label: `${partial} teilweise`, className: 'bg-status-partial' },
      { label: `${notReached} nicht erreicht`, className: 'bg-status-none-soft' },
    ]}
    emptyFallback={null}
  />
)
