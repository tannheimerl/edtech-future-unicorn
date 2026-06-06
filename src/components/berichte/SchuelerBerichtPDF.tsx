import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { Status } from '@/types/domain'

// ── Styles ────────────────────────────────────────────────────────────────────

const BORDER = 0.75
const BORDER_COLOR = '#475569'
const HEADER_BG = '#bfdbfe'   // blue for title row
const COL_BG = '#e2e8f0'      // grey for sub-headers
const MARKER_COLOR = '#1d4ed8'
const PAGE_PAD = 32

const s = StyleSheet.create({
  page: { padding: PAGE_PAD, fontSize: 10, fontFamily: 'Helvetica' },

  // ── Name row ──
  nameRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 },
  nameBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: BORDER, borderColor: BORDER_COLOR,
    paddingVertical: 4, paddingHorizontal: 8, minWidth: 200,
  },
  nameLabel: { fontSize: 10, marginRight: 8 },
  nameValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', flex: 1 },

  // ── Table wrapper ──
  table: { borderWidth: BORDER, borderColor: BORDER_COLOR, marginBottom: 8 },

  // ── Title row ──
  titleRow: {
    backgroundColor: HEADER_BG,
    paddingVertical: 5, paddingHorizontal: 6,
    borderBottomWidth: BORDER, borderBottomColor: BORDER_COLOR,
  },
  titleText: { fontSize: 11, fontFamily: 'Helvetica-Bold' },

  // ── Column header row ──
  colHeaderRow: {
    flexDirection: 'row', backgroundColor: COL_BG,
    borderBottomWidth: BORDER, borderBottomColor: BORDER_COLOR,
    minHeight: 38,
  },

  // ── Data row ──
  dataRow: {
    flexDirection: 'row',
    borderTopWidth: BORDER, borderTopColor: BORDER_COLOR,
    minHeight: 28,
  },

  // ── Cells ──
  lzCell: { flex: 3, paddingVertical: 5, paddingHorizontal: 6, justifyContent: 'center' },
  statusCell2: {
    flex: 1,
    borderLeftWidth: BORDER, borderLeftColor: BORDER_COLOR,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 4, paddingHorizontal: 3,
  },
  statusCell3: {
    flex: 1,
    borderLeftWidth: BORDER, borderLeftColor: BORDER_COLOR,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 4, paddingHorizontal: 3,
  },

  // ── Text styles ──
  colHeaderText: { fontSize: 9, textAlign: 'center', color: '#1e293b' },
  colHeaderIcon: { fontSize: 13, textAlign: 'center', marginTop: 2 },
  lzText: { fontSize: 9.5, lineHeight: 1.4, color: '#1e293b' },
  categoryLabel: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#1e293b' },
  marker: { fontSize: 14, color: MARKER_COLOR, textAlign: 'center' },

  // ── Bemerkung ──
  bemerkungSection: {
    borderWidth: BORDER, borderColor: BORDER_COLOR,
    marginBottom: 8, minHeight: 60,
  },
  bemerkungHeader: {
    borderBottomWidth: BORDER, borderBottomColor: BORDER_COLOR,
    paddingVertical: 4, paddingHorizontal: 6, backgroundColor: COL_BG,
  },
  bemerkungBody: { padding: 6, minHeight: 44 },
  bemerkungText: { fontSize: 9.5, lineHeight: 1.5, color: '#1e293b' },

  // ── Unterschrift ──
  unterschriftSection: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  unterschriftLabel: { fontSize: 10, marginRight: 12 },
  unterschriftLine: { flex: 1, borderBottomWidth: BORDER, borderBottomColor: BORDER_COLOR },

  // ── Footer ──
  footer: {
    position: 'absolute', bottom: 18, left: PAGE_PAD, right: PAGE_PAD,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  footerText: { fontSize: 7.5, color: '#94a3b8' },
})

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

// For grundlegend: binary — "not reached" bucket covers not_reached + partially_reached
function grundlegendMark(status: Status, col: 'nicht' | 'erreicht'): boolean {
  if (col === 'nicht') return status === 'not_reached' || status === 'partially_reached'
  return status === 'reached'
}

function anspruchsvollMark(status: Status, col: 'nicht' | 'teilweise' | 'erreicht'): boolean {
  return (
    (col === 'nicht' && status === 'not_reached') ||
    (col === 'teilweise' && status === 'partially_reached') ||
    (col === 'erreicht' && status === 'reached')
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SchuelerBerichtPDF({
  studentName, klassenName, fachName, themaName, date, lernziele, kommentar,
}: SchuelerBerichtPDFProps) {
  const grundlegend = lernziele.filter((lz) => lz.kategorie === 'grundlegend')
  const anspruchsvoll = lernziele.filter((lz) => lz.kategorie === 'anspruchsvoll')
  const title = `Beurteilung: ${fachName}, ${themaName}`

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Name */}
        <View style={s.nameRow}>
          <View style={s.nameBox}>
            <Text style={s.nameLabel}>Name:</Text>
            <Text style={s.nameValue}>{studentName}</Text>
          </View>
        </View>

        {/* ── Grundlegende Lernziele ── */}
        <View style={s.table}>
          <View style={s.titleRow}>
            <Text style={s.titleText}>{title}</Text>
          </View>

          {/* Column headers */}
          <View style={s.colHeaderRow}>
            <View style={s.lzCell}>
              <Text style={s.categoryLabel}>grundlegende Lernziele</Text>
            </View>
            <View style={s.statusCell2}>
              <Text style={s.colHeaderText}>{'noch nicht\nerreicht'}</Text>
              <Text style={s.colHeaderIcon}>○</Text>
            </View>
            <View style={s.statusCell2}>
              <Text style={s.colHeaderText}>erreicht</Text>
              <Text style={s.colHeaderIcon}>✓</Text>
            </View>
          </View>

          {/* Rows */}
          {grundlegend.map((lz, i) => (
            <View key={i} style={s.dataRow}>
              <View style={s.lzCell}>
                <Text style={s.lzText}>{lz.label}</Text>
              </View>
              <View style={s.statusCell2}>
                {grundlegendMark(lz.status, 'nicht') && <Text style={s.marker}>●</Text>}
              </View>
              <View style={s.statusCell2}>
                {grundlegendMark(lz.status, 'erreicht') && <Text style={s.marker}>●</Text>}
              </View>
            </View>
          ))}

          {/* Empty filler rows (min 4 rows total) */}
          {Array.from({ length: Math.max(0, 4 - grundlegend.length) }).map((_, i) => (
            <View key={`empty-g-${i}`} style={s.dataRow}>
              <View style={s.lzCell} />
              <View style={s.statusCell2} />
              <View style={s.statusCell2} />
            </View>
          ))}
        </View>

        {/* ── Anspruchsvollere Lernziele ── */}
        <View style={s.table}>
          {/* Column headers */}
          <View style={s.colHeaderRow}>
            <View style={s.lzCell}>
              <Text style={s.categoryLabel}>anspruchsvollere Lernziele</Text>
            </View>
            <View style={s.statusCell3}>
              <Text style={s.colHeaderText}>{'noch\nnicht\nerreicht'}</Text>
              <Text style={s.colHeaderIcon}>○</Text>
            </View>
            <View style={s.statusCell3}>
              <Text style={s.colHeaderText}>{'teilweise\nerreicht'}</Text>
              <Text style={s.colHeaderIcon}>◐</Text>
            </View>
            <View style={s.statusCell3}>
              <Text style={s.colHeaderText}>erreicht</Text>
              <Text style={s.colHeaderIcon}>✓</Text>
            </View>
          </View>

          {/* Rows */}
          {anspruchsvoll.map((lz, i) => (
            <View key={i} style={s.dataRow}>
              <View style={s.lzCell}>
                <Text style={s.lzText}>{lz.label}</Text>
              </View>
              <View style={s.statusCell3}>
                {anspruchsvollMark(lz.status, 'nicht') && <Text style={s.marker}>●</Text>}
              </View>
              <View style={s.statusCell3}>
                {anspruchsvollMark(lz.status, 'teilweise') && <Text style={s.marker}>●</Text>}
              </View>
              <View style={s.statusCell3}>
                {anspruchsvollMark(lz.status, 'erreicht') && <Text style={s.marker}>●</Text>}
              </View>
            </View>
          ))}

          {/* Empty filler rows */}
          {Array.from({ length: Math.max(0, 4 - anspruchsvoll.length) }).map((_, i) => (
            <View key={`empty-a-${i}`} style={s.dataRow}>
              <View style={s.lzCell} />
              <View style={s.statusCell3} />
              <View style={s.statusCell3} />
              <View style={s.statusCell3} />
            </View>
          ))}
        </View>

        {/* ── Bemerkung Lehrperson ── */}
        <View style={s.bemerkungSection}>
          <View style={s.bemerkungHeader}>
            <Text style={s.categoryLabel}>Bemerkung Lehrperson:</Text>
          </View>
          <View style={s.bemerkungBody}>
            {kommentar && <Text style={s.bemerkungText}>{kommentar}</Text>}
          </View>
        </View>

        {/* ── Unterschrift Eltern ── */}
        <View style={s.unterschriftSection}>
          <Text style={s.unterschriftLabel}>Unterschrift Eltern:</Text>
          <View style={s.unterschriftLine} />
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Klasse {klassenName} · {date}</Text>
          <Text style={s.footerText}>Lezio</Text>
        </View>

      </Page>
    </Document>
  )
}
