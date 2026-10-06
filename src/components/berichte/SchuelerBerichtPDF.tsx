import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Svg,
  Line,
} from "@react-pdf/renderer";
import type { Status } from "@/types/domain";
import {
  BERICHT_ACCENT,
  BERICHT_BORDER,
  type ResolvedBerichtIcons,
} from "@/lib/berichtIcons";

// ── Palette ───────────────────────────────────────────────────────────────────

const ACCENT = BERICHT_ACCENT;
const ACCENT_LIGHT = "#eff6ff";
const TEXT = "#0f172a";
const TEXT_MUTED = "#64748b";
const BORDER = BERICHT_BORDER;
const BG_HEADER = "#f8fafc";
const PAGE_PAD = 36;

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    paddingHorizontal: PAGE_PAD,
    paddingBottom: PAGE_PAD,
    paddingTop: 0,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: TEXT,
  },

  // ── Accent strip ──
  accentStrip: { height: 3, backgroundColor: ACCENT, marginBottom: 20 },

  // ── Info row ──
  infoRow: { flexDirection: "row", marginBottom: 16 },
  infoField: { flex: 1, marginRight: 8 },
  infoFieldLast: { flex: 1 },
  infoLabel: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: TEXT,
    borderBottomWidth: 0.75,
    borderBottomColor: BORDER,
    paddingBottom: 4,
  },

  // ── Title block ──
  titleBlock: { marginBottom: 14 },
  titleMain: { fontSize: 13, fontFamily: "Helvetica-Bold", color: TEXT },
  titleSub: { fontSize: 10, color: TEXT_MUTED, marginTop: 2 },

  // ── Table ──
  table: { borderWidth: 0.75, borderColor: BORDER, marginBottom: 10 },

  // ── Table title row ──
  tableTitleRow: {
    backgroundColor: ACCENT_LIGHT,
    borderBottomWidth: 0.75,
    borderBottomColor: BORDER,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableTitleText: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
  },

  // ── Column header row ──
  colHeaderRow: {
    flexDirection: "row",
    backgroundColor: BG_HEADER,
    borderBottomWidth: 0.75,
    borderBottomColor: BORDER,
    minHeight: 44,
  },

  // ── Data row ──
  dataRow: {
    flexDirection: "row",
    borderTopWidth: 0.75,
    borderTopColor: BORDER,
    minHeight: 30,
  },

  // ── Cells ──
  lzCell: {
    flex: 3,
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  statusCell: {
    flex: 0.85,
    borderLeftWidth: 0.75,
    borderLeftColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },

  // Ersetzt die früheren 12×12-SVG-Kreise — gleiche Kantenlänge, damit die
  // Kopfzeilenhöhe unverändert bleibt. `objectFit` hält hochgeladene Bilder
  // mit abweichendem Seitenverhältnis unverzerrt.
  legendIcon: { width: 12, height: 12, objectFit: "contain" },

  // ── Text ──
  colHeaderText: {
    fontSize: 8,
    textAlign: "center",
    color: TEXT_MUTED,
    marginBottom: 5,
  },
  lzText: { fontSize: 9.5, lineHeight: 1.45, color: TEXT },

  // ── Empty state ──
  emptyState: {
    borderWidth: 0.75,
    borderColor: BORDER,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  emptyStateText: { fontSize: 9.5, color: TEXT_MUTED },

  // ── Bemerkung ──
  bemerkungSection: {
    borderWidth: 0.75,
    borderColor: BORDER,
    marginBottom: 10,
  },
  bemerkungHeader: {
    backgroundColor: BG_HEADER,
    borderBottomWidth: 0.75,
    borderBottomColor: BORDER,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  bemerkungLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  bemerkungBody: { padding: 8, minHeight: 70 },
  bemerkungText: { fontSize: 9.5, lineHeight: 1.55, color: TEXT },

  // ── Unterschrift ──
  // Die Linie ist eine View, die nur aus ihrem unteren Rahmen besteht:
  // `flex-end` legt diesen Rahmen auf die Unterkante des Labels (Unterstrich
  // statt Strich quer durch den Text), `height` schafft den Schreibraum
  // darüber.
  unterschriftRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 18,
  },
  unterschriftLabel: { fontSize: 10, color: TEXT_MUTED, marginRight: 14 },
  unterschriftLine: {
    flex: 1,
    height: 24,
    borderBottomWidth: 0.75,
    borderBottomColor: BORDER,
  },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 16,
    left: PAGE_PAD,
    right: PAGE_PAD,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7.5, color: "#94a3b8" },
});

// ── Icons ─────────────────────────────────────────────────────────────────────

/**
 * Legenden-Icon im Spaltenkopf. Die Quelle ist eine PNG-Data-URL, die der
 * Aufrufer über `resolveBerichtIcons` erzeugt hat — entweder aus dem in den
 * Einstellungen gewählten Material Symbol oder aus einem hochgeladenen Bild.
 */
const StatusLegendIcon = ({ src }: { src: string }) => {
  // eslint-disable-next-line jsx-a11y/alt-text -- react-pdfs <Image> ist keine
  // HTML-Grafik und kennt kein alt-Attribut.
  return <Image src={src} style={s.legendIcon} />;
};

const CrossMark = () => {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Line
        x1="2"
        y1="2"
        x2="12"
        y2="12"
        stroke={ACCENT}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <Line
        x1="12"
        y1="2"
        x2="2"
        y2="12"
        stroke={ACCENT}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
};

// ── Types ─────────────────────────────────────────────────────────────────────

export type SchuelerBerichtPDFProps = {
  studentName: string;
  klassenName: string;
  fachName: string;
  themaName: string;
  date: string;
  lernziele: Array<{
    label: string;
    kategorie: "grundlegend" | "anspruchsvoll";
    status: Status;
  }>;
  kommentar?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const grundlegendMark = (
  status: Status,
  col: "nicht" | "erreicht",
): boolean => {
  if (col === "nicht")
    return status === "not_reached" || status === "partially_reached";
  return status === "reached";
};

const anspruchsvollMark = (
  status: Status,
  col: "nicht" | "teilweise" | "erreicht",
): boolean => {
  return (
    (col === "nicht" && status === "not_reached") ||
    (col === "teilweise" && status === "partially_reached") ||
    (col === "erreicht" && status === "reached")
  );
};

// ── Component: einzelne Seite ────────────────────────────────────────────────

export const SchuelerBerichtPage = ({
  studentName,
  klassenName,
  fachName,
  themaName,
  date,
  lernziele,
  kommentar,
  statusIcons,
  hidePageNumbers,
}: SchuelerBerichtPDFProps & {
  statusIcons: ResolvedBerichtIcons;
  hidePageNumbers?: boolean;
}) => {
  const grundlegend = lernziele.filter((lz) => lz.kategorie === "grundlegend");
  const anspruchsvoll = lernziele.filter(
    (lz) => lz.kategorie === "anspruchsvoll",
  );

  return (
    <Page size="A4" style={s.page}>
      {/* ── Accent strip ── */}
      <View style={s.accentStrip} fixed />

      {/* ── Info row: Name / Klasse / Datum ── */}
      <View style={s.infoRow} fixed>
        <View style={s.infoField}>
          <Text style={s.infoLabel}>Schüler*in</Text>
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
      <View style={s.titleBlock} fixed>
        <Text style={s.titleMain}>Beurteilung: {fachName}</Text>
        <Text style={s.titleSub}>{themaName}</Text>
      </View>

      {/* ── Grundlegende Lernziele ── */}
      {grundlegend.length > 0 && (
        <View style={s.table}>
          <View style={s.tableTitleRow} fixed>
            <Text style={s.tableTitleText}>Grundlegende Lernziele</Text>
          </View>

          <View style={s.colHeaderRow} fixed>
            <View style={s.lzCell} />
            <View style={s.statusCell}>
              <Text style={s.colHeaderText}>{"noch nicht\nerreicht"}</Text>
              <StatusLegendIcon src={statusIcons.not_reached} />
            </View>
            <View style={s.statusCell}>
              <Text style={s.colHeaderText}>erreicht</Text>
              <StatusLegendIcon src={statusIcons.reached} />
            </View>
          </View>

          {grundlegend.map((lz, i) => (
            <View key={i} style={s.dataRow} wrap={false}>
              <View style={s.lzCell}>
                <Text style={s.lzText}>{lz.label}</Text>
              </View>
              <View style={s.statusCell}>
                {grundlegendMark(lz.status, "nicht") && <CrossMark />}
              </View>
              <View style={s.statusCell}>
                {grundlegendMark(lz.status, "erreicht") && <CrossMark />}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ── Anspruchsvollere Lernziele ── */}
      {anspruchsvoll.length > 0 && (
        <View style={s.table}>
          <View style={s.tableTitleRow} fixed>
            <Text style={s.tableTitleText}>Anspruchsvollere Lernziele</Text>
          </View>

          <View style={s.colHeaderRow} fixed>
            <View style={s.lzCell} />
            <View style={s.statusCell}>
              <Text style={s.colHeaderText}>{"noch nicht\nerreicht"}</Text>
              <StatusLegendIcon src={statusIcons.not_reached} />
            </View>
            <View style={s.statusCell}>
              <Text style={s.colHeaderText}>{"teilweise\nerreicht"}</Text>
              <StatusLegendIcon src={statusIcons.partially_reached} />
            </View>
            <View style={s.statusCell}>
              <Text style={s.colHeaderText}>erreicht</Text>
              <StatusLegendIcon src={statusIcons.reached} />
            </View>
          </View>

          {anspruchsvoll.map((lz, i) => (
            <View key={i} style={s.dataRow} wrap={false}>
              <View style={s.lzCell}>
                <Text style={s.lzText}>{lz.label}</Text>
              </View>
              <View style={s.statusCell}>
                {anspruchsvollMark(lz.status, "nicht") && <CrossMark />}
              </View>
              <View style={s.statusCell}>
                {anspruchsvollMark(lz.status, "teilweise") && <CrossMark />}
              </View>
              <View style={s.statusCell}>
                {anspruchsvollMark(lz.status, "erreicht") && <CrossMark />}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ── Keine Lernziele ── */}
      {grundlegend.length === 0 && anspruchsvoll.length === 0 && (
        <View style={s.emptyState}>
          <Text style={s.emptyStateText}>Keine Lernziele erfasst.</Text>
        </View>
      )}

      {/* ── Bemerkung Lehrperson ── */}
      <View style={s.bemerkungSection} wrap={false}>
        <View style={s.bemerkungHeader}>
          <Text style={s.bemerkungLabel}>Bemerkung Lehrperson</Text>
        </View>
        <View style={s.bemerkungBody}>
          {kommentar && <Text style={s.bemerkungText}>{kommentar}</Text>}
        </View>
      </View>

      {/* ── Unterschrift Eltern ── */}
      <View style={s.unterschriftRow} wrap={false}>
        <Text style={s.unterschriftLabel}>Unterschrift Eltern:</Text>
        <View style={s.unterschriftLine} />
      </View>

      {/* ── Footer ── */}
      <View style={s.footer} fixed>
        <Text style={s.footerText}>{date}</Text>
        {/* Seitenzahl nur beim Einzelbericht: im Gesamt-PDF zählt `totalPages`
            über alle Schüler/innen hinweg, auf dem einzelnen Blatt wäre
            «Seite 3 / 24» irreführend. */}
        {!hidePageNumbers && (
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              totalPages > 1 ? `Seite ${pageNumber} / ${totalPages}` : ""
            }
          />
        )}
      </View>
    </Page>
  );
};

// ── Component: einzelner Bericht ─────────────────────────────────────────────

export const SchuelerBerichtPDF = (
  props: SchuelerBerichtPDFProps & { statusIcons: ResolvedBerichtIcons },
) => (
  <Document>
    <SchuelerBerichtPage {...props} />
  </Document>
);

// ── Component: Gesamt-Bericht (alle Berichte in einem PDF, je eigene Seite/n) ──

// `statusIcons` steht einmal auf oberster Ebene statt in jedem Bericht: die
// Icons sind dokumentweit gleich, und so behalten die Aufrufer beim Bauen der
// Einzelberichte ihre bisherige Props-Form.
export type GesamtBerichtPDFProps = {
  berichte: SchuelerBerichtPDFProps[];
  statusIcons: ResolvedBerichtIcons;
};

export const GesamtBerichtPDF = ({
  berichte,
  statusIcons,
}: GesamtBerichtPDFProps) => (
  <Document>
    {berichte.map((props, i) => (
      <SchuelerBerichtPage
        key={i}
        {...props}
        statusIcons={statusIcons}
        hidePageNumbers
      />
    ))}
  </Document>
);
