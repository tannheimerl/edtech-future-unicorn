export type Status = 'not_reached' | 'partially_reached' | 'reached'

export const STATUS_LABELS: Record<Status, string> = {
  not_reached: 'nicht erreicht',
  partially_reached: 'teilweise erreicht',
  reached: 'erreicht',
}

export const STATUS_CYCLE: Status[] = ['not_reached', 'partially_reached', 'reached']

export interface Klasse {
  id: string
  name: string
}

export interface Schueler {
  id: string
  klassId: string
  name: string
  note: string
  competencyStatus: Record<string, Status>
}

export interface Kompetenz {
  id: string
  label: string
}
