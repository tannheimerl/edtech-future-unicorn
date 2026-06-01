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
  { id: 'lde1a', themaId: 'tde1', kategorie: 'grundlegend',   label: 'Texte flüssig und sinngebend vorlesen', kriterien: ['Liest laut, deutlich und in angemessenem Tempo', 'Beachtet Satzzeichen und Sinnabschnitte', 'Betont wichtige Wörter korrekt'] },
  { id: 'lde1b', themaId: 'tde1', kategorie: 'grundlegend',   label: 'Hauptaussage und wesentliche Details eines Textes verstehen', kriterien: ['Benennt die Hauptaussage in eigenen Worten', 'Unterscheidet wesentliche von nebensächlichen Informationen', 'Beantwortet W-Fragen zum Text'] },
  { id: 'lde1c', themaId: 'tde1', kategorie: 'grundlegend',   label: 'Informationen aus Sachtexten entnehmen', kriterien: ['Findet gezielte Informationen im Text', 'Nutzt Überschriften und Bilder als Orientierung', 'Notiert Schlüsselbegriffe'] },
  { id: 'lde1d', themaId: 'tde1', kategorie: 'anspruchsvoll', label: 'Schlussfolgerungen aus Texten ziehen', kriterien: ['Verknüpft Textinformationen logisch', 'Erklärt Ursache-Wirkungs-Zusammenhänge', 'Begründet Schlüsse mit Textstellen'] },
  // tde2 – Schreiben
  { id: 'lde2a', themaId: 'tde2', kategorie: 'grundlegend',   label: 'Texte strukturiert und verständlich aufschreiben', kriterien: ['Gliedert Text in Einleitung, Hauptteil, Schluss', 'Verwendet Absätze sinnvoll', 'Schreibt in vollständigen Sätzen'] },
  { id: 'lde2b', themaId: 'tde2', kategorie: 'anspruchsvoll', label: 'Eigene Erlebnisse und Meinungen schriftlich ausdrücken', kriterien: ['Beschreibt Erlebnisse lebendig und anschaulich', 'Drückt Gefühle und Meinungen klar aus', 'Wählt treffende Ausdrücke'] },
  { id: 'lde2c', themaId: 'tde2', kategorie: 'anspruchsvoll', label: 'Texte überarbeiten und verbessern', kriterien: ['Liest eigene Texte kritisch durch', 'Verbessert Satzbau und Wortwahl', 'Korrigiert Rechtschreibfehler selbstständig'] },
  // tde3 – Sprechen
  { id: 'lde3a', themaId: 'tde3', kategorie: 'grundlegend',   label: 'Verständlich und deutlich sprechen', kriterien: ['Spricht in angemessener Lautstärke', 'Artikuliert klar und deutlich', 'Hält Blickkontakt beim Sprechen'] },
  { id: 'lde3b', themaId: 'tde3', kategorie: 'grundlegend',   label: 'Zuhören und das Gehörte zusammenfassen', kriterien: ['Hört aufmerksam zu ohne zu unterbrechen', 'Fasst Gehörtes in eigenen Worten zusammen', 'Stellt Verständnisfragen'] },
  { id: 'lde3c', themaId: 'tde3', kategorie: 'anspruchsvoll', label: 'An Gesprächen sachlich und respektvoll teilnehmen', kriterien: ['Wartet auf die eigene Redegelegenheit', 'Reagiert auf Beiträge anderer', 'Formuliert Kritik konstruktiv'] },
  // tde4 – Rechtschreibung
  { id: 'lde4a', themaId: 'tde4', kategorie: 'grundlegend',   label: 'Sätze grammatikalisch korrekt bilden', kriterien: ['Verwendet Subjekt und Prädikat korrekt', 'Bildet Haupt- und Nebensätze richtig', 'Beachtet Kongruenz zwischen Subjekt und Verb'] },
  { id: 'lde4b', themaId: 'tde4', kategorie: 'grundlegend',   label: 'Häufige Wörter fehlerfrei schreiben', kriterien: ['Schreibt Grundwortschatz fehlerfrei', 'Wendet Rechtschreibregeln an', 'Nutzt Wörterbuch zur Kontrolle'] },
  { id: 'lde4c', themaId: 'tde4', kategorie: 'anspruchsvoll', label: 'Wortarten erkennen und anwenden', kriterien: ['Benennt Nomen, Verben, Adjektive korrekt', 'Bestimmt Artikel und Pronomen', 'Wendet Wortarten in eigenen Texten an'] },
  // tma1 – Zahlen
  { id: 'lma1a', themaId: 'tma1', kategorie: 'grundlegend',   label: 'Zahlen bis 1 000 000 lesen, schreiben und ordnen', kriterien: ['Liest und schreibt sechsstellige Zahlen', 'Ordnet Zahlen auf dem Zahlenstrahl', 'Vergleicht Zahlen mit <, >, ='] },
  { id: 'lma1b', themaId: 'tma1', kategorie: 'grundlegend',   label: 'Schriftlich addieren und subtrahieren', kriterien: ['Führt schriftliche Addition mit Übertrag durch', 'Führt schriftliche Subtraktion mit Entbündeln durch', 'Überprüft Ergebnisse durch Proberechnung'] },
  { id: 'lma1c', themaId: 'tma1', kategorie: 'anspruchsvoll', label: 'Schriftlich multiplizieren und dividieren', kriterien: ['Multipliziert mehrstellige Zahlen schriftlich', 'Dividiert mit Rest schriftlich', 'Erkennt Zusammenhang zwischen Multiplikation und Division'] },
  { id: 'lma1d', themaId: 'tma1', kategorie: 'anspruchsvoll', label: 'Brüche und Dezimalzahlen verstehen und vergleichen', kriterien: ['Stellt Brüche als Teile eines Ganzen dar', 'Wandelt einfache Brüche in Dezimalzahlen um', 'Vergleicht und ordnet Dezimalzahlen'] },
  // tma2 – Geometrie
  { id: 'lma2a', themaId: 'tma2', kategorie: 'grundlegend',   label: 'Dreiecke und Vierecke benennen und Eigenschaften beschreiben', kriterien: ['Benennt gleichseitig, gleichschenklig, rechtwinklig', 'Beschreibt Eigenschaften von Quadrat, Rechteck, Raute', 'Zeichnet Figuren nach Vorgabe'] },
  { id: 'lma2b', themaId: 'tma2', kategorie: 'anspruchsvoll', label: 'Umfang und Flächeninhalt berechnen', kriterien: ['Berechnet Umfang von Vierecken und Dreiecken', 'Berechnet Flächeninhalt mit Formel', 'Löst Sachaufgaben zu Umfang und Fläche'] },
  { id: 'lma2c', themaId: 'tma2', kategorie: 'grundlegend',   label: 'Symmetrien und Spiegelungen erkennen und beschreiben', kriterien: ['Erkennt Achsensymmetrie in Figuren', 'Zeichnet Spiegelbilder an einer Achse', 'Beschreibt Symmetrieeigenschaften von Figuren'] },
  // tma3 – Grössen
  { id: 'lma3a', themaId: 'tma3', kategorie: 'grundlegend',   label: 'Grössen messen und umrechnen (Länge, Masse, Zeit)', kriterien: ['Misst mit geeignetem Messwerkzeug', 'Rechnet zwischen Einheiten um (km↔m, kg↔g)', 'Löst Aufgaben mit gemischten Einheiten'] },
  { id: 'lma3b', themaId: 'tma3', kategorie: 'anspruchsvoll', label: 'Diagramme und Tabellen lesen und erstellen', kriterien: ['Liest Werte aus Balken- und Liniendiagrammen ab', 'Erstellt eigene Diagramme aus Datentabellen', 'Beschreibt Trends und Auffälligkeiten'] },
  { id: 'lma3c', themaId: 'tma3', kategorie: 'anspruchsvoll', label: 'Sachaufgaben lösen und den Rechenweg aufzeigen', kriterien: ['Entnimmt relevante Daten der Aufgabe', 'Wählt passende Rechenoperation', 'Notiert Lösungsweg nachvollziehbar'] },
  // tma4 – Algebra
  { id: 'lma4a', themaId: 'tma4', kategorie: 'grundlegend',   label: 'Variable und Terme verstehen und notieren', kriterien: ['Erklärt, was eine Variable bedeutet', 'Notiert Terme mit Variablen korrekt', 'Wertet Terme für gegebene Werte aus'] },
  { id: 'lma4b', themaId: 'tma4', kategorie: 'anspruchsvoll', label: 'Einfache Gleichungen aufstellen und lösen', kriterien: ['Stellt Gleichungen aus Sachsituationen auf', 'Löst Gleichungen durch Umformen', 'Überprüft die Lösung durch Einsetzen'] },
  // tnm1 – Lebewesen
  { id: 'lnm1a', themaId: 'tnm1', kategorie: 'grundlegend',   label: 'Tiere und Pflanzen in ihren Lebensräumen beschreiben', kriterien: ['Nennt typische Vertreter verschiedener Lebensräume', 'Beschreibt Merkmale und Verhaltensweisen', 'Ordnet Lebewesen ihrem Lebensraum zu'] },
  { id: 'lnm1b', themaId: 'tnm1', kategorie: 'anspruchsvoll', label: 'Nahrungsbeziehungen und Ökosysteme erklären', kriterien: ['Erstellt einfache Nahrungsketten', 'Erklärt Rolle von Produzenten, Konsumenten, Destruenten', 'Beschreibt das Gleichgewicht im Ökosystem'] },
  { id: 'lnm1c', themaId: 'tnm1', kategorie: 'anspruchsvoll', label: 'Anpassungen von Lebewesen an Lebensräume vergleichen', kriterien: ['Nennt körperliche Anpassungen an den Lebensraum', 'Vergleicht Anpassungen verschiedener Arten', 'Begründet Anpassungen mit Umweltbedingungen'] },
  // tnm2 – Körper
  { id: 'lnm2a', themaId: 'tnm2', kategorie: 'grundlegend',   label: 'Wichtige Körperorgane und ihre Funktionen beschreiben', kriterien: ['Benennt Herz, Lunge, Magen, Niere und ihre Funktion', 'Erklärt den Blutkreislauf vereinfacht', 'Beschreibt das Verdauungssystem'] },
  { id: 'lnm2b', themaId: 'tnm2', kategorie: 'anspruchsvoll', label: 'Massnahmen zur Gesundheitsförderung begründen', kriterien: ['Nennt Regeln für gesunde Ernährung', 'Erklärt die Bedeutung von Bewegung', 'Begründet Hygienemassnahmen'] },
  // tnm3 – Schweiz
  { id: 'lnm3a', themaId: 'tnm3', kategorie: 'grundlegend',   label: 'Wichtige Ereignisse der Schweizer Geschichte einordnen', kriterien: ['Nennt Gründungsdatum und wichtige Gründer', 'Ordnet Ereignisse auf einer Zeitleiste ein', 'Erklärt die Bedeutung der Reformation'] },
  { id: 'lnm3b', themaId: 'tnm3', kategorie: 'grundlegend',   label: 'Karten lesen und geografische Merkmale der Schweiz beschreiben', kriterien: ['Liest Höhenangaben und Legenden aus Karten', 'Benennt Alpen, Mittelland und Jura', 'Nennt Nachbarländer und Landessprachen'] },
  { id: 'lnm3c', themaId: 'tnm3', kategorie: 'anspruchsvoll', label: 'Politische Grundstrukturen der Schweiz erläutern', kriterien: ['Erklärt Bund, Kanton, Gemeinde', 'Beschreibt direkte Demokratie (Abstimmung, Initiative)', 'Nennt wichtige Bundesbehörden'] },
  // tnm4 – Wirtschaft
  { id: 'lnm4a', themaId: 'tnm4', kategorie: 'anspruchsvoll', label: 'Einfache wirtschaftliche Zusammenhänge verstehen', kriterien: ['Erklärt Angebot und Nachfrage', 'Beschreibt den Wirtschaftskreislauf vereinfacht', 'Nennt Beispiele für Import und Export'] },
  { id: 'lnm4b', themaId: 'tnm4', kategorie: 'grundlegend',   label: 'Berufsbilder und Berufswahl beschreiben', kriterien: ['Nennt Anforderungen verschiedener Berufe', 'Beschreibt eigene Interessen und Stärken', 'Erklärt Schritte der Berufswahl'] },
  // tfr1 – Hören/Sprechen
  { id: 'lfr1a', themaId: 'tfr1', kategorie: 'grundlegend',   label: 'Einfache Sätze und Anweisungen auf Französisch verstehen', kriterien: ['Versteht einfache Anweisungen im Unterricht', 'Erfasst Hauptinformation aus kurzen Hörtexten', 'Erkennt bekannte Vokabeln im Gehörten'] },
  { id: 'lfr1b', themaId: 'tfr1', kategorie: 'grundlegend',   label: 'Sich vorstellen und über den Alltag auf Französisch berichten', kriterien: ['Stellt sich mit Name, Alter, Wohnort vor', 'Beschreibt Tagesablauf in einfachen Sätzen', 'Spricht über Hobbys und Familie'] },
  { id: 'lfr1c', themaId: 'tfr1', kategorie: 'anspruchsvoll', label: 'Auf Fragen zu vertrauten Themen antworten', kriterien: ['Beantwortet W-Fragen auf Französisch', 'Verwendet passende Antwortformeln', 'Stellt Rückfragen auf Französisch'] },
  // tfr2 – Lesen
  { id: 'lfr2a', themaId: 'tfr2', kategorie: 'grundlegend',   label: 'Einfache Texte sinnverstehend lesen', kriterien: ['Versteht die Hauptaussage eines einfachen Textes', 'Beantwortet Verständnisfragen zum Text', 'Erschliesst unbekannte Wörter aus dem Kontext'] },
  { id: 'lfr2b', themaId: 'tfr2', kategorie: 'grundlegend',   label: 'Bekannte Ausdrücke und Wörter in Texten erkennen', kriterien: ['Erkennt Vokabeln aus dem Unterricht im Text', 'Findet bestimmte Informationen im Text', 'Markiert bekannte Schlüsselwörter'] },
  // tfr3 – Schreiben (noch nicht fällig)
  { id: 'lfr3a', themaId: 'tfr3', kategorie: 'grundlegend',   label: 'Einfache Sätze korrekt auf Französisch aufschreiben', kriterien: ['Schreibt einfache Sätze fehlerfrei', 'Beachtet Satzstellung im Französischen', 'Verwendet gelernten Wortschatz korrekt'] },
  { id: 'lfr3b', themaId: 'tfr3', kategorie: 'anspruchsvoll', label: 'Eine kurze Mitteilung oder Postkarte auf Französisch verfassen', kriterien: ['Schreibt eine kurze Mitteilung strukturiert auf', 'Verwendet passende Gruss- und Abschiedsformeln', 'Hält sich an Wortschatz und Strukturen aus dem Unterricht'] },
]

// ── Klassen ───────────────────────────────────────────────────────────────────
// k1 (5a): Deutsch Lesen+Schreiben · Mathe Zahlen+Geometrie · NMG Lebewesen
// k2 (6b): Deutsch Sprechen+Rechtschreibung · Mathe Zahlen+Grössen · NMG Körper+Schweiz
// k3 (7c): Deutsch Schreiben · Mathe Algebra · NMG Schweiz+Wirtschaft · Französisch alle

export const SEED_CLASSES: Klasse[] = [
  { id: 'k1', name: '5a', assignedLernzielIds: ['lde1a','lde1b','lde1c','lde1d','lde2a','lde2b','lde2c','lma1a','lma1b','lma1c','lma1d','lma2a','lma2b','lma2c','lnm1a','lnm1b','lnm1c'] },
  { id: 'k2', name: '6b', assignedLernzielIds: ['lde3a','lde3b','lde3c','lde4a','lde4b','lde4c','lma1a','lma1b','lma1c','lma1d','lma3a','lma3b','lma3c','lnm2a','lnm2b','lnm3a','lnm3b','lnm3c'] },
  { id: 'k3', name: '7c', assignedLernzielIds: ['lde2a','lde2b','lde2c','lma4a','lma4b','lnm3a','lnm3b','lnm3c','lnm4a','lnm4b','lfr1a','lfr1b','lfr1c','lfr2a','lfr2b','lfr3a','lfr3b'] },
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
