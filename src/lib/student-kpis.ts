import type { Schueler, Lernkontrolle, Lernziel, Fach } from '@/types/domain'
import { sv, weightedPct } from '@/lib/utils'

/** Fortschritt über die Basis-Kompetenzen (0–100, ungerundet). */
export const competencyPct = (student: Schueler, comps: { id: string }[]): number => {
  if (comps.length === 0) return 0
  const reached = comps.filter((c) => student.competencyStatus[c.id] === 'reached').length
  const partial = comps.filter((c) => student.competencyStatus[c.id] === 'partially_reached').length
  return ((reached + partial * 0.5) / comps.length) * 100
}

/**
 * Anspruchsvolle Lernziele werden für RILZ-Schüler:innen im betroffenen
 * Fach übersprungen — sie fließen weder in Bewertung noch Statistik ein.
 */
export const isLZSkipped = (lz: Lernziel, student: Schueler, lernkontrollen: Lernkontrolle[]): boolean => {
  if (lz.kategorie !== 'anspruchsvoll') return false
  if (!student.rilzFachIds?.length) return false
  const lernkontrolle = lernkontrollen.find(t => t.id === lz.lernkontrolleId)
  return !!lernkontrolle && student.rilzFachIds.includes(lernkontrolle.fachId)
}

/**
 * Score (0–100, ungerundet) einer/eines Schüler:in über eine LZ-Liste,
 * RILZ-übersprungene Lernziele ausgenommen.
 */
export const adjustedLZScore = (student: Schueler, lzList: Lernziel[], lernkontrollen: Lernkontrolle[]): number => {
  const applicable = lzList.filter(lz => !isLZSkipped(lz, student, lernkontrollen))
  if (applicable.length === 0) return 0
  return (applicable.reduce((sum, lz) => sum + sv(student.lernzielStatus[lz.id] ?? 'not_reached'), 0) / applicable.length) * 100
}

/**
 * Eine Lernkontrolle zählt erst in Statistiken, wenn ein Fälligkeitsdatum
 * gesetzt ist und bereits erreicht/überschritten wurde. So fließen weder
 * undatierte noch zukünftig fällige (i. d. R. noch unbewertete)
 * Lernkontrollen in die Auswertung ein.
 * @param today aktuelles Datum im Format `YYYY-MM-DD`
 */
export const lernkontrolleCountsInStats = (t: Lernkontrolle, today: string): boolean => {
  return !!t.faelligAm && t.faelligAm <= today
}

type LernkontrolleKpi = {
  lernkontrolle: Lernkontrolle
  fachId: string
  pct: number
  reached: number
  partial: number
  notReached: number
  total: number
  gPct: number
  gReached: number
  gTotal: number
  aPct: number
  aReached: number
  aTotal: number
}

type FachKpi = {
  fach: Fach
  pct: number
  reached: number
  partial: number
  total: number
  gPct: number
  gReached: number
  gTotal: number
  aPct: number
  aReached: number
  aTotal: number
}

export type StudentKpis = {
  gesamtPct: number
  totalLz: number
  openLz: number
  grundPct: number
  grundReached: number
  grundTotal: number
  ansprPct: number
  ansprReached: number
  ansprTotal: number
  reached: number
  partial: number
  notReached: number
  fachKpis: FachKpi[]
  lernkontrolleKpis: LernkontrolleKpi[]
}

export const computeStudentKpis = (
  student: Schueler,
  lernkontrollen: Lernkontrolle[],
  allLernziele: Lernziel[],
  faecher: Fach[],
): StudentKpis => {
  const allLZ = lernkontrollen.flatMap((t) =>
    allLernziele.filter((lz) => lz.lernkontrolleId === t.id)
  )

  // For RILZ students, exclude anspruchsvoll LZ in RILZ subjects
  const rilzFachIds = new Set(student.rilzFachIds ?? [])
  const lernkontrolleFachMap = new Map(lernkontrollen.map((t) => [t.id, t.fachId]))

  const applicableLZ = allLZ.filter((lz) => {
    if (lz.kategorie !== 'anspruchsvoll') return true
    const fachId = lernkontrolleFachMap.get(lz.lernkontrolleId)
    return fachId ? !rilzFachIds.has(fachId) : true
  })

  const total = applicableLZ.length
  const reached = applicableLZ.filter((lz) => student.lernzielStatus[lz.id] === 'reached').length
  const partial = applicableLZ.filter((lz) => student.lernzielStatus[lz.id] === 'partially_reached').length
  const notReached = total - reached - partial
  const gesamtPct = weightedPct(reached, partial, total)
  const openLz = total - reached

  const grundLZ = applicableLZ.filter((lz) => lz.kategorie === 'grundlegend')
  const ansprLZ = applicableLZ.filter((lz) => lz.kategorie === 'anspruchsvoll')
  const grundReached = grundLZ.filter((lz) => student.lernzielStatus[lz.id] === 'reached').length
  const grundPartial = grundLZ.filter((lz) => student.lernzielStatus[lz.id] === 'partially_reached').length
  const ansprReached = ansprLZ.filter((lz) => student.lernzielStatus[lz.id] === 'reached').length
  const ansprPartial = ansprLZ.filter((lz) => student.lernzielStatus[lz.id] === 'partially_reached').length
  const grundPct = weightedPct(grundReached, grundPartial, grundLZ.length)
  const ansprPct = weightedPct(ansprReached, ansprPartial, ansprLZ.length)

  const fachKpis: FachKpi[] = faecher
    .map((fach) => {
      const fachLernkontrollen = lernkontrollen.filter((t) => t.fachId === fach.id)
      const fachLZ = fachLernkontrollen.flatMap((t) => allLernziele.filter((lz) => lz.lernkontrolleId === t.id))
      if (fachLZ.length === 0) return null
      const ids = fachLZ.map((lz) => lz.id)
      const r = ids.filter((id) => student.lernzielStatus[id] === 'reached').length
      const p = ids.filter((id) => student.lernzielStatus[id] === 'partially_reached').length
      const t = ids.length
      const pct = weightedPct(r, p, t)
      const gIds = fachLZ.filter((lz) => lz.kategorie === 'grundlegend').map((lz) => lz.id)
      const aIds = fachLZ.filter((lz) => lz.kategorie === 'anspruchsvoll').map((lz) => lz.id)
      const gR = gIds.filter((id) => student.lernzielStatus[id] === 'reached').length
      const aR = aIds.filter((id) => student.lernzielStatus[id] === 'reached').length
      const gP = gIds.filter((id) => student.lernzielStatus[id] === 'partially_reached').length
      const aP = aIds.filter((id) => student.lernzielStatus[id] === 'partially_reached').length
      const gPct = weightedPct(gR, gP, gIds.length)
      const aPct = weightedPct(aR, aP, aIds.length)
      return {
        fach,
        pct,
        reached: r,
        partial: p,
        total: t,
        gPct,
        gReached: gR,
        gTotal: gIds.length,
        aPct,
        aReached: aR,
        aTotal: aIds.length,
      }
    })
    .filter((k): k is FachKpi => k !== null)

  const lernkontrolleKpis: LernkontrolleKpi[] = lernkontrollen
    .map((lernkontrolle) => {
      const lernkontrolleLZ = allLernziele.filter((lz) => lz.lernkontrolleId === lernkontrolle.id)
      const applicable = lernkontrolleLZ.filter((lz) => {
        if (lz.kategorie !== 'anspruchsvoll') return true
        return !rilzFachIds.has(lernkontrolle.fachId)
      })
      if (applicable.length === 0) return null
      const r = applicable.filter((lz) => student.lernzielStatus[lz.id] === 'reached').length
      const p = applicable.filter((lz) => student.lernzielStatus[lz.id] === 'partially_reached').length
      const t = applicable.length
      const gLZ = applicable.filter((lz) => lz.kategorie === 'grundlegend')
      const aLZ = applicable.filter((lz) => lz.kategorie === 'anspruchsvoll')
      const gR = gLZ.filter((lz) => student.lernzielStatus[lz.id] === 'reached').length
      const gP = gLZ.filter((lz) => student.lernzielStatus[lz.id] === 'partially_reached').length
      const aR = aLZ.filter((lz) => student.lernzielStatus[lz.id] === 'reached').length
      const aP = aLZ.filter((lz) => student.lernzielStatus[lz.id] === 'partially_reached').length
      return {
        lernkontrolle,
        fachId: lernkontrolle.fachId,
        pct: weightedPct(r, p, t),
        reached: r,
        partial: p,
        notReached: t - r - p,
        total: t,
        gPct: weightedPct(gR, gP, gLZ.length),
        gReached: gR,
        gTotal: gLZ.length,
        aPct: weightedPct(aR, aP, aLZ.length),
        aReached: aR,
        aTotal: aLZ.length,
      }
    })
    .filter((k): k is LernkontrolleKpi => k !== null)

  return {
    gesamtPct,
    totalLz: total,
    openLz,
    grundPct,
    grundReached,
    grundTotal: grundLZ.length,
    ansprPct,
    ansprReached,
    ansprTotal: ansprLZ.length,
    reached,
    partial,
    notReached,
    fachKpis,
    lernkontrolleKpis,
  }
}

/** RILZ/BVSA-Schüler:innen werden aus dem Klassendurchschnitt ausgeklammert, da ihr Anspruchsniveau nicht vergleichbar ist. */
export const isSpecialStudent = (s: Pick<Schueler, 'bvsa' | 'rilzFachIds'>): boolean => {
  return !!(s.bvsa || s.rilzFachIds?.length)
}

export type KlasseStatsResult = {
  avgScore: number
  atRisk: number
  excellent: number
  reachedPct: number
  partialPct: number
  hasData: boolean
}

/** Aggregierte Fortschritts-Kennzahlen einer Klasse für die Klassenkarte auf /klassen. */
export const computeKlasseStats = (
  students: Schueler[],
  klasseLernkontrollen: Lernkontrolle[],
  lernziele: Lernziel[],
): KlasseStatsResult => {
  const allLZ = klasseLernkontrollen.flatMap((t) => lernziele.filter((lz) => lz.lernkontrolleId === t.id))
  const allLZIds = allLZ.map((lz) => lz.id)
  const regularStudents = students.filter((s) => !isSpecialStudent(s))

  let avgScore = 0
  let atRisk = 0
  let excellent = 0

  if (allLZIds.length > 0 && regularStudents.length > 0) {
    const scores = regularStudents.map((s) => {
      const applicable = allLZ.filter((lz) => {
        if (lz.kategorie !== 'anspruchsvoll') return true
        if (!s.rilzFachIds?.length) return true
        const lernkontrolle = klasseLernkontrollen.find((t) => t.id === lz.lernkontrolleId)
        return !lernkontrolle || !s.rilzFachIds.includes(lernkontrolle.fachId)
      })
      if (applicable.length === 0) return 0
      return (
        (applicable.reduce((sum, lz) => sum + sv(s.lernzielStatus[lz.id] ?? 'not_reached'), 0) /
          applicable.length) *
        100
      )
    })
    avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    atRisk = scores.filter((sc) => sc < 25).length
    excellent = scores.filter((sc) => sc >= 75).length
  }

  const reached = allLZIds.reduce(
    (sum, id) => sum + regularStudents.filter((s) => s.lernzielStatus[id] === 'reached').length,
    0,
  )
  const partial = allLZIds.reduce(
    (sum, id) => sum + regularStudents.filter((s) => s.lernzielStatus[id] === 'partially_reached').length,
    0,
  )
  const total = allLZIds.length * (regularStudents.length || 1)

  return {
    avgScore,
    atRisk,
    excellent,
    reachedPct: total > 0 ? (reached / total) * 100 : 0,
    partialPct: total > 0 ? (partial / total) * 100 : 0,
    hasData: allLZIds.length > 0,
  }
}
