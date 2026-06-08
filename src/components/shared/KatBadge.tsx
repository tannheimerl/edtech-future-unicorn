import { cn } from '@/lib/utils'
import type { LernzielKategorie } from '@/types/domain'

export function KatBadge({ kat }: { kat: LernzielKategorie }) {
  return (
    <span className={cn(
      'shrink-0 rounded px-1 py-px text-[9px] font-semibold',
      kat === 'grundlegend' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700',
    )}>
      {kat === 'grundlegend' ? 'G' : 'A'}
    </span>
  )
}
