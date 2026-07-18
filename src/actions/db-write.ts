import { getDb, upsert, toInt } from '@/lib/db'
import { uploadPruefungAnhang, deletePruefungAnhang } from '@/lib/attachments'
import type { Fach, Thema, Lernziel, Klasse, Schueler, AssessmentKommentar, ThemaKommentar, RilzLernziel, Status, Pruefung, PruefungErgebnis, KlasseBeurteilungSettings, TagKategorie } from '@/types/domain'

// ── Klassen ──────────────────────────────────────────────────────────────────

export const dbSaveKlasse = async (klasse: Klasse) => {
  const db = await getDb()
  await upsert(db, 'dim_klassen', {
    id: klasse.id, name: klasse.name,
    schuljahr: klasse.schuljahr ?? null,
    vorgaenger_klasse_id: klasse.vorgaengerKlasseId ?? null,
    settings: klasse.beurteilungSettings ? JSON.stringify(klasse.beurteilungSettings) : null,
  })

  await db.execute('DELETE FROM bridge_klasse_themen WHERE klasse_id = $1', [klasse.id])
  for (const themaId of klasse.assignedThemaIds) {
    await db.execute(
      'INSERT INTO bridge_klasse_themen (klasse_id, thema_id) VALUES ($1, $2)',
      [klasse.id, themaId]
    )
  }

  await db.execute('DELETE FROM bridge_lp_zuweisungen WHERE klasse_id = $1', [klasse.id])
  for (const z of klasse.lpZuweisungen ?? []) {
    await db.execute(
      'INSERT INTO bridge_lp_zuweisungen (id, klasse_id, lp_id, fach_ids, rolle) VALUES ($1, $2, $3, $4, $5)',
      [crypto.randomUUID(), klasse.id, z.lpId, JSON.stringify(z.fachIds), z.rolle ?? null]
    )
  }
}

export const dbSaveBeurteilungSettings = async (klassId: string, settings: KlasseBeurteilungSettings) => {
  const db = await getDb()
  await db.execute('UPDATE dim_klassen SET settings = $1 WHERE id = $2', [JSON.stringify(settings), klassId])
}

export const dbDeleteKlasse = async (id: string) => {
  const db = await getDb()
  await db.execute('DELETE FROM dim_klassen WHERE id = $1', [id])
}

// ── Schüler ───────────────────────────────────────────────────────────────────

export const dbSaveSchueler = async (s: Schueler) => {
  const db = await getDb()
  await upsert(db, 'dim_schueler', {
    id: s.id, klasse_id: s.klassId,
    vorname: s.vorname, nachname: s.nachname,
    note: s.note ?? '', bvsa: toInt(s.bvsa ?? false),
    rilz_fach_ids: JSON.stringify(s.rilzFachIds ?? []),
    rilz_thema_ids: JSON.stringify(s.rilzThemaIds ?? []),
    competency_status: JSON.stringify(s.competencyStatus ?? {}),
    lernziel_versuche: JSON.stringify(s.lernzielVersuche ?? {}),
    progress_history: JSON.stringify(s.progressHistory ?? []),
  })
}

export const dbDeleteSchueler = async (id: string) => {
  const db = await getDb()
  await db.execute('DELETE FROM dim_schueler WHERE id = $1', [id])
}

// ── Lernziel-Status ───────────────────────────────────────────────────────────

export const dbSaveLernzielStatus = async (schueler_id: string, lernziel_id: string, status: Status) => {
  const db = await getDb()
  await upsert(db, 'fact_lernziel_status', { schueler_id, lernziel_id, status }, ['schueler_id', 'lernziel_id'])
}

export const dbDeleteLernzielStatus = async (schueler_id: string, lernziel_id: string) => {
  const db = await getDb()
  await db.execute(
    'DELETE FROM fact_lernziel_status WHERE schueler_id = $1 AND lernziel_id = $2',
    [schueler_id, lernziel_id]
  )
}

// ── RILZ Lernziele ────────────────────────────────────────────────────────────

export const dbSaveRilzLernziel = async (schueler_id: string, rlz: RilzLernziel) => {
  const db = await getDb()
  await upsert(db, 'fact_rilz_lernziele', {
    id: rlz.id, schueler_id, thema_id: rlz.themaId, label: rlz.label, status: rlz.status,
  })
}

export const dbDeleteRilzLernziel = async (id: string) => {
  const db = await getDb()
  await db.execute('DELETE FROM fact_rilz_lernziele WHERE id = $1', [id])
}

// ── Kommentare ────────────────────────────────────────────────────────────────

export const dbSaveKommentar = async (k: AssessmentKommentar) => {
  const db = await getDb()
  await upsert(db, 'fact_kommentare', {
    schueler_id: k.studentId, lernziel_id: k.lernzielId, text: k.text, created_at: k.createdAt,
  }, ['schueler_id', 'lernziel_id'])
}

export const dbDeleteKommentar = async (studentId: string, lernzielId: string) => {
  const db = await getDb()
  await db.execute(
    'DELETE FROM fact_kommentare WHERE schueler_id = $1 AND lernziel_id = $2',
    [studentId, lernzielId]
  )
}

export const dbSaveThemaKommentar = async (k: ThemaKommentar) => {
  const db = await getDb()
  await upsert(db, 'fact_thema_kommentare', {
    schueler_id: k.studentId, thema_id: k.themaId, text: k.text, updated_at: k.updatedAt,
  }, ['schueler_id', 'thema_id'])
}

export const dbDeleteThemaKommentar = async (studentId: string, themaId: string) => {
  const db = await getDb()
  await db.execute(
    'DELETE FROM fact_thema_kommentare WHERE schueler_id = $1 AND thema_id = $2',
    [studentId, themaId]
  )
}

// ── Fächer ────────────────────────────────────────────────────────────────────

export const dbSaveFach = async (f: Fach) => {
  const db = await getDb()
  await upsert(db, 'dim_faecher', { id: f.id, name: f.name, color_index: f.colorIndex ?? null })
}

export const dbDeleteFach = async (id: string) => {
  const db = await getDb()
  await db.execute('DELETE FROM dim_faecher WHERE id = $1', [id])
}

// ── Themen ────────────────────────────────────────────────────────────────────

export const dbSaveThema = async (t: Thema) => {
  const db = await getDb()
  await upsert(db, 'dim_themen', {
    id: t.id, fach_id: t.fachId, name: t.name,
    typ: t.typ ?? 'standard',
    standard_thema_id: t.standardThemaId ?? null,
    faellig_am: t.faelligAm ?? null,
    stufe: t.stufe ? JSON.stringify(t.stufe) : null,
    zyklus: t.zyklus ? JSON.stringify(t.zyklus) : null,
    autor: t.autor ?? null,
    autor_lp_id: t.autorLpId ?? null,
    tags: JSON.stringify(t.tags ?? {}),
  })
}

// ── Tag-Kategorien ────────────────────────────────────────────────────────────

export const dbSaveTagKategorie = async (kat: TagKategorie) => {
  const db = await getDb()
  await upsert(db, 'dim_tag_kategorien', { id: kat.id, name: kat.name, lp_id: kat.lpId ?? null })
}

export const dbDeleteTagKategorie = async (id: string) => {
  const db = await getDb()
  await db.execute('DELETE FROM dim_tag_kategorien WHERE id = $1', [id])
}

export const dbDeleteThema = async (id: string) => {
  const db = await getDb()
  // dim_lernziele.thema_id und fact_rilz_lernziele.thema_id haben KEIN
  // ON DELETE CASCADE — diese Kinder müssen zuerst weg, sonst verweigert
  // SQLite das Löschen des Themas (und es taucht nach Refresh wieder auf).
  await db.execute('DELETE FROM fact_rilz_lernziele WHERE thema_id = $1', [id])
  // RILZ-Themen, die dieses Thema als Standard referenzieren, entkoppeln.
  await db.execute('UPDATE dim_themen SET standard_thema_id = NULL WHERE standard_thema_id = $1', [id])
  // Lernziele löschen — deren fact_lernziel_status/fact_kommentare cascaden via lernziel_id.
  await db.execute('DELETE FROM dim_lernziele WHERE thema_id = $1', [id])
  // Thema selbst — bridge_klasse_themen & fact_thema_kommentare cascaden via thema_id.
  await db.execute('DELETE FROM dim_themen WHERE id = $1', [id])
}

// ── Lernziele ─────────────────────────────────────────────────────────────────

export const dbSaveLernziel = async (l: Lernziel) => {
  const db = await getDb()
  await upsert(db, 'dim_lernziele', {
    id: l.id, thema_id: l.themaId, kategorie: l.kategorie, label: l.label,
    kriterien: l.kriterien ? JSON.stringify(l.kriterien) : null,
    stufe: l.stufe ? JSON.stringify(l.stufe) : null,
    beschreibung: l.beschreibung ?? null,
  })
}

export const dbDeleteLernziel = async (id: string) => {
  const db = await getDb()
  await db.execute('DELETE FROM dim_lernziele WHERE id = $1', [id])
}

// ── Prüfungen ─────────────────────────────────────────────────────────────────

export const dbSavePruefung = async (p: Pruefung) => {
  const db = await getDb()
  await upsert(db, 'fact_pruefungen', {
    id: p.id, klasse_id: p.klasseId, fach_id: p.fachId,
    name: p.name, datum: p.datum,
    lernziel_ids: JSON.stringify(p.lernzielIds),
    typ: p.typ,
    beschreibung: p.beschreibung ?? null,
    status: p.status,
    punkte_enabled: toInt(p.punkteEnabled),
    note_enabled: toInt(p.noteEnabled),
    anhang_enabled: toInt(p.anhangEnabled),
    max_punkte: p.maxPunkte ?? null,
    erstellt_von_id: p.erstelltVonId ?? null,
    nur_rilz: toInt(p.nurRilz),
    rilz_schueler_ids: JSON.stringify(p.rilzSchuelerIds),
  })
}

export const dbDeletePruefung = async (id: string) => {
  const db = await getDb()
  await db.execute('DELETE FROM fact_pruefungen WHERE id = $1', [id])
}

export const dbSavePruefungErgebnis = async (e: PruefungErgebnis) => {
  const db = await getDb()
  await upsert(db, 'fact_pruefung_ergebnisse', {
    id: e.id, pruefung_id: e.pruefungId, schueler_id: e.schuelerId,
    punkte: e.punkte ?? null,
    note: e.note ?? null,
    anzahl_versuche: e.anzahlVersuche,
    zweiter_versuch_ausstehend: toInt(e.zweiterVersuchAusstehend),
    abgeschlossen: toInt(e.abgeschlossen),
    versuch_snapshots: JSON.stringify(e.versuchSnapshots),
    kommentar: e.kommentar ?? null,
    anhang_urls: JSON.stringify(e.anhangUrls),
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
