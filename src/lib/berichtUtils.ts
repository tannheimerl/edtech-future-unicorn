import { createElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import type { SchuelerBerichtPDFProps } from '@/components/berichte/SchuelerBerichtPDF'

export const generatePdfBlob = async (props: SchuelerBerichtPDFProps): Promise<Blob> => {
  const [{ pdf }, { SchuelerBerichtPDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/berichte/SchuelerBerichtPDF'),
  ])
  const el = createElement(SchuelerBerichtPDF, props) as unknown as ReactElement<DocumentProps>
  return pdf(el).toBlob()
}

// Ein einzelnes PDF mit allen übergebenen Berichten, je Schüler/in eigene Seite(n).
export const generateCombinedPdfBlob = async (berichte: SchuelerBerichtPDFProps[]): Promise<Blob> => {
  const [{ pdf }, { GesamtBerichtPDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/berichte/SchuelerBerichtPDF'),
  ])
  const el = createElement(GesamtBerichtPDF, { berichte }) as unknown as ReactElement<DocumentProps>
  return pdf(el).toBlob()
}

// Unterordner für die Einzel-PDFs im ZIP, wenn ein Gesamt-PDF mitgeliefert wird.
const EINZELBERICHTE_FOLDER = 'Einzelberichte'

export const downloadZip = async (
  entries: Array<{ filename: string; blob: Blob }>,
  zipName: string,
  combined?: { filename: string; blob: Blob }
): Promise<void> => {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  if (combined) {
    // Gesamt-PDF sichtbar auf oberster Ebene, Einzel-PDFs sauber in einem Unterordner.
    zip.file(combined.filename, combined.blob)
    const folder = zip.folder(EINZELBERICHTE_FOLDER)!
    for (const { filename, blob } of entries) {
      folder.file(filename, blob)
    }
  } else {
    for (const { filename, blob } of entries) {
      zip.file(filename, blob)
    }
  }
  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  triggerDownload(zipBlob, zipName)
}

export const triggerDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Entfernt Pfad-/Sonderzeichen aus Namensbestandteilen (Schüler- und
// Themennamen sind Freitext) und ersetzt Whitespace durch Unterstriche.
export const sanitizeFilename = (name: string): string => {
  return name.replace(/[\\/:*?"<>|]/g, '').trim().replace(/\s+/g, '_')
}

/**
 * Erzeugt alle Berichts-PDFs und lädt sie herunter: ein einzelnes PDF direkt,
 * mehrere gebündelt als ZIP (Gesamt-PDF oben, Einzel-PDFs in Einzelberichte/).
 */
export const downloadBerichte = async (
  berichte: Array<{ filename: string; props: SchuelerBerichtPDFProps }>,
  zipName: string,
  combinedFilename: string
): Promise<void> => {
  const entries = await Promise.all(
    berichte.map(async ({ filename, props }) => ({ filename, blob: await generatePdfBlob(props) }))
  )
  if (entries.length === 1) {
    triggerDownload(entries[0].blob, entries[0].filename)
    return
  }
  const combinedBlob = await generateCombinedPdfBlob(berichte.map(({ props }) => props))
  await downloadZip(entries, zipName, { filename: combinedFilename, blob: combinedBlob })
}
