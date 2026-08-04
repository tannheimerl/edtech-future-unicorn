import { createElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import type { SchuelerBerichtPDFProps } from '@/components/berichte/SchuelerBerichtPDF'
import { saveBlobToDisk } from '@/lib/tauriFile'

export const generatePdfBlob = async (props: SchuelerBerichtPDFProps): Promise<Blob> => {
  const [{ pdf }, { SchuelerBerichtPDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/berichte/SchuelerBerichtPDF'),
  ])
  const el = createElement(SchuelerBerichtPDF, props) as unknown as ReactElement<DocumentProps>
  return pdf(el).toBlob()
}

export const downloadZip = async (
  entries: Array<{ filename: string; blob: Blob }>,
  zipName: string
): Promise<void> => {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  for (const { filename, blob } of entries) {
    zip.file(filename, blob)
  }
  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  await triggerDownload(zipBlob, zipName)
}

export const triggerDownload = async (blob: Blob, filename: string): Promise<void> => {
  const extension = filename.includes('.') ? filename.split('.').pop() : undefined
  await saveBlobToDisk(blob, filename, extension ? [{ name: extension.toUpperCase(), extensions: [extension] }] : undefined)
}

// Entfernt Pfad-/Sonderzeichen aus Namensbestandteilen (Schüler- und
// Themennamen sind Freitext) und ersetzt Whitespace durch Unterstriche.
export const sanitizeFilename = (name: string): string => {
  return name.replace(/[\\/:*?"<>|]/g, '').trim().replace(/\s+/g, '_')
}

/**
 * Erzeugt alle Berichts-PDFs und lädt sie herunter:
 * ein einzelnes PDF direkt, mehrere gebündelt als ZIP.
 */
export const downloadBerichte = async (
  berichte: Array<{ filename: string; props: SchuelerBerichtPDFProps }>,
  zipName: string
): Promise<void> => {
  const entries = await Promise.all(
    berichte.map(async ({ filename, props }) => ({ filename, blob: await generatePdfBlob(props) }))
  )
  if (entries.length === 1) {
    await triggerDownload(entries[0].blob, entries[0].filename)
  } else {
    await downloadZip(entries, zipName)
  }
}
