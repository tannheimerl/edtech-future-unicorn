import type { Schueler, Thema, Lernziel, Fach, Versuch } from '@/types/domain'
import { sv } from '@/lib/utils'

export interface ThemaKpi {
  thema: Thema
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

export interface FachKpi {
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

export interface StudentKpis {
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
  themaKpis: ThemaKpi[]
}

export function computeStudentKpis(
  student: Schueler,
  assignedThemen: Thema[],
  allLernziele: Lernziel[],
  faecher: Fach[],
  getVersuche: (student: Schueler, lzId: string) => Versuch[],
): StudentKpis {
  const allLZ = assignedThemen.flatMap((t) =>
    allLernziele.filter((lz) => lz.themaId === t.id)
  )

  // For RILZ students, exclude anspruchsvoll LZ in RILZ subjects
  const rilzFachIds = new Set(student.rilzFachIds ?? [])
  const themaFachMap = new Map(assignedThemen.map((t) => [t.id, t.fachId]))

  const applicableLZ = allLZ.filter((lz) => {
    if (lz.kategorie !== 'anspruchsvoll') return true
    const fachId = themaFachMap.get(lz.themaId)
    return fachId ? !rilzFachIds.has(fachId) : true
  })

  const total = applicableLZ.length
  const reached = applicableLZ.filter((lz) => student.lernzielStatus[lz.id] === 'reached').length
  const partial = applicableLZ.filter((lz) => student.lernzielStatus[lz.id] === 'partially_reached').length
  const notReached = total - reached - partial
  const gesamtPct = total > 0 ? Math.round(((reached + partial * 0.5) / total) * 100) : 0
  const openLz = total - reached

  const grundLZ = applicableLZ.filter((lz) => lz.kategorie === 'grundlegend')
  const ansprLZ = applicableLZ.filter((lz) => lz.kategorie === 'anspruchsvoll')
  const grundReached = grundLZ.filter((lz) => student.lernzielStatus[lz.id] === 'reached').length
  const grundPartial = grundLZ.filter((lz) => student.lernzielStatus[lz.id] === 'partially_reached').length
  const ansprReached = ansprLZ.filter((lz) => student.lernzielStatus[lz.id] === 'reached').length
  const ansprPartial = ansprLZ.filter((lz) => student.lernzielStatus[lz.id] === 'partially_reached').length
  const grundPct = grundLZ.length > 0 ? Math.round(((grundReached + grundPartial * 0.5) / grundLZ.length) * 100) : 0
  const ansprPct = ansprLZ.length > 0 ? Math.round(((ansprReached + ansprPartial * 0.5) / ansprLZ.length) * 100) : 0

  const fachKpis: FachKpi[] = faecher
    .map((fach) => {
      const fachThemen = assignedThemen.filter((t) => t.fachId === fach.id)
      const fachLZ = fachThemen.flatMap((t) => allLernziele.filter((lz) => lz.themaId === t.id))
      if (fachLZ.length === 0) return null
      const ids = fachLZ.map((lz) => lz.id)
      const r = ids.filter((id) => student.lernzielStatus[id] === 'reached').length
      const p = ids.filter((id) => student.lernzielStatus[id] === 'partially_reached').length
      const t = ids.length
      const pct = Math.round(((r + p * 0.5) / t) * 100)
      const gIds = fachLZ.filter((lz) => lz.kategorie === 'grundlegend').map((lz) => lz.id)
      const aIds = fachLZ.filter((lz) => lz.kategorie === 'anspruchsvoll').map((lz) => lz.id)
      const gR = gIds.filter((id) => student.lernzielStatus[id] === 'reached').length
      const aR = aIds.filter((id) => student.lernzielStatus[id] === 'reached').length
      const gP = gIds.filter((id) => student.lernzielStatus[id] === 'partially_reached').length
      const aP = aIds.filter((id) => student.lernzielStatus[id] === 'partially_reached').length
      const gPct = gIds.length > 0 ? Math.round(((gR + gP * 0.5) / gIds.length) * 100) : 0
      const aPct = aIds.length > 0 ? Math.round(((aR + aP * 0.5) / aIds.length) * 100) : 0
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

  const themaKpis: ThemaKpi[] = assignedThemen
    .map((thema) => {
      const themaLZ = allLernziele.filter((lz) => lz.themaId === thema.id)
      const applicable = themaLZ.filter((lz) => {
        if (lz.kategorie !== 'anspruchsvoll') return true
        return !rilzFachIds.has(thema.fachId)
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
        thema,
        fachId: thema.fachId,
        pct: Math.round(((r + p * 0.5) / t) * 100),
        reached: r,
        partial: p,
        notReached: t - r - p,
        total: t,
        gPct: gLZ.length > 0 ? Math.round(((gR + gP * 0.5) / gLZ.length) * 100) : 0,
        gReached: gR,
        gTotal: gLZ.length,
        aPct: aLZ.length > 0 ? Math.round(((aR + aP * 0.5) / aLZ.length) * 100) : 0,
        aReached: aR,
        aTotal: aLZ.length,
      }
    })
    .filter((k): k is ThemaKpi => k !== null)

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
    themaKpis,
  }
}
