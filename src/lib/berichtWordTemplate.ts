// Leere .docx-Vorlage mit der gleichen Struktur wie SchuelerBerichtPDF.tsx
// (Info-Zeile, Titel, Lernziel-Tabellen mit Titel-Leiste, Bemerkung,
// Unterschrift), zum manuellen Ausfüllen durch die Lehrperson in Word.

import type { BerichtIcons, Status } from '@/types/domain'
import { DEFAULT_BERICHT_ICONS } from '@/types/domain'
import {
  BERICHT_ACCENT, BERICHT_BORDER, resolveBerichtIcons, dataUrlToBytes,
} from '@/lib/berichtIcons'

// docx erwartet Hex ohne '#'.
const ACCENT = BERICHT_ACCENT.slice(1).toUpperCase()
const ACCENT_LIGHT = 'EFF6FF'
const TEXT = '0F172A'
const TEXT_MUTED = '64748B'
const BORDER_COLOR = BERICHT_BORDER.slice(1).toUpperCase()
const BG_HEADER = 'F8FAFC'

export const generateBerichtWordTemplateBlob = async (
  icons: BerichtIcons = DEFAULT_BERICHT_ICONS,
): Promise<Blob> => {
  const [
    {
      Document, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
      AlignmentType, BorderStyle, WidthType, LineRuleType, Packer,
    },
    resolved,
  ] = await Promise.all([import('docx'), resolveBerichtIcons(icons)])

  // docx kann kein SVG — die in den Einstellungen gewählten Icons kommen
  // deshalb über denselben Canvas-Umweg wie im PDF als PNG herein.
  const iconBytes: Record<Status, Uint8Array> = {
    not_reached: dataUrlToBytes(resolved.not_reached),
    partially_reached: dataUrlToBytes(resolved.partially_reached),
    reached: dataUrlToBytes(resolved.reached),
  }

  const thinBorder = { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR }
  const cellBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }
  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  const noCellBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }

  // ── Accent strip (dünner blauer Balken oben, wie im PDF) ──────────────────
  const accentStrip = new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 24, color: ACCENT } },
    spacing: { after: 260 },
    children: [new TextRun({ text: '' })],
  })

  // ── Info-Zeile: Schüler/in | Klasse | Datum, nebeneinander ────────────────
  const infoCell = (label: string) =>
    new TableCell({
      width: { size: 33.33, type: WidthType.PERCENTAGE },
      borders: noCellBorders,
      margins: { right: 200 },
      children: [
        new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: label.toUpperCase(), size: 15, color: TEXT_MUTED, characterSpacing: 10 })],
        }),
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR } },
          spacing: { after: 0 },
          children: [new TextRun({ text: ' ', size: 21 })],
        }),
      ],
    })

  const infoRow = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: [infoCell('Schüler/in'), infoCell('Klasse'), infoCell('Datum')] })],
  })

  // ── Titelblock: "Beurteilung: <Fach>" + <Thema> ───────────────────────────
  const titleBlock = [
    new Paragraph({
      spacing: { before: 320, after: 40 },
      children: [
        new TextRun({ text: 'Beurteilung: ', bold: true, size: 26, color: TEXT }),
        new TextRun({ text: '_'.repeat(24), bold: true, size: 26, color: TEXT }),
      ],
    }),
    new Paragraph({
      spacing: { after: 280 },
      children: [new TextRun({ text: '_'.repeat(30), size: 20, color: TEXT_MUTED })],
    }),
  ]

  // ── Titel-Leiste einer Tabelle (blau hinterlegt) ──────────────────────────
  const titleBarRow = (text: string, colSpan: number) =>
    new TableRow({
      children: [
        new TableCell({
          columnSpan: colSpan,
          shading: { fill: ACCENT_LIGHT },
          borders: {
            top: thinBorder,
            bottom: thinBorder,
            left: thinBorder,
            right: thinBorder,
          },
          margins: { top: 80, bottom: 80, left: 140 },
          children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 19, color: ACCENT })] })],
        }),
      ],
    })

  const headerCell = (text: string, widthPct: number, status?: Status) =>
    new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      borders: cellBorders,
      shading: { fill: BG_HEADER },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: status ? 60 : 0 }, children: [new TextRun({ text, size: 16, color: TEXT_MUTED })] }),
        ...(status ? [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new ImageRun({ type: 'png', data: iconBytes[status], transformation: { width: 16, height: 16 } })],
        })] : []),
      ],
    })

  const blankLzRow = (statusCols: number, lzColWidth: number) =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: lzColWidth, type: WidthType.PERCENTAGE },
          borders: cellBorders,
          children: [new Paragraph({ text: '' })],
        }),
        ...Array.from({ length: statusCols }).map(() =>
          new TableCell({
            width: { size: (100 - lzColWidth) / statusCols, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            children: [new Paragraph({ text: '' })],
          })
        ),
      ],
    })

  // ── Lernziel-Tabelle: Titel-Leiste + Spaltenköpfe (mit Status-Icon) + leere Zeilen ──
  const lzTable = (title: string, columns: Array<{ label: string; status: Status }>) => {
    const lzColWidth = 100 - columns.length * 15
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        titleBarRow(title, columns.length + 1),
        new TableRow({
          children: [
            headerCell('', lzColWidth),
            ...columns.map(c => headerCell(c.label, (100 - lzColWidth) / columns.length, c.status)),
          ],
        }),
        ...Array.from({ length: 5 }).map(() => blankLzRow(columns.length, lzColWidth)),
      ],
    })
  }

  // ── Bemerkung Lehrperson: Titel-Leiste + leere Box zum Beschriften ────────
  const bemerkungBox = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      titleBarRow('Bemerkung Lehrperson', 1),
      new TableRow({
        children: [
          new TableCell({
            borders: { top: noBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
            children: Array.from({ length: 5 }).map(() => new Paragraph({ text: '' })),
          }),
        ],
      }),
    ],
  })

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial' },
          paragraph: { spacing: { after: 0, line: 240, lineRule: LineRuleType.AUTO } },
        },
      },
    },
    sections: [{
      properties: {
        page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
      },
      children: [
        accentStrip,
        infoRow,
        ...titleBlock,
        lzTable('Grundlegende Lernziele', [
          { label: 'noch nicht erreicht', status: 'not_reached' },
          { label: 'erreicht', status: 'reached' },
        ]),
        new Paragraph({ text: '', spacing: { after: 200 } }),
        lzTable('Anspruchsvollere Lernziele', [
          { label: 'noch nicht erreicht', status: 'not_reached' },
          { label: 'teilweise erreicht', status: 'partially_reached' },
          { label: 'erreicht', status: 'reached' },
        ]),
        new Paragraph({ text: '', spacing: { after: 200 } }),
        bemerkungBox,
        new Paragraph({
          spacing: { before: 400, after: 400 },
          children: [
            new TextRun({ text: 'Unterschrift Eltern: ', size: 20, color: TEXT_MUTED }),
            new TextRun({ text: '_'.repeat(40), size: 20 }),
          ],
        }),
      ],
    }],
  })

  return Packer.toBlob(doc)
}
