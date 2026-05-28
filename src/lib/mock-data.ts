import type { Klasse, Schueler, Kompetenz, Fach, Thema, Lernziel } from '@/types/domain'

export const SEED_COMPETENCIES: Kompetenz[] = [
  { id: 'c1', label: 'Mathematische Grundlagen' },
  { id: 'c2', label: 'Leseverstehen' },
  { id: 'c3', label: 'Problemlösekompetenz' },
  { id: 'c4', label: 'Mündliche Kommunikation' },
  { id: 'c5', label: 'Schriftlicher Ausdruck' },
  { id: 'c6', label: 'Kooperationsfähigkeit' },
]

export const SEED_FAECHER: Fach[] = [
  { id: 'f1', name: 'Deutsch' },
  { id: 'f2', name: 'Mathematik' },
  { id: 'f3', name: 'NMG' },
  { id: 'f4', name: 'Französisch' },
]

export const SEED_THEMEN: Thema[] = [
  // Deutsch
  { id: 'tde1', fachId: 'f1', name: 'Lesen – Sach- und Gebrauchstexte', faelligAm: '2026-04-11' },
  { id: 'tde2', fachId: 'f1', name: 'Schreiben – Texte verfassen',        faelligAm: '2026-05-09' },
  { id: 'tde3', fachId: 'f1', name: 'Sprechen und Zuhören',               faelligAm: '2026-03-28' },
  { id: 'tde4', fachId: 'f1', name: 'Rechtschreibung und Grammatik',      faelligAm: '2026-04-25' },
  // Mathematik
  { id: 'tma1', fachId: 'f2', name: 'Zahlen und Operationen',             faelligAm: '2026-03-14' },
  { id: 'tma2', fachId: 'f2', name: 'Geometrie',                          faelligAm: '2026-04-11' },
  { id: 'tma3', fachId: 'f2', name: 'Grössen, Daten und Zufall',         faelligAm: '2026-05-09' },
  { id: 'tma4', fachId: 'f2', name: 'Terme und Gleichungen',              faelligAm: '2026-05-23' },
  // NMG
  { id: 'tnm1', fachId: 'f3', name: 'Lebewesen und Lebensräume',          faelligAm: '2026-04-25' },
  { id: 'tnm2', fachId: 'f3', name: 'Körper und Gesundheit',              faelligAm: '2026-03-28' },
  { id: 'tnm3', fachId: 'f3', name: 'Schweiz – Raum und Geschichte',      faelligAm: '2026-05-09' },
  { id: 'tnm4', fachId: 'f3', name: 'Wirtschaft und Arbeit',              faelligAm: '2026-05-23' },
  // Französisch
  { id: 'tfr1', fachId: 'f4', name: 'Hören und Sprechen',                 faelligAm: '2026-04-11' },
  { id: 'tfr2', fachId: 'f4', name: 'Lesen',                              faelligAm: '2026-05-09' },
  // faelligAm in der Zukunft → wird aus Analytik ausgeschlossen (Demo)
  { id: 'tfr3', fachId: 'f4', name: 'Schreiben',                          faelligAm: '2026-06-20' },
]

export const SEED_LERNZIELE: Lernziel[] = [
  // tde1 – Lesen
  { id: 'lde1a', themaId: 'tde1', label: 'Texte flüssig und sinngebend vorlesen' },
  { id: 'lde1b', themaId: 'tde1', label: 'Hauptaussage und wesentliche Details eines Textes verstehen' },
  { id: 'lde1c', themaId: 'tde1', label: 'Informationen aus Sachtexten entnehmen' },
  { id: 'lde1d', themaId: 'tde1', label: 'Schlussfolgerungen aus Texten ziehen' },
  // tde2 – Schreiben
  { id: 'lde2a', themaId: 'tde2', label: 'Texte strukturiert und verständlich aufschreiben' },
  { id: 'lde2b', themaId: 'tde2', label: 'Eigene Erlebnisse und Meinungen schriftlich ausdrücken' },
  { id: 'lde2c', themaId: 'tde2', label: 'Texte überarbeiten und verbessern' },
  // tde3 – Sprechen
  { id: 'lde3a', themaId: 'tde3', label: 'Verständlich und deutlich sprechen' },
  { id: 'lde3b', themaId: 'tde3', label: 'Zuhören und das Gehörte zusammenfassen' },
  { id: 'lde3c', themaId: 'tde3', label: 'An Gesprächen sachlich und respektvoll teilnehmen' },
  // tde4 – Rechtschreibung
  { id: 'lde4a', themaId: 'tde4', label: 'Sätze grammatikalisch korrekt bilden' },
  { id: 'lde4b', themaId: 'tde4', label: 'Häufige Wörter fehlerfrei schreiben' },
  { id: 'lde4c', themaId: 'tde4', label: 'Wortarten erkennen und anwenden' },
  // tma1 – Zahlen
  { id: 'lma1a', themaId: 'tma1', label: 'Zahlen bis 1 000 000 lesen, schreiben und ordnen' },
  { id: 'lma1b', themaId: 'tma1', label: 'Schriftlich addieren und subtrahieren' },
  { id: 'lma1c', themaId: 'tma1', label: 'Schriftlich multiplizieren und dividieren' },
  { id: 'lma1d', themaId: 'tma1', label: 'Brüche und Dezimalzahlen verstehen und vergleichen' },
  // tma2 – Geometrie
  { id: 'lma2a', themaId: 'tma2', label: 'Dreiecke und Vierecke benennen und Eigenschaften beschreiben' },
  { id: 'lma2b', themaId: 'tma2', label: 'Umfang und Flächeninhalt berechnen' },
  { id: 'lma2c', themaId: 'tma2', label: 'Symmetrien und Spiegelungen erkennen und beschreiben' },
  // tma3 – Grössen
  { id: 'lma3a', themaId: 'tma3', label: 'Grössen messen und umrechnen (Länge, Masse, Zeit)' },
  { id: 'lma3b', themaId: 'tma3', label: 'Diagramme und Tabellen lesen und erstellen' },
  { id: 'lma3c', themaId: 'tma3', label: 'Sachaufgaben lösen und den Rechenweg aufzeigen' },
  // tma4 – Algebra
  { id: 'lma4a', themaId: 'tma4', label: 'Variable und Terme verstehen und notieren' },
  { id: 'lma4b', themaId: 'tma4', label: 'Einfache Gleichungen aufstellen und lösen' },
  // tnm1 – Lebewesen
  { id: 'lnm1a', themaId: 'tnm1', label: 'Tiere und Pflanzen in ihren Lebensräumen beschreiben' },
  { id: 'lnm1b', themaId: 'tnm1', label: 'Nahrungsbeziehungen und Ökosysteme erklären' },
  { id: 'lnm1c', themaId: 'tnm1', label: 'Anpassungen von Lebewesen an Lebensräume vergleichen' },
  // tnm2 – Körper
  { id: 'lnm2a', themaId: 'tnm2', label: 'Wichtige Körperorgane und ihre Funktionen beschreiben' },
  { id: 'lnm2b', themaId: 'tnm2', label: 'Massnahmen zur Gesundheitsförderung begründen' },
  // tnm3 – Schweiz
  { id: 'lnm3a', themaId: 'tnm3', label: 'Wichtige Ereignisse der Schweizer Geschichte einordnen' },
  { id: 'lnm3b', themaId: 'tnm3', label: 'Karten lesen und geografische Merkmale der Schweiz beschreiben' },
  { id: 'lnm3c', themaId: 'tnm3', label: 'Politische Grundstrukturen der Schweiz erläutern' },
  // tnm4 – Wirtschaft
  { id: 'lnm4a', themaId: 'tnm4', label: 'Einfache wirtschaftliche Zusammenhänge verstehen' },
  { id: 'lnm4b', themaId: 'tnm4', label: 'Berufsbilder und Berufswahl beschreiben' },
  // tfr1 – Hören/Sprechen
  { id: 'lfr1a', themaId: 'tfr1', label: 'Einfache Sätze und Anweisungen auf Französisch verstehen' },
  { id: 'lfr1b', themaId: 'tfr1', label: 'Sich vorstellen und über den Alltag auf Französisch berichten' },
  { id: 'lfr1c', themaId: 'tfr1', label: 'Auf Fragen zu vertrauten Themen antworten' },
  // tfr2 – Lesen
  { id: 'lfr2a', themaId: 'tfr2', label: 'Einfache Texte sinnverstehend lesen' },
  { id: 'lfr2b', themaId: 'tfr2', label: 'Bekannte Ausdrücke und Wörter in Texten erkennen' },
  // tfr3 – Schreiben (noch nicht fällig)
  { id: 'lfr3a', themaId: 'tfr3', label: 'Einfache Sätze korrekt auf Französisch aufschreiben' },
  { id: 'lfr3b', themaId: 'tfr3', label: 'Eine kurze Mitteilung oder Postkarte auf Französisch verfassen' },
]

// ── Klassen ───────────────────────────────────────────────────────────────────
// k1 (5a): Deutsch Lesen+Schreiben · Mathe Zahlen+Geometrie · NMG Lebewesen
// k2 (6b): Deutsch Sprechen+Rechtschreibung · Mathe Zahlen+Grössen · NMG Körper+Schweiz
// k3 (7c): Deutsch Schreiben · Mathe Algebra · NMG Schweiz+Wirtschaft · Französisch alle

export const SEED_CLASSES: Klasse[] = [
  { id: 'k1', name: '5a', assignedThemenIds: ['tde1', 'tde2', 'tma1', 'tma2', 'tnm1'] },
  { id: 'k2', name: '6b', assignedThemenIds: ['tde3', 'tde4', 'tma1', 'tma3', 'tnm2', 'tnm3'] },
  { id: 'k3', name: '7c', assignedThemenIds: ['tde2', 'tma4', 'tnm3', 'tnm4', 'tfr1', 'tfr2', 'tfr3'] },
]

// ── Schüler ────────────────────────────────────────────────────────────────────
// Legende competencyStatus: c1 Mathe · c2 Lesen · c3 Problemlösen · c4 Mündlich · c5 Schreiben · c6 Kooperation

// ── 12-week progress history generator ───────────────────────────────────────
// Simulates realistic semester progression:
//   - First ~55% of LZ (early themen) are introduced from week 1
//   - Remaining ~45% (new themen) arrive at week LATE_INTRO → causes a % dip
//     because the denominator grows while the student hasn't learned them yet
//   - Each batch progresses independently toward the final lernzielStatus

const HISTORY_DATES: string[] = [
  '2026-02-06', '2026-02-13', '2026-02-20', '2026-02-27',  // KW 6–9
  '2026-03-06', '2026-03-13', '2026-03-20', '2026-03-27',  // KW 10–13
  '2026-04-03', '2026-04-10', '2026-04-17', '2026-04-24',  // KW 14–17
]

const LATE_INTRO = 4  // week index (0-based) when the second batch is introduced ≈ KW 10

function generateHistory(
  finalStatus: Record<string, Status>,
  seed: number,
): import('@/types/domain').StatusSnapshot[] {
  const allIds    = Object.keys(finalStatus)
  const toReach   = allIds.filter(id => finalStatus[id] === 'reached')
  const toPartial = allIds.filter(id => finalStatus[id] === 'partially_reached')
  const N = HISTORY_DATES.length

  let s = ((seed * 1664525 + 1013904223) | 0) >>> 0
  const rng = () => { s = ((s * 1664525 + 1013904223) | 0) >>> 0; return s / 0x100000000 }

  // Split all LZ into early (~55%) and late (~45%) batches by position
  const splitAt  = Math.ceil(allIds.length * 0.55)
  const earlySet = new Set(allIds.slice(0, splitAt))

  const partialAt: Record<string, number> = {}
  const reachAt:   Record<string, number> = {}

  // Early batch: ALL progress must start before LATE_INTRO (partialAt ≤ LATE_INTRO-1)
  // so they are established in the chart BEFORE the denominator expands — creating a
  // visible dip when late LZ are added at LATE_INTRO
  const earlyReach   = toReach.filter(id =>  earlySet.has(id))
  const earlyPartial = toPartial.filter(id => earlySet.has(id))
  earlyReach.forEach((id, i) => {
    const base = Math.floor((i / Math.max(1, earlyReach.length)) * LATE_INTRO)
    partialAt[id] = Math.max(0, Math.min(LATE_INTRO - 1, base + Math.floor(rng() * 2)))
    reachAt[id]   = Math.min(N - 1, partialAt[id] + 2 + Math.floor(rng() * 4))
  })
  earlyPartial.forEach((id, i) => {
    const base = Math.floor(1 + (i / Math.max(1, earlyPartial.length)) * (LATE_INTRO - 1))
    partialAt[id] = Math.min(LATE_INTRO - 1, base + Math.floor(rng() * 2))
  })

  // Late batch: starts 2 weeks AFTER LATE_INTRO → creates a visible dip window (weeks 4-5)
  // during which the denominator has grown but late LZ haven't been learned yet
  const lateReach   = toReach.filter(id =>  !earlySet.has(id))
  const latePartial = toPartial.filter(id => !earlySet.has(id))
  lateReach.forEach((id, i) => {
    const span = Math.max(1, N - LATE_INTRO - 4)
    const base = LATE_INTRO + 2 + Math.floor((i / Math.max(1, lateReach.length)) * span)
    partialAt[id] = Math.min(N - 2, base + Math.floor(rng() * 2))
    reachAt[id]   = Math.min(N - 1, partialAt[id] + 2 + Math.floor(rng() * 3))
  })
  latePartial.forEach((id, i) => {
    const span = Math.max(1, N - LATE_INTRO - 3)
    const base = LATE_INTRO + 2 + Math.floor((i / Math.max(1, latePartial.length)) * span)
    partialAt[id] = Math.min(N - 1, base + Math.floor(rng() * 2))
  })

  const earlyIds = allIds.filter(id => earlySet.has(id))

  return HISTORY_DATES.map((date, wi) => {
    const lernzielStatus: Record<string, Status> = {}
    for (const id of toReach) {
      if      (wi >= reachAt[id])   lernzielStatus[id] = 'reached'
      else if (wi >= partialAt[id]) lernzielStatus[id] = 'partially_reached'
    }
    for (const id of toPartial) {
      if (wi >= partialAt[id]) lernzielStatus[id] = 'partially_reached'
    }
    // Before LATE_INTRO: denominator is only the early batch → causes a visible dip when late LZ are added
    const activeLzIds = wi < LATE_INTRO ? earlyIds : undefined
    return { date, lernzielStatus, ...(activeLzIds ? { activeLzIds } : {}) }
  })
}

export const SEED_STUDENTS: Schueler[] = [

  // ════════════════════════════════════════════════════════════════════════════
  // 5a – k1   LZ-Pool: lde1a-d  lde2a-c  lma1a-d  lma2a-c  lnm1a-c
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 's1', klassId: 'k1', name: 'Emma',
    note: 'Sehr engagiert, braucht Unterstützung in Mathematik.',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'not_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached',           lde1b: 'reached',           lde1c: 'partially_reached', lde1d: 'partially_reached',
      lde2a: 'reached',           lde2b: 'partially_reached', lde2c: 'not_reached',
      lma1a: 'partially_reached', lma1b: 'partially_reached', lma1c: 'not_reached',        lma1d: 'not_reached',
      lma2a: 'partially_reached', lma2b: 'not_reached',        lma2c: 'partially_reached',
      lnm1a: 'reached',           lnm1b: 'reached',           lnm1c: 'partially_reached',
    },
  },

  {
    id: 's2', klassId: 'k1', name: 'Luca',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached', lde1b: 'reached', lde1c: 'reached',           lde1d: 'reached',
      lde2a: 'reached', lde2b: 'reached', lde2c: 'partially_reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached',           lma1d: 'partially_reached',
      lma2a: 'reached', lma2b: 'reached', lma2c: 'reached',
      lnm1a: 'reached', lnm1b: 'reached', lnm1c: 'reached',
    },
  },

  {
    id: 's3', klassId: 'k1', name: 'Mia',
    note: 'Zeigt grosses Interesse an Naturwissenschaften.',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde1a: 'partially_reached', lde1b: 'not_reached', lde1c: 'not_reached', lde1d: 'not_reached',
      lde2a: 'partially_reached', lde2b: 'not_reached', lde2c: 'not_reached',
      lma1a: 'not_reached',        lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma2a: 'not_reached',        lma2b: 'not_reached', lma2c: 'not_reached',
      lnm1a: 'partially_reached',  lnm1b: 'not_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's4', klassId: 'k1', name: 'Noah',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached',           lde1b: 'reached',           lde1c: 'partially_reached', lde1d: 'partially_reached',
      lde2a: 'reached',           lde2b: 'reached',           lde2c: 'partially_reached',
      lma1a: 'reached',           lma1b: 'reached',           lma1c: 'partially_reached', lma1d: 'partially_reached',
      lma2a: 'reached',           lma2b: 'partially_reached', lma2c: 'reached',
      lnm1a: 'reached',           lnm1b: 'partially_reached', lnm1c: 'partially_reached',
    },
  },

  {
    id: 's13', klassId: 'k1', name: 'Leon',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached', lde1b: 'reached', lde1c: 'reached',           lde1d: 'partially_reached',
      lde2a: 'reached', lde2b: 'reached', lde2c: 'partially_reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'partially_reached', lma1d: 'not_reached',
      lma2a: 'reached', lma2b: 'reached', lma2c: 'reached',
      lnm1a: 'reached', lnm1b: 'partially_reached', lnm1c: 'partially_reached',
    },
  },

  {
    id: 's14', klassId: 'k1', name: 'Anna',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde1a: 'reached',           lde1b: 'partially_reached', lde1c: 'partially_reached', lde1d: 'not_reached',
      lde2a: 'reached',           lde2b: 'partially_reached', lde2c: 'not_reached',
      lma1a: 'partially_reached', lma1b: 'partially_reached', lma1c: 'not_reached',        lma1d: 'not_reached',
      lma2a: 'partially_reached', lma2b: 'not_reached',        lma2c: 'partially_reached',
      lnm1a: 'reached',           lnm1b: 'partially_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's15', klassId: 'k1', name: 'Paul',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'partially_reached', c4: 'not_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde1a: 'not_reached', lde1b: 'not_reached', lde1c: 'not_reached', lde1d: 'not_reached',
      lde2a: 'not_reached', lde2b: 'not_reached', lde2c: 'not_reached',
      lma1a: 'partially_reached', lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma2a: 'not_reached', lma2b: 'not_reached', lma2c: 'not_reached',
      lnm1a: 'not_reached', lnm1b: 'not_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's16', klassId: 'k1', name: 'Sophia',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached', lde1b: 'reached', lde1c: 'reached', lde1d: 'reached',
      lde2a: 'reached', lde2b: 'reached', lde2c: 'reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached', lma1d: 'reached',
      lma2a: 'reached', lma2b: 'reached', lma2c: 'reached',
      lnm1a: 'reached', lnm1b: 'reached', lnm1c: 'reached',
    },
  },

  {
    id: 's17', klassId: 'k1', name: 'Finn',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'not_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'partially_reached', lde1b: 'not_reached', lde1c: 'not_reached', lde1d: 'not_reached',
      lde2a: 'not_reached',        lde2b: 'not_reached', lde2c: 'not_reached',
      lma1a: 'partially_reached',  lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma2a: 'not_reached',        lma2b: 'not_reached', lma2c: 'not_reached',
      lnm1a: 'partially_reached',  lnm1b: 'not_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's18', klassId: 'k1', name: 'Lena',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached',           lde1b: 'reached',           lde1c: 'partially_reached', lde1d: 'partially_reached',
      lde2a: 'reached',           lde2b: 'partially_reached', lde2c: 'not_reached',
      lma1a: 'reached',           lma1b: 'reached',           lma1c: 'partially_reached', lma1d: 'not_reached',
      lma2a: 'reached',           lma2b: 'partially_reached', lma2c: 'partially_reached',
      lnm1a: 'reached',           lnm1b: 'partially_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's19', klassId: 'k1', name: 'Max',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached', lde1b: 'reached', lde1c: 'reached',           lde1d: 'reached',
      lde2a: 'reached', lde2b: 'reached', lde2c: 'reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached',           lma1d: 'reached',
      lma2a: 'reached', lma2b: 'reached', lma2c: 'reached',
      lnm1a: 'reached', lnm1b: 'reached', lnm1c: 'partially_reached',
    },
  },

  {
    id: 's20', klassId: 'k1', name: 'Julia',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde1a: 'partially_reached', lde1b: 'partially_reached', lde1c: 'partially_reached', lde1d: 'not_reached',
      lde2a: 'partially_reached', lde2b: 'partially_reached', lde2c: 'not_reached',
      lma1a: 'partially_reached', lma1b: 'partially_reached', lma1c: 'not_reached',        lma1d: 'not_reached',
      lma2a: 'partially_reached', lma2b: 'not_reached',        lma2c: 'partially_reached',
      lnm1a: 'partially_reached', lnm1b: 'partially_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's21', klassId: 'k1', name: 'Luis',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'reached', c5: 'not_reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'not_reached',       lde1b: 'not_reached', lde1c: 'not_reached', lde1d: 'not_reached',
      lde2a: 'partially_reached', lde2b: 'not_reached', lde2c: 'not_reached',
      lma1a: 'not_reached',       lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma2a: 'not_reached',       lma2b: 'not_reached', lma2c: 'not_reached',
      lnm1a: 'partially_reached', lnm1b: 'not_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's22', klassId: 'k1', name: 'Sarah',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached',           lde1b: 'reached',           lde1c: 'reached',           lde1d: 'partially_reached',
      lde2a: 'reached',           lde2b: 'reached',           lde2c: 'partially_reached',
      lma1a: 'reached',           lma1b: 'reached',           lma1c: 'partially_reached', lma1d: 'partially_reached',
      lma2a: 'reached',           lma2b: 'partially_reached', lma2c: 'reached',
      lnm1a: 'reached',           lnm1b: 'reached',           lnm1c: 'partially_reached',
    },
  },

  {
    id: 's23', klassId: 'k1', name: 'Tim',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'not_reached', c4: 'not_reached', c5: 'not_reached', c6: 'not_reached' },
    lernzielStatus: {
      lde1a: 'not_reached', lde1b: 'not_reached', lde1c: 'not_reached', lde1d: 'not_reached',
      lde2a: 'not_reached', lde2b: 'not_reached', lde2c: 'not_reached',
      lma1a: 'not_reached', lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma2a: 'not_reached', lma2b: 'not_reached', lma2c: 'not_reached',
      lnm1a: 'not_reached', lnm1b: 'not_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's24', klassId: 'k1', name: 'Alina',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde1a: 'reached', lde1b: 'reached', lde1c: 'reached',           lde1d: 'reached',
      lde2a: 'reached', lde2b: 'reached', lde2c: 'partially_reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached',           lma1d: 'partially_reached',
      lma2a: 'reached', lma2b: 'reached', lma2c: 'reached',
      lnm1a: 'reached', lnm1b: 'reached', lnm1c: 'reached',
    },
  },

  {
    id: 's25', klassId: 'k1', name: 'Julian',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached',           lde1b: 'reached',           lde1c: 'partially_reached', lde1d: 'not_reached',
      lde2a: 'reached',           lde2b: 'partially_reached', lde2c: 'not_reached',
      lma1a: 'reached',           lma1b: 'partially_reached', lma1c: 'not_reached',        lma1d: 'not_reached',
      lma2a: 'reached',           lma2b: 'partially_reached', lma2c: 'reached',
      lnm1a: 'reached',           lnm1b: 'partially_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's26', klassId: 'k1', name: 'Lisa',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'not_reached', c3: 'partially_reached', c4: 'not_reached', c5: 'partially_reached', c6: 'not_reached' },
    lernzielStatus: {
      lde1a: 'partially_reached', lde1b: 'not_reached', lde1c: 'not_reached', lde1d: 'not_reached',
      lde2a: 'not_reached',        lde2b: 'not_reached', lde2c: 'not_reached',
      lma1a: 'not_reached',        lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma2a: 'not_reached',        lma2b: 'not_reached', lma2c: 'not_reached',
      lnm1a: 'partially_reached',  lnm1b: 'not_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's27', klassId: 'k1', name: 'Erik',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached',           lde1b: 'reached',           lde1c: 'reached',           lde1d: 'partially_reached',
      lde2a: 'reached',           lde2b: 'partially_reached', lde2c: 'partially_reached',
      lma1a: 'reached',           lma1b: 'reached',           lma1c: 'reached',           lma1d: 'partially_reached',
      lma2a: 'reached',           lma2b: 'reached',           lma2c: 'partially_reached',
      lnm1a: 'reached',           lnm1b: 'partially_reached', lnm1c: 'partially_reached',
    },
  },

  {
    id: 's28', klassId: 'k1', name: 'Lea',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde1a: 'not_reached', lde1b: 'not_reached', lde1c: 'not_reached', lde1d: 'not_reached',
      lde2a: 'not_reached', lde2b: 'not_reached', lde2c: 'not_reached',
      lma1a: 'not_reached', lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma2a: 'not_reached', lma2b: 'not_reached', lma2c: 'not_reached',
      lnm1a: 'not_reached', lnm1b: 'not_reached', lnm1c: 'not_reached',
    },
  },

  {
    // Negative-trend student: mastered early batch (Deutsch + lma1a-c) perfectly,
    // but all late LZ (lma1d, lma2a-c, lnm1a-c) remain unachieved after the exam →
    // Mathe line drops 100%→43%, NMG stays at 0%
    id: 'sNeg1', klassId: 'k1', name: 'Kevin',
    note: 'War gut gestartet, kommt mit den neuen Themen nicht mit.',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde1a: 'reached', lde1b: 'reached', lde1c: 'reached', lde1d: 'reached',
      lde2a: 'reached', lde2b: 'reached', lde2c: 'reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached',
      lma1d: 'not_reached',
      lma2a: 'not_reached', lma2b: 'not_reached', lma2c: 'not_reached',
      lnm1a: 'not_reached', lnm1b: 'not_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's29', klassId: 'k1', name: 'Philipp',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached',           lde1b: 'reached',           lde1c: 'reached',           lde1d: 'partially_reached',
      lde2a: 'reached',           lde2b: 'reached',           lde2c: 'partially_reached',
      lma1a: 'reached',           lma1b: 'reached',           lma1c: 'partially_reached', lma1d: 'not_reached',
      lma2a: 'reached',           lma2b: 'partially_reached', lma2c: 'reached',
      lnm1a: 'reached',           lnm1b: 'reached',           lnm1c: 'partially_reached',
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 6b – k2   LZ-Pool: lde3a-c  lde4a-c  lma1a-d  lma3a-c  lnm2a-b  lnm3a-c
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 's5', klassId: 'k2', name: 'Sophia',
    note: 'Hat deutliche Fortschritte im Sprechen gemacht.',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached', lde3b: 'reached', lde3c: 'reached',
      lde4a: 'reached', lde4b: 'reached', lde4c: 'reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached', lma1d: 'reached',
      lma3a: 'reached', lma3b: 'reached', lma3c: 'reached',
      lnm2a: 'reached', lnm2b: 'reached',
      lnm3a: 'reached', lnm3b: 'reached', lnm3c: 'reached',
    },
  },

  {
    id: 's6', klassId: 'k2', name: 'Jonas',
    note: 'Braucht mehr Übung bei schriftlichen Aufgaben.',
    competencyStatus: { c1: 'partially_reached', c2: 'not_reached', c3: 'partially_reached', c4: 'reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde3a: 'partially_reached', lde3b: 'not_reached',        lde3c: 'partially_reached',
      lde4a: 'not_reached',        lde4b: 'not_reached',        lde4c: 'not_reached',
      lma1a: 'partially_reached',  lma1b: 'partially_reached',  lma1c: 'not_reached',  lma1d: 'not_reached',
      lma3a: 'not_reached',        lma3b: 'not_reached',        lma3c: 'not_reached',
      lnm2a: 'not_reached',        lnm2b: 'not_reached',
      lnm3a: 'not_reached',        lnm3b: 'not_reached',        lnm3c: 'not_reached',
    },
  },

  {
    id: 's7', klassId: 'k2', name: 'Hannah',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached',           lde3b: 'reached',           lde3c: 'partially_reached',
      lde4a: 'reached',           lde4b: 'partially_reached', lde4c: 'reached',
      lma1a: 'reached',           lma1b: 'reached',           lma1c: 'partially_reached', lma1d: 'not_reached',
      lma3a: 'reached',           lma3b: 'partially_reached', lma3c: 'partially_reached',
      lnm2a: 'reached',           lnm2b: 'reached',
      lnm3a: 'partially_reached', lnm3b: 'partially_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's8', klassId: 'k2', name: 'Ben',
    note: 'Arbeitet sehr gut in Gruppenaufgaben.',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'not_reached', c4: 'reached', c5: 'not_reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached',   lde3b: 'partially_reached', lde3c: 'not_reached',
      lde4a: 'not_reached', lde4b: 'not_reached',      lde4c: 'not_reached',
      lma1a: 'not_reached', lma1b: 'not_reached',      lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'not_reached', lma3b: 'not_reached',      lma3c: 'not_reached',
      lnm2a: 'not_reached', lnm2b: 'partially_reached',
      lnm3a: 'not_reached', lnm3b: 'not_reached',      lnm3c: 'not_reached',
    },
  },

  {
    id: 's9', klassId: 'k2', name: 'Laura',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde3a: 'partially_reached', lde3b: 'partially_reached', lde3c: 'partially_reached',
      lde4a: 'partially_reached', lde4b: 'partially_reached', lde4c: 'not_reached',
      lma1a: 'partially_reached', lma1b: 'partially_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'partially_reached', lma3b: 'not_reached',        lma3c: 'not_reached',
      lnm2a: 'partially_reached', lnm2b: 'partially_reached',
      lnm3a: 'not_reached',        lnm3b: 'not_reached',        lnm3c: 'not_reached',
    },
  },

  {
    id: 's30', klassId: 'k2', name: 'Nico',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached',           lde3b: 'reached',           lde3c: 'reached',
      lde4a: 'reached',           lde4b: 'reached',           lde4c: 'partially_reached',
      lma1a: 'reached',           lma1b: 'reached',           lma1c: 'reached',           lma1d: 'partially_reached',
      lma3a: 'reached',           lma3b: 'reached',           lma3c: 'partially_reached',
      lnm2a: 'reached',           lnm2b: 'reached',
      lnm3a: 'reached',           lnm3b: 'reached',           lnm3c: 'partially_reached',
    },
  },

  {
    id: 's31', klassId: 'k2', name: 'Klara',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached',           lde3b: 'reached',           lde3c: 'partially_reached',
      lde4a: 'partially_reached', lde4b: 'reached',           lde4c: 'partially_reached',
      lma1a: 'partially_reached', lma1b: 'partially_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'reached',           lma3b: 'partially_reached', lma3c: 'partially_reached',
      lnm2a: 'reached',           lnm2b: 'reached',
      lnm3a: 'partially_reached', lnm3b: 'not_reached',        lnm3c: 'not_reached',
    },
  },

  {
    id: 's32', klassId: 'k2', name: 'Simon',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'not_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde3a: 'not_reached', lde3b: 'not_reached', lde3c: 'not_reached',
      lde4a: 'not_reached', lde4b: 'not_reached', lde4c: 'not_reached',
      lma1a: 'not_reached', lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'not_reached', lma3b: 'not_reached', lma3c: 'not_reached',
      lnm2a: 'not_reached', lnm2b: 'not_reached',
      lnm3a: 'not_reached', lnm3b: 'not_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's33', klassId: 'k2', name: 'Lina',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached', lde3b: 'reached', lde3c: 'reached',
      lde4a: 'reached', lde4b: 'reached', lde4c: 'reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached', lma1d: 'reached',
      lma3a: 'reached', lma3b: 'reached', lma3c: 'reached',
      lnm2a: 'reached', lnm2b: 'reached',
      lnm3a: 'reached', lnm3b: 'reached', lnm3c: 'reached',
    },
  },

  {
    id: 's34', klassId: 'k2', name: 'Moritz',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'not_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'not_reached' },
    lernzielStatus: {
      lde3a: 'partially_reached', lde3b: 'not_reached', lde3c: 'not_reached',
      lde4a: 'not_reached',        lde4b: 'not_reached', lde4c: 'not_reached',
      lma1a: 'partially_reached',  lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'not_reached',        lma3b: 'not_reached', lma3c: 'not_reached',
      lnm2a: 'not_reached',        lnm2b: 'not_reached',
      lnm3a: 'not_reached',        lnm3b: 'not_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's35', klassId: 'k2', name: 'Charlotte',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached', lde3b: 'reached', lde3c: 'reached',
      lde4a: 'reached', lde4b: 'reached', lde4c: 'reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached', lma1d: 'partially_reached',
      lma3a: 'reached', lma3b: 'reached', lma3c: 'reached',
      lnm2a: 'reached', lnm2b: 'reached',
      lnm3a: 'reached', lnm3b: 'reached', lnm3c: 'partially_reached',
    },
  },

  {
    id: 's36', klassId: 'k2', name: 'David',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'partially_reached', lde3b: 'not_reached', lde3c: 'not_reached',
      lde4a: 'not_reached',        lde4b: 'not_reached', lde4c: 'not_reached',
      lma1a: 'not_reached',        lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'not_reached',        lma3b: 'not_reached', lma3c: 'not_reached',
      lnm2a: 'not_reached',        lnm2b: 'not_reached',
      lnm3a: 'not_reached',        lnm3b: 'not_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's37', klassId: 'k2', name: 'Isabella',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde3a: 'reached',           lde3b: 'reached',           lde3c: 'reached',
      lde4a: 'reached',           lde4b: 'partially_reached', lde4c: 'reached',
      lma1a: 'reached',           lma1b: 'reached',           lma1c: 'partially_reached', lma1d: 'partially_reached',
      lma3a: 'reached',           lma3b: 'reached',           lma3c: 'partially_reached',
      lnm2a: 'reached',           lnm2b: 'reached',
      lnm3a: 'reached',           lnm3b: 'partially_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's38', klassId: 'k2', name: 'Daniel',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached',           lde3b: 'partially_reached', lde3c: 'partially_reached',
      lde4a: 'partially_reached', lde4b: 'partially_reached', lde4c: 'reached',
      lma1a: 'partially_reached', lma1b: 'reached',           lma1c: 'partially_reached', lma1d: 'not_reached',
      lma3a: 'reached',           lma3b: 'partially_reached', lma3c: 'partially_reached',
      lnm2a: 'partially_reached', lnm2b: 'reached',
      lnm3a: 'partially_reached', lnm3b: 'partially_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's39', klassId: 'k2', name: 'Antonia',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached', lde3b: 'reached', lde3c: 'reached',
      lde4a: 'reached', lde4b: 'reached', lde4c: 'reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached', lma1d: 'reached',
      lma3a: 'reached', lma3b: 'reached', lma3c: 'partially_reached',
      lnm2a: 'reached', lnm2b: 'reached',
      lnm3a: 'reached', lnm3b: 'reached', lnm3c: 'reached',
    },
  },

  {
    id: 's40', klassId: 'k2', name: 'Michael',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'not_reached', c5: 'partially_reached', c6: 'not_reached' },
    lernzielStatus: {
      lde3a: 'not_reached', lde3b: 'not_reached', lde3c: 'not_reached',
      lde4a: 'not_reached', lde4b: 'not_reached', lde4c: 'not_reached',
      lma1a: 'not_reached', lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'not_reached', lma3b: 'not_reached', lma3c: 'not_reached',
      lnm2a: 'not_reached', lnm2b: 'not_reached',
      lnm3a: 'not_reached', lnm3b: 'not_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's41', klassId: 'k2', name: 'Victoria',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached',           lde3b: 'reached',           lde3c: 'partially_reached',
      lde4a: 'partially_reached', lde4b: 'reached',           lde4c: 'partially_reached',
      lma1a: 'partially_reached', lma1b: 'partially_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'reached',           lma3b: 'partially_reached', lma3c: 'not_reached',
      lnm2a: 'partially_reached', lnm2b: 'reached',
      lnm3a: 'partially_reached', lnm3b: 'partially_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's42', klassId: 'k2', name: 'Stefan',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached',           lde3b: 'reached',           lde3c: 'partially_reached',
      lde4a: 'reached',           lde4b: 'reached',           lde4c: 'partially_reached',
      lma1a: 'reached',           lma1b: 'reached',           lma1c: 'reached',           lma1d: 'partially_reached',
      lma3a: 'reached',           lma3b: 'reached',           lma3c: 'partially_reached',
      lnm2a: 'reached',           lnm2b: 'reached',
      lnm3a: 'reached',           lnm3b: 'partially_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's43', klassId: 'k2', name: 'Amelie',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached', lde3b: 'reached', lde3c: 'reached',
      lde4a: 'reached', lde4b: 'reached', lde4c: 'reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached', lma1d: 'reached',
      lma3a: 'reached', lma3b: 'reached', lma3c: 'reached',
      lnm2a: 'reached', lnm2b: 'reached',
      lnm3a: 'reached', lnm3b: 'reached', lnm3c: 'reached',
    },
  },

  {
    id: 's44', klassId: 'k2', name: 'Jan',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'not_reached', c4: 'not_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde3a: 'not_reached', lde3b: 'not_reached', lde3c: 'not_reached',
      lde4a: 'not_reached', lde4b: 'not_reached', lde4c: 'not_reached',
      lma1a: 'not_reached', lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'not_reached', lma3b: 'not_reached', lma3c: 'not_reached',
      lnm2a: 'not_reached', lnm2b: 'not_reached',
      lnm3a: 'not_reached', lnm3b: 'not_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's45', klassId: 'k2', name: 'Elise',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde3a: 'partially_reached', lde3b: 'partially_reached', lde3c: 'not_reached',
      lde4a: 'partially_reached', lde4b: 'partially_reached', lde4c: 'not_reached',
      lma1a: 'partially_reached', lma1b: 'not_reached',        lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'not_reached',        lma3b: 'not_reached',        lma3c: 'not_reached',
      lnm2a: 'partially_reached',  lnm2b: 'not_reached',
      lnm3a: 'not_reached',        lnm3b: 'not_reached',        lnm3c: 'not_reached',
    },
  },

  {
    // Negative-trend: early Deutsch+Mathe-Basics all mastered, but all late LZ
    // (lma3a-c = Grössen, lnm2a-b, lnm3a-c) failed → Mathe 100%→57%, NMG 0%
    id: 'sNeg2', klassId: 'k2', name: 'Kim',
    note: 'Nach der Prüfung eingebrochen, neue Themenbereiche nicht aufgeholt.',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde3a: 'reached', lde3b: 'reached', lde3c: 'reached',
      lde4a: 'reached', lde4b: 'reached', lde4c: 'reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached', lma1d: 'reached',
      lma3a: 'not_reached', lma3b: 'not_reached', lma3c: 'not_reached',
      lnm2a: 'not_reached', lnm2b: 'not_reached',
      lnm3a: 'not_reached', lnm3b: 'not_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's46', klassId: 'k2', name: 'Tobias',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'not_reached', c3: 'partially_reached', c4: 'reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde3a: 'reached',   lde3b: 'not_reached',       lde3c: 'not_reached',
      lde4a: 'not_reached', lde4b: 'not_reached',     lde4c: 'not_reached',
      lma1a: 'reached',   lma1b: 'reached',           lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'partially_reached', lma3b: 'partially_reached', lma3c: 'not_reached',
      lnm2a: 'not_reached', lnm2b: 'not_reached',
      lnm3a: 'not_reached', lnm3b: 'not_reached',     lnm3c: 'not_reached',
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 7c – k3   LZ-Pool: lde2a-c  lma4a-b  lnm3a-c  lnm4a-b  lfr1a-c  lfr2a-b  lfr3a-b*
  //           (* lfr3 noch nicht fällig → aus Analytik ausgeschlossen)
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 's10', klassId: 'k3', name: 'Felix',
    note: 'Sehr selbstständiges Arbeiten, hilft anderen Schülern.',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached', lde2b: 'reached', lde2c: 'reached',
      lma4a: 'reached', lma4b: 'reached',
      lnm3a: 'reached', lnm3b: 'reached', lnm3c: 'reached',
      lnm4a: 'reached', lnm4b: 'reached',
      lfr1a: 'reached', lfr1b: 'reached', lfr1c: 'reached',
      lfr2a: 'reached', lfr2b: 'reached',
      lfr3a: 'reached', lfr3b: 'reached',
    },
  },

  {
    id: 's11', klassId: 'k3', name: 'Marie',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde2a: 'reached',           lde2b: 'partially_reached', lde2c: 'not_reached',
      lma4a: 'partially_reached', lma4b: 'not_reached',
      lnm3a: 'reached',           lnm3b: 'partially_reached', lnm3c: 'not_reached',
      lnm4a: 'reached',           lnm4b: 'partially_reached',
      lfr1a: 'partially_reached', lfr1b: 'not_reached',        lfr1c: 'not_reached',
      lfr2a: 'partially_reached', lfr2b: 'partially_reached',
      lfr3a: 'not_reached',        lfr3b: 'not_reached',
    },
  },

  {
    id: 's12', klassId: 'k3', name: 'Tom',
    note: 'Zeigt Schwierigkeiten bei der Konzentration.',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'not_reached', c5: 'partially_reached', c6: 'not_reached' },
    lernzielStatus: {
      lde2a: 'not_reached', lde2b: 'not_reached', lde2c: 'not_reached',
      lma4a: 'not_reached', lma4b: 'not_reached',
      lnm3a: 'not_reached', lnm3b: 'not_reached', lnm3c: 'not_reached',
      lnm4a: 'not_reached', lnm4b: 'not_reached',
      lfr1a: 'not_reached', lfr1b: 'not_reached', lfr1c: 'not_reached',
      lfr2a: 'not_reached', lfr2b: 'not_reached',
      lfr3a: 'not_reached', lfr3b: 'not_reached',
    },
  },

  {
    id: 's47', klassId: 'k3', name: 'Luise',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached', lde2b: 'reached', lde2c: 'reached',
      lma4a: 'reached', lma4b: 'reached',
      lnm3a: 'reached', lnm3b: 'reached', lnm3c: 'reached',
      lnm4a: 'reached', lnm4b: 'reached',
      lfr1a: 'reached', lfr1b: 'reached', lfr1c: 'reached',
      lfr2a: 'reached', lfr2b: 'reached',
      lfr3a: 'reached', lfr3b: 'reached',
    },
  },

  {
    id: 's48', klassId: 'k3', name: 'Alexander',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached',           lde2b: 'reached',           lde2c: 'partially_reached',
      lma4a: 'partially_reached', lma4b: 'not_reached',
      lnm3a: 'reached',           lnm3b: 'reached',           lnm3c: 'partially_reached',
      lnm4a: 'reached',           lnm4b: 'reached',
      lfr1a: 'partially_reached', lfr1b: 'partially_reached', lfr1c: 'not_reached',
      lfr2a: 'partially_reached', lfr2b: 'partially_reached',
      lfr3a: 'partially_reached', lfr3b: 'not_reached',
    },
  },

  {
    id: 's49', klassId: 'k3', name: 'Johanna',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached',           lde2b: 'partially_reached', lde2c: 'partially_reached',
      lma4a: 'partially_reached', lma4b: 'partially_reached',
      lnm3a: 'reached',           lnm3b: 'reached',           lnm3c: 'partially_reached',
      lnm4a: 'partially_reached', lnm4b: 'partially_reached',
      lfr1a: 'reached',           lfr1b: 'partially_reached', lfr1c: 'partially_reached',
      lfr2a: 'reached',           lfr2b: 'reached',
      lfr3a: 'partially_reached', lfr3b: 'not_reached',
    },
  },

  {
    id: 's50', klassId: 'k3', name: 'Oliver',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'partially_reached', c4: 'not_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde2a: 'not_reached',        lde2b: 'not_reached', lde2c: 'not_reached',
      lma4a: 'not_reached',        lma4b: 'not_reached',
      lnm3a: 'not_reached',        lnm3b: 'not_reached', lnm3c: 'not_reached',
      lnm4a: 'not_reached',        lnm4b: 'not_reached',
      lfr1a: 'partially_reached',  lfr1b: 'not_reached', lfr1c: 'not_reached',
      lfr2a: 'not_reached',        lfr2b: 'not_reached',
      lfr3a: 'not_reached',        lfr3b: 'not_reached',
    },
  },

  {
    id: 's51', klassId: 'k3', name: 'Franziska',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached',           lde2b: 'reached',           lde2c: 'reached',
      lma4a: 'reached',           lma4b: 'partially_reached',
      lnm3a: 'reached',           lnm3b: 'reached',           lnm3c: 'reached',
      lnm4a: 'reached',           lnm4b: 'reached',
      lfr1a: 'reached',           lfr1b: 'reached',           lfr1c: 'partially_reached',
      lfr2a: 'reached',           lfr2b: 'reached',
      lfr3a: 'reached',           lfr3b: 'partially_reached',
    },
  },

  {
    id: 's52', klassId: 'k3', name: 'Sebastian',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'not_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'not_reached' },
    lernzielStatus: {
      lde2a: 'partially_reached', lde2b: 'not_reached', lde2c: 'not_reached',
      lma4a: 'not_reached',        lma4b: 'not_reached',
      lnm3a: 'not_reached',        lnm3b: 'not_reached', lnm3c: 'not_reached',
      lnm4a: 'not_reached',        lnm4b: 'not_reached',
      lfr1a: 'not_reached',        lfr1b: 'not_reached', lfr1c: 'not_reached',
      lfr2a: 'not_reached',        lfr2b: 'not_reached',
      lfr3a: 'not_reached',        lfr3b: 'not_reached',
    },
  },

  {
    id: 's53', klassId: 'k3', name: 'Katharina',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached', lde2b: 'reached', lde2c: 'reached',
      lma4a: 'reached', lma4b: 'reached',
      lnm3a: 'reached', lnm3b: 'reached', lnm3c: 'partially_reached',
      lnm4a: 'reached', lnm4b: 'reached',
      lfr1a: 'reached', lfr1b: 'reached', lfr1c: 'reached',
      lfr2a: 'reached', lfr2b: 'reached',
      lfr3a: 'reached', lfr3b: 'partially_reached',
    },
  },

  {
    id: 's54', klassId: 'k3', name: 'Florian',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'partially_reached', lde2b: 'not_reached', lde2c: 'not_reached',
      lma4a: 'not_reached',        lma4b: 'not_reached',
      lnm3a: 'not_reached',        lnm3b: 'partially_reached', lnm3c: 'not_reached',
      lnm4a: 'not_reached',        lnm4b: 'not_reached',
      lfr1a: 'not_reached',        lfr1b: 'not_reached',        lfr1c: 'not_reached',
      lfr2a: 'not_reached',        lfr2b: 'not_reached',
      lfr3a: 'not_reached',        lfr3b: 'not_reached',
    },
  },

  {
    id: 's55', klassId: 'k3', name: 'Nina',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde2a: 'reached',           lde2b: 'reached',           lde2c: 'partially_reached',
      lma4a: 'partially_reached', lma4b: 'not_reached',
      lnm3a: 'reached',           lnm3b: 'reached',           lnm3c: 'partially_reached',
      lnm4a: 'partially_reached', lnm4b: 'reached',
      lfr1a: 'reached',           lfr1b: 'reached',           lfr1c: 'partially_reached',
      lfr2a: 'reached',           lfr2b: 'reached',
      lfr3a: 'partially_reached', lfr3b: 'not_reached',
    },
  },

  {
    id: 's56', klassId: 'k3', name: 'Markus',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached',           lde2b: 'reached',           lde2c: 'partially_reached',
      lma4a: 'reached',           lma4b: 'partially_reached',
      lnm3a: 'reached',           lnm3b: 'reached',           lnm3c: 'reached',
      lnm4a: 'reached',           lnm4b: 'partially_reached',
      lfr1a: 'partially_reached', lfr1b: 'partially_reached', lfr1c: 'not_reached',
      lfr2a: 'partially_reached', lfr2b: 'reached',
      lfr3a: 'not_reached',        lfr3b: 'not_reached',
    },
  },

  {
    id: 's57', klassId: 'k3', name: 'Sandra',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'not_reached', c4: 'not_reached', c5: 'not_reached', c6: 'not_reached' },
    lernzielStatus: {
      lde2a: 'not_reached', lde2b: 'not_reached', lde2c: 'not_reached',
      lma4a: 'not_reached', lma4b: 'not_reached',
      lnm3a: 'not_reached', lnm3b: 'not_reached', lnm3c: 'not_reached',
      lnm4a: 'not_reached', lnm4b: 'not_reached',
      lfr1a: 'not_reached', lfr1b: 'not_reached', lfr1c: 'not_reached',
      lfr2a: 'not_reached', lfr2b: 'not_reached',
      lfr3a: 'not_reached', lfr3b: 'not_reached',
    },
  },

  {
    id: 's58', klassId: 'k3', name: 'Christian',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached',           lde2b: 'reached',           lde2c: 'reached',
      lma4a: 'reached',           lma4b: 'partially_reached',
      lnm3a: 'reached',           lnm3b: 'reached',           lnm3c: 'reached',
      lnm4a: 'reached',           lnm4b: 'reached',
      lfr1a: 'reached',           lfr1b: 'partially_reached', lfr1c: 'partially_reached',
      lfr2a: 'reached',           lfr2b: 'reached',
      lfr3a: 'partially_reached', lfr3b: 'not_reached',
    },
  },

  {
    id: 's59', klassId: 'k3', name: 'Eva',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde2a: 'partially_reached', lde2b: 'partially_reached', lde2c: 'not_reached',
      lma4a: 'not_reached',        lma4b: 'not_reached',
      lnm3a: 'partially_reached',  lnm3b: 'not_reached',        lnm3c: 'not_reached',
      lnm4a: 'partially_reached',  lnm4b: 'not_reached',
      lfr1a: 'partially_reached',  lfr1b: 'not_reached',        lfr1c: 'not_reached',
      lfr2a: 'not_reached',        lfr2b: 'not_reached',
      lfr3a: 'not_reached',        lfr3b: 'not_reached',
    },
  },

  {
    id: 's60', klassId: 'k3', name: 'Karin',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'not_reached', c3: 'partially_reached', c4: 'reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde2a: 'reached',           lde2b: 'not_reached',        lde2c: 'not_reached',
      lma4a: 'partially_reached', lma4b: 'not_reached',
      lnm3a: 'reached',           lnm3b: 'partially_reached',  lnm3c: 'not_reached',
      lnm4a: 'partially_reached', lnm4b: 'not_reached',
      lfr1a: 'not_reached',        lfr1b: 'not_reached',        lfr1c: 'not_reached',
      lfr2a: 'not_reached',        lfr2b: 'not_reached',
      lfr3a: 'not_reached',        lfr3b: 'not_reached',
    },
  },

  {
    id: 's61', klassId: 'k3', name: 'Jana',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached', lde2b: 'reached', lde2c: 'reached',
      lma4a: 'reached', lma4b: 'reached',
      lnm3a: 'reached', lnm3b: 'reached', lnm3c: 'reached',
      lnm4a: 'reached', lnm4b: 'reached',
      lfr1a: 'reached', lfr1b: 'reached', lfr1c: 'reached',
      lfr2a: 'reached', lfr2b: 'reached',
      lfr3a: 'reached', lfr3b: 'reached',
    },
  },

  {
    // Negative-trend: keys reordered so French + partial others form the early batch.
    // Late LZ span every subject → ALL lines (Deutsch, Mathe, NMG, Français) drop at LATE_INTRO
    id: 'sNeg3', klassId: 'k3', name: 'Kira',
    note: 'Sehr guter Start, nach neuen Lernzielen in allen Fächern eingebrochen.',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      // First 10 keys → early batch (all reached)
      lfr1a: 'reached', lfr1b: 'reached', lfr1c: 'reached',
      lfr2a: 'reached', lfr2b: 'reached',
      lde2a: 'reached',
      lma4a: 'reached',
      lnm3a: 'reached', lnm3b: 'reached',
      lnm4a: 'reached',
      // Last 7 keys → late batch (all not_reached)
      lfr3a: 'not_reached', lfr3b: 'not_reached',
      lde2b: 'not_reached', lde2c: 'not_reached',
      lma4b: 'not_reached',
      lnm3c: 'not_reached', lnm4b: 'not_reached',
    },
  },

  {
    id: 's62', klassId: 'k3', name: 'Niclas',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'not_reached', c5: 'partially_reached', c6: 'not_reached' },
    lernzielStatus: {
      lde2a: 'not_reached', lde2b: 'not_reached', lde2c: 'not_reached',
      lma4a: 'not_reached', lma4b: 'not_reached',
      lnm3a: 'not_reached', lnm3b: 'not_reached', lnm3c: 'not_reached',
      lnm4a: 'not_reached', lnm4b: 'not_reached',
      lfr1a: 'not_reached', lfr1b: 'not_reached', lfr1c: 'not_reached',
      lfr2a: 'not_reached', lfr2b: 'not_reached',
      lfr3a: 'not_reached', lfr3b: 'not_reached',
    },
  },

  {
    id: 's63', klassId: 'k3', name: 'Amelie',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached',           lde2b: 'reached',           lde2c: 'partially_reached',
      lma4a: 'partially_reached', lma4b: 'not_reached',
      lnm3a: 'reached',           lnm3b: 'partially_reached',  lnm3c: 'not_reached',
      lnm4a: 'reached',           lnm4b: 'partially_reached',
      lfr1a: 'reached',           lfr1b: 'partially_reached',  lfr1c: 'not_reached',
      lfr2a: 'reached',           lfr2b: 'partially_reached',
      lfr3a: 'partially_reached', lfr3b: 'not_reached',
    },
  },
].map((s, i) => ({ ...s, progressHistory: generateHistory(s.lernzielStatus, i) }))
