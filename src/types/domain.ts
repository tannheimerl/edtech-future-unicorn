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

export interface TagKategorie {
  id: string
  name: string
  lpId?: string
  tenantId: string
}

export interface Thema {
  id: string
  fachId: string
  name: string
  faelligAm?: string      // ISO YYYY-MM-DD — Datum bis wann dieses Thema beherrscht sein soll
  typ?: 'standard' | 'rilz'  // default = 'standard'
  standardThemaId?: string    // für RILZ-Themen: welches Standard-Thema wird ersetzt
  stufe?: number[]            // e.g. [5, 6] — Schulstufen für die dieses Thema gedacht ist (1–9)
  zyklus?: number[]           // e.g. [2, 3] — Lehrplanzyklus (1–3)
  autor?: string              // Anzeigename der Lehrperson, die dieses Thema erstellt hat
  autorLpId?: string          // ID der Lehrperson, die dieses Thema erstellt hat
  tags?: Record<string, string[]>  // { kategorieId: [wert1, wert2] }
}

export type LernzielKategorie = 'grundlegend' | 'anspruchsvoll'

export interface Lernziel {
  id: string
  themaId: string
  kategorie: LernzielKategorie
  label: string
  kriterien?: string[]
  stufe?: number[]          // e.g. [5, 6] — school years this LZ targets
  autor?: string            // display name of teacher who created it
  beschreibung?: string     // optional short description
}

export interface LezioExportLernziel {
  kategorie: LernzielKategorie
  label: string
  kriterien?: string[]
  beschreibung?: string
}

export interface LezioExport {
  version: '1'
  exportedAt: string
  fachName: string
  thema: Pick<Thema, 'name' | 'typ' | 'stufe'>
  lernziele: LezioExportLernziel[]
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

export interface KlasseBeurteilungSettings {
  punkteEnabled: boolean
  noteEnabled: boolean
  anhangEnabled: boolean
}

export interface Klasse {
  id: string
  name: string
  assignedThemaIds: string[]
  lpZuweisungen?: LpZuweisung[]
  schuljahr?: string           // e.g. "2025/26"
  vorgaengerKlasseId?: string  // pointer to previous year's class
  beurteilungSettings?: KlasseBeurteilungSettings
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
  vorname: string
  nachname: string
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

export type PruefungTyp =
  | 'pruefung_schriftlich' | 'pruefung_muendlich'
  | 'aufsatz_textproduktion' | 'bericht_dokumentation_dossier'
  | 'praesentation_vortrag' | 'vorlesen_rezitation' | 'musikalische_darbietung' | 'sportliche_leistung' | 'szenische_darstellung_theater'
  | 'plakat' | 'bild_zeichnung' | 'modell_objekt_werkstueck'
  | 'video_film' | 'podcast_audiobeitrag' | 'programmierprodukt'
  | 'projekt' | 'experiment_versuch' | 'praktische_arbeit' | 'portfolio' | 'lernjournal'
  | 'sonstiges'

export const PRUEFUNG_TYP_GRUPPEN: { gruppe: string; optionen: { value: PruefungTyp; label: string }[] }[] = [
  {
    gruppe: 'Lernzielkontrolle',
    optionen: [
      { value: 'pruefung_schriftlich', label: 'Lernzielkontrolle schriftlich' },
      { value: 'pruefung_muendlich', label: 'Lernzielkontrolle mündlich' },
    ],
  },
  {
    gruppe: 'Schriftliche Arbeiten',
    optionen: [
      { value: 'aufsatz_textproduktion', label: 'Aufsatz / Textproduktion' },
      { value: 'bericht_dokumentation_dossier', label: 'Bericht / Dokumentation / Dossier' },
    ],
  },
  {
    gruppe: 'Vortrag & Darbietung',
    optionen: [
      { value: 'praesentation_vortrag', label: 'Präsentation / Vortrag' },
      { value: 'vorlesen_rezitation', label: 'Vorlesen / Rezitation' },
      { value: 'musikalische_darbietung', label: 'Musikalische Darbietung' },
      { value: 'sportliche_leistung', label: 'Sportliche Leistung' },
      { value: 'szenische_darstellung_theater', label: 'Szenische Darstellung / Theater' },
    ],
  },
  {
    gruppe: 'Gestalten & Produkt',
    optionen: [
      { value: 'plakat', label: 'Plakat' },
      { value: 'bild_zeichnung', label: 'Bild / Zeichnung' },
      { value: 'modell_objekt_werkstueck', label: 'Modell / Objekt / Werkstück' },
    ],
  },
  {
    gruppe: 'Medial & digital',
    optionen: [
      { value: 'video_film', label: 'Video / Film' },
      { value: 'podcast_audiobeitrag', label: 'Podcast / Audiobeitrag' },
      { value: 'programmierprodukt', label: 'Programmierprodukt' },
    ],
  },
  {
    gruppe: 'Angewandt & Prozess',
    optionen: [
      { value: 'projekt', label: 'Projekt' },
      { value: 'experiment_versuch', label: 'Experiment / Versuch' },
      { value: 'praktische_arbeit', label: 'Praktische Arbeit' },
      { value: 'portfolio', label: 'Portfolio' },
      { value: 'lernjournal', label: 'Lernjournal' },
    ],
  },
  {
    gruppe: 'Sonstiges / Andere',
    optionen: [
      { value: 'sonstiges', label: 'Sonstiges / Andere' },
    ],
  },
]

export interface Pruefung {
  id: string
  klasseId: string
  fachId: string
  name: string
  datum: string           // ISO YYYY-MM-DD
  lernzielIds: string[]
  typ: PruefungTyp
  beschreibung?: string
  status: 'laufend' | 'abgeschlossen'
  punkteEnabled: boolean
  noteEnabled: boolean
  anhangEnabled: boolean
  maxPunkte?: number
  erstelltVonId?: string
  nurRilz: boolean
  rilzSchuelerIds: string[]
  tenantId: string
  createdAt: string
}

export interface VersuchSnapshot {
  nr: number
  date: string           // 'YYYY-MM-DD'
  punkte?: number
  note?: string
  kommentar?: string
  status?: Status
}

export interface PruefungErgebnis {
  id: string
  pruefungId: string
  schuelerId: string
  punkte?: number
  note?: string           // Schweizer Note, z.B. "5.5"
  anzahlVersuche: number
  zweiterVersuchAusstehend: boolean
  abgeschlossen: boolean
  versuchSnapshots: VersuchSnapshot[]
  kommentar?: string
  anhangUrls: string[]
  status?: Status
  tenantId: string
  createdAt: string
}

export interface Kompetenz {
  id: string
  label: string
}

export const SEED_COMPETENCIES: Kompetenz[] = [
  { id: 'c1', label: 'Mathematische Grundlagen' },
  { id: 'c2', label: 'Leseverstehen' },
  { id: 'c3', label: 'Problemlösekompetenz' },
  { id: 'c4', label: 'Mündliche Kommunikation' },
  { id: 'c5', label: 'Schriftlicher Ausdruck' },
  { id: 'c6', label: 'Kooperationsfähigkeit' },
]

// Mock LP (teacher) — will be replaced by real auth later
export interface Lehrperson {
  id: string
  name: string
  kuerzel: string  // e.g. "LM" for "Lukas Meier"
}

