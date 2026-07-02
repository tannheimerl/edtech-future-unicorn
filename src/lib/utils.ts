import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Status, LernzielKategorie } from '@/types/domain'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

// Deterministic per-Fach color palette — same fachId always gets the same color
// based on its position in the faecher array from DataContext.
export const FACH_COLORS = [
  { border: 'border-l-blue-400',    bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400'    },
  { border: 'border-l-violet-400',  bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-400'  },
  { border: 'border-l-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  { border: 'border-l-rose-400',    bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-400'    },
  { border: 'border-l-amber-500',   bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  { border: 'border-l-cyan-400',    bg: 'bg-cyan-50',    text: 'text-cyan-700',    dot: 'bg-cyan-400'    },
  { border: 'border-l-pink-400',    bg: 'bg-pink-50',    text: 'text-pink-700',    dot: 'bg-pink-400'    },
  { border: 'border-l-indigo-400',  bg: 'bg-indigo-50',  text: 'text-indigo-700',  dot: 'bg-indigo-400'  },
] as const

export type FachColor = (typeof FACH_COLORS)[number]

export const getFachColor = (fachId: string, allFachIds: string[], colorIndex?: number): FachColor => {
  if (colorIndex !== undefined) return FACH_COLORS[colorIndex % FACH_COLORS.length]
  const idx = allFachIds.indexOf(fachId)
  return FACH_COLORS[idx === -1 ? 0 : idx % FACH_COLORS.length]
}

export const sv = (status: Status | string): number => {
  return status === 'reached' ? 1 : status === 'partially_reached' ? 0.5 : 0
}

export const scoreColor = (pct: number): string => {
  return pct >= 75 ? 'text-status-reached' : pct >= 25 ? 'text-status-partial' : 'text-status-not-reached'
}

// Token-based chip classes for a RAG status (soft bg + readable fg).
// `undefined` = "nicht bewertet" → neutral.
export const statusChipClasses = (status: Status | undefined): string => {
  switch (status) {
    case 'reached':
      return 'bg-status-reached-soft text-status-reached-fg'
    case 'partially_reached':
      return 'bg-status-partial-soft text-status-partial-fg'
    case 'not_reached':
      return 'bg-status-not-reached-soft text-status-not-reached-fg'
    default:
      return 'bg-status-none-soft text-status-none-fg'
  }
}

// Token-based chip classes for a Lernziel-Anspruchsniveau.
export const categoryChipClasses = (kategorie: LernzielKategorie): string => {
  return kategorie === 'anspruchsvoll'
    ? 'bg-category-anspruchsvoll-soft text-category-anspruchsvoll-fg'
    : 'bg-category-grundlegend-soft text-category-grundlegend-fg'
}

