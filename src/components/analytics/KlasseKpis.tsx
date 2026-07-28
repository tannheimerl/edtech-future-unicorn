'use client'

import { useData } from '@/contexts/DataContext'
import { KpiTile } from '@/components/analytics/shared'
import { isLZSkipped } from '@/lib/student-kpis'
import { todayISO } from '@/lib/dates'
import { scoreColor } from '@/lib/utils'
import type { Schueler, Lernkontrolle, Lernziel } from '@/types/domain'

type KlasseKpisProps = {
  klassId: string
  students: Schueler[]
  themen: Lernkontrolle[]
  lernziele: Lernziel[]
}

export const KlasseKpis = ({ klassId, students, themen, lernziele }: KlasseKpisProps) => {
  const { pruefungen, pruefungErgebnisse } = useData()

  const today = todayISO()
  const activeThemen = themen.filter(t => !!t.faelligAm && t.faelligAm <= today)
  const activeLZ = activeThemen.flatMap(t => lernziele.filter(lz => lz.lernkontrolleId === t.id))

  const klassePruefungIds = new Set(pruefungen.filter(p => p.klasseId === klassId).map(p => p.id))
  const abgeschlosseneErgebnisse = pruefungErgebnisse.filter(
    e => klassePruefungIds.has(e.pruefungId) && e.abgeschlossen
  )
  const avgVersuche = abgeschlosseneErgebnisse.length
    ? abgeschlosseneErgebnisse.reduce((sum, e) => sum + e.anzahlVersuche, 0) / abgeschlosseneErgebnisse.length
    : null

  let reachedCount = 0
  let applicableCount = 0
  for (const s of students) {
    for (const lz of activeLZ) {
      if (isLZSkipped(lz, s, activeThemen)) continue
      applicableCount++
      if (s.lernzielStatus[lz.id] === 'reached') reachedCount++
    }
  }
  const reachedPct = applicableCount ? Math.round((reachedCount / applicableCount) * 100) : 0

  const perfectStudents = students.filter(s => {
    const applicable = activeLZ.filter(lz => !isLZSkipped(lz, s, activeThemen))
    return applicable.length > 0 && applicable.every(lz => s.lernzielStatus[lz.id] === 'reached')
  }).length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <KpiTile
        label="Ø Versuche bis Erreichen"
        value={avgVersuche !== null ? avgVersuche.toFixed(1) : '—'}
        sub={`${abgeschlosseneErgebnisse.length} abgeschlossene Lernzielkontrollen`}
      />
      <KpiTile
        label="Erfolgsquote"
        value={`${reachedPct}%`}
        valueClass={scoreColor(reachedPct)}
        sub="erreichte Lernziele aller durchgeführten Lernkontrollen"
      />
      <KpiTile
        label="Alle LZ erreicht"
        value={perfectStudents}
        sub={`von ${students.length} Schüler`}
      />
    </div>
  )
}
