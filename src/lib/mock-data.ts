import type { Klasse, Schueler, Kompetenz } from '@/types/domain'

export const SEED_COMPETENCIES: Kompetenz[] = [
  { id: 'c1', label: 'Grundrechenarten' },
  { id: 'c2', label: 'Textverständnis' },
  { id: 'c3', label: 'Problemlösung' },
  { id: 'c4', label: 'Mündliche Kommunikation' },
  { id: 'c5', label: 'Schriftlicher Ausdruck' },
  { id: 'c6', label: 'Zusammenarbeit' },
]

export const SEED_CLASSES: Klasse[] = [
  { id: 'k1', name: '5a' },
  { id: 'k2', name: '6b' },
  { id: 'k3', name: '7c' },
]

export const SEED_STUDENTS: Schueler[] = [
  // 5a
  {
    id: 's1', klassId: 'k1', name: 'Emma Schulz',
    note: 'Sehr engagiert, braucht Unterstützung in Mathematik.',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'not_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
  },
  {
    id: 's2', klassId: 'k1', name: 'Luca Bauer',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'reached' },
  },
  {
    id: 's3', klassId: 'k1', name: 'Mia Fischer',
    note: 'Zeigt großes Interesse an Naturwissenschaften.',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'partially_reached' },
  },
  {
    id: 's4', klassId: 'k1', name: 'Noah Weber',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
  },
  // 6b
  {
    id: 's5', klassId: 'k2', name: 'Sophia Müller',
    note: 'Hat deutliche Fortschritte im Lesen gemacht.',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
  },
  {
    id: 's6', klassId: 'k2', name: 'Jonas Wagner',
    note: 'Braucht mehr Übung bei schriftlichen Aufgaben.',
    competencyStatus: { c1: 'partially_reached', c2: 'not_reached', c3: 'partially_reached', c4: 'reached', c5: 'not_reached', c6: 'partially_reached' },
  },
  {
    id: 's7', klassId: 'k2', name: 'Hannah Schmidt',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
  },
  {
    id: 's8', klassId: 'k2', name: 'Ben Hoffmann',
    note: 'Arbeitet sehr gut in Gruppenaufgaben.',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'not_reached', c4: 'reached', c5: 'not_reached', c6: 'reached' },
  },
  {
    id: 's9', klassId: 'k2', name: 'Laura Koch',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'partially_reached' },
  },
  // 7c
  {
    id: 's10', klassId: 'k3', name: 'Felix Richter',
    note: 'Sehr selbstständiges Arbeiten, hilft anderen Schülern.',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
  },
  {
    id: 's11', klassId: 'k3', name: 'Marie Klein',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
  },
  {
    id: 's12', klassId: 'k3', name: 'Tom Wolf',
    note: 'Zeigt Schwierigkeiten bei der Konzentration.',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'not_reached', c5: 'partially_reached', c6: 'not_reached' },
  },
]
