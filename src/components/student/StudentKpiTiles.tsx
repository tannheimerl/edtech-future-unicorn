import { cn } from '@/lib/utils'
import type { StudentKpis } from '@/lib/student-kpis'

interface Props {
  kpis: StudentKpis
}

export function StudentKpiTiles({ kpis }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col gap-3">
      <h2 className="text-sm font-semibold">Kennzahlen</h2>
      <div className="grid grid-cols-2 gap-2.5 flex-1">
        <Tile
          label="Gesamtfortschritt"
          value={`${kpis.gesamtPct}%`}
          sub={`${kpis.reached} von ${kpis.totalLz} erreicht`}
          accent="bg-status-reached-soft"
          valueColor="text-status-reached-fg"
        />
        <Tile
          label="Noch offen"
          value={String(kpis.openLz)}
          sub="Lernziele"
          accent="bg-status-not-reached-soft"
          valueColor={kpis.openLz === 0 ? 'text-status-reached-fg' : 'text-status-not-reached-fg'}
        />
        <Tile
          label="Grundlegend"
          value={`${kpis.grundPct}%`}
          sub={`${kpis.grundReached} / ${kpis.grundTotal}`}
          accent="bg-category-grundlegend-soft"
          valueColor="text-category-grundlegend-fg"
        />
        <Tile
          label="Anspruchsvoll"
          value={`${kpis.ansprPct}%`}
          sub={`${kpis.ansprReached} / ${kpis.ansprTotal}`}
          accent="bg-category-anspruchsvoll-soft"
          valueColor="text-category-anspruchsvoll-fg"
        />
      </div>
    </div>
  )
}

function Tile({ label, value, sub, accent, valueColor }: {
  label: string
  value: string
  sub: string
  accent: string
  valueColor: string
}) {
  return (
    <div className={cn('rounded-xl px-3 py-2.5', accent)}>
      <p className="text-[10px] font-medium text-muted-foreground leading-tight mb-1">{label}</p>
      <p className={cn('text-xl font-bold tabular-nums leading-none', valueColor)}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">{sub}</p>
    </div>
  )
}
