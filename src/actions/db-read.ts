import { asc } from 'drizzle-orm'
import { getDrizzle } from '@/lib/drizzle/client'
import * as schema from '@/lib/drizzle/schema'
import type {
  Fach, Thema, Lernziel, LernzielKategorie, Lehrperson,
  Klasse, KlasseBeurteilungSettings, Schueler, AssessmentKommentar, ThemaKommentar,
  Pruefung, PruefungErgebnis, VersuchSnapshot, Status, TagKategorie,
} from '@/types/domain'

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
  const db = getDrizzle()

  const [
    dbFaecher, dbThemen, dbLernziele, dbLehrpersonen, dbKlassen,
    dbKlasseThemen, dbLpZuweisungen, dbSchueler, dbLernzielStatus,
    dbRilzLernziele, dbKommentare, dbThemaKommentare,
    dbPruefungen, dbPruefungErg, dbTagKategorien,
  ] = await Promise.all([
    db.select().from(schema.dimFaecher),
    db.select().from(schema.dimThemen),
    db.select().from(schema.dimLernziele),
    db.select().from(schema.dimLehrpersonen),
    db.select().from(schema.dimKlassen),
    db.select().from(schema.bridgeKlasseThemen),
    db.select().from(schema.bridgeLpZuweisungen),
    db.select().from(schema.dimSchueler),
    db.select().from(schema.factLernzielStatus),
    db.select().from(schema.factRilzLernziele),
    db.select().from(schema.factKommentare),
    db.select().from(schema.factThemaKommentare),
    db.select().from(schema.factPruefungen),
    db.select().from(schema.factPruefungErgebnisse),
    db.select().from(schema.dimTagKategorien).orderBy(asc(schema.dimTagKategorien.position)),
  ])

  const faecher: Fach[] = dbFaecher.map((f) => ({
    id: f.id, name: f.name,
    ...(f.colorIndex != null ? { colorIndex: f.colorIndex } : {}),
  }))

  const themen: Thema[] = dbThemen.map((t) => ({
    id: t.id, fachId: t.fachId, name: t.name,
    ...(t.typ ? { typ: t.typ as 'standard' | 'rilz' } : {}),
    ...(t.standardThemaId ? { standardThemaId: t.standardThemaId } : {}),
    ...(t.faelligAm ? { faelligAm: t.faelligAm } : {}),
    ...(t.stufe ? { stufe: parseArr<number>(t.stufe) } : {}),
    ...(t.zyklus ? { zyklus: parseArr<number>(t.zyklus) } : {}),
    ...(t.autor ? { autor: t.autor } : {}),
    ...(t.autorLpId ? { autorLpId: t.autorLpId } : {}),
    ...(() => {
      const tags = parseObj<Record<string, string[]>>(t.tags, {})
      return Object.keys(tags).length > 0 ? { tags } : {}
    })(),
  }))

  const lernziele: Lernziel[] = dbLernziele.map((l) => ({
    id: l.id, themaId: l.themaId,
    kategorie: l.kategorie as LernzielKategorie, label: l.label,
    ...(l.kriterien ? { kriterien: parseArr<string>(l.kriterien) } : {}),
    ...(l.stufe ? { stufe: parseArr<number>(l.stufe) } : {}),
    ...(l.beschreibung ? { beschreibung: l.beschreibung } : {}),
  }))

  const lehrpersonen: Lehrperson[] = dbLehrpersonen.map((lp) => ({
    id: lp.id, name: lp.name, kuerzel: lp.kuerzel,
  }))

  const classes: Klasse[] = dbKlassen.map((k) => ({
    id: k.id, name: k.name,
    ...(k.schuljahr ? { schuljahr: k.schuljahr } : {}),
    ...(k.vorgaengerKlasseId ? { vorgaengerKlasseId: k.vorgaengerKlasseId } : {}),
    assignedThemaIds: dbKlasseThemen
      .filter((kt) => kt.klasseId === k.id)
      .map((kt) => kt.themaId),
    lpZuweisungen: dbLpZuweisungen
      .filter((z) => z.klasseId === k.id)
      .map((z) => ({
        lpId: z.lpId,
        fachIds: parseArr<string>(z.fachIds),
        ...(z.rolle ? { rolle: z.rolle } : {}),
      })),
    ...(k.settings ? { beurteilungSettings: parseObj<KlasseBeurteilungSettings>(k.settings, {} as KlasseBeurteilungSettings) } : {}),
  }))

  const students: Schueler[] = dbSchueler.map((sc) => ({
    id: sc.id, klassId: sc.klasseId,
    vorname: sc.vorname, nachname: sc.nachname,
    note: sc.note ?? '',
    bvsa: bool(sc.bvsa),
    rilzFachIds: parseArr<string>(sc.rilzFachIds),
    rilzThemaIds: parseArr<string>(sc.rilzThemaIds),
    competencyStatus: parseObj<Record<string, Status>>(sc.competencyStatus, {}),
    lernzielStatus: Object.fromEntries(
      dbLernzielStatus
        .filter((ls) => ls.schuelerId === sc.id)
        .map((ls) => [ls.lernzielId, ls.status])
    ),
    lernzielVersuche: parseObj(sc.lernzielVersuche, {}),
    progressHistory: parseArr(sc.progressHistory),
    rilzLernziele: dbRilzLernziele
      .filter((rl) => rl.schuelerId === sc.id)
      .map((rl) => ({
        id: rl.id, themaId: rl.themaId,
        label: rl.label, status: rl.status,
      })),
  }))

  const kommentare: AssessmentKommentar[] = dbKommentare.map((k) => ({
    studentId: k.schuelerId, lernzielId: k.lernzielId,
    text: k.text, createdAt: k.createdAt,
  }))

  const themaKommentare: ThemaKommentar[] = dbThemaKommentare.map((k) => ({
    studentId: k.schuelerId, themaId: k.themaId,
    text: k.text, updatedAt: k.updatedAt,
  }))

  const pruefungen: Pruefung[] = dbPruefungen.map((p) => ({
    id: p.id, klasseId: p.klasseId, fachId: p.fachId,
    name: p.name, datum: p.datum,
    lernzielIds: parseArr<string>(p.lernzielIds),
    typ: (p.typ ?? 'pruefung_schriftlich') as Pruefung['typ'],
    ...(p.beschreibung ? { beschreibung: p.beschreibung } : {}),
    status: (p.status ?? 'laufend') as Pruefung['status'],
    punkteEnabled: bool(p.punkteEnabled),
    noteEnabled: bool(p.noteEnabled),
    anhangEnabled: bool(p.anhangEnabled),
    ...(p.maxPunkte != null ? { maxPunkte: p.maxPunkte } : {}),
    ...(p.erstelltVonId ? { erstelltVonId: p.erstelltVonId } : {}),
    nurRilz: bool(p.nurRilz),
    rilzSchuelerIds: parseArr<string>(p.rilzSchuelerIds),
    createdAt: p.createdAt as string,
  }))

  const pruefungErgebnisse: PruefungErgebnis[] = dbPruefungErg.map((e) => ({
    id: e.id, pruefungId: e.pruefungId, schuelerId: e.schuelerId,
    ...(e.punkte != null ? { punkte: e.punkte } : {}),
    ...(e.note ? { note: e.note } : {}),
    anzahlVersuche: e.anzahlVersuche ?? 1,
    zweiterVersuchAusstehend: bool(e.zweiterVersuchAusstehend),
    abgeschlossen: bool(e.abgeschlossen),
    versuchSnapshots: parseArr<VersuchSnapshot>(e.versuchSnapshots),
    ...(e.kommentar ? { kommentar: e.kommentar } : {}),
    anhangUrls: parseArr<string>(e.anhangUrls),
    ...(e.status ? { status: e.status } : {}),
    createdAt: e.createdAt as string,
  }))

  const tagKategorien: TagKategorie[] = dbTagKategorien.map((k) => ({
    id: k.id, name: k.name,
    ...(k.lpId ? { lpId: k.lpId } : {}),
  }))

  return { faecher, themen, lernziele, lehrpersonen, classes, students, kommentare, themaKommentare, pruefungen, pruefungErgebnisse, tagKategorien }
}
