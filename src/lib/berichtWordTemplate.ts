// Leere .docx-Vorlage mit der gleichen Struktur wie SchuelerBerichtPDF.tsx
// (Info-Zeile, Titel, Lernziel-Tabellen mit Titel-Leiste, Bemerkung,
// Unterschrift), zum manuellen Ausfüllen durch die Lehrperson in Word.

const ACCENT = '1E3A8A'
const ACCENT_LIGHT = 'EFF6FF'
const TEXT = '0F172A'
const TEXT_MUTED = '64748B'
const BORDER_COLOR = 'CBD5E1'
const BG_HEADER = 'F8FAFC'

type IconKind = 'empty' | 'half' | 'full'

// Zeichnet die Status-Icons aus SchuelerBerichtPDF.tsx (IconEmpty/IconHalf/
// IconFull) als PNG nach, statt sie mit Unicode-Zeichen anzunähern — bei
// 4-facher Auflösung für scharfe Darstellung auch bei Ausdruck.
const createCircleIconPng = (kind: IconKind): Uint8Array => {
  const scale = 4
  const size = 16 * scale
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 3 * scale

  if (kind === 'full') {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = `#${ACCENT}`
    ctx.fill()
  } else if (kind === 'half') {
    ctx.lineWidth = 1.5 * scale
    ctx.strokeStyle = `#${ACCENT}`
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx, cy - r)
    ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2)
    ctx.closePath()
    ctx.fillStyle = `#${ACCENT}`
    ctx.fill()
  } else {
    ctx.lineWidth = 1.5 * scale
    ctx.strokeStyle = `#${BORDER_COLOR}`
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  const base64 = canvas.toDataURL('image/png').split(',')[1]
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export const generateBerichtWordTemplateBlob = async (): Promise<Blob> => {
  const {
    Document, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
    AlignmentType, BorderStyle, WidthType, LineRuleType, Packer,
  } = await import('docx')

  const icons: Record<IconKind, Uint8Array> = {
    empty: createCircleIconPng('empty'),
    half: createCircleIconPng('half'),
    full: createCircleIconPng('full'),
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

  // ── Titel-Leiste einer Tabelle (blau hinterlegt, linker Akzentstrich) ─────
  const titleBarRow = (text: string, colSpan: number) =>
    new TableRow({
      children: [
        new TableCell({
          columnSpan: colSpan,
          shading: { fill: ACCENT_LIGHT },
          borders: {
            top: thinBorder,
            bottom: thinBorder,
            left: { style: BorderStyle.SINGLE, size: 24, color: ACCENT },
            right: thinBorder,
          },
          margins: { top: 80, bottom: 80, left: 140 },
          children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 19, color: ACCENT })] })],
        }),
      ],
    })

  const headerCell = (text: string, widthPct: number, icon?: IconKind) =>
    new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      borders: cellBorders,
      shading: { fill: BG_HEADER },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: icon ? 60 : 0 }, children: [new TextRun({ text, size: 16, color: TEXT_MUTED })] }),
        ...(icon ? [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new ImageRun({ type: 'png', data: icons[icon], transformation: { width: 16, height: 16 } })],
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
  const lzTable = (title: string, columns: Array<{ label: string; icon: IconKind }>) => {
    const lzColWidth = 100 - columns.length * 15
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        titleBarRow(title, columns.length + 1),
        new TableRow({
          children: [
            headerCell('', lzColWidth),
            ...columns.map(c => headerCell(c.label, (100 - lzColWidth) / columns.length, c.icon)),
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
        lzTable('grundlegende Lernziele', [
          { label: 'noch nicht erreicht', icon: 'empty' },
          { label: 'erreicht', icon: 'full' },
        ]),
        new Paragraph({ text: '', spacing: { after: 200 } }),
        lzTable('anspruchsvollere Lernziele', [
          { label: 'noch nicht erreicht', icon: 'empty' },
          { label: 'teilweise erreicht', icon: 'half' },
          { label: 'erreicht', icon: 'full' },
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
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'Lezio', size: 15, color: TEXT_MUTED })],
        }),
      ],
    }],
  })

  return Packer.toBlob(doc)
}
