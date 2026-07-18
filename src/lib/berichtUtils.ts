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
