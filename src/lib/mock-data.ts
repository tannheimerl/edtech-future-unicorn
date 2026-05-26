import type { Klasse, Schueler, Kompetenz, Fach, Thema, Lernziel } from '@/types/domain'

export const SEED_COMPETENCIES: Kompetenz[] = [
  { id: 'c1', label: 'Grundrechenarten' },
  { id: 'c2', label: 'Textverständnis' },
  { id: 'c3', label: 'Problemlösung' },
  { id: 'c4', label: 'Mündliche Kommunikation' },
  { id: 'c5', label: 'Schriftlicher Ausdruck' },
  { id: 'c6', label: 'Zusammenarbeit' },
]

export const SEED_FAECHER: Fach[] = [
  { id: 'f1', name: 'Mathematik' },
  { id: 'f2', name: 'Deutsch' },
  { id: 'f3', name: 'Sachunterricht' },
]

export const SEED_THEMEN: Thema[] = [
  { id: 't1', fachId: 'f1', name: 'Zahlen & Rechnen' },
  { id: 't2', fachId: 'f1', name: 'Geometrie' },
  { id: 't3', fachId: 'f2', name: 'Lesen & Verstehen' },
  { id: 't4', fachId: 'f2', name: 'Schreiben' },
  { id: 't5', fachId: 'f3', name: 'Natur & Umwelt' },
]

export const SEED_LERNZIELE: Lernziel[] = [
  { id: 'l1', themaId: 't1', label: 'Zahlen bis 100 lesen und schreiben' },
  { id: 'l2', themaId: 't1', label: 'Addieren bis 100' },
  { id: 'l3', themaId: 't1', label: 'Subtrahieren bis 100' },
  { id: 'l4', themaId: 't2', label: 'Grundformen benennen' },
  { id: 'l5', themaId: 't2', label: 'Symmetrie erkennen' },
  { id: 'l6', themaId: 't3', label: 'Texte flüssig vorlesen' },
  { id: 'l7', themaId: 't3', label: 'Hauptaussage eines Textes verstehen' },
  { id: 'l8', themaId: 't4', label: 'Sätze fehlerfrei schreiben' },
  { id: 'l9', themaId: 't4', label: 'Texte strukturieren' },
  { id: 'l10', themaId: 't5', label: 'Jahreszeiten beschreiben' },
  { id: 'l11', themaId: 't5', label: 'Pflanzen und Tiere bestimmen' },
]

export const SEED_CLASSES: Klasse[] = [
  { id: 'k1', name: '5a', assignedThemenIds: ['t1', 't3'] },
  { id: 'k2', name: '6b', assignedThemenIds: ['t2', 't4'] },
  { id: 'k3', name: '7c', assignedThemenIds: ['t5'] },
]

export const SEED_STUDENTS: Schueler[] = [
  // ── 5a (21 Schüler) ───────────────────────────────────────────────────
  {
    id: 's1', klassId: 'k1', name: 'Emma',
    note: 'Sehr engagiert, braucht Unterstützung in Mathematik.',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'not_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l1: 'reached', l2: 'partially_reached', l3: 'not_reached', l6: 'reached', l7: 'partially_reached' },
    progressHistory: [
      { date: '2026-02-01', lernzielStatus: { l1: 'not_reached', l2: 'not_reached', l3: 'not_reached', l6: 'partially_reached', l7: 'not_reached' } },
      { date: '2026-03-01', lernzielStatus: { l1: 'partially_reached', l2: 'not_reached', l3: 'not_reached', l6: 'reached', l7: 'not_reached' } },
      { date: '2026-04-01', lernzielStatus: { l1: 'reached', l2: 'partially_reached', l3: 'not_reached', l6: 'reached', l7: 'partially_reached' } },
    ],
  },
  {
    id: 's2', klassId: 'k1', name: 'Luca',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: { l1: 'reached', l2: 'reached', l3: 'reached', l6: 'reached', l7: 'reached' },
    progressHistory: [
      { date: '2026-02-01', lernzielStatus: { l1: 'partially_reached', l2: 'not_reached', l3: 'not_reached', l6: 'partially_reached', l7: 'not_reached' } },
      { date: '2026-03-01', lernzielStatus: { l1: 'reached', l2: 'partially_reached', l3: 'not_reached', l6: 'reached', l7: 'partially_reached' } },
      { date: '2026-04-01', lernzielStatus: { l1: 'reached', l2: 'reached', l3: 'partially_reached', l6: 'reached', l7: 'reached' } },
    ],
  },
  {
    id: 's3', klassId: 'k1', name: 'Mia',
    note: 'Zeigt großes Interesse an Naturwissenschaften.',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {},
  },
  {
    id: 's4', klassId: 'k1', name: 'Noah',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {},
  },
  {
    id: 's13', klassId: 'k1', name: 'Leon',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: { l1: 'reached', l2: 'reached', l3: 'partially_reached', l6: 'reached', l7: 'reached' },
  },
  {
    id: 's14', klassId: 'k1', name: 'Anna',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: { l1: 'partially_reached', l2: 'not_reached', l6: 'reached', l7: 'partially_reached' },
  },
  {
    id: 's15', klassId: 'k1', name: 'Paul',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'partially_reached', c4: 'not_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {},
  },
  {
    id: 's16', klassId: 'k1', name: 'Sophia',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l1: 'reached', l2: 'reached', l3: 'reached', l6: 'reached', l7: 'reached' },
  },
  {
    id: 's17', klassId: 'k1', name: 'Finn',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'not_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'reached' },
    lernzielStatus: { l1: 'not_reached', l2: 'not_reached', l6: 'partially_reached', l7: 'not_reached' },
  },
  {
    id: 's18', klassId: 'k1', name: 'Lena',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l1: 'reached', l2: 'partially_reached', l3: 'not_reached', l6: 'reached', l7: 'reached' },
  },
  {
    id: 's19', klassId: 'k1', name: 'Max',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l1: 'reached', l2: 'reached', l3: 'reached', l6: 'reached', l7: 'reached' },
  },
  {
    id: 's20', klassId: 'k1', name: 'Julia',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'partially_reached' },
    lernzielStatus: {},
  },
  {
    id: 's21', klassId: 'k1', name: 'Luis',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'reached', c5: 'not_reached', c6: 'reached' },
    lernzielStatus: { l1: 'not_reached', l6: 'partially_reached' },
  },
  {
    id: 's22', klassId: 'k1', name: 'Sarah',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: { l1: 'reached', l2: 'reached', l6: 'reached', l7: 'partially_reached' },
  },
  {
    id: 's23', klassId: 'k1', name: 'Tim',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'not_reached', c4: 'not_reached', c5: 'not_reached', c6: 'not_reached' },
    lernzielStatus: {},
  },
  {
    id: 's24', klassId: 'k1', name: 'Alina',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: { l1: 'reached', l2: 'reached', l3: 'partially_reached', l6: 'reached', l7: 'reached' },
  },
  {
    id: 's25', klassId: 'k1', name: 'Julian',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l1: 'partially_reached', l2: 'not_reached', l6: 'reached', l7: 'reached' },
  },
  {
    id: 's26', klassId: 'k1', name: 'Lisa',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'not_reached', c3: 'partially_reached', c4: 'not_reached', c5: 'partially_reached', c6: 'not_reached' },
    lernzielStatus: {},
  },
  {
    id: 's27', klassId: 'k1', name: 'Erik',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: { l1: 'reached', l2: 'reached', l3: 'reached', l6: 'partially_reached', l7: 'not_reached' },
  },
  {
    id: 's28', klassId: 'k1', name: 'Lea',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {},
  },
  {
    id: 's29', klassId: 'k1', name: 'Philipp',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l1: 'reached', l2: 'partially_reached', l3: 'not_reached', l6: 'reached', l7: 'reached' },
  },

  // ── 6b (22 Schüler) ───────────────────────────────────────────────────
  {
    id: 's5', klassId: 'k2', name: 'Sophia',
    note: 'Hat deutliche Fortschritte im Lesen gemacht.',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l4: 'reached', l5: 'reached', l8: 'reached', l9: 'reached' },
    progressHistory: [
      { date: '2026-02-01', lernzielStatus: { l4: 'not_reached', l5: 'not_reached', l8: 'partially_reached', l9: 'not_reached' } },
      { date: '2026-03-01', lernzielStatus: { l4: 'partially_reached', l5: 'not_reached', l8: 'reached', l9: 'partially_reached' } },
      { date: '2026-04-01', lernzielStatus: { l4: 'reached', l5: 'partially_reached', l8: 'reached', l9: 'reached' } },
    ],
  },
  {
    id: 's6', klassId: 'k2', name: 'Jonas',
    note: 'Braucht mehr Übung bei schriftlichen Aufgaben.',
    competencyStatus: { c1: 'partially_reached', c2: 'not_reached', c3: 'partially_reached', c4: 'reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: { l4: 'partially_reached', l5: 'not_reached', l8: 'not_reached', l9: 'not_reached' },
    progressHistory: [
      { date: '2026-02-01', lernzielStatus: { l4: 'not_reached', l5: 'not_reached', l8: 'not_reached', l9: 'not_reached' } },
      { date: '2026-03-01', lernzielStatus: { l4: 'not_reached', l5: 'not_reached', l8: 'not_reached', l9: 'not_reached' } },
      { date: '2026-04-01', lernzielStatus: { l4: 'partially_reached', l5: 'not_reached', l8: 'not_reached', l9: 'not_reached' } },
    ],
  },
  {
    id: 's7', klassId: 'k2', name: 'Hannah',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {},
  },
  {
    id: 's8', klassId: 'k2', name: 'Ben',
    note: 'Arbeitet sehr gut in Gruppenaufgaben.',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'not_reached', c4: 'reached', c5: 'not_reached', c6: 'reached' },
    lernzielStatus: {},
  },
  {
    id: 's9', klassId: 'k2', name: 'Laura',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'partially_reached' },
    lernzielStatus: {},
  },
  {
    id: 's30', klassId: 'k2', name: 'Nico',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l4: 'reached', l5: 'reached', l8: 'reached', l9: 'partially_reached' },
  },
  {
    id: 's31', klassId: 'k2', name: 'Klara',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: { l4: 'partially_reached', l8: 'reached', l9: 'partially_reached' },
  },
  {
    id: 's32', klassId: 'k2', name: 'Simon',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'not_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {},
  },
  {
    id: 's33', klassId: 'k2', name: 'Lina',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l4: 'reached', l5: 'reached', l8: 'reached', l9: 'reached' },
  },
  {
    id: 's34', klassId: 'k2', name: 'Moritz',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'not_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'not_reached' },
    lernzielStatus: { l4: 'not_reached', l8: 'not_reached' },
  },
  {
    id: 's35', klassId: 'k2', name: 'Charlotte',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l4: 'reached', l5: 'partially_reached', l8: 'reached', l9: 'reached' },
  },
  {
    id: 's36', klassId: 'k2', name: 'David',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'reached' },
    lernzielStatus: {},
  },
  {
    id: 's37', klassId: 'k2', name: 'Isabella',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: { l4: 'reached', l5: 'reached', l8: 'partially_reached', l9: 'not_reached' },
  },
  {
    id: 's38', klassId: 'k2', name: 'Daniel',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l4: 'partially_reached', l5: 'not_reached', l8: 'reached', l9: 'partially_reached' },
  },
  {
    id: 's39', klassId: 'k2', name: 'Antonia',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l4: 'reached', l5: 'reached', l8: 'reached', l9: 'reached' },
  },
  {
    id: 's40', klassId: 'k2', name: 'Michael',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'not_reached', c5: 'partially_reached', c6: 'not_reached' },
    lernzielStatus: {},
  },
  {
    id: 's41', klassId: 'k2', name: 'Victoria',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: { l4: 'partially_reached', l8: 'reached' },
  },
  {
    id: 's42', klassId: 'k2', name: 'Stefan',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: { l4: 'reached', l5: 'not_reached', l8: 'reached', l9: 'partially_reached' },
  },
  {
    id: 's43', klassId: 'k2', name: 'Amelie',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l4: 'reached', l5: 'reached', l8: 'reached', l9: 'reached' },
  },
  {
    id: 's44', klassId: 'k2', name: 'Jan',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'not_reached', c4: 'not_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {},
  },
  {
    id: 's45', klassId: 'k2', name: 'Elise',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'partially_reached' },
    lernzielStatus: { l4: 'not_reached', l5: 'not_reached', l8: 'partially_reached', l9: 'not_reached' },
  },
  {
    id: 's46', klassId: 'k2', name: 'Tobias',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'not_reached', c3: 'partially_reached', c4: 'reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {},
  },

  // ── 7c (20 Schüler) ───────────────────────────────────────────────────
  {
    id: 's10', klassId: 'k3', name: 'Felix',
    note: 'Sehr selbstständiges Arbeiten, hilft anderen Schülern.',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l10: 'reached', l11: 'reached' },
    progressHistory: [
      { date: '2026-02-01', lernzielStatus: { l10: 'not_reached', l11: 'not_reached' } },
      { date: '2026-03-01', lernzielStatus: { l10: 'partially_reached', l11: 'not_reached' } },
      { date: '2026-04-01', lernzielStatus: { l10: 'reached', l11: 'partially_reached' } },
    ],
  },
  {
    id: 's11', klassId: 'k3', name: 'Marie',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: { l10: 'partially_reached', l11: 'not_reached' },
    progressHistory: [
      { date: '2026-02-01', lernzielStatus: { l10: 'not_reached', l11: 'not_reached' } },
      { date: '2026-03-01', lernzielStatus: { l10: 'not_reached', l11: 'not_reached' } },
      { date: '2026-04-01', lernzielStatus: { l10: 'partially_reached', l11: 'not_reached' } },
    ],
  },
  {
    id: 's12', klassId: 'k3', name: 'Tom',
    note: 'Zeigt Schwierigkeiten bei der Konzentration.',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'not_reached', c5: 'partially_reached', c6: 'not_reached' },
    lernzielStatus: {},
  },
  {
    id: 's47', klassId: 'k3', name: 'Luise',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l10: 'reached', l11: 'reached' },
  },
  {
    id: 's48', klassId: 'k3', name: 'Alexander',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l10: 'reached', l11: 'partially_reached' },
  },
  {
    id: 's49', klassId: 'k3', name: 'Johanna',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: { l10: 'partially_reached', l11: 'partially_reached' },
  },
  {
    id: 's50', klassId: 'k3', name: 'Oliver',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'partially_reached', c4: 'not_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {},
  },
  {
    id: 's51', klassId: 'k3', name: 'Franziska',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l10: 'reached', l11: 'reached' },
  },
  {
    id: 's52', klassId: 'k3', name: 'Sebastian',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'not_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'not_reached' },
    lernzielStatus: { l10: 'not_reached', l11: 'not_reached' },
  },
  {
    id: 's53', klassId: 'k3', name: 'Katharina',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l10: 'reached', l11: 'partially_reached' },
  },
  {
    id: 's54', klassId: 'k3', name: 'Florian',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'reached' },
    lernzielStatus: {},
  },
  {
    id: 's55', klassId: 'k3', name: 'Nina',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: { l10: 'partially_reached', l11: 'reached' },
  },
  {
    id: 's56', klassId: 'k3', name: 'Markus',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: { l10: 'reached', l11: 'not_reached' },
  },
  {
    id: 's57', klassId: 'k3', name: 'Sandra',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'not_reached', c4: 'not_reached', c5: 'not_reached', c6: 'not_reached' },
    lernzielStatus: {},
  },
  {
    id: 's58', klassId: 'k3', name: 'Christian',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l10: 'reached', l11: 'reached' },
  },
  {
    id: 's59', klassId: 'k3', name: 'Eva',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'partially_reached' },
    lernzielStatus: { l10: 'partially_reached', l11: 'not_reached' },
  },
  {
    id: 's60', klassId: 'k3', name: 'Karin',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'not_reached', c3: 'partially_reached', c4: 'reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {},
  },
  {
    id: 's61', klassId: 'k3', name: 'Jana',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l10: 'reached', l11: 'reached' },
  },
  {
    id: 's62', klassId: 'k3', name: 'Niclas',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'not_reached', c5: 'partially_reached', c6: 'not_reached' },
    lernzielStatus: {},
  },
  {
    id: 's63', klassId: 'k3', name: 'Amelie',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: { l10: 'reached', l11: 'partially_reached' },
  },
]
