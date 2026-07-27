/**
 * Heutiges Datum als `YYYY-MM-DD` in lokaler Zeit.
 * `new Date().toISOString()` wäre UTC: zwischen Mitternacht und ~2 Uhr
 * (CET/CEST) ergäbe das noch den Vortag, womit Fälligkeits-Vergleiche
 * und Statistik-Stichtage einen Tag lang falsch wären.
 */
export const todayISO = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Formatiert ein `YYYY-MM-DD`-Datum lokalisiert (de-CH).
 * Hängt `T00:00:00` an, damit der String als lokale Zeit geparst wird —
 * `new Date('2026-03-12')` wäre UTC-Mitternacht und könnte je nach
 * Zeitzone auf den Vortag fallen.
 */
export const formatDateCH = (isoDate: string, options?: Intl.DateTimeFormatOptions): string => {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('de-CH', options)
}
