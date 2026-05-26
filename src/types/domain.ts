export type Status = 'not_reached' | 'partially_reached' | 'reached'

export interface StatusSnapshot {
  date: string
  lernzielStatus: Record<string, Status>
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
