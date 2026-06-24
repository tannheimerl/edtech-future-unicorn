import type { Fach } from '@/types/domain'

/**
 * Fächer-Matching für den Lernziel-Import.
 *
 * Beim Import von `.lezio`-Dateien kommt der Fachname als Freitext-String (`fachName`).
 * Verschiedene Lehrpersonen benennen dasselbe Fach unterschiedlich ("Mathe" vs.
 * "Mathematik", "Franz" vs. "Französisch"). Diese Helfer normalisieren Namen für einen
 * robusten exakten Vergleich und ranken ähnliche Fächer, damit die UI den
 * wahrscheinlichsten Kandidaten vorschlagen kann.
 */

/** Schwelle, ab der ein gerankter Treffer als „Vorschlag" gilt (0–1). */
export const SUGGEST_THRESHOLD = 0.6

/**
 * Normalisiert einen Fachnamen für den Vergleich:
 * trim → lowercase → Diakritika/Umlaute entfernen → Mehrfach-Whitespace kollabieren.
 * So matchen "Französisch", "franzoesisch " und "FRANZÖSISCH" auf denselben Wert.
 */
export function normalizeFachName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    // Umlaute ausschreiben, damit "ö" und "oe" gleich behandelt werden
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    // restliche Diakritika (é, è, ç …) auf Grundbuchstaben reduzieren
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
}

/** Findet ein Fach mit (nach Normalisierung) identischem Namen. */
export function findExactFachMatch(fachName: string, faecher: Fach[]): Fach | undefined {
  const target = normalizeFachName(fachName)
  return faecher.find((f) => normalizeFachName(f.name) === target)
}

/** Levenshtein-Distanz zwischen zwei Strings. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 0; i < a.length; i++) {
    const curr = [i + 1]
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1
      curr[j + 1] = Math.min(curr[j] + 1, prev[j + 1] + 1, prev[j] + cost)
    }
    prev = curr
  }
  return prev[b.length]
}

/**
 * Ähnlichkeitsscore zweier Fachnamen (0–1, höher = ähnlicher).
 * Präfix > Substring > Levenshtein-basierte Ähnlichkeit.
 */
export function fachSimilarity(a: string, b: string): number {
  const na = normalizeFachName(a)
  const nb = normalizeFachName(b)
  if (!na || !nb) return 0
  if (na === nb) return 1
  const shorter = Math.min(na.length, nb.length)
  const longer = Math.max(na.length, nb.length)
  // Präfix in eine der beiden Richtungen ("mathe" ⊂ "mathematik"). Ein aussagekräftiger
  // Präfix (≥ 3 Zeichen) ist ein starkes Signal → hoher Sockel, damit z.B. "Mathe"→"Mathematik"
  // (0.85) und "Franz"→"Französisch" (0.84) sicher über SUGGEST_THRESHOLD liegen.
  if (shorter >= 3 && (nb.startsWith(na) || na.startsWith(nb))) {
    return 0.7 + 0.3 * (shorter / longer)
  }
  // Substring-Enthaltensein
  if (shorter >= 3 && (nb.includes(na) || na.includes(nb))) {
    return 0.55 + 0.3 * (shorter / longer)
  }
  // Levenshtein-Ähnlichkeit als Tippfehlertoleranz
  const dist = levenshtein(na, nb)
  return Math.max(0, 1 - dist / Math.max(na.length, nb.length))
}

/**
 * Rankt alle Fächer nach Ähnlichkeit zum gegebenen Namen, bester zuerst.
 * Die UI nutzt das, um Kandidaten zu sortieren und den Top-Treffer
 * (score ≥ {@link SUGGEST_THRESHOLD}) als Vorschlag hervorzuheben.
 */
export function rankFachSuggestions(
  fachName: string,
  faecher: Fach[],
): { fach: Fach; score: number }[] {
  return faecher
    .map((fach) => ({ fach, score: fachSimilarity(fachName, fach.name) }))
    .sort((a, b) => b.score - a.score)
}
