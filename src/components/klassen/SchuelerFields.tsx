'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn, getFachColor } from '@/lib/utils'
import type { Fach } from '@/types/domain'

export const Toggle = ({ on, color = 'bg-primary' }: { on: boolean; color?: string }) => {
  return (
    <div className={cn(
      'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors pointer-events-none',
      on ? color : 'bg-muted',
    )}>
      <span className={cn(
        'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
        on ? 'translate-x-4' : 'translate-x-0',
      )} />
    </div>
  )
}

export const SchuelerFields = ({
  vorname, nachname, onVornameChange, onNachnameChange,
  bvsa, onBvsaChange,
  rilzFachIds, onRilzFachToggle,
  faecher,
  autoFocus = true,
}: {
  vorname: string
  nachname: string
  onVornameChange: (v: string) => void
  onNachnameChange: (v: string) => void
  bvsa: boolean
  onBvsaChange: (v: boolean) => void
  rilzFachIds: string[]
  onRilzFachToggle: (fachId: string, enabled: boolean) => void
  faecher: Fach[]
  autoFocus?: boolean
}) => {
  return (
    <div className="space-y-2">
      {/* Name fields side by side */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="schueler-vorname" className="text-xs text-muted-foreground">Vorname</Label>
          <Input
            id="schueler-vorname"
            value={vorname}
            onChange={e => onVornameChange(e.target.value)}
            placeholder="Vorname"
            className="h-8 text-sm"
            autoFocus={autoFocus}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="schueler-nachname" className="text-xs text-muted-foreground">Nachname</Label>
          <Input
            id="schueler-nachname"
            value={nachname}
            onChange={e => onNachnameChange(e.target.value)}
            placeholder="Nachname"
            className="h-8 text-sm"
          />
        </div>
      </div>

      {/* bVSA card */}
      <div className="rounded-2xl border border-border overflow-hidden bg-muted/20">
        <div
          className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent/30 transition-colors"
          onClick={() => onBvsaChange(!bvsa)}
        >
          <div className="min-w-0">
            <p className="text-sm font-medium leading-tight">bVSA</p>
            <p className="text-2xs text-muted-foreground leading-tight">Bericht ohne Noten</p>
          </div>
          <Toggle on={bvsa} color="bg-category-bvsa-fg" />
        </div>
      </div>

      {/* RILZ card */}
      {faecher.length > 0 && (
        <div className="rounded-2xl border border-border overflow-hidden divide-y divide-border/60 bg-muted/20">
          {/* RILZ divider label */}
          <div className="px-3 py-1 bg-muted/40">
            <p className="text-3xs font-semibold uppercase tracking-wider text-muted-foreground">
              RILZ — Reduzierte Lernziele
            </p>
          </div>

          {/* RILZ per Fach */}
          {faecher.map(fach => {
            const hasRilz = rilzFachIds.includes(fach.id)
            const fc = getFachColor(fach.id, faecher.map(f => f.id), fach.colorIndex)
            return (
              <div
                key={fach.id}
                className="flex items-center justify-between px-3 py-1.5 cursor-pointer hover:bg-accent/30 transition-colors"
                onClick={() => onRilzFachToggle(fach.id, !hasRilz)}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className={cn('size-2 rounded-full shrink-0', fc.dot)} />
                  <span className="text-sm truncate">{fach.name}</span>
                </span>
                <Toggle on={hasRilz} color="bg-rilz" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
