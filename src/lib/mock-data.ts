import type { Klasse, Schueler, Kompetenz, Fach, Thema, Lernziel, Lehrperson, AssessmentKommentar, Status, StatusSnapshot } from '@/types/domain'

// ── Schulkatalog: Programmatischer Generator ──────────────────────────────
// 49 aktive LPs (lp4 HP ausgeschlossen) × 3 Fächer × 8 Themen ≈ 1176 Themen.
// Jedes Thema bekommt 2 Lernziele (grundlegend + anspruchsvoll).
// zyklus wird direkt aus dem Stufe-Bereich abgeleitet (Z1=1-2, Z2=3-6, Z3=7-9).

type _PoolEntry = { name: string; g: string; a: string }

const _POOLS: Record<string, Record<number, _PoolEntry[]>> = {
  f1: { // Deutsch
    1: [
      { name: 'Buchstaben kennen und schreiben',              g: 'Ich kann alle Buchstaben des Alphabets erkennen und benennen',                         a: 'Ich kann Groß- und Kleinbuchstaben in eigenen Texten korrekt anwenden' },
      { name: 'Einfache Wörter lesen und verstehen',          g: 'Ich kann einfache Wörter lautgetreu lesen',                                           a: 'Ich kann den Sinn kurzer Sätze verstehen und wiedergeben' },
      { name: 'Einfache Sätze bilden und schreiben',          g: 'Ich kann kurze Sätze nach Muster aufschreiben',                                       a: 'Ich kann eigene einfache Sätze selbstständig formulieren' },
      { name: 'Mündliches Erzählen – Erlebnisse berichten',   g: 'Ich kann ein eigenes Erlebnis in einfachen Sätzen erzählen',                         a: 'Ich kann beim Erzählen auf Anfang, Mitte und Ende achten' },
      { name: 'Lautieren und Silben trennen',                 g: 'Ich kann Wörter in Silben klatschen und trennen',                                    a: 'Ich kann Silben beim Schreiben korrekt anwenden' },
      { name: 'Erste kurze Texte verfassen',                  g: 'Ich kann einen kurzen Text mit Bild und Satz gestalten',                             a: 'Ich kann einen kleinen Bericht oder eine Geschichte aufschreiben' },
      { name: 'Zuhören und Nacherzählen',                     g: 'Ich kann eine kurze Geschichte anhören und die Hauptpersonen nennen',                a: 'Ich kann eine gehörte Geschichte mit eigenen Worten nacherzählen' },
      { name: 'Diktate und Abschreiben',                      g: 'Ich kann bekannte Wörter fehlerfrei abschreiben',                                    a: 'Ich kann einfache Wörter nach Diktat korrekt aufschreiben' },
    ],
    2: [
      { name: 'Lesen – Sach- und Gebrauchstexte',            g: 'Ich kann Texte flüssig und sinngebend vorlesen',                                     a: 'Ich kann Schlussfolgerungen aus Texten ziehen' },
      { name: 'Schreiben – Texte verfassen',                  g: 'Ich kann Texte strukturiert und verständlich aufschreiben',                          a: 'Ich kann eigene Texte überarbeiten und verbessern' },
      { name: 'Sprechen und Zuhören',                         g: 'Ich kann verständlich und deutlich sprechen',                                        a: 'Ich kann an Gesprächen sachlich und respektvoll teilnehmen' },
      { name: 'Rechtschreibung und Grammatik',                g: 'Ich kann häufige Wörter fehlerfrei schreiben',                                       a: 'Ich kann Wortarten erkennen und in eigenen Texten anwenden' },
      { name: 'Textaufbau und Gliederung',                    g: 'Ich kann einen Text in Einleitung, Hauptteil und Schluss gliedern',                  a: 'Ich kann Übergänge und Verbindungswörter gezielt einsetzen' },
      { name: 'Mundart und Standardsprache',                  g: 'Ich kann Unterschiede zwischen Mundart und Standardsprache erkennen',               a: 'Ich kann situationsgerecht zwischen Mundart und Standardsprache wechseln' },
      { name: 'Wortarten und Satzglieder',                    g: 'Ich kann Nomen, Verben und Adjektive im Satz bestimmen',                            a: 'Ich kann Satzglieder in komplexen Sätzen erkennen und benennen' },
      { name: 'Literarische Texte verstehen',                 g: 'Ich kann Handlung und Figuren eines literarischen Textes beschreiben',              a: 'Ich kann Themen und Motive eines literarischen Textes deuten' },
    ],
    3: [
      { name: 'Argumentative Texte verfassen',               g: 'Ich kann eine eigene Meinung mit Argumenten schriftlich begründen',                  a: 'Ich kann Gegenargumente entkräften und die eigene Position stärken' },
      { name: 'Medienanalyse und Medienkritik',              g: 'Ich kann den Unterschied zwischen Nachricht und Meinung in Medien erkennen',         a: 'Ich kann Medieninhalte auf Glaubwürdigkeit und Absicht kritisch prüfen' },
      { name: 'Sprachreflexion und Grammatik',               g: 'Ich kann Wortarten bestimmen und korrekt anwenden',                                 a: 'Ich kann sprachliche Mittel bewusst und wirkungsvoll einsetzen' },
      { name: 'Literarische Texte analysieren',              g: 'Ich kann Textstellen zitieren und kommentieren',                                     a: 'Ich kann Stilmittel und ihre Wirkung in Texten erläutern' },
      { name: 'Öffentliches Reden und Präsentieren',         g: 'Ich kann einen vorbereiteten Vortrag strukturiert halten',                           a: 'Ich kann Fragen souverän beantworten und auf Feedback eingehen' },
      { name: 'Schriftlicher Ausdruck – formelle Texte',     g: 'Ich kann einen formellen Brief korrekt aufbauen und verfassen',                      a: 'Ich kann sprachlich differenziert und adressatengerecht schreiben' },
      { name: 'Kreatives Schreiben und Lyrik',               g: 'Ich kann kurze Gedichte oder lyrische Texte verfassen',                             a: 'Ich kann sprachliche Bilder und Rhythmus bewusst einsetzen' },
      { name: 'Bewerbung und berufliche Kommunikation',      g: 'Ich kann einen vollständigen Lebenslauf erstellen',                                  a: 'Ich kann ein überzeugendes Bewerbungsschreiben verfassen' },
    ],
  },
  f2: { // Mathematik
    1: [
      { name: 'Zahlen bis 20 kennen und vergleichen',        g: 'Ich kann Zahlen von 1 bis 20 lesen, schreiben und der Reihe nach nennen',  a: 'Ich kann Zahlen bis 20 auf dem Zahlenstrahl einordnen und vergleichen' },
      { name: 'Addition und Subtraktion bis 20',             g: 'Ich kann einfache Additionsaufgaben bis 20 lösen',                         a: 'Ich kann den Zusammenhang zwischen Addition und Subtraktion erkennen' },
      { name: 'Formen und Figuren erkennen',                 g: 'Ich kann Grundformen (Kreis, Dreieck, Rechteck) benennen und zeichnen',   a: 'Ich kann Figuren nach Merkmalen sortieren und beschreiben' },
      { name: 'Messen und Vergleichen im Alltag',            g: 'Ich kann Objekte nach Länge, Gewicht und Volumen vergleichen',             a: 'Ich kann einfache Messungen mit geeignetem Werkzeug durchführen' },
      { name: 'Zahlen bis 100',                              g: 'Ich kann Zahlen bis 100 lesen, schreiben und ordnen',                     a: 'Ich kann Zahlen bis 100 auf dem Zahlenstrahl einordnen' },
      { name: 'Einfache Sachaufgaben lösen',                 g: 'Ich kann eine Sachaufgabe lesen und den gesuchten Wert benennen',         a: 'Ich kann eine Sachaufgabe mit einer Rechenoperation lösen' },
      { name: 'Symmetrie entdecken',                         g: 'Ich kann symmetrische Figuren erkennen und zeigen',                       a: 'Ich kann symmetrische Figuren zeichnen und die Symmetrieachse einzeichnen' },
      { name: 'Geld und Einkaufen',                          g: 'Ich kann Münzen und Noten bis 10 CHF kennen und benennen',                a: 'Ich kann einfache Einkaufssituationen mit Wechselgeld berechnen' },
    ],
    2: [
      { name: 'Zahlen und Operationen',                      g: 'Ich kann Zahlen bis 1 000 000 lesen, schreiben und ordnen',               a: 'Ich kann schriftlich multiplizieren und dividieren' },
      { name: 'Geometrie – Flächen und Körper',              g: 'Ich kann Dreiecke und Vierecke benennen und Eigenschaften beschreiben',   a: 'Ich kann Umfang und Flächeninhalt berechnen' },
      { name: 'Grössen, Daten und Zufall',                   g: 'Ich kann Grössen messen und umrechnen (Länge, Masse, Zeit)',              a: 'Ich kann Diagramme und Tabellen lesen und erstellen' },
      { name: 'Brüche und Dezimalzahlen',                    g: 'Ich kann Brüche mit gleichem Nenner addieren und subtrahieren',           a: 'Ich kann Brüche multiplizieren und dividieren' },
      { name: 'Zahlen bis 100 000',                          g: 'Ich kann Zahlen bis 100 000 lesen, schreiben und ordnen',                a: 'Ich kann mit grossen Zahlen rechnen und Ergebnisse schätzen' },
      { name: 'Multiplikation und Division schriftlich',     g: 'Ich kann schriftlich multiplizieren und dividieren mit einstelligem Divisor', a: 'Ich kann Division mit Rest lösen und das Ergebnis interpretieren' },
      { name: 'Sachaufgaben und Modellieren',                g: 'Ich kann relevante Angaben aus einer Sachaufgabe herausfiltern',          a: 'Ich kann mehrstufige Sachprobleme in einen Rechenplan übersetzen' },
      { name: 'Statistik und Diagramme',                     g: 'Ich kann einfache Balken- und Kreisdiagramme lesen',                     a: 'Ich kann eigene Daten erheben, ordnen und in Diagrammen darstellen' },
    ],
    3: [
      { name: 'Terme und Gleichungen',                       g: 'Ich kann Variable und Terme verstehen und notieren',                      a: 'Ich kann einfache Gleichungen aufstellen und lösen' },
      { name: 'Pythagoras und rechtwinkliges Dreieck',       g: 'Ich kann den Satz des Pythagoras formulieren und anwenden',               a: 'Ich kann Aufgaben mit dem Pythagoras in Sachkontexten lösen' },
      { name: 'Funktionen und Koordinatensystem',            g: 'Ich kann Punkte im Koordinatensystem einzeichnen und ablesen',            a: 'Ich kann lineare Funktionen darstellen und die Steigung interpretieren' },
      { name: 'Prozentrechnen im Alltag',                    g: 'Ich kann Prozentwert, Grundwert und Prozentsatz berechnen',               a: 'Ich kann Prozentrechnung auf Alltagssituationen (Rabatt, Zinsen) anwenden' },
      { name: 'Statistik und Wahrscheinlichkeit',            g: 'Ich kann einfache Zufallsexperimente durchführen und Ergebnisse notieren', a: 'Ich kann Wahrscheinlichkeiten als Brüche angeben und vergleichen' },
      { name: 'Lineare Gleichungssysteme',                   g: 'Ich kann Terme mit einer Variablen vereinfachen',                         a: 'Ich kann lineare Gleichungssysteme aufstellen und lösen' },
      { name: 'Potenzen und Wurzeln',                        g: 'Ich kann Potenzen als wiederholte Multiplikation verstehen',              a: 'Ich kann Rechenregeln für Potenzen und Wurzeln anwenden' },
      { name: 'Geometrische Körper – Volumen und Oberfläche', g: 'Ich kann Würfel und Quader beschreiben und skizzieren',                  a: 'Ich kann Volumen und Oberfläche geometrischer Körper berechnen' },
    ],
  },
  f3: { // NMG
    1: [
      { name: 'Jahreszeiten und Naturbeobachtung',           g: 'Ich kann die vier Jahreszeiten mit typischen Merkmalen beschreiben',       a: 'Ich kann Veränderungen in der Natur im Jahresverlauf dokumentieren' },
      { name: 'Mensch und Gemeinschaft – Familie und Schule', g: 'Ich kann meine eigene Rolle in Familie und Schulklasse beschreiben',      a: 'Ich kann Regeln des Zusammenlebens erklären und einhalten' },
      { name: 'Tiere in unserer Umgebung',                   g: 'Ich kann heimische Tiere benennen und ihre Lebensweise beschreiben',       a: 'Ich kann Tiere nach Merkmalen (Fell, Federn, Schuppen) ordnen' },
      { name: 'Pflanzen entdecken und bestimmen',            g: 'Ich kann Teile einer Pflanze (Wurzel, Stiel, Blatt, Blüte) benennen',    a: 'Ich kann heimische Pflanzen anhand von Merkmalen bestimmen' },
      { name: 'Mein Körper – Gesundheit und Pflege',         g: 'Ich kann wichtige Körperteile und ihre Funktion benennen',                a: 'Ich kann die Bedeutung von Hygiene und gesunder Ernährung erklären' },
      { name: 'Luft, Wasser, Erde erkunden',                 g: 'Ich kann Eigenschaften von Luft, Wasser und Erde beschreiben',            a: 'Ich kann einfache Versuche zu Luft, Wasser und Erde durchführen' },
      { name: 'Materialien und Stoffe vergleichen',          g: 'Ich kann Alltagsmaterialien nach Eigenschaften (hart, weich, glatt) sortieren', a: 'Ich kann geeignete Materialien für einen Zweck auswählen und begründen' },
      { name: 'Sicher im Verkehr',                           g: 'Ich kann wichtige Verkehrsregeln für Fussgänger kennen und anwenden',     a: 'Ich kann Gefahrenstellen im Strassenverkehr erkennen und sicher handeln' },
    ],
    2: [
      { name: 'Lebewesen und Lebensräume',                   g: 'Ich kann Tiere und Pflanzen in ihren Lebensräumen beschreiben',           a: 'Ich kann Nahrungsbeziehungen und Ökosysteme erklären' },
      { name: 'Körper und Gesundheit',                       g: 'Ich kann wichtige Körperorgane und ihre Funktionen beschreiben',          a: 'Ich kann Massnahmen zur Gesundheitsförderung begründen' },
      { name: 'Schweiz – Raum und Geschichte',               g: 'Ich kann wichtige Ereignisse der Schweizer Geschichte einordnen',         a: 'Ich kann politische Grundstrukturen der Schweiz erläutern' },
      { name: 'Wirtschaft und Arbeit',                       g: 'Ich kann Berufsbilder und die Berufswahl beschreiben',                    a: 'Ich kann einfache wirtschaftliche Zusammenhänge verstehen' },
      { name: 'Pflanzen und Tiere im Jahreslauf',            g: 'Ich kann typische Pflanzen und Tiere der Jahreszeiten benennen',          a: 'Ich kann Lebenszyklen von Tieren und Pflanzen vergleichen' },
      { name: 'Raum und Orientierung – Karten und Pläne',   g: 'Ich kann einfache Karten lesen und Standorte einzeichnen',                a: 'Ich kann Pläne und Karten mit Massstab und Legende interpretieren' },
      { name: 'Energie und Umwelt',                          g: 'Ich kann erneuerbare und nicht erneuerbare Energiequellen unterscheiden', a: 'Ich kann Massnahmen zum Klimaschutz erläutern und bewerten' },
      { name: 'Klima und Wetter',                            g: 'Ich kann Wetterphänomene beobachten, messen und dokumentieren',           a: 'Ich kann den Unterschied zwischen Wetter und Klima erklären' },
    ],
    3: [
      { name: 'Wirtschaft und globale Vernetzung',           g: 'Ich kann einfache wirtschaftliche Zusammenhänge der Globalisierung erklären', a: 'Ich kann Auswirkungen globaler Wirtschaftsverflechtungen beurteilen' },
      { name: 'Politische Systeme und Demokratie',           g: 'Ich kann politische Grundstrukturen verschiedener Staatsformen beschreiben',  a: 'Ich kann das Schweizer Demokratiemodell im internationalen Vergleich einordnen' },
      { name: 'Chemische Grundprozesse und Alltagschemie',   g: 'Ich kann einfache chemische Reaktionen beobachten und beschreiben',          a: 'Ich kann chemische Prozesse im Alltag erklären und einordnen' },
      { name: 'Physikalische Grundphänomene',                g: 'Ich kann einfache physikalische Phänomene (Magnetismus, Optik) beschreiben', a: 'Ich kann physikalische Gesetze an Alltagsbeispielen erläutern' },
      { name: 'Ökologie und Umweltschutz',                   g: 'Ich kann Ökosysteme und ihre Gefährdung beschreiben',                       a: 'Ich kann Handlungsmöglichkeiten für nachhaltigen Umweltschutz evaluieren' },
      { name: 'Globale Herausforderungen',                   g: 'Ich kann globale Herausforderungen (Klimawandel, Migration) benennen',       a: 'Ich kann Ursachen und Folgen globaler Herausforderungen analysieren' },
      { name: 'Geschichte des 20. Jahrhunderts',             g: 'Ich kann wichtige Ereignisse des 20. Jahrhunderts chronologisch einordnen',  a: 'Ich kann Ursachen und Folgen historischer Ereignisse analysieren' },
      { name: 'Berufswahlvorbereitung',                      g: 'Ich kann eigene Stärken und Interessen im Hinblick auf die Berufswahl reflektieren', a: 'Ich kann den Berufswahlprozess selbstständig planen und dokumentieren' },
    ],
  },
  f4: { // Französisch (kein Zyklus 1)
    2: [
      { name: 'Erste Schritte auf Französisch – Vorstellen und Begrüssen', g: 'Ich kann mich auf Französisch vorstellen (Name, Alter, Wohnort)',    a: 'Ich kann ein kurzes Gespräch zur Begrüssung auf Französisch führen' },
      { name: 'Alltag und Familie auf Französisch beschreiben', g: 'Ich kann Familienmitglieder und Alltagsgegenstände auf Französisch benennen',  a: 'Ich kann den Tagesablauf in einfachen Sätzen auf Französisch beschreiben' },
      { name: 'Schule und Freizeit auf Französisch',         g: 'Ich kann Schulfächer und Freizeitaktivitäten auf Französisch benennen',          a: 'Ich kann über Vorlieben und Abneigungen in der Freizeit sprechen' },
      { name: 'Zahlen, Farben und Einkaufen auf Französisch', g: 'Ich kann Zahlen 1–100 und Farben auf Französisch nennen',                       a: 'Ich kann einfache Einkaufsdialoge auf Französisch führen' },
      { name: 'Essen und Trinken – Vokabular Français',      g: 'Ich kann häufige Lebensmittel auf Französisch benennen',                        a: 'Ich kann eine einfache Speisekarte auf Französisch lesen und bestellen' },
      { name: 'Mein Zuhause auf Französisch beschreiben',    g: 'Ich kann Zimmer und Möbel im Haus auf Französisch benennen',                    a: 'Ich kann das eigene Zimmer auf Französisch beschreiben' },
      { name: 'Hören und Sprechen – einfache Dialoge Français', g: 'Ich kann einfache Sätze und Anweisungen auf Französisch verstehen',          a: 'Ich kann auf Fragen zu vertrauten Themen auf Französisch antworten' },
      { name: 'Erste Texte auf Französisch lesen',           g: 'Ich kann einfache Texte sinnentnehmend auf Französisch lesen',                  a: 'Ich kann Verständnisfragen zu einem Lesetext auf Französisch beantworten' },
    ],
    3: [
      { name: 'Hören und Sprechen – komplexe Situationen Français', g: 'Ich kann einem längeren Gespräch auf Französisch folgen',                a: 'Ich kann komplexe Situationen (Telefon, Bewerbung) auf Französisch meistern' },
      { name: 'Lesen – Texte verstehen und analysieren Français', g: 'Ich kann einem längeren Text auf Französisch die Hauptaussage entnehmen', a: 'Ich kann komplexe Texte auf Französisch zusammenfassen und kommentieren' },
      { name: 'Schreiben – formelle Texte auf Französisch',  g: 'Ich kann eine kurze Mitteilung auf Französisch korrekt aufschreiben',          a: 'Ich kann formelle Briefe und E-Mails auf Französisch verfassen' },
      { name: 'Wortschatz und Grammatik Français vertiefen', g: 'Ich kann grundlegende Grammatikregeln des Französischen anwenden',             a: 'Ich kann komplexe Satzstrukturen auf Französisch bilden' },
      { name: 'Komplexe Texte auf Französisch verstehen',    g: 'Ich kann einem Text die wichtigsten Informationen entnehmen',                  a: 'Ich kann literarische und journalistische Texte auf Französisch interpretieren' },
      { name: 'Diskussionen und Debatten auf Französisch führen', g: 'Ich kann den eigenen Standpunkt auf Französisch vertreten',              a: 'Ich kann eine Diskussion auf Französisch strukturiert moderieren' },
      { name: 'Landeskunde Frankreich und Romandie',         g: 'Ich kann wichtige geographische und kulturelle Merkmale Frankreichs benennen', a: 'Ich kann Unterschiede und Gemeinsamkeiten zwischen Frankreich und Romandie analysieren' },
      { name: 'Prüfungsvorbereitung und Selbstbeurteilung Français', g: 'Ich kann eigene Sprachkenntnisse anhand des Europäischen Sprachenportfolios einschätzen', a: 'Ich kann gezielte Vorbereitungsstrategien für Sprachprüfungen anwenden' },
    ],
  },
}

type _LpConfig = { lpId: string; name: string; zyklus: number; fachIds: string[] }

const _LP_CONFIGS: _LpConfig[] = [
  // ── Zyklus 2 – bestehende lp1–lp3 ─────────────────────────────────────
  { lpId: 'lp1',  name: 'Lukas Meier',        zyklus: 2, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp2',  name: 'Sarah Keller',        zyklus: 2, fachIds: ['f1', 'f2', 'f4'] },
  { lpId: 'lp3',  name: 'Marco Brun',          zyklus: 2, fachIds: ['f1', 'f2', 'f3'] },
  // lp4 Jana Huber = Heilpädagogin, keine regulären Katalog-Themen
  // ── Zyklus 1 – lp5, lp6 (Klassenlehrpersonen 1a/2a) ──────────────────
  { lpId: 'lp5',  name: 'Anna Zimmermann',     zyklus: 1, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp6',  name: 'Thomas Frei',         zyklus: 1, fachIds: ['f1', 'f2', 'f3'] },
  // ── Zyklus 2 – lp7, lp8 (Klassenlehrpersonen 3a/4a) ──────────────────
  { lpId: 'lp7',  name: 'Sandra Gerber',       zyklus: 2, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp8',  name: 'Michael Brunner',     zyklus: 2, fachIds: ['f1', 'f2', 'f4'] },
  // ── Zyklus 3 – lp9–lp12 (Klassenlehrpersonen 8a/9a + FLPs) ──────────
  { lpId: 'lp9',  name: 'Katharina Wolf',      zyklus: 3, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp10', name: 'David Steiner',       zyklus: 3, fachIds: ['f1', 'f2', 'f4'] },
  { lpId: 'lp11', name: 'Nicole Roth',         zyklus: 3, fachIds: ['f1', 'f2', 'f4'] },
  { lpId: 'lp12', name: 'Andreas Baumann',     zyklus: 3, fachIds: ['f1', 'f3', 'f4'] },
  // ── Zyklus 1 – lp13–lp22 ──────────────────────────────────────────────
  { lpId: 'lp13', name: 'Petra Schneider',     zyklus: 1, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp14', name: 'Christian Müller',    zyklus: 1, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp15', name: 'Claudia Kramer',      zyklus: 1, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp16', name: 'Stefan Graf',         zyklus: 1, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp17', name: 'Monika Bucher',       zyklus: 1, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp18', name: 'René Lehmann',        zyklus: 1, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp19', name: 'Franziska Kälin',     zyklus: 2, fachIds: ['f1', 'f2', 'f4'] },
  { lpId: 'lp20', name: 'Beat Hasler',         zyklus: 1, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp21', name: 'Vreni Maurer',        zyklus: 1, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp22', name: 'Philipp Ammann',      zyklus: 1, fachIds: ['f1', 'f2', 'f3'] },
  // ── Zyklus 2 – lp23–lp36 ──────────────────────────────────────────────
  { lpId: 'lp23', name: 'Regula Gysin',        zyklus: 2, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp24', name: 'Hanspeter Lüthy',     zyklus: 2, fachIds: ['f1', 'f2', 'f4'] },
  { lpId: 'lp25', name: 'Sonja Flückiger',     zyklus: 2, fachIds: ['f1', 'f2', 'f4'] },
  { lpId: 'lp26', name: 'Markus Zbinden',      zyklus: 2, fachIds: ['f1', 'f3', 'f4'] },
  { lpId: 'lp27', name: 'Irene Stucki',        zyklus: 2, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp28', name: 'Roland Gasser',       zyklus: 2, fachIds: ['f2', 'f3', 'f4'] },
  { lpId: 'lp29', name: 'Susanne Iten',        zyklus: 2, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp30', name: 'Dieter Hug',          zyklus: 2, fachIds: ['f1', 'f2', 'f4'] },
  { lpId: 'lp31', name: 'Cornelia Bosshard',   zyklus: 2, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp32', name: 'Urs Odermatt',        zyklus: 2, fachIds: ['f1', 'f3', 'f4'] },
  { lpId: 'lp33', name: 'Brigitte Fankhauser', zyklus: 2, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp34', name: 'Kurt Blaser',         zyklus: 2, fachIds: ['f2', 'f3', 'f4'] },
  { lpId: 'lp35', name: 'Heidi Rickli',        zyklus: 2, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp36', name: 'Walter Schöni',       zyklus: 2, fachIds: ['f1', 'f2', 'f4'] },
  // ── Zyklus 3 – lp37–lp50 ──────────────────────────────────────────────
  { lpId: 'lp37', name: 'Elisabeth Tanner',    zyklus: 3, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp38', name: 'Hans-Rudolf Buess',   zyklus: 3, fachIds: ['f1', 'f2', 'f4'] },
  { lpId: 'lp39', name: 'Anita Lutz',          zyklus: 3, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp40', name: 'Peter Gsteiger',      zyklus: 3, fachIds: ['f1', 'f3', 'f4'] },
  { lpId: 'lp41', name: 'Margrit Sutter',      zyklus: 3, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp42', name: 'Daniel Nussbaum',     zyklus: 3, fachIds: ['f2', 'f3', 'f4'] },
  { lpId: 'lp43', name: 'Eva Christen',        zyklus: 3, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp44', name: 'Franz Gloor',         zyklus: 3, fachIds: ['f1', 'f2', 'f4'] },
  { lpId: 'lp45', name: 'Rosmarie Egger',      zyklus: 3, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp46', name: 'Werner Grob',         zyklus: 3, fachIds: ['f1', 'f3', 'f4'] },
  { lpId: 'lp47', name: 'Esther Schär',        zyklus: 3, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp48', name: 'Max Aebischer',       zyklus: 3, fachIds: ['f2', 'f3', 'f4'] },
  { lpId: 'lp49', name: 'Ruth Christen',       zyklus: 3, fachIds: ['f1', 'f2', 'f3'] },
  { lpId: 'lp50', name: 'Josef Bühlmann',      zyklus: 3, fachIds: ['f1', 'f2', 'f4'] },
]

function _stufen(zyklus: number, fachId: string, i: number): number[] {
  if (zyklus === 1) return [1, 2]
  if (zyklus === 2) {
    if (fachId === 'f4') return [5, 6]
    const opts: number[][] = [[3, 4], [4, 5], [5, 6]]
    return opts[i % 3]!
  }
  const opts: number[][] = [[7, 8], [8, 9]]
  return opts[i % 2]!
}

const _genThemen: Thema[] = []
const _genLernziele: Lernziel[] = []
for (const lp of _LP_CONFIGS) {
  for (const fachId of lp.fachIds) {
    const pool = _POOLS[fachId]?.[lp.zyklus]
    if (!pool) continue
    pool.forEach(({ name, g, a }, i) => {
      const id = `cat_${lp.lpId}_${fachId}_${i + 1}`
      _genThemen.push({ id, fachId, name, stufe: _stufen(lp.zyklus, fachId, i), zyklus: [lp.zyklus], autor: lp.name, publishedToLibrary: true })
      _genLernziele.push(
        { id: `${id}_g`, themaId: id, kategorie: 'grundlegend',   label: g },
        { id: `${id}_a`, themaId: id, kategorie: 'anspruchsvoll', label: a },
      )
    })
  }
}
// ── Ende Generator ────────────────────────────────────────────────────────

export const SEED_COMPETENCIES: Kompetenz[] = [
  { id: 'c1', label: 'Mathematische Grundlagen' },
  { id: 'c2', label: 'Leseverstehen' },
  { id: 'c3', label: 'Problemlösekompetenz' },
  { id: 'c4', label: 'Mündliche Kommunikation' },
  { id: 'c5', label: 'Schriftlicher Ausdruck' },
  { id: 'c6', label: 'Kooperationsfähigkeit' },
]

export const SEED_FAECHER: Fach[] = [
  { id: 'f1', name: 'Deutsch' },
  { id: 'f2', name: 'Mathematik' },
  { id: 'f3', name: 'NMG' },
  { id: 'f4', name: 'Französisch' },
]

export const SEED_THEMEN: Thema[] = [
  // Deutsch
  { id: 'tde1', fachId: 'f1', name: 'Lesen – Sach- und Gebrauchstexte', faelligAm: '2026-04-11', stufe: [5, 6], zyklus: [2], autor: 'Lukas Meier' },
  { id: 'tde2', fachId: 'f1', name: 'Schreiben – Texte verfassen',        faelligAm: '2026-05-09', stufe: [5, 6, 7], zyklus: [2, 3], autor: 'Lukas Meier' },
  { id: 'tde3', fachId: 'f1', name: 'Sprechen und Zuhören',               faelligAm: '2026-03-28', stufe: [6], zyklus: [2], autor: 'Lukas Meier' },
  { id: 'tde4', fachId: 'f1', name: 'Rechtschreibung und Grammatik',      faelligAm: '2026-04-25', stufe: [6], zyklus: [2], autor: 'Lukas Meier' },
  // Mathematik
  { id: 'tma1', fachId: 'f2', name: 'Zahlen und Operationen',             faelligAm: '2026-03-14', stufe: [5, 6], zyklus: [2], autor: 'Sarah Keller' },
  { id: 'tma2', fachId: 'f2', name: 'Geometrie',                          faelligAm: '2026-04-11', stufe: [5], zyklus: [2], autor: 'Sarah Keller' },
  { id: 'tma3', fachId: 'f2', name: 'Grössen, Daten und Zufall',         faelligAm: '2026-05-09', stufe: [6], zyklus: [2], autor: 'Sarah Keller' },
  { id: 'tma4', fachId: 'f2', name: 'Terme und Gleichungen',              faelligAm: '2026-05-23', stufe: [7, 8], zyklus: [3], autor: 'Sarah Keller' },
  // NMG
  { id: 'tnm1', fachId: 'f3', name: 'Lebewesen und Lebensräume',          faelligAm: '2026-04-25', stufe: [5], zyklus: [2], autor: 'Marco Brun' },
  { id: 'tnm2', fachId: 'f3', name: 'Körper und Gesundheit',              faelligAm: '2026-03-28', stufe: [6], zyklus: [2], autor: 'Marco Brun' },
  { id: 'tnm3', fachId: 'f3', name: 'Schweiz – Raum und Geschichte',      faelligAm: '2026-05-09', stufe: [6, 7], zyklus: [2, 3], autor: 'Marco Brun' },
  { id: 'tnm4', fachId: 'f3', name: 'Wirtschaft und Arbeit',              faelligAm: '2026-05-23', stufe: [7], zyklus: [3], autor: 'Marco Brun' },
  // Französisch
  { id: 'tfr1', fachId: 'f4', name: 'Hören und Sprechen',                 faelligAm: '2026-04-11', stufe: [7, 8], zyklus: [3], autor: 'Jana Huber' },
  { id: 'tfr2', fachId: 'f4', name: 'Lesen',                              faelligAm: '2026-05-09', stufe: [7, 8], zyklus: [3], autor: 'Jana Huber' },
  // faelligAm in der Zukunft → wird aus Analytik ausgeschlossen (Demo)
  { id: 'tfr3', fachId: 'f4', name: 'Schreiben',                          faelligAm: '2026-06-20', stufe: [7, 8], zyklus: [3], autor: 'Jana Huber' },
  // Extra-Themen für Bibliothek-Demo (mehrere Autoren pro Fach)
  { id: 'tde5', fachId: 'f1', name: 'Sprachreflexion und Grammatik',      stufe: [7, 8], zyklus: [3], autor: 'Marco Brun' },
  { id: 'tde6', fachId: 'f1', name: 'Literarische Texte verstehen',       stufe: [6, 7], zyklus: [2, 3], autor: 'Sarah Keller' },
  { id: 'tma5', fachId: 'f2', name: 'Brüche und Dezimalzahlen',           stufe: [6, 7], zyklus: [2, 3], autor: 'Lukas Meier' },
  { id: 'tnm5', fachId: 'f3', name: 'Energie und Umwelt',                 stufe: [7, 8], zyklus: [3], autor: 'Sarah Keller' },
  { id: 'tfr4', fachId: 'f4', name: 'Wortschatz und Grammatik',           stufe: [7, 8], zyklus: [3], autor: 'Marco Brun' },
  // RILZ-Themen (typ: 'rilz') – erstellt von der Heilpädagogin, keine Stufenbeschränkung
  { id: 'tma1_rilz', fachId: 'f2', name: 'Zahlen und Operationen (RILZ)',    typ: 'rilz', standardThemaId: 'tma1', autor: 'Jana Huber' },
  { id: 'tma3_rilz', fachId: 'f2', name: 'Grössen, Daten und Zufall (RILZ)', typ: 'rilz', standardThemaId: 'tma3', autor: 'Jana Huber' },
  // Eigene Themen von Lukas Meier (autor: undefined → erscheinen im «Eigene Lernziele»-Tab)
  { id: 'tde_e1', fachId: 'f1', name: 'Kreatives Schreiben', stufe: [5, 6], zyklus: [2] },
  { id: 'tde_e2', fachId: 'f1', name: 'Medien und Kommunikation', stufe: [6, 7], zyklus: [2, 3] },
  { id: 'tma_e1', fachId: 'f2', name: 'Wahrscheinlichkeit und Zufall', stufe: [6], zyklus: [2] },
  { id: 'tma_e2', fachId: 'f2', name: 'Textaufgaben und Modellieren' },
  { id: 'tnm_e1', fachId: 'f3', name: 'Wetter und Klima', stufe: [5], zyklus: [2] },
  // ── Schulkatalog: Neue Themen Zyklus 1 (Stufen 1–2) ─────────────────────
  { id: 'tde_z1_1', fachId: 'f1', name: 'Buchstaben kennen und schreiben',              stufe: [1, 2], zyklus: [1], autor: 'Anna Zimmermann' },
  { id: 'tde_z1_2', fachId: 'f1', name: 'Einfache Wörter lesen und verstehen',          stufe: [1, 2], zyklus: [1], autor: 'Thomas Frei' },
  { id: 'tde_z1_3', fachId: 'f1', name: 'Mündliches Erzählen – Erlebnisse berichten',   stufe: [2],    zyklus: [1], autor: 'Sandra Gerber' },
  { id: 'tma_z1_1', fachId: 'f2', name: 'Zahlen bis 20 kennen und vergleichen',         stufe: [1, 2], zyklus: [1], autor: 'Anna Zimmermann' },
  { id: 'tma_z1_2', fachId: 'f2', name: 'Addition und Subtraktion bis 20',              stufe: [1, 2], zyklus: [1], autor: 'Thomas Frei' },
  { id: 'tma_z1_3', fachId: 'f2', name: 'Formen und Figuren erkennen',                  stufe: [1, 2], zyklus: [1], autor: 'Thomas Frei' },
  { id: 'tnm_z1_1', fachId: 'f3', name: 'Jahreszeiten und Naturbeobachtung',            stufe: [1, 2], zyklus: [1], autor: 'Sandra Gerber' },
  { id: 'tnm_z1_2', fachId: 'f3', name: 'Mensch und Gemeinschaft – Familie und Schule', stufe: [1, 2], zyklus: [1], autor: 'Anna Zimmermann' },
  // ── Schulkatalog: Neue Themen Zyklus 2 (Stufen 3–6) ─────────────────────
  { id: 'tde_z2_5', fachId: 'f1', name: 'Textaufbau und Gliederung',                    stufe: [3, 4], zyklus: [2], autor: 'Sandra Gerber' },
  { id: 'tde_z2_6', fachId: 'f1', name: 'Mundart und Standardsprache',                  stufe: [3, 4], zyklus: [2], autor: 'Michael Brunner' },
  { id: 'tma_z2_5', fachId: 'f2', name: 'Zahlen bis 100 000',                           stufe: [3, 4], zyklus: [2], autor: 'Sandra Gerber' },
  { id: 'tma_z2_6', fachId: 'f2', name: 'Multiplikation und Division – schriftlich',    stufe: [3, 4], zyklus: [2], autor: 'Michael Brunner' },
  { id: 'tnm_z2_5', fachId: 'f3', name: 'Pflanzen und Tiere im Jahreslauf',             stufe: [3, 4], zyklus: [2], autor: 'Michael Brunner' },
  { id: 'tnm_z2_6', fachId: 'f3', name: 'Raum und Orientierung – Karten und Pläne',     stufe: [4, 5], zyklus: [2], autor: 'Sandra Gerber' },
  { id: 'tfr_z2_1', fachId: 'f4', name: 'Erste Schritte auf Französisch – Vorstellen',  stufe: [5, 6], zyklus: [2], autor: 'Franziska Kälin' },
  { id: 'tfr_z2_2', fachId: 'f4', name: 'Alltag und Familie auf Französisch beschreiben', stufe: [5, 6], zyklus: [2], autor: 'Franziska Kälin' },
  { id: 'tfr_z2_3', fachId: 'f4', name: 'Einfache Texte auf Französisch lesen',         stufe: [6],    zyklus: [2], autor: 'Sonja Flückiger' },
  { id: 'tfr_z2_4', fachId: 'f4', name: 'Schreiben – kurze Mitteilungen auf Französisch', stufe: [6],  zyklus: [2], autor: 'Sonja Flückiger' },
  // ── Schulkatalog: Neue Themen Zyklus 3 (Stufen 7–9) ─────────────────────
  { id: 'tde_z3_1', fachId: 'f1', name: 'Argumentative Texte verfassen',                stufe: [8, 9], zyklus: [3], autor: 'Katharina Wolf' },
  { id: 'tde_z3_2', fachId: 'f1', name: 'Medienanalyse und Medienkritik',               stufe: [8, 9], zyklus: [3], autor: 'David Steiner' },
  { id: 'tma_z3_3', fachId: 'f2', name: 'Funktionen und Koordinatensystem',             stufe: [8, 9], zyklus: [3], autor: 'Katharina Wolf' },
  { id: 'tma_z3_4', fachId: 'f2', name: 'Pythagoras und rechtwinkliges Dreieck',        stufe: [8, 9], zyklus: [3], autor: 'David Steiner' },
  { id: 'tma_z3_5', fachId: 'f2', name: 'Prozentrechnen im Alltag',                     stufe: [7, 8], zyklus: [3], autor: 'Nicole Roth' },
  { id: 'tnm_z3_3', fachId: 'f3', name: 'Politische Systeme und globale Herausforderungen', stufe: [8, 9], zyklus: [3], autor: 'Katharina Wolf' },
  { id: 'tnm_z3_4', fachId: 'f3', name: 'Chemische Grundprozesse und Alltagschemie',   stufe: [8, 9], zyklus: [3], autor: 'Andreas Baumann' },
  { id: 'tfr_z3_3', fachId: 'f4', name: 'Komplexe Texte auf Französisch verstehen',     stufe: [8, 9], zyklus: [3], autor: 'Nicole Roth' },
  { id: 'tfr_z3_4', fachId: 'f4', name: 'Diskussionen und Debatten auf Französisch führen', stufe: [9], zyklus: [3], autor: 'Andreas Baumann' },
  { id: 'tfr_z3_5', fachId: 'f4', name: 'Formelles Schreiben auf Französisch',          stufe: [9],    zyklus: [3], autor: 'Nicole Roth' },
  ..._genThemen,
].map(t => (t.autor && t.typ !== 'rilz') ? { ...t, publishedToLibrary: true } : t) as Thema[]

export const SEED_LERNZIELE: Lernziel[] = [
  // tde1 – Lesen
  { id: 'lde1a', themaId: 'tde1', kategorie: 'grundlegend',   label: 'Ich kann Texte flüssig und sinngebend vorlesen', kriterien: ['Liest laut, deutlich und in angemessenem Tempo', 'Beachtet Satzzeichen und Sinnabschnitte', 'Betont wichtige Wörter korrekt'] },
  { id: 'lde1b', themaId: 'tde1', kategorie: 'grundlegend',   label: 'Ich kann die Hauptaussage und wesentliche Details eines Textes verstehen', kriterien: ['Benennt die Hauptaussage in eigenen Worten', 'Unterscheidet wesentliche von nebensächlichen Informationen', 'Beantwortet W-Fragen zum Text'] },
  { id: 'lde1c', themaId: 'tde1', kategorie: 'grundlegend',   label: 'Ich kann Informationen aus Sachtexten entnehmen', kriterien: ['Findet gezielte Informationen im Text', 'Nutzt Überschriften und Bilder als Orientierung', 'Notiert Schlüsselbegriffe'] },
  { id: 'lde1d', themaId: 'tde1', kategorie: 'anspruchsvoll', label: 'Ich kann Schlussfolgerungen aus Texten ziehen', kriterien: ['Verknüpft Textinformationen logisch', 'Erklärt Ursache-Wirkungs-Zusammenhänge', 'Begründet Schlüsse mit Textstellen'] },
  // tde2 – Schreiben
  { id: 'lde2a', themaId: 'tde2', kategorie: 'grundlegend',   label: 'Ich kann Texte strukturiert und verständlich aufschreiben', kriterien: ['Gliedert Text in Einleitung, Hauptteil, Schluss', 'Verwendet Absätze sinnvoll', 'Schreibt in vollständigen Sätzen'] },
  { id: 'lde2b', themaId: 'tde2', kategorie: 'anspruchsvoll', label: 'Ich kann eigene Erlebnisse und Meinungen schriftlich ausdrücken', kriterien: ['Beschreibt Erlebnisse lebendig und anschaulich', 'Drückt Gefühle und Meinungen klar aus', 'Wählt treffende Ausdrücke'] },
  { id: 'lde2c', themaId: 'tde2', kategorie: 'anspruchsvoll', label: 'Ich kann Texte überarbeiten und verbessern', kriterien: ['Liest eigene Texte kritisch durch', 'Verbessert Satzbau und Wortwahl', 'Korrigiert Rechtschreibfehler selbstständig'] },
  // tde3 – Sprechen
  { id: 'lde3a', themaId: 'tde3', kategorie: 'grundlegend',   label: 'Ich kann verständlich und deutlich sprechen', kriterien: ['Spricht in angemessener Lautstärke', 'Artikuliert klar und deutlich', 'Hält Blickkontakt beim Sprechen'] },
  { id: 'lde3b', themaId: 'tde3', kategorie: 'grundlegend',   label: 'Ich kann zuhören und das Gehörte zusammenfassen', kriterien: ['Hört aufmerksam zu ohne zu unterbrechen', 'Fasst Gehörtes in eigenen Worten zusammen', 'Stellt Verständnisfragen'] },
  { id: 'lde3c', themaId: 'tde3', kategorie: 'anspruchsvoll', label: 'Ich kann an Gesprächen sachlich und respektvoll teilnehmen', kriterien: ['Wartet auf die eigene Redegelegenheit', 'Reagiert auf Beiträge anderer', 'Formuliert Kritik konstruktiv'] },
  // tde4 – Rechtschreibung
  { id: 'lde4a', themaId: 'tde4', kategorie: 'grundlegend',   label: 'Ich kann Sätze grammatikalisch korrekt bilden', kriterien: ['Verwendet Subjekt und Prädikat korrekt', 'Bildet Haupt- und Nebensätze richtig', 'Beachtet Kongruenz zwischen Subjekt und Verb'] },
  { id: 'lde4b', themaId: 'tde4', kategorie: 'grundlegend',   label: 'Ich kann häufige Wörter fehlerfrei schreiben', kriterien: ['Schreibt Grundwortschatz fehlerfrei', 'Wendet Rechtschreibregeln an', 'Nutzt Wörterbuch zur Kontrolle'] },
  { id: 'lde4c', themaId: 'tde4', kategorie: 'anspruchsvoll', label: 'Ich kann Wortarten erkennen und anwenden', kriterien: ['Benennt Nomen, Verben, Adjektive korrekt', 'Bestimmt Artikel und Pronomen', 'Wendet Wortarten in eigenen Texten an'] },
  // tma1 – Zahlen
  { id: 'lma1a', themaId: 'tma1', kategorie: 'grundlegend',   label: 'Ich kann Zahlen bis 1 000 000 lesen, schreiben und ordnen', kriterien: ['Liest und schreibt sechsstellige Zahlen', 'Ordnet Zahlen auf dem Zahlenstrahl', 'Vergleicht Zahlen mit <, >, ='] },
  { id: 'lma1b', themaId: 'tma1', kategorie: 'grundlegend',   label: 'Ich kann schriftlich addieren und subtrahieren', kriterien: ['Führt schriftliche Addition mit Übertrag durch', 'Führt schriftliche Subtraktion mit Entbündeln durch', 'Überprüft Ergebnisse durch Proberechnung'] },
  { id: 'lma1c', themaId: 'tma1', kategorie: 'anspruchsvoll', label: 'Ich kann schriftlich multiplizieren und dividieren', kriterien: ['Multipliziert mehrstellige Zahlen schriftlich', 'Dividiert mit Rest schriftlich', 'Erkennt Zusammenhang zwischen Multiplikation und Division'] },
  { id: 'lma1d', themaId: 'tma1', kategorie: 'anspruchsvoll', label: 'Ich kann Brüche und Dezimalzahlen verstehen und vergleichen', kriterien: ['Stellt Brüche als Teile eines Ganzen dar', 'Wandelt einfache Brüche in Dezimalzahlen um', 'Vergleicht und ordnet Dezimalzahlen'] },
  // tma2 – Geometrie
  { id: 'lma2a', themaId: 'tma2', kategorie: 'grundlegend',   label: 'Ich kann Dreiecke und Vierecke benennen und Eigenschaften beschreiben', kriterien: ['Benennt gleichseitig, gleichschenklig, rechtwinklig', 'Beschreibt Eigenschaften von Quadrat, Rechteck, Raute', 'Zeichnet Figuren nach Vorgabe'] },
  { id: 'lma2b', themaId: 'tma2', kategorie: 'anspruchsvoll', label: 'Ich kann Umfang und Flächeninhalt berechnen', kriterien: ['Berechnet Umfang von Vierecken und Dreiecken', 'Berechnet Flächeninhalt mit Formel', 'Löst Sachaufgaben zu Umfang und Fläche'] },
  { id: 'lma2c', themaId: 'tma2', kategorie: 'grundlegend',   label: 'Ich kann Symmetrien und Spiegelungen erkennen und beschreiben', kriterien: ['Erkennt Achsensymmetrie in Figuren', 'Zeichnet Spiegelbilder an einer Achse', 'Beschreibt Symmetrieeigenschaften von Figuren'] },
  // tma3 – Grössen
  { id: 'lma3a', themaId: 'tma3', kategorie: 'grundlegend',   label: 'Ich kann Grössen messen und umrechnen (Länge, Masse, Zeit)', kriterien: ['Misst mit geeignetem Messwerkzeug', 'Rechnet zwischen Einheiten um (km↔m, kg↔g)', 'Löst Aufgaben mit gemischten Einheiten'] },
  { id: 'lma3b', themaId: 'tma3', kategorie: 'anspruchsvoll', label: 'Ich kann Diagramme und Tabellen lesen und erstellen', kriterien: ['Liest Werte aus Balken- und Liniendiagrammen ab', 'Erstellt eigene Diagramme aus Datentabellen', 'Beschreibt Trends und Auffälligkeiten'] },
  { id: 'lma3c', themaId: 'tma3', kategorie: 'anspruchsvoll', label: 'Ich kann Sachaufgaben lösen und den Rechenweg aufzeigen', kriterien: ['Entnimmt relevante Daten der Aufgabe', 'Wählt passende Rechenoperation', 'Notiert Lösungsweg nachvollziehbar'] },
  // tma4 – Algebra
  { id: 'lma4a', themaId: 'tma4', kategorie: 'grundlegend',   label: 'Ich kann Variable und Terme verstehen und notieren', kriterien: ['Erklärt, was eine Variable bedeutet', 'Notiert Terme mit Variablen korrekt', 'Wertet Terme für gegebene Werte aus'] },
  { id: 'lma4b', themaId: 'tma4', kategorie: 'anspruchsvoll', label: 'Ich kann einfache Gleichungen aufstellen und lösen', kriterien: ['Stellt Gleichungen aus Sachsituationen auf', 'Löst Gleichungen durch Umformen', 'Überprüft die Lösung durch Einsetzen'] },
  // tnm1 – Lebewesen
  { id: 'lnm1a', themaId: 'tnm1', kategorie: 'grundlegend',   label: 'Ich kann Tiere und Pflanzen in ihren Lebensräumen beschreiben', kriterien: ['Nennt typische Vertreter verschiedener Lebensräume', 'Beschreibt Merkmale und Verhaltensweisen', 'Ordnet Lebewesen ihrem Lebensraum zu'] },
  { id: 'lnm1b', themaId: 'tnm1', kategorie: 'anspruchsvoll', label: 'Ich kann Nahrungsbeziehungen und Ökosysteme erklären', kriterien: ['Erstellt einfache Nahrungsketten', 'Erklärt Rolle von Produzenten, Konsumenten, Destruenten', 'Beschreibt das Gleichgewicht im Ökosystem'] },
  { id: 'lnm1c', themaId: 'tnm1', kategorie: 'anspruchsvoll', label: 'Ich kann Anpassungen von Lebewesen an Lebensräume vergleichen', kriterien: ['Nennt körperliche Anpassungen an den Lebensraum', 'Vergleicht Anpassungen verschiedener Arten', 'Begründet Anpassungen mit Umweltbedingungen'] },
  // tnm2 – Körper
  { id: 'lnm2a', themaId: 'tnm2', kategorie: 'grundlegend',   label: 'Ich kann wichtige Körperorgane und ihre Funktionen beschreiben', kriterien: ['Benennt Herz, Lunge, Magen, Niere und ihre Funktion', 'Erklärt den Blutkreislauf vereinfacht', 'Beschreibt das Verdauungssystem'] },
  { id: 'lnm2b', themaId: 'tnm2', kategorie: 'anspruchsvoll', label: 'Ich kann Massnahmen zur Gesundheitsförderung begründen', kriterien: ['Nennt Regeln für gesunde Ernährung', 'Erklärt die Bedeutung von Bewegung', 'Begründet Hygienemassnahmen'] },
  // tnm3 – Schweiz
  { id: 'lnm3a', themaId: 'tnm3', kategorie: 'grundlegend',   label: 'Ich kann wichtige Ereignisse der Schweizer Geschichte einordnen', kriterien: ['Nennt Gründungsdatum und wichtige Gründer', 'Ordnet Ereignisse auf einer Zeitleiste ein', 'Erklärt die Bedeutung der Reformation'] },
  { id: 'lnm3b', themaId: 'tnm3', kategorie: 'grundlegend',   label: 'Ich kann Karten lesen und geografische Merkmale der Schweiz beschreiben', kriterien: ['Liest Höhenangaben und Legenden aus Karten', 'Benennt Alpen, Mittelland und Jura', 'Nennt Nachbarländer und Landessprachen'] },
  { id: 'lnm3c', themaId: 'tnm3', kategorie: 'anspruchsvoll', label: 'Ich kann politische Grundstrukturen der Schweiz erläutern', kriterien: ['Erklärt Bund, Kanton, Gemeinde', 'Beschreibt direkte Demokratie (Abstimmung, Initiative)', 'Nennt wichtige Bundesbehörden'] },
  // tnm4 – Wirtschaft
  { id: 'lnm4a', themaId: 'tnm4', kategorie: 'anspruchsvoll', label: 'Ich kann einfache wirtschaftliche Zusammenhänge verstehen', kriterien: ['Erklärt Angebot und Nachfrage', 'Beschreibt den Wirtschaftskreislauf vereinfacht', 'Nennt Beispiele für Import und Export'] },
  { id: 'lnm4b', themaId: 'tnm4', kategorie: 'grundlegend',   label: 'Ich kann Berufsbilder und die Berufswahl beschreiben', kriterien: ['Nennt Anforderungen verschiedener Berufe', 'Beschreibt eigene Interessen und Stärken', 'Erklärt Schritte der Berufswahl'] },
  // tfr1 – Hören/Sprechen
  { id: 'lfr1a', themaId: 'tfr1', kategorie: 'grundlegend',   label: 'Ich kann einfache Sätze und Anweisungen auf Französisch verstehen', kriterien: ['Versteht einfache Anweisungen im Unterricht', 'Erfasst Hauptinformation aus kurzen Hörtexten', 'Erkennt bekannte Vokabeln im Gehörten'] },
  { id: 'lfr1b', themaId: 'tfr1', kategorie: 'grundlegend',   label: 'Ich kann mich vorstellen und über den Alltag auf Französisch berichten', kriterien: ['Stellt sich mit Name, Alter, Wohnort vor', 'Beschreibt Tagesablauf in einfachen Sätzen', 'Spricht über Hobbys und Familie'] },
  { id: 'lfr1c', themaId: 'tfr1', kategorie: 'anspruchsvoll', label: 'Ich kann auf Fragen zu vertrauten Themen antworten', kriterien: ['Beantwortet W-Fragen auf Französisch', 'Verwendet passende Antwortformeln', 'Stellt Rückfragen auf Französisch'] },
  // tfr2 – Lesen
  { id: 'lfr2a', themaId: 'tfr2', kategorie: 'grundlegend',   label: 'Ich kann einfache Texte sinnverstehend lesen', kriterien: ['Versteht die Hauptaussage eines einfachen Textes', 'Beantwortet Verständnisfragen zum Text', 'Erschliesst unbekannte Wörter aus dem Kontext'] },
  { id: 'lfr2b', themaId: 'tfr2', kategorie: 'grundlegend',   label: 'Ich kann bekannte Ausdrücke und Wörter in Texten erkennen', kriterien: ['Erkennt Vokabeln aus dem Unterricht im Text', 'Findet bestimmte Informationen im Text', 'Markiert bekannte Schlüsselwörter'] },
  // tfr3 – Schreiben (noch nicht fällig)
  { id: 'lfr3a', themaId: 'tfr3', kategorie: 'grundlegend',   label: 'Ich kann einfache Sätze korrekt auf Französisch aufschreiben', kriterien: ['Schreibt einfache Sätze fehlerfrei', 'Beachtet Satzstellung im Französischen', 'Verwendet gelernten Wortschatz korrekt'] },
  { id: 'lfr3b', themaId: 'tfr3', kategorie: 'anspruchsvoll', label: 'Ich kann eine kurze Mitteilung oder Postkarte auf Französisch verfassen', kriterien: ['Schreibt eine kurze Mitteilung strukturiert auf', 'Verwendet passende Gruss- und Abschiedsformeln', 'Hält sich an Wortschatz und Strukturen aus dem Unterricht'] },
  // tde5 – Sprachreflexion
  { id: 'lde5a', themaId: 'tde5', kategorie: 'grundlegend',   label: 'Ich kann Wortarten bestimmen und korrekt anwenden' },
  { id: 'lde5b', themaId: 'tde5', kategorie: 'grundlegend',   label: 'Ich kann Satzglieder in einfachen Sätzen erkennen' },
  { id: 'lde5c', themaId: 'tde5', kategorie: 'anspruchsvoll', label: 'Ich kann sprachliche Mittel bewusst und wirkungsvoll einsetzen' },
  // tde6 – Literarische Texte
  { id: 'lde6a', themaId: 'tde6', kategorie: 'grundlegend',   label: 'Ich kann Handlung und Figuren eines literarischen Textes beschreiben' },
  { id: 'lde6b', themaId: 'tde6', kategorie: 'grundlegend',   label: 'Ich kann Textstellen zitieren und kommentieren' },
  { id: 'lde6c', themaId: 'tde6', kategorie: 'anspruchsvoll', label: 'Ich kann Themen und Motive eines literarischen Textes deuten' },
  // tma5 – Brüche und Dezimalzahlen
  { id: 'lma5a', themaId: 'tma5', kategorie: 'grundlegend',   label: 'Ich kann Brüche mit gleichem Nenner addieren und subtrahieren' },
  { id: 'lma5b', themaId: 'tma5', kategorie: 'grundlegend',   label: 'Ich kann Dezimalzahlen in Brüche umwandeln und umgekehrt' },
  { id: 'lma5c', themaId: 'tma5', kategorie: 'anspruchsvoll', label: 'Ich kann Brüche multiplizieren und dividieren' },
  // tnm5 – Energie und Umwelt
  { id: 'lnm5a', themaId: 'tnm5', kategorie: 'grundlegend',   label: 'Ich kann erneuerbare und nicht erneuerbare Energiequellen unterscheiden' },
  { id: 'lnm5b', themaId: 'tnm5', kategorie: 'grundlegend',   label: 'Ich kann Auswirkungen des Energieverbrauchs auf die Umwelt beschreiben' },
  { id: 'lnm5c', themaId: 'tnm5', kategorie: 'anspruchsvoll', label: 'Ich kann Massnahmen zum Klimaschutz erläutern und bewerten' },
  // tfr4 – Wortschatz und Grammatik
  { id: 'lfr4a', themaId: 'tfr4', kategorie: 'grundlegend',   label: 'Ich kann grundlegende Grammatikregeln des Französischen anwenden' },
  { id: 'lfr4b', themaId: 'tfr4', kategorie: 'grundlegend',   label: 'Ich kann Wortschatz aus dem Unterricht korrekt einsetzen' },
  { id: 'lfr4c', themaId: 'tfr4', kategorie: 'anspruchsvoll', label: 'Ich kann komplexe Satzstrukturen erkennen und selbst bilden' },
  // Eigene Lernziele von Lukas Meier (zu den eigenen Themen ohne autor)
  // tde_e1 – Kreatives Schreiben
  { id: 'lde_e1a', themaId: 'tde_e1', kategorie: 'grundlegend',   label: 'Ich kann kurze Geschichten mit klarem Anfang, Wendepunkt und Ende erfinden', kriterien: ['Entwickelt eine eigene Figur mit Eigenschaften', 'Baut eine erkennbare Spannungskurve auf', 'Schliesst die Geschichte stimmig ab'] },
  { id: 'lde_e1b', themaId: 'tde_e1', kategorie: 'grundlegend',   label: 'Ich kann beschreibende Sprache und Sinneseindrücke gezielt einsetzen', kriterien: ['Verwendet Adjektive und Vergleiche treffend', 'Beschreibt mindestens zwei Sinneseindrücke', 'Vermeidet Wiederholungen durch Synonyme'] },
  { id: 'lde_e1c', themaId: 'tde_e1', kategorie: 'anspruchsvoll', label: 'Ich kann einen überraschenden oder offenen Schluss gestalten', kriterien: ['Baut eine unerwartete Wendung ein', 'Begründet die Wirkung des Endes auf den Leser', 'Setzt sprachliche Mittel bewusst ein'] },
  // tde_e2 – Medien und Kommunikation
  { id: 'lde_e2a', themaId: 'tde_e2', kategorie: 'grundlegend',   label: 'Ich kann Nachrichten und Meinungen in Medientexten unterscheiden', kriterien: ['Benennt Aussagen, die Fakten sind', 'Erkennt wertende Formulierungen', 'Vergleicht zwei Quellen zur gleichen Information'] },
  { id: 'lde_e2b', themaId: 'tde_e2', kategorie: 'anspruchsvoll', label: 'Ich kann Absicht und Wirkung eines Medientextes einschätzen', kriterien: ['Benennt die Zielgruppe des Textes', 'Erklärt, welche Wirkung der Text erzielen will', 'Reflektiert, ob die Darstellung einseitig ist'] },
  // tma_e1 – Wahrscheinlichkeit und Zufall
  { id: 'lma_e1a', themaId: 'tma_e1', kategorie: 'grundlegend',   label: 'Ich kann einfache Zufallsexperimente durchführen und Ergebnisse notieren', kriterien: ['Führt Münzwurf- oder Würfelexperiment korrekt durch', 'Hält Ergebnisse in einer Tabelle fest', 'Vergleicht Erwartung mit Versuchsergebnis'] },
  { id: 'lma_e1b', themaId: 'tma_e1', kategorie: 'anspruchsvoll', label: 'Ich kann Wahrscheinlichkeiten als Brüche angeben und vergleichen', kriterien: ['Berechnet Wahrscheinlichkeit als günstige/mögliche Ergebnisse', 'Vergleicht Wahrscheinlichkeiten zweier Ereignisse', 'Begründet, ob ein Spiel fair ist'] },
  // tma_e2 – Textaufgaben und Modellieren
  { id: 'lma_e2a', themaId: 'tma_e2', kategorie: 'grundlegend',   label: 'Ich kann relevante Angaben aus einer Sachaufgabe herausfiltern', kriterien: ['Unterstreicht gesuchte und gegebene Grössen', 'Erkennt überflüssige Angaben', 'Skizziert die Situation wenn nötig'] },
  { id: 'lma_e2b', themaId: 'tma_e2', kategorie: 'anspruchsvoll', label: 'Ich kann mehrstufige Sachprobleme in einen Rechenplan übersetzen', kriterien: ['Gliedert das Problem in Teilschritte', 'Wählt für jeden Schritt die richtige Operation', 'Überprüft das Endergebnis auf Plausibilität'] },
  // tnm_e1 – Wetter und Klima
  { id: 'lnm_e1a', themaId: 'tnm_e1', kategorie: 'grundlegend',   label: 'Ich kann Wetterphänomene beobachten, messen und dokumentieren', kriterien: ['Misst Temperatur, Niederschlag und Wind korrekt', 'Führt ein Wettertagebuch über mindestens eine Woche', 'Nutzt Wettersymbole auf einer Wetterkarte'] },
  { id: 'lnm_e1b', themaId: 'tnm_e1', kategorie: 'grundlegend',   label: 'Ich kann den Unterschied zwischen Wetter und Klima erklären', kriterien: ['Definiert Wetter als kurzfristigen Zustand', 'Beschreibt Klima als langfristiges Muster', 'Nennt ein Beispiel für ein Klimagebiet der Erde'] },
  { id: 'lnm_e1c', themaId: 'tnm_e1', kategorie: 'anspruchsvoll', label: 'Ich kann Auswirkungen des Klimawandels auf die Schweiz beschreiben und bewerten', kriterien: ['Nennt mindestens zwei messbare Folgen (z.B. Gletscherschmelze, Hitzetage)', 'Erklärt Ursache-Wirkungs-Zusammenhänge', 'Beurteilt mögliche Massnahmen auf lokaler Ebene'] },
  // ── Lernziele für neue Schulkatalog-Themen (Zyklus 1) ────────────────────
  { id: 'ltde_z1_1a', themaId: 'tde_z1_1', kategorie: 'grundlegend',   label: 'Ich kann alle Buchstaben des Alphabets erkennen und benennen' },
  { id: 'ltde_z1_1b', themaId: 'tde_z1_1', kategorie: 'anspruchsvoll', label: 'Ich kann Groß- und Kleinbuchstaben korrekt schreiben' },
  { id: 'ltde_z1_2a', themaId: 'tde_z1_2', kategorie: 'grundlegend',   label: 'Ich kann einfache Wörter lautgetreu lesen' },
  { id: 'ltde_z1_2b', themaId: 'tde_z1_2', kategorie: 'anspruchsvoll', label: 'Ich kann den Sinn eines kurzen Satzes verstehen und wiedergeben' },
  { id: 'ltde_z1_3a', themaId: 'tde_z1_3', kategorie: 'grundlegend',   label: 'Ich kann ein eigenes Erlebnis in einfachen Sätzen erzählen' },
  { id: 'ltde_z1_3b', themaId: 'tde_z1_3', kategorie: 'anspruchsvoll', label: 'Ich kann beim Erzählen auf Anfang, Mitte und Ende achten' },
  { id: 'ltma_z1_1a', themaId: 'tma_z1_1', kategorie: 'grundlegend',   label: 'Ich kann Zahlen von 1 bis 20 lesen, schreiben und der Reihe nach nennen' },
  { id: 'ltma_z1_1b', themaId: 'tma_z1_1', kategorie: 'anspruchsvoll', label: 'Ich kann Zahlen bis 20 vergleichen und auf dem Zahlenstrahl einordnen' },
  { id: 'ltma_z1_2a', themaId: 'tma_z1_2', kategorie: 'grundlegend',   label: 'Ich kann einfache Additionsaufgaben bis 20 lösen' },
  { id: 'ltma_z1_2b', themaId: 'tma_z1_2', kategorie: 'anspruchsvoll', label: 'Ich kann den Zusammenhang zwischen Addition und Subtraktion erkennen' },
  { id: 'ltma_z1_3a', themaId: 'tma_z1_3', kategorie: 'grundlegend',   label: 'Ich kann Grundformen (Kreis, Dreieck, Rechteck, Quadrat) benennen und zeichnen' },
  { id: 'ltma_z1_3b', themaId: 'tma_z1_3', kategorie: 'anspruchsvoll', label: 'Ich kann Figuren nach Merkmalen sortieren und beschreiben' },
  { id: 'ltnm_z1_1a', themaId: 'tnm_z1_1', kategorie: 'grundlegend',   label: 'Ich kann die vier Jahreszeiten mit typischen Merkmalen beschreiben' },
  { id: 'ltnm_z1_1b', themaId: 'tnm_z1_1', kategorie: 'anspruchsvoll', label: 'Ich kann Veränderungen in der Natur im Jahresverlauf erkennen und dokumentieren' },
  { id: 'ltnm_z1_2a', themaId: 'tnm_z1_2', kategorie: 'grundlegend',   label: 'Ich kann meine eigene Rolle in Familie und Schulklasse beschreiben' },
  { id: 'ltnm_z1_2b', themaId: 'tnm_z1_2', kategorie: 'anspruchsvoll', label: 'Ich kann Regeln des Zusammenlebens erklären und einhalten' },
  // ── Lernziele für neue Schulkatalog-Themen (Zyklus 2) ────────────────────
  { id: 'ltde_z2_5a', themaId: 'tde_z2_5', kategorie: 'grundlegend',   label: 'Ich kann einen Text in Einleitung, Hauptteil und Schluss gliedern' },
  { id: 'ltde_z2_5b', themaId: 'tde_z2_5', kategorie: 'anspruchsvoll', label: 'Ich kann Übergänge und Verbindungswörter gezielt einsetzen' },
  { id: 'ltde_z2_6a', themaId: 'tde_z2_6', kategorie: 'grundlegend',   label: 'Ich kann Unterschiede zwischen Mundart und Standardsprache erkennen' },
  { id: 'ltde_z2_6b', themaId: 'tde_z2_6', kategorie: 'anspruchsvoll', label: 'Ich kann situationsgerecht zwischen Mundart und Standardsprache wechseln' },
  { id: 'ltma_z2_5a', themaId: 'tma_z2_5', kategorie: 'grundlegend',   label: 'Ich kann Zahlen bis 100 000 lesen, schreiben und ordnen' },
  { id: 'ltma_z2_5b', themaId: 'tma_z2_5', kategorie: 'anspruchsvoll', label: 'Ich kann mit grossen Zahlen rechnen und Ergebnisse schätzen' },
  { id: 'ltma_z2_6a', themaId: 'tma_z2_6', kategorie: 'grundlegend',   label: 'Ich kann schriftlich multiplizieren und dividieren mit einstelligem Divisor' },
  { id: 'ltma_z2_6b', themaId: 'tma_z2_6', kategorie: 'anspruchsvoll', label: 'Ich kann Division mit Rest lösen und das Ergebnis interpretieren' },
  { id: 'ltnm_z2_5a', themaId: 'tnm_z2_5', kategorie: 'grundlegend',   label: 'Ich kann typische Pflanzen und Tiere der Jahreszeiten benennen' },
  { id: 'ltnm_z2_5b', themaId: 'tnm_z2_5', kategorie: 'anspruchsvoll', label: 'Ich kann Lebenszyklen von Tieren und Pflanzen beschreiben und vergleichen' },
  { id: 'ltnm_z2_6a', themaId: 'tnm_z2_6', kategorie: 'grundlegend',   label: 'Ich kann einfache Karten lesen und Standorte einzeichnen' },
  { id: 'ltnm_z2_6b', themaId: 'tnm_z2_6', kategorie: 'anspruchsvoll', label: 'Ich kann Pläne und Karten mit Massstab und Legende interpretieren' },
  { id: 'ltfr_z2_1a', themaId: 'tfr_z2_1', kategorie: 'grundlegend',   label: 'Ich kann mich auf Französisch vorstellen (Name, Alter, Wohnort)' },
  { id: 'ltfr_z2_1b', themaId: 'tfr_z2_1', kategorie: 'anspruchsvoll', label: 'Ich kann ein kurzes Gespräch zur Begrüssung auf Französisch führen' },
  { id: 'ltfr_z2_2a', themaId: 'tfr_z2_2', kategorie: 'grundlegend',   label: 'Ich kann Familienmitglieder und Alltagsgegenstände auf Französisch benennen' },
  { id: 'ltfr_z2_2b', themaId: 'tfr_z2_2', kategorie: 'anspruchsvoll', label: 'Ich kann den Tagesablauf in einfachen Sätzen auf Französisch beschreiben' },
  { id: 'ltfr_z2_3a', themaId: 'tfr_z2_3', kategorie: 'grundlegend',   label: 'Ich kann einfache Texte auf Französisch sinnentnehmend lesen' },
  { id: 'ltfr_z2_3b', themaId: 'tfr_z2_3', kategorie: 'anspruchsvoll', label: 'Ich kann Verständnisfragen zu einem Lesetext auf Französisch beantworten' },
  { id: 'ltfr_z2_4a', themaId: 'tfr_z2_4', kategorie: 'grundlegend',   label: 'Ich kann eine kurze Mitteilung auf Französisch korrekt aufschreiben' },
  { id: 'ltfr_z2_4b', themaId: 'tfr_z2_4', kategorie: 'anspruchsvoll', label: 'Ich kann eine strukturierte Postkarte oder E-Mail auf Französisch verfassen' },
  // ── Lernziele für neue Schulkatalog-Themen (Zyklus 3) ────────────────────
  { id: 'ltde_z3_1a', themaId: 'tde_z3_1', kategorie: 'grundlegend',   label: 'Ich kann eine eigene Meinung mit Argumenten schriftlich begründen' },
  { id: 'ltde_z3_1b', themaId: 'tde_z3_1', kategorie: 'anspruchsvoll', label: 'Ich kann Gegenargumente entkräften und die eigene Position stärken' },
  { id: 'ltde_z3_2a', themaId: 'tde_z3_2', kategorie: 'grundlegend',   label: 'Ich kann den Unterschied zwischen Nachricht und Meinung in Medien erkennen' },
  { id: 'ltde_z3_2b', themaId: 'tde_z3_2', kategorie: 'anspruchsvoll', label: 'Ich kann Medieninhalte auf Glaubwürdigkeit und Absicht kritisch prüfen' },
  { id: 'ltma_z3_3a', themaId: 'tma_z3_3', kategorie: 'grundlegend',   label: 'Ich kann Punkte im Koordinatensystem einzeichnen und ablesen' },
  { id: 'ltma_z3_3b', themaId: 'tma_z3_3', kategorie: 'anspruchsvoll', label: 'Ich kann lineare Funktionen darstellen und deren Steigung interpretieren' },
  { id: 'ltma_z3_4a', themaId: 'tma_z3_4', kategorie: 'grundlegend',   label: 'Ich kann den Satz des Pythagoras formulieren und anwenden' },
  { id: 'ltma_z3_4b', themaId: 'tma_z3_4', kategorie: 'anspruchsvoll', label: 'Ich kann Aufgaben mit dem Satz des Pythagoras in Sachkontexten lösen' },
  { id: 'ltma_z3_5a', themaId: 'tma_z3_5', kategorie: 'grundlegend',   label: 'Ich kann Prozentwert, Grundwert und Prozentsatz berechnen' },
  { id: 'ltma_z3_5b', themaId: 'tma_z3_5', kategorie: 'anspruchsvoll', label: 'Ich kann Prozentrechnung auf Alltagssituationen (Rabatt, Zinsen) anwenden' },
  { id: 'ltnm_z3_3a', themaId: 'tnm_z3_3', kategorie: 'grundlegend',   label: 'Ich kann politische Grundstrukturen verschiedener Staatsformen beschreiben' },
  { id: 'ltnm_z3_3b', themaId: 'tnm_z3_3', kategorie: 'anspruchsvoll', label: 'Ich kann globale Herausforderungen (Klimawandel, Migration) analysieren' },
  { id: 'ltnm_z3_4a', themaId: 'tnm_z3_4', kategorie: 'grundlegend',   label: 'Ich kann einfache chemische Reaktionen beobachten und beschreiben' },
  { id: 'ltnm_z3_4b', themaId: 'tnm_z3_4', kategorie: 'anspruchsvoll', label: 'Ich kann chemische Prozesse im Alltag erklären und einordnen' },
  { id: 'ltfr_z3_3a', themaId: 'tfr_z3_3', kategorie: 'grundlegend',   label: 'Ich kann einem längeren Text auf Französisch die Hauptaussage entnehmen' },
  { id: 'ltfr_z3_3b', themaId: 'tfr_z3_3', kategorie: 'anspruchsvoll', label: 'Ich kann komplexe Texte auf Französisch zusammenfassen und kommentieren' },
  { id: 'ltfr_z3_4a', themaId: 'tfr_z3_4', kategorie: 'grundlegend',   label: 'Ich kann den eigenen Standpunkt auf Französisch mündlich vertreten' },
  { id: 'ltfr_z3_4b', themaId: 'tfr_z3_4', kategorie: 'anspruchsvoll', label: 'Ich kann eine Diskussion auf Französisch strukturiert leiten und moderieren' },
  { id: 'ltfr_z3_5a', themaId: 'tfr_z3_5', kategorie: 'grundlegend',   label: 'Ich kann formelle Briefe und E-Mails auf Französisch korrekt verfassen' },
  { id: 'ltfr_z3_5b', themaId: 'tfr_z3_5', kategorie: 'anspruchsvoll', label: 'Ich kann sprachliche Register im Französischen situationsgerecht einsetzen' },
  ..._genLernziele,
]

// ── Klassen ───────────────────────────────────────────────────────────────────
// k1 (5a): Deutsch Lesen+Schreiben · Mathe Zahlen+Geometrie · NMG Lebewesen
// k2 (6b): Deutsch Sprechen+Rechtschreibung · Mathe Zahlen+Grössen · NMG Körper+Schweiz
// k3 (7c): Deutsch Schreiben · Mathe Algebra · NMG Schweiz+Wirtschaft · Französisch alle

// RILZ-Lernziele für die Bibliothek-RILZ-Themen (eigene Lernziele der Heilpädagogin)
export const SEED_LERNZIELE_RILZ: Lernziel[] = [
  // tma1_rilz – Zahlen und Operationen (vereinfacht)
  { id: 'rilz_tma1_a', themaId: 'tma1_rilz', kategorie: 'grundlegend', label: 'Ich kann Zahlen bis 1 000 lesen, schreiben und vergleichen' },
  { id: 'rilz_tma1_b', themaId: 'tma1_rilz', kategorie: 'grundlegend', label: 'Ich kann Addition und Subtraktion bis 1 000 ohne Übertragsrechnung' },
  { id: 'rilz_tma1_c', themaId: 'tma1_rilz', kategorie: 'grundlegend', label: 'Ich kann das kleine Einmaleins (1–5) sicher anwenden' },
  // tma3_rilz – Grössen, Daten und Zufall (vereinfacht, Alltagsbezug)
  { id: 'rilz_tma3_a', themaId: 'tma3_rilz', kategorie: 'grundlegend', label: 'Ich kann die Uhrzeit ablesen und einfache Zeitspannen berechnen' },
  { id: 'rilz_tma3_b', themaId: 'tma3_rilz', kategorie: 'grundlegend', label: 'Ich kann Meter und Zentimeter im Alltag messen und umrechnen' },
  { id: 'rilz_tma3_c', themaId: 'tma3_rilz', kategorie: 'grundlegend', label: 'Ich kann Kilogramm und Gramm mit der Waage bestimmen' },
]

export const SEED_LERNZIELE_BIBLIOTHEK: Lernziel[] = [
  // Deutsch – Lesen (Stufen 3-4)
  { id: 'bde1a', themaId: 'tde1', kategorie: 'grundlegend',   label: 'Ich kann einfache Texte sinnentnehmend lesen',              source: 'bibliothek', stufe: [3, 4], autor: 'Sarah Keller', beschreibung: 'Bewährtes Grundlernziel für die Unterstufe, geprüft in mehreren Klassen.' },
  { id: 'bde1b', themaId: 'tde1', kategorie: 'anspruchsvoll', label: 'Ich kann Texte mit unbekannten Wörtern erschliessen',        source: 'bibliothek', stufe: [3, 4], autor: 'Sarah Keller' },
  // Deutsch – Schreiben (Stufen 3-4)
  { id: 'bde2a', themaId: 'tde2', kategorie: 'grundlegend',   label: 'Ich kann kurze Texte mit klarer Struktur verfassen',         source: 'bibliothek', stufe: [3, 4], autor: 'Jana Huber' },
  { id: 'bde2b', themaId: 'tde2', kategorie: 'anspruchsvoll', label: 'Ich kann eigene Erfahrungen schriftlich beschreiben',        source: 'bibliothek', stufe: [3, 4], autor: 'Jana Huber', beschreibung: 'Gut kombinierbar mit dem Mündlichkeitslernziel aus Sprechen/Zuhören.' },
  // Mathematik – Zahlen (Stufen 5-6)
  { id: 'bma1a', themaId: 'tma1', kategorie: 'grundlegend',   label: 'Ich kann Zahlen bis 10 000 sicher lesen und schreiben',     source: 'bibliothek', stufe: [5, 6], autor: 'Marco Brun' },
  { id: 'bma1b', themaId: 'tma1', kategorie: 'grundlegend',   label: 'Ich kann Grundoperationen im Zahlenraum bis 10 000 anwenden', source: 'bibliothek', stufe: [5, 6], autor: 'Marco Brun', beschreibung: 'Aufbaulernziel auf «Zahlen bis 10 000 sicher lesen und schreiben».' },
  { id: 'bma1c', themaId: 'tma1', kategorie: 'anspruchsvoll', label: 'Ich kann Primzahlen und Teilbarkeitsregeln kennen',          source: 'bibliothek', stufe: [5, 6],                 autor: 'Marco Brun' },
  // Mathematik – Geometrie (Stufen 5-6)
  { id: 'bma2a', themaId: 'tma2', kategorie: 'grundlegend',   label: 'Ich kann grundlegende geometrische Formen benennen',        source: 'bibliothek', stufe: [5, 6],                 autor: 'Sarah Keller' },
  { id: 'bma2b', themaId: 'tma2', kategorie: 'anspruchsvoll', label: 'Ich kann Flächen- und Rauminhalte einfacher Körper berechnen', source: 'bibliothek', stufe: [6, 7],             autor: 'Sarah Keller' },
  // Mathematik – Algebra (Stufen 7-8)
  { id: 'bma4a', themaId: 'tma4', kategorie: 'grundlegend',   label: 'Ich kann Terme mit einer Variablen vereinfachen',           source: 'bibliothek', stufe: [7, 8], autor: 'Lukas Meier' },
  { id: 'bma4b', themaId: 'tma4', kategorie: 'anspruchsvoll', label: 'Ich kann lineare Gleichungssysteme lösen',                  source: 'bibliothek', stufe: [7, 8],                 autor: 'Lukas Meier', beschreibung: 'Für Klassen ab Stufe 8 empfohlen, setzt Terme vereinfachen voraus.' },
  // NMG – Lebewesen (Stufen 5-6)
  { id: 'bnm1a', themaId: 'tnm1', kategorie: 'grundlegend',   label: 'Ich kann heimische Tiere und Pflanzen bestimmen',           source: 'bibliothek', stufe: [5, 6],                 autor: 'Jana Huber' },
  { id: 'bnm1b', themaId: 'tnm1', kategorie: 'anspruchsvoll', label: 'Ich kann Ökosysteme und Artenvielfalt erklären',            source: 'bibliothek', stufe: [5, 6],                 autor: 'Jana Huber' },
  // NMG – Schweiz (Stufen 6-7)
  { id: 'bnm3a', themaId: 'tnm3', kategorie: 'grundlegend',   label: 'Ich kann wichtige Kantone und deren Hauptorte kennen',      source: 'bibliothek', stufe: [6, 7],                 autor: 'Marco Brun' },
  { id: 'bnm3b', themaId: 'tnm3', kategorie: 'anspruchsvoll', label: 'Ich kann die Entstehung der Eidgenossenschaft erläutern',   source: 'bibliothek', stufe: [6, 7],                 autor: 'Marco Brun' },
  // Französisch – Grundstufe (Stufen 5-6)
  { id: 'bfr1a', themaId: 'tfr1', kategorie: 'grundlegend',   label: 'Ich kann grundlegende Begrüssungen und Verabschiedungen',   source: 'bibliothek', stufe: [5, 6], autor: 'Lukas Meier' },
  { id: 'bfr1b', themaId: 'tfr1', kategorie: 'grundlegend',   label: 'Ich kann Zahlen 1–100 auf Französisch nennen',              source: 'bibliothek', stufe: [5, 6],                 autor: 'Lukas Meier' },
  { id: 'bfr2a', themaId: 'tfr2', kategorie: 'grundlegend',   label: 'Ich kann einfache Dialoge auf Französisch verstehen',       source: 'bibliothek', stufe: [5, 6],                 autor: 'Sarah Keller' },
  { id: 'bfr2b', themaId: 'tfr2', kategorie: 'anspruchsvoll', label: 'Ich kann kurze Geschichten auf Französisch zusammenfassen', source: 'bibliothek', stufe: [6, 7],                 autor: 'Sarah Keller' },
]

export const SEED_LEHRPERSONEN: Lehrperson[] = [
  // ── Bestehende Lehrpersonen (k1–k3) ──────────────────────────────────────
  { id: 'lp1',  name: 'Lukas Meier',          kuerzel: 'LM'  },
  { id: 'lp2',  name: 'Sarah Keller',          kuerzel: 'SK'  },
  { id: 'lp3',  name: 'Marco Brun',            kuerzel: 'MB'  },
  { id: 'lp4',  name: 'Jana Huber',            kuerzel: 'JH'  },
  // ── Klassenlehrpersonen neue Klassen (lp5–lp10) ───────────────────────────
  { id: 'lp5',  name: 'Anna Zimmermann',       kuerzel: 'AZ'  },
  { id: 'lp6',  name: 'Thomas Frei',           kuerzel: 'TF'  },
  { id: 'lp7',  name: 'Sandra Gerber',         kuerzel: 'SG'  },
  { id: 'lp8',  name: 'Michael Brunner',       kuerzel: 'MBR' },
  { id: 'lp9',  name: 'Katharina Wolf',        kuerzel: 'KW'  },
  { id: 'lp10', name: 'David Steiner',         kuerzel: 'DS'  },
  // ── Fachlehrpersonen / Heilpädagoginnen ──────────────────────────────────
  { id: 'lp11', name: 'Nicole Roth',           kuerzel: 'NR'  },
  { id: 'lp12', name: 'Andreas Baumann',       kuerzel: 'AB'  },
  { id: 'lp13', name: 'Petra Schneider',       kuerzel: 'PS'  },
  { id: 'lp14', name: 'Christian Müller',      kuerzel: 'CM'  },
  { id: 'lp15', name: 'Claudia Kramer',        kuerzel: 'CK'  },
  { id: 'lp16', name: 'Stefan Graf',           kuerzel: 'STG' },
  { id: 'lp17', name: 'Monika Bucher',         kuerzel: 'MOB' },
  { id: 'lp18', name: 'René Lehmann',          kuerzel: 'RL'  },
  { id: 'lp19', name: 'Franziska Kälin',       kuerzel: 'FK'  },
  { id: 'lp20', name: 'Beat Hasler',           kuerzel: 'BH'  },
  { id: 'lp21', name: 'Vreni Maurer',          kuerzel: 'VM'  },
  { id: 'lp22', name: 'Philipp Ammann',        kuerzel: 'PA'  },
  { id: 'lp23', name: 'Regula Gysin',          kuerzel: 'RG'  },
  { id: 'lp24', name: 'Hanspeter Lüthy',       kuerzel: 'HL'  },
  { id: 'lp25', name: 'Sonja Flückiger',       kuerzel: 'SF'  },
  { id: 'lp26', name: 'Markus Zbinden',        kuerzel: 'MZ'  },
  { id: 'lp27', name: 'Irene Stucki',          kuerzel: 'IS'  },
  { id: 'lp28', name: 'Roland Gasser',         kuerzel: 'ROG' },
  { id: 'lp29', name: 'Susanne Iten',          kuerzel: 'SIT' },
  { id: 'lp30', name: 'Dieter Hug',            kuerzel: 'DH'  },
  { id: 'lp31', name: 'Cornelia Bosshard',     kuerzel: 'COB' },
  { id: 'lp32', name: 'Urs Odermatt',          kuerzel: 'UO'  },
  { id: 'lp33', name: 'Brigitte Fankhauser',   kuerzel: 'BF'  },
  { id: 'lp34', name: 'Kurt Blaser',           kuerzel: 'KB'  },
  { id: 'lp35', name: 'Heidi Rickli',          kuerzel: 'HR'  },
  { id: 'lp36', name: 'Walter Schöni',         kuerzel: 'WS'  },
  { id: 'lp37', name: 'Elisabeth Tanner',      kuerzel: 'ET'  },
  { id: 'lp38', name: 'Hans-Rudolf Buess',     kuerzel: 'HRB' },
  { id: 'lp39', name: 'Anita Lutz',            kuerzel: 'AL'  },
  { id: 'lp40', name: 'Peter Gsteiger',        kuerzel: 'PG'  },
  { id: 'lp41', name: 'Margrit Sutter',        kuerzel: 'MGS' },
  { id: 'lp42', name: 'Daniel Nussbaum',       kuerzel: 'DN'  },
  { id: 'lp43', name: 'Eva Christen',          kuerzel: 'EC'  },
  { id: 'lp44', name: 'Franz Gloor',           kuerzel: 'FGL' },
  { id: 'lp45', name: 'Rosmarie Egger',        kuerzel: 'RE'  },
  { id: 'lp46', name: 'Werner Grob',           kuerzel: 'WG'  },
  { id: 'lp47', name: 'Esther Schär',          kuerzel: 'ESC' },
  { id: 'lp48', name: 'Max Aebischer',         kuerzel: 'MA'  },
  { id: 'lp49', name: 'Ruth Christen',         kuerzel: 'RUC' },
  { id: 'lp50', name: 'Josef Bühlmann',        kuerzel: 'JB'  },
]

export const SEED_CLASSES: Klasse[] = [
  {
    id: 'k1', name: '5a', schuljahr: '2025/26',
    assignedThemaIds: ['tde1', 'tde2', 'tma1', 'tma2', 'tnm1'],
    lpZuweisungen: [
      { lpId: 'lp1', fachIds: ['f1', 'f3'], rolle: 'klassenlehrperson' },
      { lpId: 'lp2', fachIds: ['f2'], rolle: 'fachlehrperson' },
      { lpId: 'lp4', fachIds: [], rolle: 'heilpaedagogin' },
    ],
  },
  {
    id: 'k2', name: '5b', schuljahr: '2025/26',
    assignedThemaIds: ['tde3', 'tde4', 'tma1', 'tma3', 'tnm2', 'tnm3'],
    lpZuweisungen: [
      { lpId: 'lp1', fachIds: ['f1', 'f3'], rolle: 'klassenlehrperson' },
      { lpId: 'lp2', fachIds: ['f2'], rolle: 'fachlehrperson' },
      { lpId: 'lp4', fachIds: [], rolle: 'heilpaedagogin' },
    ],
  },
  {
    id: 'k3', name: '7c', schuljahr: '2025/26',
    assignedThemaIds: ['tde2', 'tma4', 'tnm3', 'tnm4', 'tfr1', 'tfr2', 'tfr3'],
    lpZuweisungen: [
      { lpId: 'lp3', fachIds: ['f1', 'f3'], rolle: 'klassenlehrperson' },
      { lpId: 'lp2', fachIds: ['f2'], rolle: 'fachlehrperson' },
      { lpId: 'lp4', fachIds: [], rolle: 'heilpaedagogin' },
    ],
  },
  // ── Neue Klassen (Zyklus 1–3, keine Schüler) ─────────────────────────────
  {
    id: 'k4', name: '1a', schuljahr: '2025/26',
    assignedThemaIds: ['tde_z1_1', 'tma_z1_1', 'tnm_z1_1'],
    lpZuweisungen: [
      { lpId: 'lp5',  fachIds: ['f1', 'f2', 'f3'], rolle: 'klassenlehrperson' },
      { lpId: 'lp4',  fachIds: [],                  rolle: 'heilpaedagogin' },
    ],
  },
  {
    id: 'k5', name: '2a', schuljahr: '2025/26',
    assignedThemaIds: ['tde_z1_2', 'tde_z1_3', 'tma_z1_2', 'tnm_z1_2'],
    lpZuweisungen: [
      { lpId: 'lp6',  fachIds: ['f1', 'f2', 'f3'], rolle: 'klassenlehrperson' },
      { lpId: 'lp4',  fachIds: [],                  rolle: 'heilpaedagogin' },
    ],
  },
  {
    id: 'k6', name: '3a', schuljahr: '2025/26',
    assignedThemaIds: ['tde_z2_5', 'tma_z2_5', 'tnm_z2_5'],
    lpZuweisungen: [
      { lpId: 'lp1',  fachIds: ['f1', 'f3'],        rolle: 'klassenlehrperson' },
      { lpId: 'lp13', fachIds: ['f2'],               rolle: 'fachlehrperson' },
      { lpId: 'lp4',  fachIds: [],                   rolle: 'heilpaedagogin' },
    ],
  },
  {
    id: 'k7', name: '4a', schuljahr: '2025/26',
    assignedThemaIds: ['tde_z2_6', 'tma_z2_6', 'tnm_z2_6'],
    lpZuweisungen: [
      { lpId: 'lp8',  fachIds: ['f1', 'f3'],        rolle: 'klassenlehrperson' },
      { lpId: 'lp14', fachIds: ['f2'],               rolle: 'fachlehrperson' },
      { lpId: 'lp4',  fachIds: [],                   rolle: 'heilpaedagogin' },
    ],
  },
  {
    id: 'k8', name: '8a', schuljahr: '2025/26',
    assignedThemaIds: ['tde_z3_1', 'tma_z3_3', 'tnm_z3_3', 'tfr_z3_3'],
    lpZuweisungen: [
      { lpId: 'lp9',  fachIds: ['f1'],               rolle: 'klassenlehrperson' },
      { lpId: 'lp11', fachIds: ['f2'],                rolle: 'fachlehrperson' },
      { lpId: 'lp12', fachIds: ['f3', 'f4'],          rolle: 'fachlehrperson' },
      { lpId: 'lp4',  fachIds: [],                    rolle: 'heilpaedagogin' },
    ],
  },
  {
    id: 'k9', name: '9a', schuljahr: '2025/26',
    assignedThemaIds: ['tde_z3_2', 'tma_z3_4', 'tnm_z3_4', 'tfr_z3_4'],
    lpZuweisungen: [
      { lpId: 'lp10', fachIds: ['f1'],               rolle: 'klassenlehrperson' },
      { lpId: 'lp11', fachIds: ['f2'],                rolle: 'fachlehrperson' },
      { lpId: 'lp12', fachIds: ['f3', 'f4'],          rolle: 'fachlehrperson' },
      { lpId: 'lp4',  fachIds: [],                    rolle: 'heilpaedagogin' },
    ],
  },
]

// ── Schüler ────────────────────────────────────────────────────────────────────
// Legende competencyStatus: c1 Mathe · c2 Lesen · c3 Problemlösen · c4 Mündlich · c5 Schreiben · c6 Kooperation

// ── 12-week progress history generator ───────────────────────────────────────
// Simulates realistic semester progression:
//   - First ~55% of LZ (early themen) are introduced from week 1
//   - Remaining ~45% (new themen) arrive at week LATE_INTRO → causes a % dip
//     because the denominator grows while the student hasn't learned them yet
//   - Each batch progresses independently toward the final lernzielStatus

const HISTORY_DATES: string[] = [
  '2026-02-06', '2026-02-13', '2026-02-20', '2026-02-27',  // KW 6–9
  '2026-03-06', '2026-03-13', '2026-03-20', '2026-03-27',  // KW 10–13
  '2026-04-03', '2026-04-10', '2026-04-17', '2026-04-24',  // KW 14–17
]

const LATE_INTRO = 4  // week index (0-based) when the second batch is introduced ≈ KW 10

function generateHistory(
  finalStatus: Record<string, Status>,
  seed: number,
): StatusSnapshot[] {
  const allIds    = Object.keys(finalStatus)
  const toReach   = allIds.filter(id => finalStatus[id] === 'reached')
  const toPartial = allIds.filter(id => finalStatus[id] === 'partially_reached')
  const N = HISTORY_DATES.length

  let s = ((seed * 1664525 + 1013904223) | 0) >>> 0
  const rng = () => { s = ((s * 1664525 + 1013904223) | 0) >>> 0; return s / 0x100000000 }

  // Split all LZ into early (~55%) and late (~45%) batches by position
  const splitAt  = Math.ceil(allIds.length * 0.55)
  const earlySet = new Set(allIds.slice(0, splitAt))

  const partialAt: Record<string, number> = {}
  const reachAt:   Record<string, number> = {}

  // Early batch: ALL progress must start before LATE_INTRO (partialAt ≤ LATE_INTRO-1)
  // so they are established in the chart BEFORE the denominator expands — creating a
  // visible dip when late LZ are added at LATE_INTRO
  const earlyReach   = toReach.filter(id =>  earlySet.has(id))
  const earlyPartial = toPartial.filter(id => earlySet.has(id))
  earlyReach.forEach((id, i) => {
    const base = Math.floor((i / Math.max(1, earlyReach.length)) * LATE_INTRO)
    partialAt[id] = Math.max(0, Math.min(LATE_INTRO - 1, base + Math.floor(rng() * 2)))
    reachAt[id]   = Math.min(N - 1, partialAt[id] + 2 + Math.floor(rng() * 4))
  })
  earlyPartial.forEach((id, i) => {
    const base = Math.floor(1 + (i / Math.max(1, earlyPartial.length)) * (LATE_INTRO - 1))
    partialAt[id] = Math.min(LATE_INTRO - 1, base + Math.floor(rng() * 2))
  })

  // Late batch: starts 2 weeks AFTER LATE_INTRO → creates a visible dip window (weeks 4-5)
  // during which the denominator has grown but late LZ haven't been learned yet
  const lateReach   = toReach.filter(id =>  !earlySet.has(id))
  const latePartial = toPartial.filter(id => !earlySet.has(id))
  lateReach.forEach((id, i) => {
    const span = Math.max(1, N - LATE_INTRO - 4)
    const base = LATE_INTRO + 2 + Math.floor((i / Math.max(1, lateReach.length)) * span)
    partialAt[id] = Math.min(N - 2, base + Math.floor(rng() * 2))
    reachAt[id]   = Math.min(N - 1, partialAt[id] + 2 + Math.floor(rng() * 3))
  })
  latePartial.forEach((id, i) => {
    const span = Math.max(1, N - LATE_INTRO - 3)
    const base = LATE_INTRO + 2 + Math.floor((i / Math.max(1, latePartial.length)) * span)
    partialAt[id] = Math.min(N - 1, base + Math.floor(rng() * 2))
  })

  const earlyIds = allIds.filter(id => earlySet.has(id))

  return HISTORY_DATES.map((date, wi) => {
    const lernzielStatus: Record<string, Status> = {}
    for (const id of toReach) {
      if      (wi >= reachAt[id])   lernzielStatus[id] = 'reached'
      else if (wi >= partialAt[id]) lernzielStatus[id] = 'partially_reached'
    }
    for (const id of toPartial) {
      if (wi >= partialAt[id]) lernzielStatus[id] = 'partially_reached'
    }
    // Before LATE_INTRO: denominator is only the early batch → causes a visible dip when late LZ are added
    const activeLzIds = wi < LATE_INTRO ? earlyIds : undefined
    return { date, lernzielStatus, ...(activeLzIds ? { activeLzIds } : {}) }
  })
}

type StudentSeed = Omit<Schueler, 'progressHistory'>

export const SEED_STUDENTS: Schueler[] = ([

  // ════════════════════════════════════════════════════════════════════════════
  // 5a – k1   LZ-Pool: lde1a-d  lde2a-c  lma1a-d  lma2a-c  lnm1a-c
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 's1', klassId: 'k1', vorname: 'Emma', nachname: 'Bauer',
    note: 'Sehr engagiert, braucht Unterstützung in Mathematik.',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'not_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached',           lde1b: 'reached',           lde1c: 'partially_reached', lde1d: 'partially_reached',
      lde2a: 'reached',           lde2b: 'partially_reached', lde2c: 'not_reached',
      lma1a: 'partially_reached', lma1b: 'partially_reached', lma1c: 'not_reached',        lma1d: 'not_reached',
      lma2a: 'partially_reached', lma2b: 'not_reached',        lma2c: 'partially_reached',
      lnm1a: 'reached',           lnm1b: 'reached',           lnm1c: 'partially_reached',
    },
  },

  {
    id: 's2', klassId: 'k1', vorname: 'Luca', nachname: 'Müller',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached', lde1b: 'reached', lde1c: 'reached',           lde1d: 'reached',
      lde2a: 'reached', lde2b: 'reached', lde2c: 'partially_reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached',           lma1d: 'partially_reached',
      lma2a: 'reached', lma2b: 'reached', lma2c: 'reached',
      lnm1a: 'reached', lnm1b: 'reached', lnm1c: 'reached',
    },
  },

  {
    id: 's3', klassId: 'k1', vorname: 'Mia', nachname: 'Schneider',
    rilzFachIds: ['f2'],  // RILZ in Mathematik
    note: 'Zeigt grosses Interesse an Naturwissenschaften.',
    rilzLernziele: [
      { id: 'rlz_s3_1', themaId: 'tma1', label: 'Ich kann Zahlen bis 100 lesen und schreiben', status: 'reached' },
      { id: 'rlz_s3_2', themaId: 'tma1', label: 'Ich kann einfache Addition und Subtraktion bis 20', status: 'partially_reached' },
      { id: 'rlz_s3_3', themaId: 'tma1', label: 'Ich kann verdoppeln und halbieren im Zahlenraum bis 20', status: 'not_reached' },
      { id: 'rlz_s3_4', themaId: 'tma2', label: 'Ich kann grundlegende geometrische Formen erkennen und benennen', status: 'not_reached' },
      { id: 'rlz_s3_5', themaId: 'tma2', label: 'Ich kann Figuren nach Vorlage mit Lineal nachzeichnen', status: 'partially_reached' },
    ],
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde1a: 'partially_reached', lde1b: 'not_reached', lde1c: 'not_reached', lde1d: 'not_reached',
      lde2a: 'partially_reached', lde2b: 'not_reached', lde2c: 'not_reached',
      lma1a: 'not_reached',        lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma2a: 'not_reached',        lma2b: 'not_reached', lma2c: 'not_reached',
      lnm1a: 'partially_reached',  lnm1b: 'not_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's4', klassId: 'k1', vorname: 'Noah', nachname: 'Fischer',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached',           lde1b: 'reached',           lde1c: 'partially_reached', lde1d: 'partially_reached',
      lde2a: 'reached',           lde2b: 'reached',           lde2c: 'partially_reached',
      lma1a: 'reached',           lma1b: 'reached',           lma1c: 'partially_reached', lma1d: 'partially_reached',
      lma2a: 'reached',           lma2b: 'partially_reached', lma2c: 'reached',
      lnm1a: 'reached',           lnm1b: 'partially_reached', lnm1c: 'partially_reached',
    },
  },

  {
    id: 's13', klassId: 'k1', vorname: 'Leon', nachname: 'Wagner',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached', lde1b: 'reached', lde1c: 'reached',           lde1d: 'partially_reached',
      lde2a: 'reached', lde2b: 'reached', lde2c: 'partially_reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'partially_reached', lma1d: 'not_reached',
      lma2a: 'reached', lma2b: 'reached', lma2c: 'reached',
      lnm1a: 'reached', lnm1b: 'partially_reached', lnm1c: 'partially_reached',
    },
  },

  {
    id: 's14', klassId: 'k1', vorname: 'Anna', nachname: 'Huber',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde1a: 'reached',           lde1b: 'partially_reached', lde1c: 'partially_reached', lde1d: 'not_reached',
      lde2a: 'reached',           lde2b: 'partially_reached', lde2c: 'not_reached',
      lma1a: 'partially_reached', lma1b: 'partially_reached', lma1c: 'not_reached',        lma1d: 'not_reached',
      lma2a: 'partially_reached', lma2b: 'not_reached',        lma2c: 'partially_reached',
      lnm1a: 'reached',           lnm1b: 'partially_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's15', klassId: 'k1', vorname: 'Paul', nachname: 'Koch',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde1a: 'reached',           lde1b: 'partially_reached', lde1c: 'partially_reached', lde1d: 'not_reached',
      lde2a: 'partially_reached', lde2b: 'not_reached',        lde2c: 'not_reached',
      lma1a: 'partially_reached', lma1b: 'partially_reached',  lma1c: 'not_reached',       lma1d: 'not_reached',
      lma2a: 'partially_reached', lma2b: 'not_reached',        lma2c: 'not_reached',
      lnm1a: 'partially_reached', lnm1b: 'not_reached',        lnm1c: 'not_reached',
    },
  },

  {
    id: 's16', klassId: 'k1', vorname: 'Sophia', nachname: 'Richter',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached', lde1b: 'reached', lde1c: 'reached', lde1d: 'reached',
      lde2a: 'reached', lde2b: 'reached', lde2c: 'reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached', lma1d: 'reached',
      lma2a: 'reached', lma2b: 'reached', lma2c: 'reached',
      lnm1a: 'reached', lnm1b: 'reached', lnm1c: 'reached',
    },
  },

  {
    id: 's17', klassId: 'k1', vorname: 'Finn', nachname: 'Klein',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'not_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'partially_reached', lde1b: 'not_reached', lde1c: 'not_reached', lde1d: 'not_reached',
      lde2a: 'not_reached',        lde2b: 'not_reached', lde2c: 'not_reached',
      lma1a: 'partially_reached',  lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma2a: 'not_reached',        lma2b: 'not_reached', lma2c: 'not_reached',
      lnm1a: 'partially_reached',  lnm1b: 'not_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's18', klassId: 'k1', vorname: 'Lena', nachname: 'Schmid',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached',           lde1b: 'reached',           lde1c: 'partially_reached', lde1d: 'partially_reached',
      lde2a: 'reached',           lde2b: 'partially_reached', lde2c: 'not_reached',
      lma1a: 'reached',           lma1b: 'reached',           lma1c: 'partially_reached', lma1d: 'not_reached',
      lma2a: 'reached',           lma2b: 'partially_reached', lma2c: 'partially_reached',
      lnm1a: 'reached',           lnm1b: 'partially_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's19', klassId: 'k1', vorname: 'Max', nachname: 'Weber',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached', lde1b: 'reached', lde1c: 'reached',           lde1d: 'reached',
      lde2a: 'reached', lde2b: 'reached', lde2c: 'reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached',           lma1d: 'reached',
      lma2a: 'reached', lma2b: 'reached', lma2c: 'reached',
      lnm1a: 'reached', lnm1b: 'reached', lnm1c: 'partially_reached',
    },
  },

  {
    id: 's20', klassId: 'k1', vorname: 'Julia', nachname: 'Meyer',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde1a: 'partially_reached', lde1b: 'partially_reached', lde1c: 'partially_reached', lde1d: 'not_reached',
      lde2a: 'partially_reached', lde2b: 'partially_reached', lde2c: 'not_reached',
      lma1a: 'partially_reached', lma1b: 'partially_reached', lma1c: 'not_reached',        lma1d: 'not_reached',
      lma2a: 'partially_reached', lma2b: 'not_reached',        lma2c: 'partially_reached',
      lnm1a: 'partially_reached', lnm1b: 'partially_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's21', klassId: 'k1', vorname: 'Luis', nachname: 'Braun',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'reached', c5: 'not_reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'not_reached',       lde1b: 'not_reached', lde1c: 'not_reached', lde1d: 'not_reached',
      lde2a: 'partially_reached', lde2b: 'not_reached', lde2c: 'not_reached',
      lma1a: 'not_reached',       lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma2a: 'not_reached',       lma2b: 'not_reached', lma2c: 'not_reached',
      lnm1a: 'partially_reached', lnm1b: 'not_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's22', klassId: 'k1', vorname: 'Sarah', nachname: 'Zimmermann',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached',           lde1b: 'reached',           lde1c: 'reached',           lde1d: 'partially_reached',
      lde2a: 'reached',           lde2b: 'reached',           lde2c: 'partially_reached',
      lma1a: 'reached',           lma1b: 'reached',           lma1c: 'partially_reached', lma1d: 'partially_reached',
      lma2a: 'reached',           lma2b: 'partially_reached', lma2c: 'reached',
      lnm1a: 'reached',           lnm1b: 'reached',           lnm1c: 'partially_reached',
    },
  },

  {
    id: 's23', klassId: 'k1', vorname: 'Tim', nachname: 'Hoffmann',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'not_reached', c4: 'not_reached', c5: 'not_reached', c6: 'not_reached' },
    lernzielStatus: {
      lde1a: 'not_reached', lde1b: 'not_reached', lde1c: 'not_reached', lde1d: 'not_reached',
      lde2a: 'not_reached', lde2b: 'not_reached', lde2c: 'not_reached',
      lma1a: 'not_reached', lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma2a: 'not_reached', lma2b: 'not_reached', lma2c: 'not_reached',
      lnm1a: 'not_reached', lnm1b: 'not_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's24', klassId: 'k1', vorname: 'Alina', nachname: 'Schäfer',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde1a: 'reached', lde1b: 'reached', lde1c: 'reached',           lde1d: 'reached',
      lde2a: 'reached', lde2b: 'reached', lde2c: 'partially_reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached',           lma1d: 'partially_reached',
      lma2a: 'reached', lma2b: 'reached', lma2c: 'reached',
      lnm1a: 'reached', lnm1b: 'reached', lnm1c: 'reached',
    },
  },

  {
    id: 's25', klassId: 'k1', vorname: 'Julian', nachname: 'Keller',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached',           lde1b: 'reached',           lde1c: 'partially_reached', lde1d: 'not_reached',
      lde2a: 'reached',           lde2b: 'partially_reached', lde2c: 'not_reached',
      lma1a: 'reached',           lma1b: 'partially_reached', lma1c: 'not_reached',        lma1d: 'not_reached',
      lma2a: 'reached',           lma2b: 'partially_reached', lma2c: 'reached',
      lnm1a: 'reached',           lnm1b: 'partially_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's26', klassId: 'k1', vorname: 'Lisa', nachname: 'Wolf',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'not_reached', c5: 'partially_reached', c6: 'not_reached' },
    lernzielStatus: {
      lde1a: 'reached',            lde1b: 'partially_reached', lde1c: 'not_reached', lde1d: 'not_reached',
      lde2a: 'partially_reached',  lde2b: 'not_reached',        lde2c: 'not_reached',
      lma1a: 'partially_reached',  lma1b: 'partially_reached',  lma1c: 'not_reached', lma1d: 'not_reached',
      lma2a: 'partially_reached',  lma2b: 'not_reached',        lma2c: 'not_reached',
      lnm1a: 'partially_reached',  lnm1b: 'partially_reached',  lnm1c: 'not_reached',
    },
  },

  {
    id: 's27', klassId: 'k1', vorname: 'Erik', nachname: 'Lehmann',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached',           lde1b: 'reached',           lde1c: 'reached',           lde1d: 'partially_reached',
      lde2a: 'reached',           lde2b: 'partially_reached', lde2c: 'partially_reached',
      lma1a: 'reached',           lma1b: 'reached',           lma1c: 'reached',           lma1d: 'partially_reached',
      lma2a: 'reached',           lma2b: 'reached',           lma2c: 'partially_reached',
      lnm1a: 'reached',           lnm1b: 'partially_reached', lnm1c: 'partially_reached',
    },
  },

  {
    id: 's28', klassId: 'k1', vorname: 'Lea', nachname: 'Maier',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde1a: 'reached',            lde1b: 'reached',            lde1c: 'partially_reached', lde1d: 'not_reached',
      lde2a: 'reached',            lde2b: 'partially_reached',  lde2c: 'not_reached',
      lma1a: 'partially_reached',  lma1b: 'not_reached',        lma1c: 'not_reached',       lma1d: 'not_reached',
      lma2a: 'not_reached',         lma2b: 'not_reached',        lma2c: 'not_reached',
      lnm1a: 'partially_reached',  lnm1b: 'not_reached',        lnm1c: 'not_reached',
    },
  },

  {
    // Negative-trend student: mastered early batch (Deutsch + lma1a-c) perfectly,
    // but all late LZ (lma1d, lma2a-c, lnm1a-c) remain unachieved after the exam →
    // Mathe line drops 100%→43%, NMG stays at 0%
    id: 'sNeg1', klassId: 'k1', vorname: 'Kevin', nachname: 'Sommer',
    note: 'War gut gestartet, kommt mit den neuen Themen nicht mit.',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde1a: 'reached', lde1b: 'reached', lde1c: 'reached', lde1d: 'reached',
      lde2a: 'reached', lde2b: 'reached', lde2c: 'reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached',
      lma1d: 'not_reached',
      lma2a: 'not_reached', lma2b: 'not_reached', lma2c: 'not_reached',
      lnm1a: 'not_reached', lnm1b: 'not_reached', lnm1c: 'not_reached',
    },
  },

  {
    id: 's29', klassId: 'k1', vorname: 'Philipp', nachname: 'Steiner',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde1a: 'reached',           lde1b: 'reached',           lde1c: 'reached',           lde1d: 'partially_reached',
      lde2a: 'reached',           lde2b: 'reached',           lde2c: 'partially_reached',
      lma1a: 'reached',           lma1b: 'reached',           lma1c: 'partially_reached', lma1d: 'not_reached',
      lma2a: 'reached',           lma2b: 'partially_reached', lma2c: 'reached',
      lnm1a: 'reached',           lnm1b: 'reached',           lnm1c: 'partially_reached',
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 6b – k2   LZ-Pool: lde3a-c  lde4a-c  lma1a-d  lma3a-c  lnm2a-b  lnm3a-c
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 's5', klassId: 'k2', vorname: 'Sophia', nachname: 'Beck',
    note: 'Hat deutliche Fortschritte im Sprechen gemacht.',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached', lde3b: 'reached', lde3c: 'reached',
      lde4a: 'reached', lde4b: 'reached', lde4c: 'reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached', lma1d: 'reached',
      lma3a: 'reached', lma3b: 'reached', lma3c: 'reached',
      lnm2a: 'reached', lnm2b: 'reached',
      lnm3a: 'reached', lnm3b: 'reached', lnm3c: 'reached',
    },
  },

  {
    id: 's6', klassId: 'k2', vorname: 'Jonas', nachname: 'Krause',
    note: 'Braucht mehr Übung bei schriftlichen Aufgaben.',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde3a: 'reached',            lde3b: 'partially_reached', lde3c: 'partially_reached',
      lde4a: 'partially_reached',  lde4b: 'partially_reached', lde4c: 'not_reached',
      lma1a: 'partially_reached',  lma1b: 'partially_reached', lma1c: 'not_reached',  lma1d: 'not_reached',
      lma3a: 'partially_reached',  lma3b: 'not_reached',       lma3c: 'not_reached',
      lnm2a: 'partially_reached',  lnm2b: 'not_reached',
      lnm3a: 'partially_reached',  lnm3b: 'not_reached',       lnm3c: 'not_reached',
    },
  },

  {
    id: 's7', klassId: 'k2', vorname: 'Hannah', nachname: 'Schwarz',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached',           lde3b: 'reached',           lde3c: 'partially_reached',
      lde4a: 'reached',           lde4b: 'partially_reached', lde4c: 'reached',
      lma1a: 'reached',           lma1b: 'reached',           lma1c: 'partially_reached', lma1d: 'not_reached',
      lma3a: 'reached',           lma3b: 'partially_reached', lma3c: 'partially_reached',
      lnm2a: 'reached',           lnm2b: 'reached',
      lnm3a: 'partially_reached', lnm3b: 'partially_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's8', klassId: 'k2', vorname: 'Ben', nachname: 'Berger',
    note: 'Arbeitet sehr gut in Gruppenaufgaben.',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'reached', c5: 'not_reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached',            lde3b: 'reached',            lde3c: 'partially_reached',
      lde4a: 'partially_reached',  lde4b: 'not_reached',        lde4c: 'not_reached',
      lma1a: 'partially_reached',  lma1b: 'not_reached',        lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'partially_reached',  lma3b: 'not_reached',        lma3c: 'not_reached',
      lnm2a: 'partially_reached',  lnm2b: 'partially_reached',
      lnm3a: 'not_reached',         lnm3b: 'not_reached',        lnm3c: 'not_reached',
    },
  },

  {
    id: 's9', klassId: 'k2', vorname: 'Laura', nachname: 'Roth',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde3a: 'partially_reached', lde3b: 'partially_reached', lde3c: 'partially_reached',
      lde4a: 'partially_reached', lde4b: 'partially_reached', lde4c: 'not_reached',
      lma1a: 'partially_reached', lma1b: 'partially_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'partially_reached', lma3b: 'not_reached',        lma3c: 'not_reached',
      lnm2a: 'partially_reached', lnm2b: 'partially_reached',
      lnm3a: 'not_reached',        lnm3b: 'not_reached',        lnm3c: 'not_reached',
    },
  },

  {
    id: 's30', klassId: 'k2', vorname: 'Nico', nachname: 'Frank',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached',           lde3b: 'reached',           lde3c: 'reached',
      lde4a: 'reached',           lde4b: 'reached',           lde4c: 'partially_reached',
      lma1a: 'reached',           lma1b: 'reached',           lma1c: 'reached',           lma1d: 'partially_reached',
      lma3a: 'reached',           lma3b: 'reached',           lma3c: 'partially_reached',
      lnm2a: 'reached',           lnm2b: 'reached',
      lnm3a: 'reached',           lnm3b: 'reached',           lnm3c: 'partially_reached',
    },
  },

  {
    id: 's31', klassId: 'k2', vorname: 'Klara', nachname: 'Schulz',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached',           lde3b: 'reached',           lde3c: 'partially_reached',
      lde4a: 'partially_reached', lde4b: 'reached',           lde4c: 'partially_reached',
      lma1a: 'partially_reached', lma1b: 'partially_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'reached',           lma3b: 'partially_reached', lma3c: 'partially_reached',
      lnm2a: 'reached',           lnm2b: 'reached',
      lnm3a: 'partially_reached', lnm3b: 'not_reached',        lnm3c: 'not_reached',
    },
  },

  {
    id: 's32', klassId: 'k2', vorname: 'Simon', nachname: 'Ziegler',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'not_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde3a: 'not_reached', lde3b: 'not_reached', lde3c: 'not_reached',
      lde4a: 'not_reached', lde4b: 'not_reached', lde4c: 'not_reached',
      lma1a: 'not_reached', lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'not_reached', lma3b: 'not_reached', lma3c: 'not_reached',
      lnm2a: 'not_reached', lnm2b: 'not_reached',
      lnm3a: 'not_reached', lnm3b: 'not_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's33', klassId: 'k2', vorname: 'Lina', nachname: 'Baumann',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached', lde3b: 'reached', lde3c: 'reached',
      lde4a: 'reached', lde4b: 'reached', lde4c: 'reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached', lma1d: 'reached',
      lma3a: 'reached', lma3b: 'reached', lma3c: 'reached',
      lnm2a: 'reached', lnm2b: 'reached',
      lnm3a: 'reached', lnm3b: 'reached', lnm3c: 'reached',
    },
  },

  {
    id: 's34', klassId: 'k2', vorname: 'Moritz', nachname: 'Vogel',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'not_reached' },
    lernzielStatus: {
      lde3a: 'reached',            lde3b: 'partially_reached', lde3c: 'not_reached',
      lde4a: 'partially_reached',  lde4b: 'partially_reached', lde4c: 'not_reached',
      lma1a: 'partially_reached',  lma1b: 'partially_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'partially_reached',  lma3b: 'not_reached',        lma3c: 'not_reached',
      lnm2a: 'partially_reached',  lnm2b: 'not_reached',
      lnm3a: 'not_reached',         lnm3b: 'not_reached',        lnm3c: 'not_reached',
    },
  },

  {
    id: 's35', klassId: 'k2', vorname: 'Charlotte', nachname: 'Hartmann',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached', lde3b: 'reached', lde3c: 'reached',
      lde4a: 'reached', lde4b: 'reached', lde4c: 'reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached', lma1d: 'partially_reached',
      lma3a: 'reached', lma3b: 'reached', lma3c: 'reached',
      lnm2a: 'reached', lnm2b: 'reached',
      lnm3a: 'reached', lnm3b: 'reached', lnm3c: 'partially_reached',
    },
  },

  {
    id: 's36', klassId: 'k2', vorname: 'David', nachname: 'Kramer',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'partially_reached', lde3b: 'not_reached', lde3c: 'not_reached',
      lde4a: 'not_reached',        lde4b: 'not_reached', lde4c: 'not_reached',
      lma1a: 'not_reached',        lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'not_reached',        lma3b: 'not_reached', lma3c: 'not_reached',
      lnm2a: 'not_reached',        lnm2b: 'not_reached',
      lnm3a: 'not_reached',        lnm3b: 'not_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's37', klassId: 'k2', vorname: 'Isabella', nachname: 'Pfeiffer',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde3a: 'reached',           lde3b: 'reached',           lde3c: 'reached',
      lde4a: 'reached',           lde4b: 'partially_reached', lde4c: 'reached',
      lma1a: 'reached',           lma1b: 'reached',           lma1c: 'partially_reached', lma1d: 'partially_reached',
      lma3a: 'reached',           lma3b: 'reached',           lma3c: 'partially_reached',
      lnm2a: 'reached',           lnm2b: 'reached',
      lnm3a: 'reached',           lnm3b: 'partially_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's38', klassId: 'k2', vorname: 'Daniel', nachname: 'Haas',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached',           lde3b: 'partially_reached', lde3c: 'partially_reached',
      lde4a: 'partially_reached', lde4b: 'partially_reached', lde4c: 'reached',
      lma1a: 'partially_reached', lma1b: 'reached',           lma1c: 'partially_reached', lma1d: 'not_reached',
      lma3a: 'reached',           lma3b: 'partially_reached', lma3c: 'partially_reached',
      lnm2a: 'partially_reached', lnm2b: 'reached',
      lnm3a: 'partially_reached', lnm3b: 'partially_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's39', klassId: 'k2', vorname: 'Antonia', nachname: 'Lenz',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached', lde3b: 'reached', lde3c: 'reached',
      lde4a: 'reached', lde4b: 'reached', lde4c: 'reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached', lma1d: 'reached',
      lma3a: 'reached', lma3b: 'reached', lma3c: 'partially_reached',
      lnm2a: 'reached', lnm2b: 'reached',
      lnm3a: 'reached', lnm3b: 'reached', lnm3c: 'reached',
    },
  },

  {
    id: 's40', klassId: 'k2', vorname: 'Michael', nachname: 'Graf',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'not_reached', c5: 'partially_reached', c6: 'not_reached' },
    lernzielStatus: {
      lde3a: 'reached',            lde3b: 'partially_reached',  lde3c: 'not_reached',
      lde4a: 'not_reached',        lde4b: 'partially_reached',  lde4c: 'not_reached',
      lma1a: 'partially_reached',  lma1b: 'partially_reached',  lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'partially_reached',  lma3b: 'not_reached',        lma3c: 'not_reached',
      lnm2a: 'partially_reached',  lnm2b: 'partially_reached',
      lnm3a: 'partially_reached',  lnm3b: 'not_reached',        lnm3c: 'not_reached',
    },
  },

  {
    id: 's41', klassId: 'k2', vorname: 'Victoria', nachname: 'Kunz',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached',           lde3b: 'reached',           lde3c: 'partially_reached',
      lde4a: 'partially_reached', lde4b: 'reached',           lde4c: 'partially_reached',
      lma1a: 'partially_reached', lma1b: 'partially_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'reached',           lma3b: 'partially_reached', lma3c: 'not_reached',
      lnm2a: 'partially_reached', lnm2b: 'reached',
      lnm3a: 'partially_reached', lnm3b: 'partially_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's42', klassId: 'k2', vorname: 'Stefan', nachname: 'Becker',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached',           lde3b: 'reached',           lde3c: 'partially_reached',
      lde4a: 'reached',           lde4b: 'reached',           lde4c: 'partially_reached',
      lma1a: 'reached',           lma1b: 'reached',           lma1c: 'reached',           lma1d: 'partially_reached',
      lma3a: 'reached',           lma3b: 'reached',           lma3c: 'partially_reached',
      lnm2a: 'reached',           lnm2b: 'reached',
      lnm3a: 'reached',           lnm3b: 'partially_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's43', klassId: 'k2', vorname: 'Amelie', nachname: 'Gerber',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde3a: 'reached', lde3b: 'reached', lde3c: 'reached',
      lde4a: 'reached', lde4b: 'reached', lde4c: 'reached',
      lma1a: 'reached', lma1b: 'reached', lma1c: 'reached', lma1d: 'reached',
      lma3a: 'reached', lma3b: 'reached', lma3c: 'reached',
      lnm2a: 'reached', lnm2b: 'reached',
      lnm3a: 'reached', lnm3b: 'reached', lnm3c: 'reached',
    },
  },

  {
    id: 's44', klassId: 'k2', vorname: 'Jan', nachname: 'Frei',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'not_reached', c4: 'not_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde3a: 'not_reached', lde3b: 'not_reached', lde3c: 'not_reached',
      lde4a: 'not_reached', lde4b: 'not_reached', lde4c: 'not_reached',
      lma1a: 'not_reached', lma1b: 'not_reached', lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'not_reached', lma3b: 'not_reached', lma3c: 'not_reached',
      lnm2a: 'not_reached', lnm2b: 'not_reached',
      lnm3a: 'not_reached', lnm3b: 'not_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's45', klassId: 'k2', vorname: 'Elise', nachname: 'Arnold',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde3a: 'partially_reached', lde3b: 'partially_reached', lde3c: 'not_reached',
      lde4a: 'partially_reached', lde4b: 'partially_reached', lde4c: 'not_reached',
      lma1a: 'partially_reached', lma1b: 'not_reached',        lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'not_reached',        lma3b: 'not_reached',        lma3c: 'not_reached',
      lnm2a: 'partially_reached',  lnm2b: 'not_reached',
      lnm3a: 'not_reached',        lnm3b: 'not_reached',        lnm3c: 'not_reached',
    },
  },

  {
    // Negative-trend: early Deutsch+Mathe-Basics all mastered, but all late LZ
    // (lma3a-c = Grössen, lnm2a-b, lnm3a-c) failed → Mathe 100%→57%, NMG 0%
    id: 'sNeg2', klassId: 'k2', vorname: 'Kim', nachname: 'Ott',
    rilzFachIds: ['f2', 'f3'],  // RILZ in Mathematik und NMG
    rilzThemaIds: ['tma1_rilz', 'tma3_rilz'],  // Bibliotheks-RILZ-Themen zugewiesen
    bvsa: true,
    note: 'Nach der Prüfung eingebrochen, neue Themenbereiche nicht aufgeholt.',
    rilzLernziele: [
      // NMG – Körper und Gesundheit (ad-hoc, kein Bibliotheks-RILZ-Thema vorhanden)
      { id: 'rlz_sNeg2_7', themaId: 'tnm2', label: 'Ich kann wichtige Körperteile und ihre Funktion benennen', status: 'reached' },
      { id: 'rlz_sNeg2_8', themaId: 'tnm2', label: 'Ich kann Regeln für gesunde Ernährung im Alltag nennen', status: 'partially_reached' },
      // NMG – Schweiz (ad-hoc)
      { id: 'rlz_sNeg2_9',  themaId: 'tnm3', label: 'Ich kann auf einer Karte Wohnort und Hauptstadt der Schweiz zeigen', status: 'not_reached' },
      { id: 'rlz_sNeg2_10', themaId: 'tnm3', label: 'Ich kann die vier Landessprachen der Schweiz nennen', status: 'partially_reached' },
    ],
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde3a: 'reached', lde3b: 'reached', lde3c: 'reached',
      lde4a: 'reached', lde4b: 'reached', lde4c: 'reached',
      // Mathematik RILZ-Bibliothek-Lernziele (tma1_rilz)
      rilz_tma1_a: 'reached', rilz_tma1_b: 'reached', rilz_tma1_c: 'partially_reached',
      // Grössen RILZ-Bibliothek-Lernziele (tma3_rilz)
      rilz_tma3_a: 'partially_reached', rilz_tma3_b: 'not_reached', rilz_tma3_c: 'not_reached',
      lnm2a: 'not_reached', lnm2b: 'not_reached',
      lnm3a: 'not_reached', lnm3b: 'not_reached', lnm3c: 'not_reached',
    },
  },

  {
    id: 's46', klassId: 'k2', vorname: 'Tobias', nachname: 'Widmer',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde3a: 'reached',            lde3b: 'partially_reached',  lde3c: 'not_reached',
      lde4a: 'partially_reached',  lde4b: 'not_reached',        lde4c: 'not_reached',
      lma1a: 'reached',            lma1b: 'reached',            lma1c: 'not_reached', lma1d: 'not_reached',
      lma3a: 'partially_reached',  lma3b: 'partially_reached',  lma3c: 'not_reached',
      lnm2a: 'partially_reached',  lnm2b: 'not_reached',
      lnm3a: 'partially_reached',  lnm3b: 'not_reached',        lnm3c: 'not_reached',
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 3a – k6   LZ-Pool: ltde_z2_5a-b  ltma_z2_5a-b  ltnm_z2_5a-b
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 'sK6_01', klassId: 'k6', vorname: 'Lena', nachname: 'Müller',
    note: 'Sehr fleissig und motiviert.',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      ltde_z2_5a: 'reached', ltde_z2_5b: 'reached',
      ltma_z2_5a: 'reached', ltma_z2_5b: 'reached',
      ltnm_z2_5a: 'reached', ltnm_z2_5b: 'reached',
    },
  },

  {
    id: 'sK6_02', klassId: 'k6', vorname: 'Jonas', nachname: 'Becker',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      ltde_z2_5a: 'reached', ltde_z2_5b: 'reached',
      ltma_z2_5a: 'reached', ltma_z2_5b: 'partially_reached',
      ltnm_z2_5a: 'reached', ltnm_z2_5b: 'reached',
    },
  },

  {
    id: 'sK6_03', klassId: 'k6', vorname: 'Sarah', nachname: 'Zimmermann',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      ltde_z2_5a: 'reached', ltde_z2_5b: 'partially_reached',
      ltma_z2_5a: 'reached', ltma_z2_5b: 'reached',
      ltnm_z2_5a: 'reached', ltnm_z2_5b: 'partially_reached',
    },
  },

  {
    id: 'sK6_04', klassId: 'k6', vorname: 'Finn', nachname: 'Weber',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      ltde_z2_5a: 'reached', ltde_z2_5b: 'partially_reached',
      ltma_z2_5a: 'reached', ltma_z2_5b: 'partially_reached',
      ltnm_z2_5a: 'reached', ltnm_z2_5b: 'not_reached',
    },
  },

  {
    id: 'sK6_05', klassId: 'k6', vorname: 'Leonie', nachname: 'Braun',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      ltde_z2_5a: 'reached', ltde_z2_5b: 'not_reached',
      ltma_z2_5a: 'reached', ltma_z2_5b: 'partially_reached',
      ltnm_z2_5a: 'reached', ltnm_z2_5b: 'partially_reached',
    },
  },

  {
    id: 'sK6_06', klassId: 'k6', vorname: 'Jan', nachname: 'Schulz',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      ltde_z2_5a: 'reached', ltde_z2_5b: 'partially_reached',
      ltma_z2_5a: 'reached', ltma_z2_5b: 'not_reached',
      ltnm_z2_5a: 'reached', ltnm_z2_5b: 'partially_reached',
    },
  },

  {
    id: 'sK6_07', klassId: 'k6', vorname: 'Sophie', nachname: 'Hartmann',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      ltde_z2_5a: 'reached', ltde_z2_5b: 'partially_reached',
      ltma_z2_5a: 'partially_reached', ltma_z2_5b: 'not_reached',
      ltnm_z2_5a: 'reached', ltnm_z2_5b: 'not_reached',
    },
  },

  {
    id: 'sK6_08', klassId: 'k6', vorname: 'Max', nachname: 'König',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      ltde_z2_5a: 'partially_reached', ltde_z2_5b: 'not_reached',
      ltma_z2_5a: 'reached', ltma_z2_5b: 'partially_reached',
      ltnm_z2_5a: 'reached', ltnm_z2_5b: 'partially_reached',
    },
  },

  {
    id: 'sK6_09', klassId: 'k6', vorname: 'Klara', nachname: 'Vogel',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'partially_reached', c6: 'partially_reached' },
    lernzielStatus: {
      ltde_z2_5a: 'reached', ltde_z2_5b: 'not_reached',
      ltma_z2_5a: 'partially_reached', ltma_z2_5b: 'not_reached',
      ltnm_z2_5a: 'reached', ltnm_z2_5b: 'partially_reached',
    },
  },

  {
    id: 'sK6_10', klassId: 'k6', vorname: 'Tim', nachname: 'Berger',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'partially_reached' },
    lernzielStatus: {
      ltde_z2_5a: 'partially_reached', ltde_z2_5b: 'not_reached',
      ltma_z2_5a: 'partially_reached', ltma_z2_5b: 'not_reached',
      ltnm_z2_5a: 'partially_reached', ltnm_z2_5b: 'not_reached',
    },
  },

  {
    id: 'sK6_11', klassId: 'k6', vorname: 'Hannah', nachname: 'Frank',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      ltde_z2_5a: 'partially_reached', ltde_z2_5b: 'partially_reached',
      ltma_z2_5a: 'partially_reached', ltma_z2_5b: 'not_reached',
      ltnm_z2_5a: 'partially_reached', ltnm_z2_5b: 'not_reached',
    },
  },

  {
    id: 'sK6_12', klassId: 'k6', vorname: 'Kevin', nachname: 'Maier',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'reached', c5: 'partially_reached', c6: 'not_reached' },
    lernzielStatus: {
      ltde_z2_5a: 'reached', ltde_z2_5b: 'partially_reached',
      ltma_z2_5a: 'partially_reached', ltma_z2_5b: 'partially_reached',
      ltnm_z2_5a: 'partially_reached', ltnm_z2_5b: 'not_reached',
    },
  },

  {
    id: 'sK6_13', klassId: 'k6', vorname: 'Lisa', nachname: 'Keller',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'reached', c5: 'partially_reached', c6: 'partially_reached' },
    lernzielStatus: {
      ltde_z2_5a: 'partially_reached', ltde_z2_5b: 'not_reached',
      ltma_z2_5a: 'reached', ltma_z2_5b: 'not_reached',
      ltnm_z2_5a: 'partially_reached', ltnm_z2_5b: 'not_reached',
    },
  },

  {
    id: 'sK6_14', klassId: 'k6', vorname: 'Nico', nachname: 'Richter',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'partially_reached' },
    lernzielStatus: {
      ltde_z2_5a: 'partially_reached', ltde_z2_5b: 'not_reached',
      ltma_z2_5a: 'partially_reached', ltma_z2_5b: 'not_reached',
      ltnm_z2_5a: 'not_reached', ltnm_z2_5b: 'not_reached',
    },
  },

  {
    id: 'sK6_15', klassId: 'k6', vorname: 'Lea', nachname: 'Schenk',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'partially_reached', c6: 'partially_reached' },
    lernzielStatus: {
      ltde_z2_5a: 'reached', ltde_z2_5b: 'not_reached',
      ltma_z2_5a: 'partially_reached', ltma_z2_5b: 'not_reached',
      ltnm_z2_5a: 'partially_reached', ltnm_z2_5b: 'not_reached',
    },
  },

  {
    id: 'sK6_16', klassId: 'k6', vorname: 'Ben', nachname: 'Schwarz',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      ltde_z2_5a: 'partially_reached', ltde_z2_5b: 'not_reached',
      ltma_z2_5a: 'partially_reached', ltma_z2_5b: 'not_reached',
      ltnm_z2_5a: 'partially_reached', ltnm_z2_5b: 'not_reached',
    },
  },

  {
    id: 'sK6_17', klassId: 'k6', vorname: 'Zoe', nachname: 'Frei',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      ltde_z2_5a: 'reached', ltde_z2_5b: 'partially_reached',
      ltma_z2_5a: 'partially_reached', ltma_z2_5b: 'not_reached',
      ltnm_z2_5a: 'reached', ltnm_z2_5b: 'partially_reached',
    },
  },

  {
    id: 'sK6_18', klassId: 'k6', vorname: 'Aaron', nachname: 'Lüthi',
    note: 'Benötigt besondere Unterstützung. Aufmerksamkeit und Konzentration schwierig.',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      ltde_z2_5a: 'not_reached', ltde_z2_5b: 'not_reached',
      ltma_z2_5a: 'partially_reached', ltma_z2_5b: 'not_reached',
      ltnm_z2_5a: 'not_reached', ltnm_z2_5b: 'not_reached',
    },
  },

  {
    id: 'sK6_19', klassId: 'k6', vorname: 'Sina', nachname: 'Wüthrich',
    rilzFachIds: ['f1'],
    note: 'Legasthenie-Abklärung im Gang. Braucht vereinfachte Texte.',
    rilzLernziele: [
      { id: 'rlz_sK6_19_1', themaId: 'tde_z2_5', label: 'Ich kann einen kurzen Text mit Anfang und Ende schreiben', status: 'partially_reached' },
      { id: 'rlz_sK6_19_2', themaId: 'tde_z2_5', label: 'Ich kann Schlüsselwörter in einem Text markieren', status: 'reached' },
      { id: 'rlz_sK6_19_3', themaId: 'tde_z2_5', label: 'Ich kann einen Satz mit einem Verbindungswort ergänzen (z.B. «und», «aber»)', status: 'not_reached' },
    ],
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      ltde_z2_5a: 'not_reached', ltde_z2_5b: 'not_reached',
      ltma_z2_5a: 'partially_reached', ltma_z2_5b: 'not_reached',
      ltnm_z2_5a: 'partially_reached', ltnm_z2_5b: 'not_reached',
    },
  },

  {
    id: 'sK6_20', klassId: 'k6', vorname: 'Marco', nachname: 'Bucher',
    rilzFachIds: ['f2'],
    note: 'Dyskalkulie-Verdacht. Zahlenraum stark eingeschränkt.',
    rilzLernziele: [
      { id: 'rlz_sK6_20_1', themaId: 'tma_z2_5', label: 'Ich kann Zahlen bis 1000 lesen und schreiben', status: 'partially_reached' },
      { id: 'rlz_sK6_20_2', themaId: 'tma_z2_5', label: 'Ich kann einfache Addition bis 100 ohne Hilfsmittel', status: 'not_reached' },
      { id: 'rlz_sK6_20_3', themaId: 'tma_z2_5', label: 'Ich kann Zahlen der Grösse nach ordnen bis 1000', status: 'reached' },
    ],
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      ltde_z2_5a: 'partially_reached', ltde_z2_5b: 'not_reached',
      ltma_z2_5a: 'not_reached', ltma_z2_5b: 'not_reached',
      ltnm_z2_5a: 'partially_reached', ltnm_z2_5b: 'not_reached',
    },
  },
] as StudentSeed[]).map((s, i) => ({ ...s, progressHistory: generateHistory(s.lernzielStatus, i) }))

export const SEED_KOMMENTARE: AssessmentKommentar[] = []
