import { getDb } from '@/lib/db'
import type {
  Fach, Thema, Lernziel, LernzielKategorie, Lehrperson,
  Klasse, KlasseBeurteilungSettings, Schueler, AssessmentKommentar, ThemaKommentar,
  Pruefung, PruefungErgebnis, VersuchSnapshot, Status, TagKategorie,
} from '@/types/domain'

type Row = Record<string, unknown>

const parseArr = <T>(v: unknown): T[] => {
  if (v == null) return []
  try { return JSON.parse(v as string) as T[] } catch { return [] }
}

const parseObj = <T extends object>(v: unknown, fallback: T): T => {
  if (v == null) return fallback
  try { return JSON.parse(v as string) as T } catch { return fallback }
}

const bool = (v: unknown): boolean => v === 1 || v === true

export const fetchAllData = async () => {
  const db = await getDb()

  const [
    dbFaecher, dbThemen, dbLernziele, dbLehrpersonen, dbKlassen,
    dbKlasseThemen, dbLpZuweisungen, dbSchueler, dbLernzielStatus,
    dbRilzLernziele, dbKommentare, dbThemaKommentare,
    dbPruefungen, dbPruefungErg, dbTagKategorien,
  ] = await Promise.all([
    db.select<Row[]>('SELECT * FROM dim_faecher'),
    db.select<Row[]>('SELECT * FROM dim_themen'),
    db.select<Row[]>('SELECT * FROM dim_lernziele'),
    db.select<Row[]>('SELECT * FROM dim_lehrpersonen'),
    db.select<Row[]>('SELECT * FROM dim_klassen'),
    db.select<Row[]>('SELECT * FROM bridge_klasse_themen'),
    db.select<Row[]>('SELECT * FROM bridge_lp_zuweisungen'),
    db.select<Row[]>('SELECT * FROM dim_schueler'),
    db.select<Row[]>('SELECT * FROM fact_lernziel_status'),
    db.select<Row[]>('SELECT * FROM fact_rilz_lernziele'),
    db.select<Row[]>('SELECT * FROM fact_kommentare'),
    db.select<Row[]>('SELECT * FROM fact_thema_kommentare'),
    db.select<Row[]>('SELECT * FROM fact_pruefungen'),
    db.select<Row[]>('SELECT * FROM fact_pruefung_ergebnisse'),
    db.select<Row[]>('SELECT * FROM dim_tag_kategorien ORDER BY position'),
  ])

  const faecher: Fach[] = dbFaecher.map((f) => ({
    id: f.id as string, name: f.name as string,
    ...(f.color_index != null ? { colorIndex: f.color_index as number } : {}),
  }))

  const themen: Thema[] = dbThemen.map((t) => ({
    id: t.id as string, fachId: t.fach_id as string, name: t.name as string,
    ...(t.typ ? { typ: t.typ as 'standard' | 'rilz' } : {}),
    ...(t.standard_thema_id ? { standardThemaId: t.standard_thema_id as string } : {}),
    ...(t.faellig_am ? { faelligAm: t.faellig_am as string } : {}),
    ...(t.stufe ? { stufe: parseArr<number>(t.stufe) } : {}),
    ...(t.zyklus ? { zyklus: parseArr<number>(t.zyklus) } : {}),
    ...(t.autor ? { autor: t.autor as string } : {}),
    ...(t.autor_lp_id ? { autorLpId: t.autor_lp_id as string } : {}),
    ...(() => {
      const tags = parseObj<Record<string, string[]>>(t.tags, {})
      return Object.keys(tags).length > 0 ? { tags } : {}
    })(),
  }))

  const lernziele: Lernziel[] = dbLernziele.map((l) => ({
    id: l.id as string, themaId: l.thema_id as string,
    kategorie: l.kategorie as LernzielKategorie, label: l.label as string,
    ...(l.kriterien ? { kriterien: parseArr<string>(l.kriterien) } : {}),
    ...(l.stufe ? { stufe: parseArr<number>(l.stufe) } : {}),
    ...(l.beschreibung ? { beschreibung: l.beschreibung as string } : {}),
  }))

  const lehrpersonen: Lehrperson[] = dbLehrpersonen.map((lp) => ({
    id: lp.id as string, name: lp.name as string, kuerzel: lp.kuerzel as string,
  }))

  const classes: Klasse[] = dbKlassen.map((k) => ({
    id: k.id as string, name: k.name as string,
    ...(k.schuljahr ? { schuljahr: k.schuljahr as string } : {}),
    ...(k.vorgaenger_klasse_id ? { vorgaengerKlasseId: k.vorgaenger_klasse_id as string } : {}),
    assignedThemaIds: dbKlasseThemen
      .filter((kt) => kt.klasse_id === k.id)
      .map((kt) => kt.thema_id as string),
    lpZuweisungen: dbLpZuweisungen
      .filter((z) => z.klasse_id === k.id)
      .map((z) => ({
        lpId: z.lp_id as string,
        fachIds: parseArr<string>(z.fach_ids),
        ...(z.rolle ? { rolle: z.rolle as 'klassenlehrperson' | 'fachlehrperson' | 'heilpaedagogin' } : {}),
      })),
    ...(k.settings ? { beurteilungSettings: parseObj<KlasseBeurteilungSettings>(k.settings, {} as KlasseBeurteilungSettings) } : {}),
  }))

  const students: Schueler[] = dbSchueler.map((s) => ({
    id: s.id as string, klassId: s.klasse_id as string,
    vorname: s.vorname as string, nachname: s.nachname as string,
    note: (s.note as string) ?? '',
    bvsa: bool(s.bvsa),
    rilzFachIds: parseArr<string>(s.rilz_fach_ids),
    rilzThemaIds: parseArr<string>(s.rilz_thema_ids),
    competencyStatus: parseObj<Record<string, Status>>(s.competency_status, {}),
    lernzielStatus: Object.fromEntries(
      dbLernzielStatus
        .filter((ls) => ls.schueler_id === s.id)
        .map((ls) => [ls.lernziel_id as string, ls.status as Status])
    ),
    lernzielVersuche: parseObj(s.lernziel_versuche, {}),
    progressHistory: parseArr(s.progress_history),
    rilzLernziele: dbRilzLernziele
      .filter((rl) => rl.schueler_id === s.id)
      .map((rl) => ({
        id: rl.id as string, themaId: rl.thema_id as string,
        label: rl.label as string, status: rl.status as Status,
      })),
  }))

  const kommentare: AssessmentKommentar[] = dbKommentare.map((k) => ({
    studentId: k.schueler_id as string, lernzielId: k.lernziel_id as string,
    text: k.text as string, createdAt: k.created_at as string,
  }))

  const themaKommentare: ThemaKommentar[] = dbThemaKommentare.map((k) => ({
    studentId: k.schueler_id as string, themaId: k.thema_id as string,
    text: k.text as string, updatedAt: k.updated_at as string,
  }))

  const pruefungen: Pruefung[] = dbPruefungen.map((p) => ({
    id: p.id as string, klasseId: p.klasse_id as string, fachId: p.fach_id as string,
    name: p.name as string, datum: p.datum as string,
    lernzielIds: parseArr<string>(p.lernziel_ids),
    typ: (p.typ ?? 'pruefung_schriftlich') as Pruefung['typ'],
    ...(p.beschreibung ? { beschreibung: p.beschreibung as string } : {}),
    status: (p.status ?? 'laufend') as Pruefung['status'],
    punkteEnabled: bool(p.punkte_enabled),
    noteEnabled: bool(p.note_enabled),
    anhangEnabled: bool(p.anhang_enabled),
    ...(p.max_punkte != null ? { maxPunkte: p.max_punkte as number } : {}),
    ...(p.erstellt_von_id ? { erstelltVonId: p.erstellt_von_id as string } : {}),
    nurRilz: bool(p.nur_rilz),
    rilzSchuelerIds: parseArr<string>(p.rilz_schueler_ids),
    createdAt: p.created_at as string,
  }))

  const pruefungErgebnisse: PruefungErgebnis[] = dbPruefungErg.map((e) => ({
    id: e.id as string, pruefungId: e.pruefung_id as string, schuelerId: e.schueler_id as string,
    ...(e.punkte != null ? { punkte: e.punkte as number } : {}),
    ...(e.note ? { note: e.note as string } : {}),
    anzahlVersuche: (e.anzahl_versuche as number) ?? 1,
    zweiterVersuchAusstehend: bool(e.zweiter_versuch_ausstehend),
    abgeschlossen: bool(e.abgeschlossen),
    versuchSnapshots: parseArr<VersuchSnapshot>(e.versuch_snapshots),
    ...(e.kommentar ? { kommentar: e.kommentar as string } : {}),
    anhangUrls: parseArr<string>(e.anhang_urls),
    ...(e.status ? { status: e.status as Status } : {}),
    createdAt: e.created_at as string,
  }))

  const tagKategorien: TagKategorie[] = dbTagKategorien.map((k) => ({
    id: k.id as string, name: k.name as string,
    ...(k.lp_id ? { lpId: k.lp_id as string } : {}),
  }))

  return { faecher, themen, lernziele, lehrpersonen, classes, students, kommentare, themaKommentare, pruefungen, pruefungErgebnisse, tagKategorien }
}
