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
  faelligAm?: string      // ISO YYYY-MM-DD — Datum bis wann dieses Thema beherrscht sein soll
  typ?: 'standard' | 'rilz'  // default = 'standard'
  standardThemaId?: string    // für RILZ-Themen: welches Standard-Thema wird ersetzt
  stufe?: number[]            // e.g. [5, 6] — Schulstufen für die dieses Thema gedacht ist
  autor?: string              // Anzeigename der Lehrperson, die dieses Thema erstellt hat
  publishedToLibrary?: boolean // true once a personal Thema has been shared to the school library
}

export type LernzielKategorie = 'grundlegend' | 'anspruchsvoll'

export type LernzielSource = 'eigene' | 'bibliothek'

export interface Lernziel {
  id: string
  themaId: string
  kategorie: LernzielKategorie
  label: string
  kriterien?: string[]
  wichtig?: boolean
  // Library / provenance fields
  source?: LernzielSource   // undefined or 'eigene' = own; 'bibliothek' = published
  stufe?: number[]          // e.g. [5, 6] — school years this LZ targets
  autor?: string            // display name of teacher who published it
  beschreibung?: string     // optional short description shown in the library view
}

export type LpRolle = 'klassenlehrperson' | 'fachlehrperson' | 'heilpaedagogin'

export const LP_ROLLE_LABELS: Record<LpRolle, string> = {
  klassenlehrperson: 'Klassenlehrperson',
  fachlehrperson: 'Fachlehrperson',
  heilpaedagogin: 'Heilpädagogin',
}

export interface LpZuweisung {
  lpId: string
  fachIds: string[]
  rolle?: LpRolle
}

export interface Klasse {
  id: string
  name: string
  assignedThemaIds: string[]
  lpZuweisungen?: LpZuweisung[]
  schuljahr?: string           // e.g. "2025/26"
  vorgaengerKlasseId?: string  // pointer to previous year's class
}

// A single assessment attempt for a Lernziel
export interface Versuch {
  date: string
  status: Status
  withHelp?: boolean
}

export interface AssessmentKommentar {
  studentId: string
  lernzielId: string
  text: string
  createdAt: string  // ISO timestamp
}

export interface ThemaKommentar {
  studentId: string
  themaId: string
  text: string
  updatedAt: string  // ISO timestamp
}

export interface RilzLernziel {
  id: string
  themaId: string
  label: string
  status: Status
}

export interface Schueler {
  id: string
  klassId: string
  name: string
  note: string
  bvsa?: boolean             // Besonderer Förderbedarf — gets report even without grades in some subjects
  rilzFachIds?: string[]     // Fach IDs where student has reduced learning goals (RILZ)
  rilzLernziele?: RilzLernziel[]  // Individual RILZ learning goals written by Heilpädagogin (ad-hoc)
  rilzThemaIds?: string[]    // RILZ-Themen aus der Bibliothek, die diesem Schüler zugewiesen sind
  competencyStatus: Record<string, Status>
  lernzielStatus: Record<string, Status>
  lernzielVersuche?: Record<string, Versuch[]>  // attempt history per LZ (replaces lernzielStatus long-term)
  progressHistory?: StatusSnapshot[]
}

export interface Kompetenz {
  id: string
  label: string
}

// Mock LP (teacher) — will be replaced by real auth later
export interface Lehrperson {
  id: string
  name: string
  kuerzel: string  // e.g. "LM" for "Lukas Meier"
}

// Helper: derive current status from attempt list (latest wins)
export function getCurrentStatusFromVersuche(versuche: Versuch[]): Status | undefined {
  if (!versuche || versuche.length === 0) return undefined
  return versuche[versuche.length - 1].status
}
