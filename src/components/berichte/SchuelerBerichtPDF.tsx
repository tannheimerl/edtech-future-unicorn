import { Document, Page, View, Text, StyleSheet, Svg, Line, Circle, Path } from '@react-pdf/renderer'
import type { Status } from '@/types/domain'

// ── Palette ───────────────────────────────────────────────────────────────────

const ACCENT       = '#1e3a8a'
const ACCENT_LIGHT = '#eff6ff'
const TEXT         = '#0f172a'
const TEXT_MUTED   = '#64748b'
const BORDER       = '#cbd5e1'
const BG_HEADER    = '#f8fafc'
const PAGE_PAD     = 36

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: { paddingHorizontal: PAGE_PAD, paddingBottom: PAGE_PAD, paddingTop: 0, fontSize: 10, fontFamily: 'Helvetica', color: TEXT },

  // ── Accent strip ──
  accentStrip: { height: 3, backgroundColor: ACCENT, marginBottom: 20 },

  // ── Info row ──
  infoRow: { flexDirection: 'row', marginBottom: 16 },
  infoField: { flex: 1, marginRight: 8 },
  infoFieldLast: { flex: 1 },
  infoLabel: { fontSize: 7.5, color: TEXT_MUTED, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: TEXT, borderBottomWidth: 0.75, borderBottomColor: BORDER, paddingBottom: 4 },

  // ── Title block ──
  titleBlock: { marginBottom: 14 },
  titleMain: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: TEXT },
  titleSub: { fontSize: 10, color: TEXT_MUTED, marginTop: 2 },

  // ── Table ──
  table: { borderWidth: 0.75, borderColor: BORDER, marginBottom: 10 },

  // ── Table title row ──
  tableTitleRow: {
    backgroundColor: ACCENT_LIGHT,
    borderLeftWidth: 3, borderLeftColor: ACCENT,
    borderBottomWidth: 0.75, borderBottomColor: BORDER,
    paddingVertical: 5, paddingHorizontal: 8,
  },
  tableTitleText: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: ACCENT },

  // ── Column header row ──
  colHeaderRow: {
    flexDirection: 'row', backgroundColor: BG_HEADER,
    borderBottomWidth: 0.75, borderBottomColor: BORDER,
    minHeight: 44,
  },

  // ── Data row ──
  dataRow: {
    flexDirection: 'row',
    borderTopWidth: 0.75, borderTopColor: BORDER,
    minHeight: 30,
  },

  // ── Cells ──
  lzCell: { flex: 3, paddingVertical: 6, paddingHorizontal: 8, justifyContent: 'center' },
  statusCell: {
    flex: 0.85,
    borderLeftWidth: 0.75, borderLeftColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 4,
  },

  // ── Text ──
  colHeaderText: { fontSize: 8, textAlign: 'center', color: TEXT_MUTED, marginBottom: 5 },
  lzText: { fontSize: 9.5, lineHeight: 1.45, color: TEXT },

  // ── Bemerkung ──
  bemerkungSection: { borderWidth: 0.75, borderColor: BORDER, marginBottom: 10 },
  bemerkungHeader: {
    backgroundColor: BG_HEADER,
    borderBottomWidth: 0.75, borderBottomColor: BORDER,
    paddingVertical: 5, paddingHorizontal: 8,
  },
  bemerkungLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.4 },
  bemerkungBody: { padding: 8, minHeight: 70 },
  bemerkungText: { fontSize: 9.5, lineHeight: 1.55, color: TEXT },

  // ── Unterschrift ──
  unterschriftRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  unterschriftLabel: { fontSize: 10, color: TEXT_MUTED, marginRight: 14 },
  unterschriftLine: { flex: 1, borderBottomWidth: 0.75, borderBottomColor: BORDER },

  // ── Footer ──
  footer: {
    position: 'absolute', bottom: 16, left: PAGE_PAD, right: PAGE_PAD,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  footerText: { fontSize: 7.5, color: '#94a3b8' },
})

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function IconEmpty() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Circle cx="6" cy="6" r="5" fill="none" stroke={BORDER} strokeWidth={1.5} />
    </Svg>
  )
}

function IconHalf() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Circle cx="6" cy="6" r="5" fill="none" stroke={ACCENT} strokeWidth={1.5} />
      <Path d="M6,1 A5,5 0 0,1 6,11 Z" fill={ACCENT} />
    </Svg>
  )
}

function IconFull() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Circle cx="6" cy="6" r="5" fill={ACCENT} />
    </Svg>
  )
}

function CrossMark() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Line x1="2" y1="2" x2="12" y2="12" stroke={ACCENT} strokeWidth={2.2} strokeLinecap="round" />
      <Line x1="12" y1="2" x2="2" y2="12" stroke={ACCENT} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SchuelerBerichtPDFProps {
  studentName: string
  klassenName: string
  fachName: string
  themaName: string
  date: string
  lernziele: Array<{
    label: string
    kategorie: 'grundlegend' | 'anspruchsvoll'
    status: Status
  }>
  kommentar?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function grundlegendMark(status: Status, col: 'nicht' | 'erreicht'): boolean {
  if (col === 'nicht') return status === 'not_reached' || status === 'partially_reached'
  return status === 'reached'
}

function anspruchsvollMark(status: Status, col: 'nicht' | 'teilweise' | 'erreicht'): boolean {
  return (
    (col === 'nicht'    && status === 'not_reached')       ||
    (col === 'teilweise' && status === 'partially_reached') ||
    (col === 'erreicht' && status === 'reached')
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SchuelerBerichtPDF({
  studentName, klassenName, fachName, themaName, date, lernziele, kommentar,
}: SchuelerBerichtPDFProps) {
  const grundlegend   = lernziele.filter((lz) => lz.kategorie === 'grundlegend')
  const anspruchsvoll = lernziele.filter((lz) => lz.kategorie === 'anspruchsvoll')

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Accent strip ── */}
        <View style={s.accentStrip} />

        {/* ── Info row: Name / Klasse / Datum ── */}
        <View style={s.infoRow}>
          <View style={s.infoField}>
            <Text style={s.infoLabel}>Schüler/in</Text>
            <Text style={s.infoValue}>{studentName}</Text>
          </View>
          <View style={s.infoField}>
            <Text style={s.infoLabel}>Klasse</Text>
            <Text style={s.infoValue}>{klassenName}</Text>
          </View>
          <View style={s.infoFieldLast}>
            <Text style={s.infoLabel}>Datum</Text>
            <Text style={s.infoValue}>{date}</Text>
          </View>
        </View>

        {/* ── Title block ── */}
        <View style={s.titleBlock}>
          <Text style={s.titleMain}>Beurteilung: {fachName}</Text>
          <Text style={s.titleSub}>{themaName}</Text>
        </View>

        {/* ── Grundlegende Lernziele ── */}
        <View style={s.table}>
          <View style={s.tableTitleRow}>
            <Text style={s.tableTitleText}>grundlegende Lernziele</Text>
          </View>

          <View style={s.colHeaderRow}>
            <View style={s.lzCell} />
            <View style={s.statusCell}>
              <Text style={s.colHeaderText}>{'noch nicht\nerreicht'}</Text>
              <IconEmpty />
            </View>
            <View style={s.statusCell}>
              <Text style={s.colHeaderText}>erreicht</Text>
              <IconFull />
            </View>
          </View>

          {grundlegend.map((lz, i) => (
            <View key={i} style={s.dataRow}>
              <View style={s.lzCell}>
                <Text style={s.lzText}>{lz.label}</Text>
              </View>
              <View style={s.statusCell}>
                {grundlegendMark(lz.status, 'nicht') && <CrossMark />}
              </View>
              <View style={s.statusCell}>
                {grundlegendMark(lz.status, 'erreicht') && <CrossMark />}
              </View>
            </View>
          ))}

          {Array.from({ length: Math.max(0, 4 - grundlegend.length) }).map((_, i) => (
            <View key={`eg${i}`} style={s.dataRow}>
              <View style={s.lzCell} />
              <View style={s.statusCell} />
              <View style={s.statusCell} />
            </View>
          ))}
        </View>

        {/* ── Anspruchsvollere Lernziele ── */}
        <View style={s.table}>
          <View style={s.tableTitleRow}>
            <Text style={s.tableTitleText}>anspruchsvollere Lernziele</Text>
          </View>

          <View style={s.colHeaderRow}>
            <View style={s.lzCell} />
            <View style={s.statusCell}>
              <Text style={s.colHeaderText}>{'noch nicht\nerreicht'}</Text>
              <IconEmpty />
            </View>
            <View style={s.statusCell}>
              <Text style={s.colHeaderText}>{'teilweise\nerreicht'}</Text>
              <IconHalf />
            </View>
            <View style={s.statusCell}>
              <Text style={s.colHeaderText}>erreicht</Text>
              <IconFull />
            </View>
          </View>

          {anspruchsvoll.map((lz, i) => (
            <View key={i} style={s.dataRow}>
              <View style={s.lzCell}>
                <Text style={s.lzText}>{lz.label}</Text>
              </View>
              <View style={s.statusCell}>
                {anspruchsvollMark(lz.status, 'nicht') && <CrossMark />}
              </View>
              <View style={s.statusCell}>
                {anspruchsvollMark(lz.status, 'teilweise') && <CrossMark />}
              </View>
              <View style={s.statusCell}>
                {anspruchsvollMark(lz.status, 'erreicht') && <CrossMark />}
              </View>
            </View>
          ))}

          {Array.from({ length: Math.max(0, 4 - anspruchsvoll.length) }).map((_, i) => (
            <View key={`ea${i}`} style={s.dataRow}>
              <View style={s.lzCell} />
              <View style={s.statusCell} />
              <View style={s.statusCell} />
              <View style={s.statusCell} />
            </View>
          ))}
        </View>

        {/* ── Bemerkung Lehrperson ── */}
        <View style={s.bemerkungSection}>
          <View style={s.bemerkungHeader}>
            <Text style={s.bemerkungLabel}>Bemerkung Lehrperson</Text>
          </View>
          <View style={s.bemerkungBody}>
            {kommentar && <Text style={s.bemerkungText}>{kommentar}</Text>}
          </View>
        </View>

        {/* ── Unterschrift Eltern ── */}
        <View style={s.unterschriftRow}>
          <Text style={s.unterschriftLabel}>Unterschrift Eltern:</Text>
          <View style={s.unterschriftLine} />
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{date}</Text>
          <Text style={s.footerText}>Lezio</Text>
        </View>

      </Page>
    </Document>
  )
}
