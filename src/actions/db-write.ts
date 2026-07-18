import { and, eq } from 'drizzle-orm'
import { toInt } from '@/lib/db'
import { getDrizzle } from '@/lib/drizzle/client'
import { upsert } from '@/lib/drizzle/upsert'
import * as schema from '@/lib/drizzle/schema'
import { uploadPruefungAnhang, deletePruefungAnhang } from '@/lib/attachments'
import type { Fach, Thema, Lernziel, Klasse, Schueler, AssessmentKommentar, ThemaKommentar, RilzLernziel, Status, Pruefung, PruefungErgebnis, KlasseBeurteilungSettings, TagKategorie } from '@/types/domain'

// ── Klassen ──────────────────────────────────────────────────────────────────

export const dbSaveKlasse = async (klasse: Klasse) => {
  const db = getDrizzle()
  await upsert(schema.dimKlassen, {
    id: klasse.id, name: klasse.name,
    schuljahr: klasse.schuljahr ?? null,
    vorgaengerKlasseId: klasse.vorgaengerKlasseId ?? null,
    settings: klasse.beurteilungSettings ? JSON.stringify(klasse.beurteilungSettings) : null,
  })

  await db.delete(schema.bridgeKlasseThemen).where(eq(schema.bridgeKlasseThemen.klasseId, klasse.id))
  for (const themaId of klasse.assignedThemaIds) {
    await db.insert(schema.bridgeKlasseThemen).values({ klasseId: klasse.id, themaId })
  }

  await db.delete(schema.bridgeLpZuweisungen).where(eq(schema.bridgeLpZuweisungen.klasseId, klasse.id))
  for (const z of klasse.lpZuweisungen ?? []) {
    await db.insert(schema.bridgeLpZuweisungen).values({
      id: crypto.randomUUID(), klasseId: klasse.id, lpId: z.lpId,
      fachIds: JSON.stringify(z.fachIds), rolle: z.rolle ?? null,
    })
  }
}

export const dbSaveBeurteilungSettings = async (klassId: string, settings: KlasseBeurteilungSettings) => {
  const db = getDrizzle()
  await db.update(schema.dimKlassen).set({ settings: JSON.stringify(settings) }).where(eq(schema.dimKlassen.id, klassId))
}

export const dbDeleteKlasse = async (id: string) => {
  const db = getDrizzle()
  await db.delete(schema.dimKlassen).where(eq(schema.dimKlassen.id, id))
}

// ── Schüler ───────────────────────────────────────────────────────────────────

export const dbSaveSchueler = async (s: Schueler) => {
  await upsert(schema.dimSchueler, {
    id: s.id, klasseId: s.klassId,
    vorname: s.vorname, nachname: s.nachname,
    note: s.note ?? '', bvsa: toInt(s.bvsa ?? false),
    rilzFachIds: JSON.stringify(s.rilzFachIds ?? []),
    rilzThemaIds: JSON.stringify(s.rilzThemaIds ?? []),
    competencyStatus: JSON.stringify(s.competencyStatus ?? {}),
    lernzielVersuche: JSON.stringify(s.lernzielVersuche ?? {}),
    progressHistory: JSON.stringify(s.progressHistory ?? []),
  })
}

export const dbDeleteSchueler = async (id: string) => {
  const db = getDrizzle()
  await db.delete(schema.dimSchueler).where(eq(schema.dimSchueler.id, id))
}

// ── Lernziel-Status ───────────────────────────────────────────────────────────

export const dbSaveLernzielStatus = async (schueler_id: string, lernziel_id: string, status: Status) => {
  await upsert(
    schema.factLernzielStatus,
    { schuelerId: schueler_id, lernzielId: lernziel_id, status },
    ['schuelerId', 'lernzielId'],
  )
}

export const dbDeleteLernzielStatus = async (schueler_id: string, lernziel_id: string) => {
  const db = getDrizzle()
  await db.delete(schema.factLernzielStatus).where(
    and(
      eq(schema.factLernzielStatus.schuelerId, schueler_id),
      eq(schema.factLernzielStatus.lernzielId, lernziel_id),
    ),
  )
}

// ── RILZ Lernziele ────────────────────────────────────────────────────────────

export const dbSaveRilzLernziel = async (schueler_id: string, rlz: RilzLernziel) => {
  await upsert(schema.factRilzLernziele, {
    id: rlz.id, schuelerId: schueler_id, themaId: rlz.themaId, label: rlz.label, status: rlz.status,
  })
}

export const dbDeleteRilzLernziel = async (id: string) => {
  const db = getDrizzle()
  await db.delete(schema.factRilzLernziele).where(eq(schema.factRilzLernziele.id, id))
}

// ── Kommentare ────────────────────────────────────────────────────────────────

export const dbSaveKommentar = async (k: AssessmentKommentar) => {
  await upsert(
    schema.factKommentare,
    { schuelerId: k.studentId, lernzielId: k.lernzielId, text: k.text, createdAt: k.createdAt },
    ['schuelerId', 'lernzielId'],
  )
}

export const dbDeleteKommentar = async (studentId: string, lernzielId: string) => {
  const db = getDrizzle()
  await db.delete(schema.factKommentare).where(
    and(
      eq(schema.factKommentare.schuelerId, studentId),
      eq(schema.factKommentare.lernzielId, lernzielId),
    ),
  )
}

export const dbSaveThemaKommentar = async (k: ThemaKommentar) => {
  await upsert(
    schema.factThemaKommentare,
    { schuelerId: k.studentId, themaId: k.themaId, text: k.text, updatedAt: k.updatedAt },
    ['schuelerId', 'themaId'],
  )
}

export const dbDeleteThemaKommentar = async (studentId: string, themaId: string) => {
  const db = getDrizzle()
  await db.delete(schema.factThemaKommentare).where(
    and(
      eq(schema.factThemaKommentare.schuelerId, studentId),
      eq(schema.factThemaKommentare.themaId, themaId),
    ),
  )
}

// ── Fächer ────────────────────────────────────────────────────────────────────

export const dbSaveFach = async (f: Fach) => {
  await upsert(schema.dimFaecher, { id: f.id, name: f.name, colorIndex: f.colorIndex ?? null })
}

export const dbDeleteFach = async (id: string) => {
  const db = getDrizzle()
  await db.delete(schema.dimFaecher).where(eq(schema.dimFaecher.id, id))
}

// ── Themen ────────────────────────────────────────────────────────────────────

export const dbSaveThema = async (t: Thema) => {
  await upsert(schema.dimThemen, {
    id: t.id, fachId: t.fachId, name: t.name,
    typ: t.typ ?? 'standard',
    standardThemaId: t.standardThemaId ?? null,
    faelligAm: t.faelligAm ?? null,
    stufe: t.stufe ? JSON.stringify(t.stufe) : null,
    zyklus: t.zyklus ? JSON.stringify(t.zyklus) : null,
    autor: t.autor ?? null,
    autorLpId: t.autorLpId ?? null,
    tags: JSON.stringify(t.tags ?? {}),
  })
}

// ── Tag-Kategorien ────────────────────────────────────────────────────────────

export const dbSaveTagKategorie = async (kat: TagKategorie) => {
  await upsert(schema.dimTagKategorien, { id: kat.id, name: kat.name, lpId: kat.lpId ?? null })
}

export const dbDeleteTagKategorie = async (id: string) => {
  const db = getDrizzle()
  await db.delete(schema.dimTagKategorien).where(eq(schema.dimTagKategorien.id, id))
}

export const dbDeleteThema = async (id: string) => {
  const db = getDrizzle()
  // dim_lernziele.thema_id und fact_rilz_lernziele.thema_id haben KEIN
  // ON DELETE CASCADE — diese Kinder müssen zuerst weg, sonst verweigert
  // SQLite das Löschen des Themas (und es taucht nach Refresh wieder auf).
  await db.delete(schema.factRilzLernziele).where(eq(schema.factRilzLernziele.themaId, id))
  // RILZ-Themen, die dieses Thema als Standard referenzieren, entkoppeln.
  await db.update(schema.dimThemen).set({ standardThemaId: null }).where(eq(schema.dimThemen.standardThemaId, id))
  // Lernziele löschen — deren fact_lernziel_status/fact_kommentare cascaden via lernziel_id.
  await db.delete(schema.dimLernziele).where(eq(schema.dimLernziele.themaId, id))
  // Thema selbst — bridge_klasse_themen & fact_thema_kommentare cascaden via thema_id.
  await db.delete(schema.dimThemen).where(eq(schema.dimThemen.id, id))
}

// ── Lernziele ─────────────────────────────────────────────────────────────────

export const dbSaveLernziel = async (l: Lernziel) => {
  await upsert(schema.dimLernziele, {
    id: l.id, themaId: l.themaId, kategorie: l.kategorie, label: l.label,
    kriterien: l.kriterien ? JSON.stringify(l.kriterien) : null,
    stufe: l.stufe ? JSON.stringify(l.stufe) : null,
    beschreibung: l.beschreibung ?? null,
  })
}

export const dbDeleteLernziel = async (id: string) => {
  const db = getDrizzle()
  await db.delete(schema.dimLernziele).where(eq(schema.dimLernziele.id, id))
}

// ── Prüfungen ─────────────────────────────────────────────────────────────────

export const dbSavePruefung = async (p: Pruefung) => {
  await upsert(schema.factPruefungen, {
    id: p.id, klasseId: p.klasseId, fachId: p.fachId,
    name: p.name, datum: p.datum,
    lernzielIds: JSON.stringify(p.lernzielIds),
    typ: p.typ,
    beschreibung: p.beschreibung ?? null,
    status: p.status,
    punkteEnabled: toInt(p.punkteEnabled),
    noteEnabled: toInt(p.noteEnabled),
    anhangEnabled: toInt(p.anhangEnabled),
    maxPunkte: p.maxPunkte ?? null,
    erstelltVonId: p.erstelltVonId ?? null,
    nurRilz: toInt(p.nurRilz),
    rilzSchuelerIds: JSON.stringify(p.rilzSchuelerIds),
  })
}

export const dbDeletePruefung = async (id: string) => {
  const db = getDrizzle()
  await db.delete(schema.factPruefungen).where(eq(schema.factPruefungen.id, id))
}

export const dbSavePruefungErgebnis = async (e: PruefungErgebnis) => {
  await upsert(schema.factPruefungErgebnisse, {
    id: e.id, pruefungId: e.pruefungId, schuelerId: e.schuelerId,
    punkte: e.punkte ?? null,
    note: e.note ?? null,
    anzahlVersuche: e.anzahlVersuche,
    zweiterVersuchAusstehend: toInt(e.zweiterVersuchAusstehend),
    abgeschlossen: toInt(e.abgeschlossen),
    versuchSnapshots: JSON.stringify(e.versuchSnapshots),
    kommentar: e.kommentar ?? null,
    anhangUrls: JSON.stringify(e.anhangUrls),
    status: e.status ?? null,
  })
}

export const dbUploadPruefungAnhang = async (
  pruefungId: string,
  schuelerId: string,
  file: File,
): Promise<string | null> => {
  try {
    return await uploadPruefungAnhang(pruefungId, schuelerId, file)
  } catch (err) {
    console.error('dbUploadPruefungAnhang', err)
    return null
  }
}

export const dbDeletePruefungAnhang = async (url: string): Promise<void> => {
  await deletePruefungAnhang(url)
}
