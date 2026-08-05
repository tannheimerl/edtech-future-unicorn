export type Status = "not_reached" | "partially_reached" | "reached";

export type StatusSnapshot = {
  date: string;
  lernzielStatus: Record<string, Status>;
  // When set, only these IDs count toward the denominator (models new themen being added mid-semester)
  activeLzIds?: string[];
};

export const STATUS_LABELS: Record<Status, string> = {
  not_reached: "nicht erreicht",
  partially_reached: "teilweise erreicht",
  reached: "erreicht",
};

export type Fach = {
  id: string;
  name: string;
  colorIndex?: number;
};

export type Lernkontrolle = {
  id: string;
  fachId: string;
  name: string;
  faelligAm?: string; // ISO YYYY-MM-DD — Datum bis wann diese Lernkontrolle beherrscht sein soll
  typ: "standard" | "rilz";
  standardLernkontrolleId?: string; // für RILZ-Lernkontrollen: welche Standard-Lernkontrolle wird ersetzt
  stufe: number[]; // e.g. [5, 6] — Schulstufen für die diese Lernkontrolle gedacht ist (1–9)
  zyklus?: number[]; // e.g. [2, 3] — Lehrplanzyklus (1–3)
  autor?: string; // Anzeigename der Lehrperson, die diese Lernkontrolle erstellt hat
  autorLpId?: string; // ID der Lehrperson, die diese Lernkontrolle erstellt hat
};

export type LernzielKategorie = "grundlegend" | "anspruchsvoll";

export type Lernziel = {
  id: string;
  lernkontrolleId: string;
  kategorie: LernzielKategorie;
  label: string;
  kriterien?: string[];
  stufe?: number[]; // e.g. [5, 6] — school years this LZ targets
  autor?: string; // display name of teacher who created it
  beschreibung?: string; // optional short description
};

export type LezioExportLernziel = {
  kategorie: LernzielKategorie;
  label: string;
  kriterien?: string[];
  beschreibung?: string;
};

export type LezioExport = {
  version: "1";
  exportedAt: string;
  fachName: string;
  lernkontrolle: Pick<Lernkontrolle, "name" | "typ" | "stufe">;
  lernziele: LezioExportLernziel[];
};

export type LpRolle = "klassenlehrperson" | "fachlehrperson" | "heilpaedagogin";

export type LpZuweisung = {
  lpId: string;
  fachIds: string[];
  rolle?: LpRolle;
};

export type Klasse = {
  id: string;
  name: string;
  lpZuweisungen?: LpZuweisung[];
  schuljahr?: string; // e.g. "2025/26"
  vorgaengerKlasseId?: string; // pointer to previous year's class
};

// A single assessment attempt for a Lernziel
export type Versuch = {
  date: string;
  status?: Status;
  withHelp?: boolean;
};

export type AssessmentKommentar = {
  studentId: string;
  lernzielId: string;
  text: string;
  createdAt: string; // ISO timestamp
};

export type LernkontrolleKommentar = {
  studentId: string;
  lernkontrolleId: string;
  text: string;
  updatedAt: string; // ISO timestamp
};

export type Schueler = {
  id: string;
  klassId: string;
  vorname: string;
  nachname: string;
  note: string;
  bvsa?: boolean; // Besonderer Förderbedarf — gets report even without grades in some subjects
  rilzFachIds?: string[]; // Fach IDs where student has reduced learning goals (RILZ)
  competencyStatus: Record<string, Status>;
  lernzielStatus: Record<string, Status>;
  lernzielVersuche?: Record<string, Versuch[]>; // attempt history per LZ (replaces lernzielStatus long-term)
  progressHistory?: StatusSnapshot[];
};

export type PruefungTyp =
  | "pruefung_schriftlich"
  | "pruefung_muendlich"
  | "aufsatz_textproduktion"
  | "bericht_dokumentation_dossier"
  | "praesentation_vortrag"
  | "vorlesen_rezitation"
  | "musikalische_darbietung"
  | "sportliche_leistung"
  | "szenische_darstellung_theater"
  | "plakat"
  | "bild_zeichnung"
  | "modell_objekt_werkstueck"
  | "video_film"
  | "podcast_audiobeitrag"
  | "programmierprodukt"
  | "projekt"
  | "experiment_versuch"
  | "praktische_arbeit"
  | "portfolio"
  | "lernjournal"
  | "sonstiges";

export const PRUEFUNG_TYP_GRUPPEN: {
  gruppe: string;
  optionen: { value: PruefungTyp; label: string }[];
}[] = [
  {
    gruppe: "Lernkontrolle",
    optionen: [
      { value: "pruefung_schriftlich", label: "Lernkontrolle schriftlich" },
      { value: "pruefung_muendlich", label: "Lernkontrolle mündlich" },
    ],
  },
  {
    gruppe: "Schriftliche Arbeiten",
    optionen: [
      { value: "aufsatz_textproduktion", label: "Aufsatz / Textproduktion" },
      {
        value: "bericht_dokumentation_dossier",
        label: "Bericht / Dokumentation / Dossier",
      },
    ],
  },
  {
    gruppe: "Vortrag & Darbietung",
    optionen: [
      { value: "praesentation_vortrag", label: "Präsentation / Vortrag" },
      { value: "vorlesen_rezitation", label: "Vorlesen / Rezitation" },
      { value: "musikalische_darbietung", label: "Musikalische Darbietung" },
      { value: "sportliche_leistung", label: "Sportliche Leistung" },
      {
        value: "szenische_darstellung_theater",
        label: "Szenische Darstellung / Theater",
      },
    ],
  },
  {
    gruppe: "Gestalten & Produkt",
    optionen: [
      { value: "plakat", label: "Plakat" },
      { value: "bild_zeichnung", label: "Bild / Zeichnung" },
      {
        value: "modell_objekt_werkstueck",
        label: "Modell / Objekt / Werkstück",
      },
    ],
  },
  {
    gruppe: "Medial & digital",
    optionen: [
      { value: "video_film", label: "Video / Film" },
      { value: "podcast_audiobeitrag", label: "Podcast / Audiobeitrag" },
      { value: "programmierprodukt", label: "Programmierprodukt" },
    ],
  },
  {
    gruppe: "Angewandt & Prozess",
    optionen: [
      { value: "projekt", label: "Projekt" },
      { value: "experiment_versuch", label: "Experiment / Versuch" },
      { value: "praktische_arbeit", label: "Praktische Arbeit" },
      { value: "portfolio", label: "Portfolio" },
      { value: "lernjournal", label: "Lernjournal" },
    ],
  },
  {
    gruppe: "Sonstiges / Andere",
    optionen: [{ value: "sonstiges", label: "Sonstiges / Andere" }],
  },
];

export type Pruefung = {
  id: string;
  klasseId: string;
  fachId: string;
  name: string;
  datum: string; // ISO YYYY-MM-DD
  lernzielIds: string[];
  typ: PruefungTyp;
  status: "laufend" | "abgeschlossen";
  erstelltVonId?: string;
  nurRilz: boolean;
  /** Teilnehmende Schüler — im Erstellen-Modal (Schritt 2) gewählt. */
  schuelerIds: string[];
  createdAt: string;
};

export type VersuchSnapshot = {
  nr: number;
  date: string; // 'YYYY-MM-DD'
  kommentar?: string;
  status?: Status;
};

export type PruefungErgebnis = {
  id: string;
  pruefungId: string;
  schuelerId: string;
  anzahlVersuche: number;
  zweiterVersuchAusstehend: boolean;
  abgeschlossen: boolean;
  versuchSnapshots: VersuchSnapshot[];
  kommentar?: string;
  status?: Status;
  createdAt: string;
};

export type Kompetenz = {
  id: string;
  label: string;
};

export const SEED_COMPETENCIES: Kompetenz[] = [
  { id: "c1", label: "Mathematische Grundlagen" },
  { id: "c2", label: "Leseverstehen" },
  { id: "c3", label: "Problemlösekompetenz" },
  { id: "c4", label: "Mündliche Kommunikation" },
  { id: "c5", label: "Schriftlicher Ausdruck" },
  { id: "c6", label: "Kooperationsfähigkeit" },
];

// Mock LP (teacher) — will be replaced by real auth later
export type Lehrperson = {
  id: string;
  name: string;
  kuerzel: string; // e.g. "LM" for "Lukas Meier"
};
