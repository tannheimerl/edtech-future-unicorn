export type Status = 'not_reached' | 'partially_reached' | 'reached'

export interface StatusSnapshot {
  date: string
  lernzielStatus: Record<string, Status>
  // When set, only these IDs count toward the denominator (models new themen being added mid-semester)
  activeLzIds?: string[]
}

export const STATUS_LABELS: Record<Status, string> = {
  not_reached: 'nicht erreicht',
  partially_reached: 'teilweise erreicht',
  reached: 'erreicht',
}

export const STATUS_CYCLE: Status[] = ['not_reached', 'partially_reached', 'reached']

export interface Fach {
  id: string
  name: string
}

export interface Thema {
  id: string
  fachId: string
  name: string
  faelligAm?: string  // ISO YYYY-MM-DD — Datum bis wann dieses Thema beherrscht sein soll
}

export interface Lernziel {
  id: string
  themaId: string
  label: string
}

export interface Klasse {
  id: string
  name: string
  assignedThemenIds: string[]
}

export interface Schueler {
  id: string
  klassId: string
  name: string
  note: string
  competencyStatus: Record<string, Status>
  lernzielStatus: Record<string, Status>
  progressHistory?: StatusSnapshot[]
}

export interface Kompetenz {
  id: string
  label: string
}
