'use server'

import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-server'
import { resolveTenantId, TENANT_COOKIE } from '@/lib/tenants'
import type {
  Fach, Thema, Lernziel, LernzielKategorie, Lehrperson,
  Klasse, KlasseBeurteilungSettings, Schueler, AssessmentKommentar, ThemaKommentar,
  Pruefung, PruefungErgebnis, VersuchSnapshot, Status,
} from '@/types/domain'

export async function getCurrentTenantId(): Promise<string> {
  const cookieStore = await cookies()
  return resolveTenantId(cookieStore.get(TENANT_COOKIE)?.value)
}

export async function fetchAllData() {
  const tenantId = await getCurrentTenantId()
  const tenants = ['shared', tenantId]

  const [
    { data: dbFaecher,          error: e1 },
    { data: dbThemen,           error: e2 },
    { data: dbLernziele,        error: e3 },
    { data: dbLehrpersonen,     error: e4 },
    { data: dbKlassen,          error: e5 },
    { data: dbKlasseThemen,     error: e6 },
    { data: dbLpZuweisungen,    error: e7 },
    { data: dbSchueler,         error: e8 },
    { data: dbLernzielStatus,   error: e9 },
    { data: dbRilzLernziele,    error: e10 },
    { data: dbKommentare,       error: e11 },
    { data: dbThemaKommentare,  error: e12 },
    { data: dbPruefungen,       error: e13 },
    { data: dbPruefungErg,      error: e14 },
  ] = await Promise.all([
    supabaseAdmin.from('dim_faecher').select('*').in('tenant_id', tenants),
    supabaseAdmin.from('dim_themen').select('*').in('tenant_id', tenants),
    supabaseAdmin.from('dim_lernziele').select('*').in('tenant_id', tenants),
    supabaseAdmin.from('dim_lehrpersonen').select('*').in('tenant_id', tenants),
    supabaseAdmin.from('dim_klassen').select('*').in('tenant_id', tenants),
    supabaseAdmin.from('bridge_klasse_themen').select('*').in('tenant_id', tenants),
    supabaseAdmin.from('bridge_lp_zuweisungen').select('*').in('tenant_id', tenants),
    supabaseAdmin.from('dim_schueler').select('*').in('tenant_id', tenants),
    supabaseAdmin.from('fact_lernziel_status').select('*').in('tenant_id', tenants),
    supabaseAdmin.from('fact_rilz_lernziele').select('*').in('tenant_id', tenants),
    supabaseAdmin.from('fact_kommentare').select('*').in('tenant_id', tenants),
    supabaseAdmin.from('fact_thema_kommentare').select('*').in('tenant_id', tenants),
    supabaseAdmin.from('fact_pruefungen').select('*').eq('tenant_id', tenantId),
    supabaseAdmin.from('fact_pruefung_ergebnisse').select('*').eq('tenant_id', tenantId),
  ])

  for (const [label, err] of [
    ['dim_faecher', e1], ['dim_themen', e2], ['dim_lernziele', e3],
    ['dim_lehrpersonen', e4], ['dim_klassen', e5], ['bridge_klasse_themen', e6],
    ['bridge_lp_zuweisungen', e7], ['dim_schueler', e8], ['fact_lernziel_status', e9],
    ['fact_rilz_lernziele', e10], ['fact_kommentare', e11], ['fact_thema_kommentare', e12],
    ['fact_pruefungen', e13], ['fact_pruefung_ergebnisse', e14],
  ] as const) {
    if (err) console.error(`fetchAllData ${label}:`, err.message)
  }

  const faecher: Fach[] = (dbFaecher ?? []).map((f) => ({ id: f.id, name: f.name }))

  const themen: Thema[] = (dbThemen ?? []).map((t) => ({
    id: t.id, fachId: t.fach_id, name: t.name,
    ...(t.typ ? { typ: t.typ as 'standard' | 'rilz' } : {}),
    ...(t.standard_thema_id ? { standardThemaId: t.standard_thema_id } : {}),
    ...(t.faellig_am ? { faelligAm: t.faellig_am } : {}),
    ...(t.stufe ? { stufe: t.stufe } : {}),
    ...(t.zyklus ? { zyklus: t.zyklus } : {}),
    ...(t.autor ? { autor: t.autor } : {}),
    ...(t.autor_lp_id ? { autorLpId: t.autor_lp_id } : {}),
  }))

  const lernziele: Lernziel[] = (dbLernziele ?? []).map((l) => ({
    id: l.id, themaId: l.thema_id, kategorie: l.kategorie as LernzielKategorie, label: l.label,
    ...(l.kriterien ? { kriterien: l.kriterien } : {}),
    ...(l.stufe ? { stufe: l.stufe } : {}),
    ...(l.beschreibung ? { beschreibung: l.beschreibung } : {}),
  }))

  const lehrpersonen: Lehrperson[] = (dbLehrpersonen ?? []).map((lp) => ({
    id: lp.id, name: lp.name, kuerzel: lp.kuerzel,
  }))

  const classes: Klasse[] = (dbKlassen ?? []).map((k) => ({
    id: k.id, name: k.name,
    ...(k.schuljahr ? { schuljahr: k.schuljahr } : {}),
    ...(k.vorgaenger_klasse_id ? { vorgaengerKlasseId: k.vorgaenger_klasse_id } : {}),
    assignedThemaIds: (dbKlasseThemen ?? [])
      .filter((kt) => kt.klasse_id === k.id)
      .map((kt) => kt.thema_id),
    lpZuweisungen: (dbLpZuweisungen ?? [])
      .filter((z) => z.klasse_id === k.id)
      .map((z) => ({ lpId: z.lp_id, fachIds: z.fach_ids ?? [], ...(z.rolle ? { rolle: z.rolle } : {}) })),
    ...(k.settings ? { beurteilungSettings: k.settings as KlasseBeurteilungSettings } : {}),
  }))

  const students: Schueler[] = (dbSchueler ?? []).map((s) => ({
    id: s.id, klassId: s.klasse_id,
    vorname: s.vorname, nachname: s.nachname,
    note: s.note ?? '',
    bvsa: s.bvsa ?? false,
    rilzFachIds: s.rilz_fach_ids ?? [],
    rilzThemaIds: s.rilz_thema_ids ?? [],
    competencyStatus: s.competency_status ?? {},
    lernzielStatus: Object.fromEntries(
      (dbLernzielStatus ?? [])
        .filter((ls) => ls.schueler_id === s.id)
        .map((ls) => [ls.lernziel_id, ls.status])
    ),
    lernzielVersuche: s.lernziel_versuche ?? {},
    progressHistory: s.progress_history ?? [],
    rilzLernziele: (dbRilzLernziele ?? [])
      .filter((rl) => rl.schueler_id === s.id)
      .map((rl) => ({ id: rl.id, themaId: rl.thema_id, label: rl.label, status: rl.status })),
  }))

  const kommentare: AssessmentKommentar[] = (dbKommentare ?? []).map((k) => ({
    studentId: k.schueler_id, lernzielId: k.lernziel_id, text: k.text, createdAt: k.created_at,
  }))

  const themaKommentare: ThemaKommentar[] = (dbThemaKommentare ?? []).map((k) => ({
    studentId: k.schueler_id, themaId: k.thema_id, text: k.text, updatedAt: k.updated_at,
  }))

  const pruefungen: Pruefung[] = (dbPruefungen ?? []).map((p) => ({
    id: p.id, klasseId: p.klasse_id, fachId: p.fach_id,
    name: p.name, datum: p.datum,
    lernzielIds: p.lernziel_ids ?? [],
    typ: (p.typ ?? 'pruefung_schriftlich') as Pruefung['typ'],
    ...(p.beschreibung ? { beschreibung: p.beschreibung } : {}),
    status: (p.status ?? 'laufend') as Pruefung['status'],
    punkteEnabled: p.punkte_enabled ?? false,
    noteEnabled: p.note_enabled ?? false,
    anhangEnabled: p.anhang_enabled ?? false,
    ...(p.max_punkte != null ? { maxPunkte: p.max_punkte } : {}),
    ...(p.erstellt_von_id ? { erstelltVonId: p.erstellt_von_id } : {}),
    nurRilz: p.nur_rilz ?? false,
    rilzSchuelerIds: p.rilz_schueler_ids ?? [],
    tenantId: p.tenant_id, createdAt: p.created_at,
  }))

  const pruefungErgebnisse: PruefungErgebnis[] = (dbPruefungErg ?? []).map((e) => ({
    id: e.id, pruefungId: e.pruefung_id, schuelerId: e.schueler_id,
    ...(e.punkte != null ? { punkte: e.punkte } : {}),
    ...(e.note ? { note: e.note } : {}),
    anzahlVersuche: e.anzahl_versuche ?? 1,
    zweiterVersuchAusstehend: e.zweiter_versuch_ausstehend ?? false,
    abgeschlossen: e.abgeschlossen ?? false,
    versuchSnapshots: (e.versuch_snapshots as VersuchSnapshot[]) ?? [],
    ...(e.kommentar ? { kommentar: e.kommentar } : {}),
    anhangUrls: e.anhang_urls ?? [],
    ...(e.status ? { status: e.status as Status } : {}),
    tenantId: e.tenant_id, createdAt: e.created_at,
  }))

  return { faecher, themen, lernziele, lehrpersonen, classes, students, kommentare, themaKommentare, pruefungen, pruefungErgebnisse }
}
