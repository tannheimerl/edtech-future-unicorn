'use server'

import { supabaseAdmin } from '@/lib/supabase-server'
import { getCurrentTenantId } from './db-read'
import type { Fach, Thema, Lernziel, Klasse, Schueler, AssessmentKommentar, ThemaKommentar, RilzLernziel, Status, Pruefung, PruefungErgebnis, KlasseBeurteilungSettings, TagKategorie } from '@/types/domain'

// ── Helpers ──────────────────────────────────────────────────────────────────

function log(label: string, error: { message: string } | null) {
  if (error) console.error(`db-write ${label}:`, error.message)
}

// ── Klassen ──────────────────────────────────────────────────────────────────

export async function dbSaveKlasse(klasse: Klasse) {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('dim_klassen').upsert({
    id: klasse.id, name: klasse.name,
    schuljahr: klasse.schuljahr ?? null,
    vorgaenger_klasse_id: klasse.vorgaengerKlasseId ?? null,
    settings: klasse.beurteilungSettings ?? null,
    tenant_id: tenantId,
  }, { onConflict: 'id' })
  log('dbSaveKlasse', error)

  // Sync bridge_klasse_themen
  await supabaseAdmin.from('bridge_klasse_themen')
    .delete().eq('klasse_id', klasse.id).eq('tenant_id', tenantId)
  if (klasse.assignedThemaIds.length > 0) {
    const { error: eKT } = await supabaseAdmin.from('bridge_klasse_themen').insert(
      klasse.assignedThemaIds.map((themaId) => ({ klasse_id: klasse.id, thema_id: themaId, tenant_id: tenantId }))
    )
    log('bridge_klasse_themen insert', eKT)
  }

  // Sync bridge_lp_zuweisungen
  await supabaseAdmin.from('bridge_lp_zuweisungen')
    .delete().eq('klasse_id', klasse.id).eq('tenant_id', tenantId)
  const zuweisungen = klasse.lpZuweisungen ?? []
  if (zuweisungen.length > 0) {
    const { error: eLPZ } = await supabaseAdmin.from('bridge_lp_zuweisungen').insert(
      zuweisungen.map((z) => ({
        klasse_id: klasse.id, lp_id: z.lpId,
        fach_ids: z.fachIds, rolle: z.rolle ?? null, tenant_id: tenantId,
      }))
    )
    log('bridge_lp_zuweisungen insert', eLPZ)
  }
}

export async function dbSaveBeurteilungSettings(klassId: string, settings: KlasseBeurteilungSettings) {
  const { error } = await supabaseAdmin.from('dim_klassen')
    .update({ settings })
    .eq('id', klassId)
  log('dbSaveBeurteilungSettings', error)
}

export async function dbDeleteKlasse(id: string) {
  const { error } = await supabaseAdmin.from('dim_klassen').delete().eq('id', id)
  log('dbDeleteKlasse', error)
}

// ── Schüler ───────────────────────────────────────────────────────────────────

export async function dbSaveSchueler(s: Schueler) {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('dim_schueler').upsert({
    id: s.id, klasse_id: s.klassId,
    vorname: s.vorname, nachname: s.nachname,
    note: s.note ?? '', bvsa: s.bvsa ?? false,
    rilz_fach_ids: s.rilzFachIds ?? [],
    rilz_thema_ids: s.rilzThemaIds ?? [],
    competency_status: s.competencyStatus ?? {},
    lernziel_versuche: s.lernzielVersuche ?? {},
    progress_history: s.progressHistory ?? [],
    tenant_id: tenantId,
  }, { onConflict: 'id' })
  log('dbSaveSchueler', error)
}

export async function dbDeleteSchueler(id: string) {
  const { error } = await supabaseAdmin.from('dim_schueler').delete().eq('id', id)
  log('dbDeleteSchueler', error)
}

// ── Lernziel-Status ───────────────────────────────────────────────────────────

export async function dbSaveLernzielStatus(schueler_id: string, lernziel_id: string, status: Status) {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('fact_lernziel_status').upsert(
    { schueler_id, lernziel_id, status, tenant_id: tenantId },
    { onConflict: 'schueler_id,lernziel_id' }
  )
  log('dbSaveLernzielStatus', error)
}

export async function dbDeleteLernzielStatus(schueler_id: string, lernziel_id: string) {
  const { error } = await supabaseAdmin.from('fact_lernziel_status')
    .delete().eq('schueler_id', schueler_id).eq('lernziel_id', lernziel_id)
  log('dbDeleteLernzielStatus', error)
}

// ── RILZ Lernziele ────────────────────────────────────────────────────────────

export async function dbSaveRilzLernziel(schueler_id: string, rlz: RilzLernziel) {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('fact_rilz_lernziele').upsert(
    { id: rlz.id, schueler_id, thema_id: rlz.themaId, label: rlz.label, status: rlz.status, tenant_id: tenantId },
    { onConflict: 'id' }
  )
  log('dbSaveRilzLernziel', error)
}

export async function dbDeleteRilzLernziel(id: string) {
  const { error } = await supabaseAdmin.from('fact_rilz_lernziele').delete().eq('id', id)
  log('dbDeleteRilzLernziel', error)
}

// ── Kommentare ────────────────────────────────────────────────────────────────

export async function dbSaveKommentar(k: AssessmentKommentar) {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('fact_kommentare').upsert(
    { schueler_id: k.studentId, lernziel_id: k.lernzielId, text: k.text, created_at: k.createdAt, tenant_id: tenantId },
    { onConflict: 'schueler_id,lernziel_id' }
  )
  log('dbSaveKommentar', error)
}

export async function dbDeleteKommentar(studentId: string, lernzielId: string) {
  const { error } = await supabaseAdmin.from('fact_kommentare')
    .delete().eq('schueler_id', studentId).eq('lernziel_id', lernzielId)
  log('dbDeleteKommentar', error)
}

export async function dbSaveThemaKommentar(k: ThemaKommentar) {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('fact_thema_kommentare').upsert(
    { schueler_id: k.studentId, thema_id: k.themaId, text: k.text, updated_at: k.updatedAt, tenant_id: tenantId },
    { onConflict: 'schueler_id,thema_id' }
  )
  log('dbSaveThemaKommentar', error)
}

export async function dbDeleteThemaKommentar(studentId: string, themaId: string) {
  const { error } = await supabaseAdmin.from('fact_thema_kommentare')
    .delete().eq('schueler_id', studentId).eq('thema_id', themaId)
  log('dbDeleteThemaKommentar', error)
}

// ── Fächer ────────────────────────────────────────────────────────────────────

export async function dbSaveFach(f: Fach) {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('dim_faecher').upsert(
    { id: f.id, name: f.name, tenant_id: tenantId }, { onConflict: 'id' }
  )
  log('dbSaveFach', error)
}

export async function dbDeleteFach(id: string) {
  const { error } = await supabaseAdmin.from('dim_faecher').delete().eq('id', id)
  log('dbDeleteFach', error)
}

// ── Themen ────────────────────────────────────────────────────────────────────

export async function dbSaveThema(t: Thema) {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('dim_themen').upsert({
    id: t.id, fach_id: t.fachId, name: t.name,
    typ: t.typ ?? 'standard',
    standard_thema_id: t.standardThemaId ?? null,
    faellig_am: t.faelligAm ?? null,
    stufe: t.stufe ?? null,
    zyklus: t.zyklus ?? null,
    autor: t.autor ?? null,
    autor_lp_id: t.autorLpId ?? null,
    tags: t.tags ?? {},
    tenant_id: tenantId,
  }, { onConflict: 'id' })
  log('dbSaveThema', error)
}

// ── Tag-Kategorien ────────────────────────────────────────────────────────────

export async function dbSaveTagKategorie(kat: TagKategorie) {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('dim_tag_kategorien').upsert({
    id: kat.id, name: kat.name, lp_id: kat.lpId ?? null, tenant_id: tenantId,
  }, { onConflict: 'id' })
  log('dbSaveTagKategorie', error)
}

export async function dbDeleteTagKategorie(id: string) {
  const { error } = await supabaseAdmin.from('dim_tag_kategorien').delete().eq('id', id)
  log('dbDeleteTagKategorie', error)
}

export async function dbDeleteThema(id: string) {
  const { error } = await supabaseAdmin.from('dim_themen').delete().eq('id', id)
  log('dbDeleteThema', error)
}

// ── Lernziele ─────────────────────────────────────────────────────────────────

export async function dbSaveLernziel(l: Lernziel) {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('dim_lernziele').upsert({
    id: l.id, thema_id: l.themaId, kategorie: l.kategorie, label: l.label,
    kriterien: l.kriterien ?? null,
    stufe: l.stufe ?? null,
    beschreibung: l.beschreibung ?? null,
    tenant_id: tenantId,
  }, { onConflict: 'id' })
  log('dbSaveLernziel', error)
}

export async function dbDeleteLernziel(id: string) {
  const { error } = await supabaseAdmin.from('dim_lernziele').delete().eq('id', id)
  log('dbDeleteLernziel', error)
}

// ── Prüfungen ─────────────────────────────────────────────────────────────────

export async function dbSavePruefung(p: Pruefung) {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('fact_pruefungen').upsert({
    id: p.id, klasse_id: p.klasseId, fach_id: p.fachId,
    name: p.name, datum: p.datum,
    lernziel_ids: p.lernzielIds,
    typ: p.typ,
    beschreibung: p.beschreibung ?? null,
    status: p.status,
    punkte_enabled: p.punkteEnabled,
    note_enabled: p.noteEnabled,
    anhang_enabled: p.anhangEnabled,
    max_punkte: p.maxPunkte ?? null,
    erstellt_von_id: p.erstelltVonId ?? null,
    nur_rilz: p.nurRilz,
    rilz_schueler_ids: p.rilzSchuelerIds,
    tenant_id: tenantId,
  }, { onConflict: 'id' })
  log('dbSavePruefung', error)
}

export async function dbDeletePruefung(id: string) {
  const { error } = await supabaseAdmin.from('fact_pruefungen').delete().eq('id', id)
  log('dbDeletePruefung', error)
}

export async function dbSavePruefungErgebnis(e: PruefungErgebnis) {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('fact_pruefung_ergebnisse').upsert({
    id: e.id, pruefung_id: e.pruefungId, schueler_id: e.schuelerId,
    punkte: e.punkte ?? null,
    note: e.note ?? null,
    anzahl_versuche: e.anzahlVersuche,
    zweiter_versuch_ausstehend: e.zweiterVersuchAusstehend,
    abgeschlossen: e.abgeschlossen,
    versuch_snapshots: e.versuchSnapshots,
    kommentar: e.kommentar ?? null,
    anhang_urls: e.anhangUrls,
    status: e.status ?? null,
    tenant_id: tenantId,
  }, { onConflict: 'id' })
  log('dbSavePruefungErgebnis', error)
  return error
}

export async function dbUploadPruefungAnhang(
  pruefungId: string,
  schuelerId: string,
  file: File,
): Promise<string | null> {
  const tenantId = await getCurrentTenantId()
  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${tenantId}/${pruefungId}/${schuelerId}/${crypto.randomUUID()}.${ext}`
  const arrayBuffer = await file.arrayBuffer()
  const { error } = await supabaseAdmin.storage
    .from('lezio-anhaenge')
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false })
  if (error) { log('dbUploadPruefungAnhang', error); return null }
  const { data } = supabaseAdmin.storage.from('lezio-anhaenge').getPublicUrl(path)
  return data.publicUrl
}

export async function dbDeletePruefungAnhang(url: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const prefix = `${supabaseUrl}/storage/v1/object/public/lezio-anhaenge/`
  const path = url.startsWith(prefix) ? url.slice(prefix.length) : url
  const { error } = await supabaseAdmin.storage.from('lezio-anhaenge').remove([path])
  log('dbDeletePruefungAnhang', error)
}
