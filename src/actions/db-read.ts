import { getDrizzle } from '@/lib/drizzle/client'
import * as schema from '@/lib/drizzle/schema'
import type {
  Fach, Lernkontrolle, Lernziel, LernzielKategorie, Lehrperson,
  Klasse, Schueler, AssessmentKommentar, LernkontrolleKommentar,
  Pruefung, PruefungErgebnis, VersuchSnapshot, Status, BerichtIcons,
} from '@/types/domain'
import { DEFAULT_BERICHT_ICONS } from '@/types/domain'

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
    dbFaecher, dbLernkontrollen, dbLernziele, dbLehrpersonen, dbKlassen,
    dbLpZuweisungen, dbSchueler, dbLernzielStatus,
    dbKommentare, dbLernkontrolleKommentare,
    dbPruefungen, dbPruefungErg, dbBerichtIcons,
  ] = await Promise.all([
    db.select().from(schema.dimFaecher),
    db.select().from(schema.dimLernkontrollen),
    db.select().from(schema.dimLernziele),
    db.select().from(schema.dimLehrpersonen),
    db.select().from(schema.dimKlassen),
    db.select().from(schema.bridgeLpZuweisungen),
    db.select().from(schema.dimSchueler),
    db.select().from(schema.factLernzielStatus),
    db.select().from(schema.factKommentare),
    db.select().from(schema.factLernkontrolleKommentare),
    db.select().from(schema.factPruefungen),
    db.select().from(schema.factPruefungErgebnisse),
    db.select().from(schema.dimBerichtIcons),
  ])

  // Fehlt eine Zeile, gilt für diesen Status der Default — so funktionieren
  // Datenbanken ohne konfigurierte Icons ohne Seeding.
  const berichtIcons: BerichtIcons = { ...DEFAULT_BERICHT_ICONS }
  for (const row of dbBerichtIcons) {
    berichtIcons[row.status] = row.kind === 'image'
      ? { kind: 'image', dataUrl: row.value }
      : { kind: 'symbol', name: row.value }
  }

  const faecher: Fach[] = dbFaecher.map((f) => ({
    id: f.id, name: f.name,
    ...(f.colorIndex != null ? { colorIndex: f.colorIndex } : {}),
  }))

  const lernkontrollen: Lernkontrolle[] = dbLernkontrollen.map((t) => ({
    id: t.id, fachId: t.fachId, name: t.name,
    typ: (t.typ ?? 'standard') as 'standard' | 'rilz',
    stufe: t.stufe ? parseArr<number>(t.stufe) : [],
    ...(t.standardLernkontrolleId ? { standardLernkontrolleId: t.standardLernkontrolleId } : {}),
    ...(t.faelligAm ? { faelligAm: t.faelligAm } : {}),
    ...(t.zyklus ? { zyklus: parseArr<number>(t.zyklus) } : {}),
    ...(t.autor ? { autor: t.autor } : {}),
    ...(t.autorLpId ? { autorLpId: t.autorLpId } : {}),
  }))

  const lernziele: Lernziel[] = dbLernziele.map((l) => ({
    id: l.id, lernkontrolleId: l.lernkontrolleId,
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
    lpZuweisungen: dbLpZuweisungen
      .filter((z) => z.klasseId === k.id)
      .map((z) => ({
        lpId: z.lpId,
        fachIds: parseArr<string>(z.fachIds),
        ...(z.rolle ? { rolle: z.rolle } : {}),
      })),
  }))

  const students: Schueler[] = dbSchueler.map((sc) => ({
    id: sc.id, klassId: sc.klasseId,
    vorname: sc.vorname, nachname: sc.nachname,
    note: sc.note ?? '',
    bvsa: bool(sc.bvsa),
    rilzFachIds: parseArr<string>(sc.rilzFachIds),
    competencyStatus: parseObj<Record<string, Status>>(sc.competencyStatus, {}),
    lernzielStatus: Object.fromEntries(
      dbLernzielStatus
        .filter((ls) => ls.schuelerId === sc.id)
        .map((ls) => [ls.lernzielId, ls.status])
    ),
    lernzielVersuche: parseObj(sc.lernzielVersuche, {}),
    progressHistory: parseArr(sc.progressHistory),
  }))

  const kommentare: AssessmentKommentar[] = dbKommentare.map((k) => ({
    studentId: k.schuelerId, lernzielId: k.lernzielId,
    text: k.text, createdAt: k.createdAt,
  }))

  const lernkontrolleKommentare: LernkontrolleKommentar[] = dbLernkontrolleKommentare.map((k) => ({
    studentId: k.schuelerId, lernkontrolleId: k.lernkontrolleId,
    text: k.text, updatedAt: k.updatedAt,
  }))

  const pruefungen: Pruefung[] = dbPruefungen.map((p) => ({
    id: p.id, klasseId: p.klasseId, fachId: p.fachId,
    name: p.name, datum: p.datum,
    lernzielIds: parseArr<string>(p.lernzielIds),
    typ: (p.typ ?? 'pruefung_schriftlich') as Pruefung['typ'],
    status: (p.status ?? 'laufend') as Pruefung['status'],
    ...(p.erstelltVonId ? { erstelltVonId: p.erstelltVonId } : {}),
    nurRilz: bool(p.nurRilz),
    schuelerIds: parseArr<string>(p.schuelerIds),
    createdAt: p.createdAt as string,
  }))

  const pruefungErgebnisse: PruefungErgebnis[] = dbPruefungErg.map((e) => ({
    id: e.id, pruefungId: e.pruefungId, schuelerId: e.schuelerId,
    anzahlVersuche: e.anzahlVersuche ?? 1,
    zweiterVersuchAusstehend: bool(e.zweiterVersuchAusstehend),
    abgeschlossen: bool(e.abgeschlossen),
    versuchSnapshots: parseArr<VersuchSnapshot>(e.versuchSnapshots),
    ...(e.kommentar ? { kommentar: e.kommentar } : {}),
    ...(e.status ? { status: e.status } : {}),
    createdAt: e.createdAt as string,
  }))

  return { faecher, lernkontrollen, lernziele, lehrpersonen, classes, students, kommentare, lernkontrolleKommentare, pruefungen, pruefungErgebnisse, berichtIcons }
}
