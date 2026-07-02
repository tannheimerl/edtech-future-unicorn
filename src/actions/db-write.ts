'use server'

import { supabaseAdmin } from '@/lib/supabase-server'
import { getCurrentTenantId } from './db-read'
import type { Fach, Thema, Lernziel, Klasse, Schueler, AssessmentKommentar, ThemaKommentar, RilzLernziel, Status, Pruefung, PruefungErgebnis, KlasseBeurteilungSettings, TagKategorie } from '@/types/domain'

// ── Helpers ──────────────────────────────────────────────────────────────────

const log = (label: string, error: { message: string } | null) => {
  if (error) console.error(`db-write ${label}:`, error.message)
}

// ── Klassen ──────────────────────────────────────────────────────────────────

export const dbSaveKlasse = async (klasse: Klasse) => {
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

export const dbSaveBeurteilungSettings = async (klassId: string, settings: KlasseBeurteilungSettings) => {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('dim_klassen')
    .update({ settings })
    .eq('id', klassId).eq('tenant_id', tenantId)
  log('dbSaveBeurteilungSettings', error)
}

export const dbDeleteKlasse = async (id: string) => {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('dim_klassen').delete().eq('id', id).eq('tenant_id', tenantId)
  log('dbDeleteKlasse', error)
}

// ── Schüler ───────────────────────────────────────────────────────────────────

export const dbSaveSchueler = async (s: Schueler) => {
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

export const dbDeleteSchueler = async (id: string) => {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('dim_schueler').delete().eq('id', id).eq('tenant_id', tenantId)
  log('dbDeleteSchueler', error)
}

// ── Lernziel-Status ───────────────────────────────────────────────────────────

export const dbSaveLernzielStatus = async (schueler_id: string, lernziel_id: string, status: Status) => {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('fact_lernziel_status').upsert(
    { schueler_id, lernziel_id, status, tenant_id: tenantId },
    { onConflict: 'schueler_id,lernziel_id' }
  )
  log('dbSaveLernzielStatus', error)
}

export const dbDeleteLernzielStatus = async (schueler_id: string, lernziel_id: string) => {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('fact_lernziel_status')
    .delete().eq('schueler_id', schueler_id).eq('lernziel_id', lernziel_id).eq('tenant_id', tenantId)
  log('dbDeleteLernzielStatus', error)
}

// ── RILZ Lernziele ────────────────────────────────────────────────────────────

export const dbSaveRilzLernziel = async (schueler_id: string, rlz: RilzLernziel) => {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('fact_rilz_lernziele').upsert(
    { id: rlz.id, schueler_id, thema_id: rlz.themaId, label: rlz.label, status: rlz.status, tenant_id: tenantId },
    { onConflict: 'id' }
  )
  log('dbSaveRilzLernziel', error)
}

export const dbDeleteRilzLernziel = async (id: string) => {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('fact_rilz_lernziele').delete().eq('id', id).eq('tenant_id', tenantId)
  log('dbDeleteRilzLernziel', error)
}

// ── Kommentare ────────────────────────────────────────────────────────────────

export const dbSaveKommentar = async (k: AssessmentKommentar) => {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('fact_kommentare').upsert(
    { schueler_id: k.studentId, lernziel_id: k.lernzielId, text: k.text, created_at: k.createdAt, tenant_id: tenantId },
    { onConflict: 'schueler_id,lernziel_id' }
  )
  log('dbSaveKommentar', error)
}

export const dbDeleteKommentar = async (studentId: string, lernzielId: string) => {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('fact_kommentare')
    .delete().eq('schueler_id', studentId).eq('lernziel_id', lernzielId).eq('tenant_id', tenantId)
  log('dbDeleteKommentar', error)
}

export const dbSaveThemaKommentar = async (k: ThemaKommentar) => {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('fact_thema_kommentare').upsert(
    { schueler_id: k.studentId, thema_id: k.themaId, text: k.text, updated_at: k.updatedAt, tenant_id: tenantId },
    { onConflict: 'schueler_id,thema_id' }
  )
  log('dbSaveThemaKommentar', error)
}

export const dbDeleteThemaKommentar = async (studentId: string, themaId: string) => {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('fact_thema_kommentare')
    .delete().eq('schueler_id', studentId).eq('thema_id', themaId).eq('tenant_id', tenantId)
  log('dbDeleteThemaKommentar', error)
}

// ── Fächer ────────────────────────────────────────────────────────────────────

export const dbSaveFach = async (f: Fach) => {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('dim_faecher').upsert(
    { id: f.id, name: f.name, color_index: f.colorIndex ?? null, tenant_id: tenantId },
    { onConflict: 'id' }
  )
  log('dbSaveFach', error)
}

export const dbDeleteFach = async (id: string) => {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('dim_faecher').delete().eq('id', id).eq('tenant_id', tenantId)
  log('dbDeleteFach', error)
}

// ── Themen ────────────────────────────────────────────────────────────────────

export const dbSaveThema = async (t: Thema) => {
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

export const dbSaveTagKategorie = async (kat: TagKategorie) => {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('dim_tag_kategorien').upsert({
    id: kat.id, name: kat.name, lp_id: kat.lpId ?? null, tenant_id: tenantId,
  }, { onConflict: 'id' })
  log('dbSaveTagKategorie', error)
}

export const dbDeleteTagKategorie = async (id: string) => {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('dim_tag_kategorien').delete().eq('id', id).eq('tenant_id', tenantId)
  log('dbDeleteTagKategorie', error)
}

export const dbDeleteThema = async (id: string) => {
  const tenantId = await getCurrentTenantId()
  // dim_lernziele.thema_id und fact_rilz_lernziele.thema_id haben KEIN
  // ON DELETE CASCADE — diese Kinder müssen zuerst weg, sonst verweigert
  // Postgres das Löschen des Themas (und es taucht nach Refresh wieder auf).
  await supabaseAdmin.from('fact_rilz_lernziele').delete().eq('thema_id', id).eq('tenant_id', tenantId)
  // RILZ-Themen, die dieses Thema als Standard referenzieren, entkoppeln.
  await supabaseAdmin.from('dim_themen').update({ standard_thema_id: null }).eq('standard_thema_id', id).eq('tenant_id', tenantId)
  // Lernziele löschen — deren fact_lernziel_status/fact_kommentare cascaden via lernziel_id.
  await supabaseAdmin.from('dim_lernziele').delete().eq('thema_id', id).eq('tenant_id', tenantId)
  // Thema selbst — bridge_klasse_themen & fact_thema_kommentare cascaden via thema_id.
  const { error } = await supabaseAdmin.from('dim_themen').delete().eq('id', id).eq('tenant_id', tenantId)
  log('dbDeleteThema', error)
  return error
}

// ── Lernziele ─────────────────────────────────────────────────────────────────

export const dbSaveLernziel = async (l: Lernziel) => {
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

export const dbDeleteLernziel = async (id: string) => {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('dim_lernziele').delete().eq('id', id).eq('tenant_id', tenantId)
  log('dbDeleteLernziel', error)
}

// ── Prüfungen ─────────────────────────────────────────────────────────────────

export const dbSavePruefung = async (p: Pruefung) => {
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

export const dbDeletePruefung = async (id: string) => {
  const tenantId = await getCurrentTenantId()
  const { error } = await supabaseAdmin.from('fact_pruefungen').delete().eq('id', id).eq('tenant_id', tenantId)
  log('dbDeletePruefung', error)
}

export const dbSavePruefungErgebnis = async (e: PruefungErgebnis) => {
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

export const dbUploadPruefungAnhang = async (
  pruefungId: string,
  schuelerId: string,
  file: File,
): Promise<string | null> => {
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

export const dbDeletePruefungAnhang = async (url: string): Promise<void> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const prefix = `${supabaseUrl}/storage/v1/object/public/lezio-anhaenge/`
  const path = url.startsWith(prefix) ? url.slice(prefix.length) : url
  const { error } = await supabaseAdmin.storage.from('lezio-anhaenge').remove([path])
  log('dbDeletePruefungAnhang', error)
}
