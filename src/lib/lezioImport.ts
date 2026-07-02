import type { LezioExport } from '@/types/domain'

/**
 * Einlesen von `.lezio`-Importdateien für Einzel- und Mehrfach-Import.
 *
 * Eine `.lezio`-Datei ist JSON mit genau einem Thema und dessen Lernzielen
 * (siehe {@link LezioExport}). Beim Mehrfach-Import können mehrere `.lezio`-Dateien
 * oder ein `.zip`-Archiv (Gegenstück zu `exportFach`) ausgewählt werden.
 */

/** Ein eingelesenes Thema samt Herkunft (Dateiname) für Fehlermeldungen/Anzeige. */
export type LezioImportItem = {
  source: string
  data: LezioExport
}

/** Parst und validiert den Inhalt einer einzelnen `.lezio`/`.json`-Datei. */
export const parseLezio = (text: string): LezioExport => {
  const data = JSON.parse(text) as LezioExport
  if (data.version !== '1' || !data.fachName || !data.thema?.name) {
    throw new Error('Ungültiges Dateiformat')
  }
  return data
}

const isLezioEntry = (name: string): boolean => {
  const lower = name.toLowerCase()
  return lower.endsWith('.lezio') || lower.endsWith('.json')
}

/**
 * Liest eine Liste ausgewählter Dateien ein. `.zip`-Archive werden entpackt und jede
 * enthaltene `.lezio`/`.json`-Datei verarbeitet. Ungültige Einträge werden gezählt
 * (`errors`), brechen den Import aber nicht ab.
 */
export const readLezioFiles = async (
  files: File[],
): Promise<{ items: LezioImportItem[]; errors: number }> => {
  const items: LezioImportItem[] = []
  let errors = 0

  for (const file of files) {
    if (file.name.toLowerCase().endsWith('.zip')) {
      try {
        const JSZip = (await import('jszip')).default
        const zip = await JSZip.loadAsync(file)
        const entries = Object.values(zip.files).filter((e) => !e.dir && isLezioEntry(e.name))
        for (const entry of entries) {
          try {
            items.push({ source: entry.name, data: parseLezio(await entry.async('string')) })
          } catch {
            errors++
          }
        }
      } catch {
        errors++
      }
    } else {
      try {
        items.push({ source: file.name, data: parseLezio(await file.text()) })
      } catch {
        errors++
      }
    }
  }

  return { items, errors }
}

/** Sentinel: in der Fächer-Zuordnung „neues Fach anlegen“ wählen. */
export const NEW_FACH = '__new__'

/** Baut die Erfolgsmeldung nach einem Import zusammen. */
export const importDoneMsg = (themen: number, neueFaecher: number, errors: number): string => {
  const teile = [`${themen} ${themen === 1 ? 'Thema' : 'Themen'} importiert`]
  if (neueFaecher > 0) teile.push(`${neueFaecher} ${neueFaecher === 1 ? 'neues Fach' : 'neue Fächer'} angelegt`)
  if (errors > 0) teile.push(`${errors} übersprungen`)
  return teile.join(' · ')
}
