import type { Klasse, Schueler, Kompetenz, Fach, Thema, Lernziel, Lehrperson, AssessmentKommentar, Status, StatusSnapshot } from '@/types/domain'

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
]

export const SEED_LERNZIELE: Lernziel[] = [
  // tde1 – Lesen
  { id: 'lde1a', themaId: 'tde1', kategorie: 'grundlegend',   wichtig: true, label: 'Texte flüssig und sinngebend vorlesen', kriterien: ['Liest laut, deutlich und in angemessenem Tempo', 'Beachtet Satzzeichen und Sinnabschnitte', 'Betont wichtige Wörter korrekt'] },
  { id: 'lde1b', themaId: 'tde1', kategorie: 'grundlegend',   label: 'Hauptaussage und wesentliche Details eines Textes verstehen', kriterien: ['Benennt die Hauptaussage in eigenen Worten', 'Unterscheidet wesentliche von nebensächlichen Informationen', 'Beantwortet W-Fragen zum Text'] },
  { id: 'lde1c', themaId: 'tde1', kategorie: 'grundlegend',   label: 'Informationen aus Sachtexten entnehmen', kriterien: ['Findet gezielte Informationen im Text', 'Nutzt Überschriften und Bilder als Orientierung', 'Notiert Schlüsselbegriffe'] },
  { id: 'lde1d', themaId: 'tde1', kategorie: 'anspruchsvoll', label: 'Schlussfolgerungen aus Texten ziehen', kriterien: ['Verknüpft Textinformationen logisch', 'Erklärt Ursache-Wirkungs-Zusammenhänge', 'Begründet Schlüsse mit Textstellen'] },
  // tde2 – Schreiben
  { id: 'lde2a', themaId: 'tde2', kategorie: 'grundlegend',   label: 'Texte strukturiert und verständlich aufschreiben', kriterien: ['Gliedert Text in Einleitung, Hauptteil, Schluss', 'Verwendet Absätze sinnvoll', 'Schreibt in vollständigen Sätzen'] },
  { id: 'lde2b', themaId: 'tde2', kategorie: 'anspruchsvoll', label: 'Eigene Erlebnisse und Meinungen schriftlich ausdrücken', kriterien: ['Beschreibt Erlebnisse lebendig und anschaulich', 'Drückt Gefühle und Meinungen klar aus', 'Wählt treffende Ausdrücke'] },
  { id: 'lde2c', themaId: 'tde2', kategorie: 'anspruchsvoll', label: 'Texte überarbeiten und verbessern', kriterien: ['Liest eigene Texte kritisch durch', 'Verbessert Satzbau und Wortwahl', 'Korrigiert Rechtschreibfehler selbstständig'] },
  // tde3 – Sprechen
  { id: 'lde3a', themaId: 'tde3', kategorie: 'grundlegend',   label: 'Verständlich und deutlich sprechen', kriterien: ['Spricht in angemessener Lautstärke', 'Artikuliert klar und deutlich', 'Hält Blickkontakt beim Sprechen'] },
  { id: 'lde3b', themaId: 'tde3', kategorie: 'grundlegend',   label: 'Zuhören und das Gehörte zusammenfassen', kriterien: ['Hört aufmerksam zu ohne zu unterbrechen', 'Fasst Gehörtes in eigenen Worten zusammen', 'Stellt Verständnisfragen'] },
  { id: 'lde3c', themaId: 'tde3', kategorie: 'anspruchsvoll', label: 'An Gesprächen sachlich und respektvoll teilnehmen', kriterien: ['Wartet auf die eigene Redegelegenheit', 'Reagiert auf Beiträge anderer', 'Formuliert Kritik konstruktiv'] },
  // tde4 – Rechtschreibung
  { id: 'lde4a', themaId: 'tde4', kategorie: 'grundlegend',   label: 'Sätze grammatikalisch korrekt bilden', kriterien: ['Verwendet Subjekt und Prädikat korrekt', 'Bildet Haupt- und Nebensätze richtig', 'Beachtet Kongruenz zwischen Subjekt und Verb'] },
  { id: 'lde4b', themaId: 'tde4', kategorie: 'grundlegend',   label: 'Häufige Wörter fehlerfrei schreiben', kriterien: ['Schreibt Grundwortschatz fehlerfrei', 'Wendet Rechtschreibregeln an', 'Nutzt Wörterbuch zur Kontrolle'] },
  { id: 'lde4c', themaId: 'tde4', kategorie: 'anspruchsvoll', label: 'Wortarten erkennen und anwenden', kriterien: ['Benennt Nomen, Verben, Adjektive korrekt', 'Bestimmt Artikel und Pronomen', 'Wendet Wortarten in eigenen Texten an'] },
  // tma1 – Zahlen
  { id: 'lma1a', themaId: 'tma1', kategorie: 'grundlegend',   wichtig: true, label: 'Zahlen bis 1 000 000 lesen, schreiben und ordnen', kriterien: ['Liest und schreibt sechsstellige Zahlen', 'Ordnet Zahlen auf dem Zahlenstrahl', 'Vergleicht Zahlen mit <, >, ='] },
  { id: 'lma1b', themaId: 'tma1', kategorie: 'grundlegend',   wichtig: true, label: 'Schriftlich addieren und subtrahieren', kriterien: ['Führt schriftliche Addition mit Übertrag durch', 'Führt schriftliche Subtraktion mit Entbündeln durch', 'Überprüft Ergebnisse durch Proberechnung'] },
  { id: 'lma1c', themaId: 'tma1', kategorie: 'anspruchsvoll', label: 'Schriftlich multiplizieren und dividieren', kriterien: ['Multipliziert mehrstellige Zahlen schriftlich', 'Dividiert mit Rest schriftlich', 'Erkennt Zusammenhang zwischen Multiplikation und Division'] },
  { id: 'lma1d', themaId: 'tma1', kategorie: 'anspruchsvoll', label: 'Brüche und Dezimalzahlen verstehen und vergleichen', kriterien: ['Stellt Brüche als Teile eines Ganzen dar', 'Wandelt einfache Brüche in Dezimalzahlen um', 'Vergleicht und ordnet Dezimalzahlen'] },
  // tma2 – Geometrie
  { id: 'lma2a', themaId: 'tma2', kategorie: 'grundlegend',   label: 'Dreiecke und Vierecke benennen und Eigenschaften beschreiben', kriterien: ['Benennt gleichseitig, gleichschenklig, rechtwinklig', 'Beschreibt Eigenschaften von Quadrat, Rechteck, Raute', 'Zeichnet Figuren nach Vorgabe'] },
  { id: 'lma2b', themaId: 'tma2', kategorie: 'anspruchsvoll', label: 'Umfang und Flächeninhalt berechnen', kriterien: ['Berechnet Umfang von Vierecken und Dreiecken', 'Berechnet Flächeninhalt mit Formel', 'Löst Sachaufgaben zu Umfang und Fläche'] },
  { id: 'lma2c', themaId: 'tma2', kategorie: 'grundlegend',   label: 'Symmetrien und Spiegelungen erkennen und beschreiben', kriterien: ['Erkennt Achsensymmetrie in Figuren', 'Zeichnet Spiegelbilder an einer Achse', 'Beschreibt Symmetrieeigenschaften von Figuren'] },
  // tma3 – Grössen
  { id: 'lma3a', themaId: 'tma3', kategorie: 'grundlegend',   label: 'Grössen messen und umrechnen (Länge, Masse, Zeit)', kriterien: ['Misst mit geeignetem Messwerkzeug', 'Rechnet zwischen Einheiten um (km↔m, kg↔g)', 'Löst Aufgaben mit gemischten Einheiten'] },
  { id: 'lma3b', themaId: 'tma3', kategorie: 'anspruchsvoll', label: 'Diagramme und Tabellen lesen und erstellen', kriterien: ['Liest Werte aus Balken- und Liniendiagrammen ab', 'Erstellt eigene Diagramme aus Datentabellen', 'Beschreibt Trends und Auffälligkeiten'] },
  { id: 'lma3c', themaId: 'tma3', kategorie: 'anspruchsvoll', label: 'Sachaufgaben lösen und den Rechenweg aufzeigen', kriterien: ['Entnimmt relevante Daten der Aufgabe', 'Wählt passende Rechenoperation', 'Notiert Lösungsweg nachvollziehbar'] },
  // tma4 – Algebra
  { id: 'lma4a', themaId: 'tma4', kategorie: 'grundlegend',   label: 'Variable und Terme verstehen und notieren', kriterien: ['Erklärt, was eine Variable bedeutet', 'Notiert Terme mit Variablen korrekt', 'Wertet Terme für gegebene Werte aus'] },
  { id: 'lma4b', themaId: 'tma4', kategorie: 'anspruchsvoll', label: 'Einfache Gleichungen aufstellen und lösen', kriterien: ['Stellt Gleichungen aus Sachsituationen auf', 'Löst Gleichungen durch Umformen', 'Überprüft die Lösung durch Einsetzen'] },
  // tnm1 – Lebewesen
  { id: 'lnm1a', themaId: 'tnm1', kategorie: 'grundlegend',   label: 'Tiere und Pflanzen in ihren Lebensräumen beschreiben', kriterien: ['Nennt typische Vertreter verschiedener Lebensräume', 'Beschreibt Merkmale und Verhaltensweisen', 'Ordnet Lebewesen ihrem Lebensraum zu'] },
  { id: 'lnm1b', themaId: 'tnm1', kategorie: 'anspruchsvoll', label: 'Nahrungsbeziehungen und Ökosysteme erklären', kriterien: ['Erstellt einfache Nahrungsketten', 'Erklärt Rolle von Produzenten, Konsumenten, Destruenten', 'Beschreibt das Gleichgewicht im Ökosystem'] },
  { id: 'lnm1c', themaId: 'tnm1', kategorie: 'anspruchsvoll', label: 'Anpassungen von Lebewesen an Lebensräume vergleichen', kriterien: ['Nennt körperliche Anpassungen an den Lebensraum', 'Vergleicht Anpassungen verschiedener Arten', 'Begründet Anpassungen mit Umweltbedingungen'] },
  // tnm2 – Körper
  { id: 'lnm2a', themaId: 'tnm2', kategorie: 'grundlegend',   label: 'Wichtige Körperorgane und ihre Funktionen beschreiben', kriterien: ['Benennt Herz, Lunge, Magen, Niere und ihre Funktion', 'Erklärt den Blutkreislauf vereinfacht', 'Beschreibt das Verdauungssystem'] },
  { id: 'lnm2b', themaId: 'tnm2', kategorie: 'anspruchsvoll', label: 'Massnahmen zur Gesundheitsförderung begründen', kriterien: ['Nennt Regeln für gesunde Ernährung', 'Erklärt die Bedeutung von Bewegung', 'Begründet Hygienemassnahmen'] },
  // tnm3 – Schweiz
  { id: 'lnm3a', themaId: 'tnm3', kategorie: 'grundlegend',   label: 'Wichtige Ereignisse der Schweizer Geschichte einordnen', kriterien: ['Nennt Gründungsdatum und wichtige Gründer', 'Ordnet Ereignisse auf einer Zeitleiste ein', 'Erklärt die Bedeutung der Reformation'] },
  { id: 'lnm3b', themaId: 'tnm3', kategorie: 'grundlegend',   label: 'Karten lesen und geografische Merkmale der Schweiz beschreiben', kriterien: ['Liest Höhenangaben und Legenden aus Karten', 'Benennt Alpen, Mittelland und Jura', 'Nennt Nachbarländer und Landessprachen'] },
  { id: 'lnm3c', themaId: 'tnm3', kategorie: 'anspruchsvoll', label: 'Politische Grundstrukturen der Schweiz erläutern', kriterien: ['Erklärt Bund, Kanton, Gemeinde', 'Beschreibt direkte Demokratie (Abstimmung, Initiative)', 'Nennt wichtige Bundesbehörden'] },
  // tnm4 – Wirtschaft
  { id: 'lnm4a', themaId: 'tnm4', kategorie: 'anspruchsvoll', label: 'Einfache wirtschaftliche Zusammenhänge verstehen', kriterien: ['Erklärt Angebot und Nachfrage', 'Beschreibt den Wirtschaftskreislauf vereinfacht', 'Nennt Beispiele für Import und Export'] },
  { id: 'lnm4b', themaId: 'tnm4', kategorie: 'grundlegend',   label: 'Berufsbilder und Berufswahl beschreiben', kriterien: ['Nennt Anforderungen verschiedener Berufe', 'Beschreibt eigene Interessen und Stärken', 'Erklärt Schritte der Berufswahl'] },
  // tfr1 – Hören/Sprechen
  { id: 'lfr1a', themaId: 'tfr1', kategorie: 'grundlegend',   label: 'Einfache Sätze und Anweisungen auf Französisch verstehen', kriterien: ['Versteht einfache Anweisungen im Unterricht', 'Erfasst Hauptinformation aus kurzen Hörtexten', 'Erkennt bekannte Vokabeln im Gehörten'] },
  { id: 'lfr1b', themaId: 'tfr1', kategorie: 'grundlegend',   label: 'Sich vorstellen und über den Alltag auf Französisch berichten', kriterien: ['Stellt sich mit Name, Alter, Wohnort vor', 'Beschreibt Tagesablauf in einfachen Sätzen', 'Spricht über Hobbys und Familie'] },
  { id: 'lfr1c', themaId: 'tfr1', kategorie: 'anspruchsvoll', label: 'Auf Fragen zu vertrauten Themen antworten', kriterien: ['Beantwortet W-Fragen auf Französisch', 'Verwendet passende Antwortformeln', 'Stellt Rückfragen auf Französisch'] },
  // tfr2 – Lesen
  { id: 'lfr2a', themaId: 'tfr2', kategorie: 'grundlegend',   label: 'Einfache Texte sinnverstehend lesen', kriterien: ['Versteht die Hauptaussage eines einfachen Textes', 'Beantwortet Verständnisfragen zum Text', 'Erschliesst unbekannte Wörter aus dem Kontext'] },
  { id: 'lfr2b', themaId: 'tfr2', kategorie: 'grundlegend',   label: 'Bekannte Ausdrücke und Wörter in Texten erkennen', kriterien: ['Erkennt Vokabeln aus dem Unterricht im Text', 'Findet bestimmte Informationen im Text', 'Markiert bekannte Schlüsselwörter'] },
  // tfr3 – Schreiben (noch nicht fällig)
  { id: 'lfr3a', themaId: 'tfr3', kategorie: 'grundlegend',   label: 'Einfache Sätze korrekt auf Französisch aufschreiben', kriterien: ['Schreibt einfache Sätze fehlerfrei', 'Beachtet Satzstellung im Französischen', 'Verwendet gelernten Wortschatz korrekt'] },
  { id: 'lfr3b', themaId: 'tfr3', kategorie: 'anspruchsvoll', label: 'Eine kurze Mitteilung oder Postkarte auf Französisch verfassen', kriterien: ['Schreibt eine kurze Mitteilung strukturiert auf', 'Verwendet passende Gruss- und Abschiedsformeln', 'Hält sich an Wortschatz und Strukturen aus dem Unterricht'] },
  // tde5 – Sprachreflexion
  { id: 'lde5a', themaId: 'tde5', kategorie: 'grundlegend',   label: 'Wortarten bestimmen und korrekt anwenden' },
  { id: 'lde5b', themaId: 'tde5', kategorie: 'grundlegend',   label: 'Satzglieder in einfachen Sätzen erkennen' },
  { id: 'lde5c', themaId: 'tde5', kategorie: 'anspruchsvoll', label: 'Sprachliche Mittel bewusst und wirkungsvoll einsetzen' },
  // tde6 – Literarische Texte
  { id: 'lde6a', themaId: 'tde6', kategorie: 'grundlegend',   label: 'Handlung und Figuren eines literarischen Textes beschreiben' },
  { id: 'lde6b', themaId: 'tde6', kategorie: 'grundlegend',   label: 'Textstellen zitieren und kommentieren' },
  { id: 'lde6c', themaId: 'tde6', kategorie: 'anspruchsvoll', label: 'Themen und Motive eines literarischen Textes deuten' },
  // tma5 – Brüche und Dezimalzahlen
  { id: 'lma5a', themaId: 'tma5', kategorie: 'grundlegend',   label: 'Brüche mit gleichem Nenner addieren und subtrahieren' },
  { id: 'lma5b', themaId: 'tma5', kategorie: 'grundlegend',   label: 'Dezimalzahlen in Brüche umwandeln und umgekehrt' },
  { id: 'lma5c', themaId: 'tma5', kategorie: 'anspruchsvoll', label: 'Brüche multiplizieren und dividieren' },
  // tnm5 – Energie und Umwelt
  { id: 'lnm5a', themaId: 'tnm5', kategorie: 'grundlegend',   label: 'Erneuerbare und nicht erneuerbare Energiequellen unterscheiden' },
  { id: 'lnm5b', themaId: 'tnm5', kategorie: 'grundlegend',   label: 'Auswirkungen des Energieverbrauchs auf die Umwelt beschreiben' },
  { id: 'lnm5c', themaId: 'tnm5', kategorie: 'anspruchsvoll', label: 'Massnahmen zum Klimaschutz erläutern und bewerten' },
  // tfr4 – Wortschatz und Grammatik
  { id: 'lfr4a', themaId: 'tfr4', kategorie: 'grundlegend',   label: 'Grundlegende Grammatikregeln des Französischen anwenden' },
  { id: 'lfr4b', themaId: 'tfr4', kategorie: 'grundlegend',   label: 'Wortschatz aus dem Unterricht korrekt einsetzen' },
  { id: 'lfr4c', themaId: 'tfr4', kategorie: 'anspruchsvoll', label: 'Komplexe Satzstrukturen erkennen und selbst bilden' },
  // Eigene Lernziele von Lukas Meier (zu den eigenen Themen ohne autor)
  // tde_e1 – Kreatives Schreiben
  { id: 'lde_e1a', themaId: 'tde_e1', kategorie: 'grundlegend',   label: 'Kurze Geschichten mit klarem Anfang, Wendepunkt und Ende erfinden', kriterien: ['Entwickelt eine eigene Figur mit Eigenschaften', 'Baut eine erkennbare Spannungskurve auf', 'Schliesst die Geschichte stimmig ab'] },
  { id: 'lde_e1b', themaId: 'tde_e1', kategorie: 'grundlegend',   label: 'Beschreibende Sprache und Sinneseindrücke gezielt einsetzen', kriterien: ['Verwendet Adjektive und Vergleiche treffend', 'Beschreibt mindestens zwei Sinneseindrücke', 'Vermeidet Wiederholungen durch Synonyme'] },
  { id: 'lde_e1c', themaId: 'tde_e1', kategorie: 'anspruchsvoll', label: 'Einen überraschenden oder offenen Schluss gestalten', kriterien: ['Baut eine unerwartete Wendung ein', 'Begründet die Wirkung des Endes auf den Leser', 'Setzt sprachliche Mittel bewusst ein'] },
  // tde_e2 – Medien und Kommunikation
  { id: 'lde_e2a', themaId: 'tde_e2', kategorie: 'grundlegend',   label: 'Nachrichten und Meinungen in Medientexten unterscheiden', kriterien: ['Benennt Aussagen, die Fakten sind', 'Erkennt wertende Formulierungen', 'Vergleicht zwei Quellen zur gleichen Information'] },
  { id: 'lde_e2b', themaId: 'tde_e2', kategorie: 'anspruchsvoll', label: 'Absicht und Wirkung eines Medientextes einschätzen', kriterien: ['Benennt die Zielgruppe des Textes', 'Erklärt, welche Wirkung der Text erzielen will', 'Reflektiert, ob die Darstellung einseitig ist'] },
  // tma_e1 – Wahrscheinlichkeit und Zufall
  { id: 'lma_e1a', themaId: 'tma_e1', kategorie: 'grundlegend',   label: 'Einfache Zufallsexperimente durchführen und Ergebnisse notieren', kriterien: ['Führt Münzwurf- oder Würfelexperiment korrekt durch', 'Hält Ergebnisse in einer Tabelle fest', 'Vergleicht Erwartung mit Versuchsergebnis'] },
  { id: 'lma_e1b', themaId: 'tma_e1', kategorie: 'anspruchsvoll', label: 'Wahrscheinlichkeiten als Brüche angeben und vergleichen', kriterien: ['Berechnet Wahrscheinlichkeit als günstige/mögliche Ergebnisse', 'Vergleicht Wahrscheinlichkeiten zweier Ereignisse', 'Begründet, ob ein Spiel fair ist'] },
  // tma_e2 – Textaufgaben und Modellieren
  { id: 'lma_e2a', themaId: 'tma_e2', kategorie: 'grundlegend',   label: 'Relevante Angaben aus einer Sachaufgabe herausfiltern', kriterien: ['Unterstreicht gesuchte und gegebene Grössen', 'Erkennt überflüssige Angaben', 'Skizziert die Situation wenn nötig'] },
  { id: 'lma_e2b', themaId: 'tma_e2', kategorie: 'anspruchsvoll', label: 'Mehrstufige Sachprobleme in einen Rechenplan übersetzen', kriterien: ['Gliedert das Problem in Teilschritte', 'Wählt für jeden Schritt die richtige Operation', 'Überprüft das Endergebnis auf Plausibilität'] },
  // tnm_e1 – Wetter und Klima
  { id: 'lnm_e1a', themaId: 'tnm_e1', kategorie: 'grundlegend',   label: 'Wetterphänomene beobachten, messen und dokumentieren', kriterien: ['Misst Temperatur, Niederschlag und Wind korrekt', 'Führt ein Wettertagebuch über mindestens eine Woche', 'Nutzt Wettersymbole auf einer Wetterkarte'] },
  { id: 'lnm_e1b', themaId: 'tnm_e1', kategorie: 'grundlegend',   label: 'Den Unterschied zwischen Wetter und Klima erklären', kriterien: ['Definiert Wetter als kurzfristigen Zustand', 'Beschreibt Klima als langfristiges Muster', 'Nennt ein Beispiel für ein Klimagebiet der Erde'] },
  { id: 'lnm_e1c', themaId: 'tnm_e1', kategorie: 'anspruchsvoll', label: 'Auswirkungen des Klimawandels auf die Schweiz beschreiben und bewerten', kriterien: ['Nennt mindestens zwei messbare Folgen (z.B. Gletscherschmelze, Hitzetage)', 'Erklärt Ursache-Wirkungs-Zusammenhänge', 'Beurteilt mögliche Massnahmen auf lokaler Ebene'] },
]

// ── Klassen ───────────────────────────────────────────────────────────────────
// k1 (5a): Deutsch Lesen+Schreiben · Mathe Zahlen+Geometrie · NMG Lebewesen
// k2 (6b): Deutsch Sprechen+Rechtschreibung · Mathe Zahlen+Grössen · NMG Körper+Schweiz
// k3 (7c): Deutsch Schreiben · Mathe Algebra · NMG Schweiz+Wirtschaft · Französisch alle

// RILZ-Lernziele für die Bibliothek-RILZ-Themen (eigene Lernziele der Heilpädagogin)
export const SEED_LERNZIELE_RILZ: Lernziel[] = [
  // tma1_rilz – Zahlen und Operationen (vereinfacht)
  { id: 'rilz_tma1_a', themaId: 'tma1_rilz', kategorie: 'grundlegend', label: 'Zahlen bis 1 000 lesen, schreiben und vergleichen' },
  { id: 'rilz_tma1_b', themaId: 'tma1_rilz', kategorie: 'grundlegend', label: 'Addition und Subtraktion bis 1 000 ohne Übertragsrechnung' },
  { id: 'rilz_tma1_c', themaId: 'tma1_rilz', kategorie: 'grundlegend', label: 'Das kleine Einmaleins (1–5) sicher anwenden' },
  // tma3_rilz – Grössen, Daten und Zufall (vereinfacht, Alltagsbezug)
  { id: 'rilz_tma3_a', themaId: 'tma3_rilz', kategorie: 'grundlegend', label: 'Uhrzeit ablesen und einfache Zeitspannen berechnen' },
  { id: 'rilz_tma3_b', themaId: 'tma3_rilz', kategorie: 'grundlegend', label: 'Meter und Zentimeter im Alltag messen und umrechnen' },
  { id: 'rilz_tma3_c', themaId: 'tma3_rilz', kategorie: 'grundlegend', label: 'Kilogramm und Gramm mit Waage bestimmen' },
]

export const SEED_LERNZIELE_BIBLIOTHEK: Lernziel[] = [
  // Deutsch – Lesen (Stufen 3-4)
  { id: 'bde1a', themaId: 'tde1', kategorie: 'grundlegend',   label: 'Einfache Texte sinnentnehmend lesen',              source: 'bibliothek', stufe: [3, 4], autor: 'Sarah Keller', beschreibung: 'Bewährtes Grundlernziel für die Unterstufe, geprüft in mehreren Klassen.' },
  { id: 'bde1b', themaId: 'tde1', kategorie: 'anspruchsvoll', label: 'Texte mit unbekannten Wörtern erschliessen',        source: 'bibliothek', stufe: [3, 4], autor: 'Sarah Keller' },
  // Deutsch – Schreiben (Stufen 3-4)
  { id: 'bde2a', themaId: 'tde2', kategorie: 'grundlegend',   label: 'Kurze Texte mit klarer Struktur verfassen',         source: 'bibliothek', stufe: [3, 4], autor: 'Jana Huber' },
  { id: 'bde2b', themaId: 'tde2', kategorie: 'anspruchsvoll', label: 'Eigene Erfahrungen schriftlich beschreiben',        source: 'bibliothek', stufe: [3, 4], autor: 'Jana Huber', beschreibung: 'Gut kombinierbar mit dem Mündlichkeitslernziel aus Sprechen/Zuhören.' },
  // Mathematik – Zahlen (Stufen 5-6)
  { id: 'bma1a', themaId: 'tma1', kategorie: 'grundlegend',   label: 'Zahlen bis 10 000 sicher lesen und schreiben',     source: 'bibliothek', stufe: [5, 6], wichtig: true,  autor: 'Marco Brun' },
  { id: 'bma1b', themaId: 'tma1', kategorie: 'grundlegend',   label: 'Grundoperationen im Zahlenraum bis 10 000 anwenden',source: 'bibliothek', stufe: [5, 6], wichtig: true,  autor: 'Marco Brun', beschreibung: 'Aufbaulernziel auf «Zahlen bis 10 000 sicher lesen und schreiben».' },
  { id: 'bma1c', themaId: 'tma1', kategorie: 'anspruchsvoll', label: 'Primzahlen und Teilbarkeitsregeln kennen',          source: 'bibliothek', stufe: [5, 6],                 autor: 'Marco Brun' },
  // Mathematik – Geometrie (Stufen 5-6)
  { id: 'bma2a', themaId: 'tma2', kategorie: 'grundlegend',   label: 'Grundlegende geometrische Formen benennen',        source: 'bibliothek', stufe: [5, 6],                 autor: 'Sarah Keller' },
  { id: 'bma2b', themaId: 'tma2', kategorie: 'anspruchsvoll', label: 'Flächen- und Rauminhalte einfacher Körper berechnen',source: 'bibliothek', stufe: [6, 7],               autor: 'Sarah Keller' },
  // Mathematik – Algebra (Stufen 7-8)
  { id: 'bma4a', themaId: 'tma4', kategorie: 'grundlegend',   label: 'Terme mit einer Variablen vereinfachen',           source: 'bibliothek', stufe: [7, 8], wichtig: true,  autor: 'Lukas Meier' },
  { id: 'bma4b', themaId: 'tma4', kategorie: 'anspruchsvoll', label: 'Lineare Gleichungssysteme lösen',                  source: 'bibliothek', stufe: [7, 8],                 autor: 'Lukas Meier', beschreibung: 'Für Klassen ab Stufe 8 empfohlen, setzt Terme vereinfachen voraus.' },
  // NMG – Lebewesen (Stufen 5-6)
  { id: 'bnm1a', themaId: 'tnm1', kategorie: 'grundlegend',   label: 'Heimische Tiere und Pflanzen bestimmen',           source: 'bibliothek', stufe: [5, 6],                 autor: 'Jana Huber' },
  { id: 'bnm1b', themaId: 'tnm1', kategorie: 'anspruchsvoll', label: 'Ökosysteme und Artenvielfalt erklären',            source: 'bibliothek', stufe: [5, 6],                 autor: 'Jana Huber' },
  // NMG – Schweiz (Stufen 6-7)
  { id: 'bnm3a', themaId: 'tnm3', kategorie: 'grundlegend',   label: 'Wichtige Kantone und deren Hauptorte kennen',      source: 'bibliothek', stufe: [6, 7],                 autor: 'Marco Brun' },
  { id: 'bnm3b', themaId: 'tnm3', kategorie: 'anspruchsvoll', label: 'Die Entstehung der Eidgenossenschaft erläutern',   source: 'bibliothek', stufe: [6, 7],                 autor: 'Marco Brun' },
  // Französisch – Grundstufe (Stufen 5-6)
  { id: 'bfr1a', themaId: 'tfr1', kategorie: 'grundlegend',   label: 'Grundlegende Begrüssungen und Verabschiedungen',   source: 'bibliothek', stufe: [5, 6], wichtig: true,  autor: 'Lukas Meier' },
  { id: 'bfr1b', themaId: 'tfr1', kategorie: 'grundlegend',   label: 'Zahlen 1–100 auf Französisch nennen',              source: 'bibliothek', stufe: [5, 6],                 autor: 'Lukas Meier' },
  { id: 'bfr2a', themaId: 'tfr2', kategorie: 'grundlegend',   label: 'Einfache Dialoge auf Französisch verstehen',       source: 'bibliothek', stufe: [5, 6],                 autor: 'Sarah Keller' },
  { id: 'bfr2b', themaId: 'tfr2', kategorie: 'anspruchsvoll', label: 'Kurze Geschichten auf Französisch zusammenfassen', source: 'bibliothek', stufe: [6, 7],                 autor: 'Sarah Keller' },
]

export const SEED_LEHRPERSONEN: Lehrperson[] = [
  { id: 'lp1', name: 'Lukas Meier', kuerzel: 'LM' },
  { id: 'lp2', name: 'Sarah Keller', kuerzel: 'SK' },
  { id: 'lp3', name: 'Marco Brun', kuerzel: 'MB' },
  { id: 'lp4', name: 'Jana Huber', kuerzel: 'JH' },
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
    id: 'k2', name: '6b', schuljahr: '2025/26',
    assignedThemaIds: ['tde3', 'tde4', 'tma1', 'tma3', 'tnm2', 'tnm3'],
    lpZuweisungen: [
      { lpId: 'lp3', fachIds: ['f1', 'f3'], rolle: 'klassenlehrperson' },
      { lpId: 'lp2', fachIds: ['f2'], rolle: 'fachlehrperson' },
      { lpId: 'lp4', fachIds: [], rolle: 'heilpaedagogin' },
    ],
  },
  {
    id: 'k3', name: '7c', schuljahr: '2025/26',
    assignedThemaIds: ['tde2', 'tma4', 'tnm3', 'tnm4', 'tfr1', 'tfr2', 'tfr3'],
    lpZuweisungen: [
      { lpId: 'lp1', fachIds: ['f1'], rolle: 'klassenlehrperson' },
      { lpId: 'lp2', fachIds: ['f2'], rolle: 'fachlehrperson' },
      { lpId: 'lp3', fachIds: ['f3', 'f4'], rolle: 'fachlehrperson' },
      { lpId: 'lp4', fachIds: [], rolle: 'heilpaedagogin' },
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
      { id: 'rlz_s3_1', themaId: 'tma1', label: 'Zahlen bis 100 lesen und schreiben', status: 'reached' },
      { id: 'rlz_s3_2', themaId: 'tma1', label: 'Einfache Addition und Subtraktion bis 20', status: 'partially_reached' },
      { id: 'rlz_s3_3', themaId: 'tma1', label: 'Verdoppeln und Halbieren im Zahlenraum bis 20', status: 'not_reached' },
      { id: 'rlz_s3_4', themaId: 'tma2', label: 'Grundlegende geometrische Formen erkennen und benennen', status: 'not_reached' },
      { id: 'rlz_s3_5', themaId: 'tma2', label: 'Figuren nach Vorlage mit Lineal nachzeichnen', status: 'partially_reached' },
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
      { id: 'rlz_sNeg2_7', themaId: 'tnm2', label: 'Wichtige Körperteile und ihre Funktion benennen', status: 'reached' },
      { id: 'rlz_sNeg2_8', themaId: 'tnm2', label: 'Regeln für gesunde Ernährung im Alltag nennen', status: 'partially_reached' },
      // NMG – Schweiz (ad-hoc)
      { id: 'rlz_sNeg2_9',  themaId: 'tnm3', label: 'Auf einer Karte Wohnort und Hauptstadt der Schweiz zeigen', status: 'not_reached' },
      { id: 'rlz_sNeg2_10', themaId: 'tnm3', label: 'Die vier Landessprachen der Schweiz nennen', status: 'partially_reached' },
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
  // 7c – k3   LZ-Pool: lde2a-c  lma4a-b  lnm3a-c  lnm4a-b  lfr1a-c  lfr2a-b  lfr3a-b*
  //           (* lfr3 noch nicht fällig → aus Analytik ausgeschlossen)
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 's10', klassId: 'k3', vorname: 'Felix', nachname: 'Bucher',
    note: 'Sehr selbstständiges Arbeiten, hilft anderen Schülern.',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached', lde2b: 'reached', lde2c: 'reached',
      lma4a: 'reached', lma4b: 'reached',
      lnm3a: 'reached', lnm3b: 'reached', lnm3c: 'reached',
      lnm4a: 'reached', lnm4b: 'reached',
      lfr1a: 'reached', lfr1b: 'reached', lfr1c: 'reached',
      lfr2a: 'reached', lfr2b: 'reached',
      lfr3a: 'reached', lfr3b: 'reached',
    },
  },

  {
    id: 's11', klassId: 'k3', vorname: 'Marie', nachname: 'Suter',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde2a: 'reached',           lde2b: 'partially_reached', lde2c: 'not_reached',
      lma4a: 'partially_reached', lma4b: 'not_reached',
      lnm3a: 'reached',           lnm3b: 'partially_reached', lnm3c: 'not_reached',
      lnm4a: 'reached',           lnm4b: 'partially_reached',
      lfr1a: 'partially_reached', lfr1b: 'not_reached',        lfr1c: 'not_reached',
      lfr2a: 'partially_reached', lfr2b: 'partially_reached',
      lfr3a: 'not_reached',        lfr3b: 'not_reached',
    },
  },

  {
    id: 's12', klassId: 'k3', vorname: 'Tom', nachname: 'Meier',
    rilzFachIds: ['f2', 'f4'],  // RILZ in Mathematik und Französisch
    note: 'Zeigt Schwierigkeiten bei der Konzentration.',
    rilzLernziele: [
      // Mathematik – Algebra (vereinfacht: konkrete Muster statt Terme)
      { id: 'rlz_s12_1', themaId: 'tma4', label: 'Zahlenfolgen und Muster erkennen und fortführen', status: 'partially_reached' },
      { id: 'rlz_s12_2', themaId: 'tma4', label: 'Einfache Gleichungen mit Platzhalter lösen (z. B. □ + 4 = 9)', status: 'not_reached' },
      // Französisch – Hören und Sprechen (vereinfacht: Grundwortschatz)
      { id: 'rlz_s12_3', themaId: 'tfr1', label: 'Sich auf Französisch vorstellen (Name, Alter, Wohnort)', status: 'reached' },
      { id: 'rlz_s12_4', themaId: 'tfr1', label: 'Einfache Anweisungen im Unterricht verstehen', status: 'partially_reached' },
      { id: 'rlz_s12_5', themaId: 'tfr1', label: 'Zahlen 1–20 auf Französisch nennen', status: 'reached' },
      // Französisch – Lesen (vereinfacht: Bildwörterbuch-Niveau)
      { id: 'rlz_s12_6', themaId: 'tfr2', label: 'Bekannte Vokabeln in einfachen Texten erkennen', status: 'partially_reached' },
      { id: 'rlz_s12_7', themaId: 'tfr2', label: 'Kurze beschriftete Bilder und Schilder auf Französisch lesen', status: 'not_reached' },
      // Französisch – Schreiben (vereinfacht: Wörter abschreiben)
      { id: 'rlz_s12_8', themaId: 'tfr3', label: 'Gelernten Grundwortschatz fehlerfrei abschreiben', status: 'not_reached' },
      { id: 'rlz_s12_9', themaId: 'tfr3', label: 'Eine einfache Vorstellung auf Französisch aufschreiben', status: 'not_reached' },
    ],
    competencyStatus: { c1: 'not_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'not_reached', c5: 'partially_reached', c6: 'not_reached' },
    lernzielStatus: {
      lde2a: 'not_reached', lde2b: 'not_reached', lde2c: 'not_reached',
      lma4a: 'not_reached', lma4b: 'not_reached',
      lnm3a: 'not_reached', lnm3b: 'not_reached', lnm3c: 'not_reached',
      lnm4a: 'not_reached', lnm4b: 'not_reached',
      lfr1a: 'not_reached', lfr1b: 'not_reached', lfr1c: 'not_reached',
      lfr2a: 'not_reached', lfr2b: 'not_reached',
      lfr3a: 'not_reached', lfr3b: 'not_reached',
    },
  },

  {
    id: 's47', klassId: 'k3', vorname: 'Luise', nachname: 'Hofer',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached', lde2b: 'reached', lde2c: 'reached',
      lma4a: 'reached', lma4b: 'reached',
      lnm3a: 'reached', lnm3b: 'reached', lnm3c: 'reached',
      lnm4a: 'reached', lnm4b: 'reached',
      lfr1a: 'reached', lfr1b: 'reached', lfr1c: 'reached',
      lfr2a: 'reached', lfr2b: 'reached',
      lfr3a: 'reached', lfr3b: 'reached',
    },
  },

  {
    id: 's48', klassId: 'k3', vorname: 'Alexander', nachname: 'Moser',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached',           lde2b: 'reached',           lde2c: 'partially_reached',
      lma4a: 'partially_reached', lma4b: 'not_reached',
      lnm3a: 'reached',           lnm3b: 'reached',           lnm3c: 'partially_reached',
      lnm4a: 'reached',           lnm4b: 'reached',
      lfr1a: 'partially_reached', lfr1b: 'partially_reached', lfr1c: 'not_reached',
      lfr2a: 'partially_reached', lfr2b: 'partially_reached',
      lfr3a: 'partially_reached', lfr3b: 'not_reached',
    },
  },

  {
    id: 's49', klassId: 'k3', vorname: 'Johanna', nachname: 'Hug',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached',           lde2b: 'partially_reached', lde2c: 'partially_reached',
      lma4a: 'partially_reached', lma4b: 'partially_reached',
      lnm3a: 'reached',           lnm3b: 'reached',           lnm3c: 'partially_reached',
      lnm4a: 'partially_reached', lnm4b: 'partially_reached',
      lfr1a: 'reached',           lfr1b: 'partially_reached', lfr1c: 'partially_reached',
      lfr2a: 'reached',           lfr2b: 'reached',
      lfr3a: 'partially_reached', lfr3b: 'not_reached',
    },
  },

  {
    id: 's50', klassId: 'k3', vorname: 'Oliver', nachname: 'Furrer',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'partially_reached', c4: 'not_reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde2a: 'not_reached',        lde2b: 'not_reached', lde2c: 'not_reached',
      lma4a: 'not_reached',        lma4b: 'not_reached',
      lnm3a: 'not_reached',        lnm3b: 'not_reached', lnm3c: 'not_reached',
      lnm4a: 'not_reached',        lnm4b: 'not_reached',
      lfr1a: 'partially_reached',  lfr1b: 'not_reached', lfr1c: 'not_reached',
      lfr2a: 'not_reached',        lfr2b: 'not_reached',
      lfr3a: 'not_reached',        lfr3b: 'not_reached',
    },
  },

  {
    id: 's51', klassId: 'k3', vorname: 'Franziska', nachname: 'Keller',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached',           lde2b: 'reached',           lde2c: 'reached',
      lma4a: 'reached',           lma4b: 'partially_reached',
      lnm3a: 'reached',           lnm3b: 'reached',           lnm3c: 'reached',
      lnm4a: 'reached',           lnm4b: 'reached',
      lfr1a: 'reached',           lfr1b: 'reached',           lfr1c: 'partially_reached',
      lfr2a: 'reached',           lfr2b: 'reached',
      lfr3a: 'reached',           lfr3b: 'partially_reached',
    },
  },

  {
    id: 's52', klassId: 'k3', vorname: 'Sebastian', nachname: 'Mayer',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'not_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'not_reached', c6: 'not_reached' },
    lernzielStatus: {
      lde2a: 'partially_reached', lde2b: 'not_reached', lde2c: 'not_reached',
      lma4a: 'not_reached',        lma4b: 'not_reached',
      lnm3a: 'not_reached',        lnm3b: 'not_reached', lnm3c: 'not_reached',
      lnm4a: 'not_reached',        lnm4b: 'not_reached',
      lfr1a: 'not_reached',        lfr1b: 'not_reached', lfr1c: 'not_reached',
      lfr2a: 'not_reached',        lfr2b: 'not_reached',
      lfr3a: 'not_reached',        lfr3b: 'not_reached',
    },
  },

  {
    id: 's53', klassId: 'k3', vorname: 'Katharina', nachname: 'Brunner',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached', lde2b: 'reached', lde2c: 'reached',
      lma4a: 'reached', lma4b: 'reached',
      lnm3a: 'reached', lnm3b: 'reached', lnm3c: 'partially_reached',
      lnm4a: 'reached', lnm4b: 'reached',
      lfr1a: 'reached', lfr1b: 'reached', lfr1c: 'reached',
      lfr2a: 'reached', lfr2b: 'reached',
      lfr3a: 'reached', lfr3b: 'partially_reached',
    },
  },

  {
    id: 's54', klassId: 'k3', vorname: 'Florian', nachname: 'Fuchs',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'partially_reached',  lde2b: 'partially_reached', lde2c: 'not_reached',
      lma4a: 'not_reached',         lma4b: 'not_reached',
      lnm3a: 'partially_reached',   lnm3b: 'partially_reached', lnm3c: 'not_reached',
      lnm4a: 'partially_reached',   lnm4b: 'partially_reached',
      lfr1a: 'partially_reached',   lfr1b: 'not_reached',        lfr1c: 'not_reached',
      lfr2a: 'partially_reached',   lfr2b: 'not_reached',
      lfr3a: 'not_reached',          lfr3b: 'not_reached',
    },
  },

  {
    id: 's55', klassId: 'k3', vorname: 'Nina', nachname: 'Reuter',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde2a: 'reached',           lde2b: 'reached',           lde2c: 'partially_reached',
      lma4a: 'partially_reached', lma4b: 'not_reached',
      lnm3a: 'reached',           lnm3b: 'reached',           lnm3c: 'partially_reached',
      lnm4a: 'partially_reached', lnm4b: 'reached',
      lfr1a: 'reached',           lfr1b: 'reached',           lfr1c: 'partially_reached',
      lfr2a: 'reached',           lfr2b: 'reached',
      lfr3a: 'partially_reached', lfr3b: 'not_reached',
    },
  },

  {
    id: 's56', klassId: 'k3', vorname: 'Markus', nachname: 'Bühler',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'partially_reached', c3: 'reached', c4: 'reached', c5: 'partially_reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached',           lde2b: 'reached',           lde2c: 'partially_reached',
      lma4a: 'reached',           lma4b: 'partially_reached',
      lnm3a: 'reached',           lnm3b: 'reached',           lnm3c: 'reached',
      lnm4a: 'reached',           lnm4b: 'partially_reached',
      lfr1a: 'partially_reached', lfr1b: 'partially_reached', lfr1c: 'not_reached',
      lfr2a: 'partially_reached', lfr2b: 'reached',
      lfr3a: 'not_reached',        lfr3b: 'not_reached',
    },
  },

  {
    id: 's57', klassId: 'k3', vorname: 'Sandra', nachname: 'Gehrig',
    note: '',
    competencyStatus: { c1: 'not_reached', c2: 'not_reached', c3: 'not_reached', c4: 'not_reached', c5: 'not_reached', c6: 'not_reached' },
    lernzielStatus: {
      lde2a: 'not_reached', lde2b: 'not_reached', lde2c: 'not_reached',
      lma4a: 'not_reached', lma4b: 'not_reached',
      lnm3a: 'not_reached', lnm3b: 'not_reached', lnm3c: 'not_reached',
      lnm4a: 'not_reached', lnm4b: 'not_reached',
      lfr1a: 'not_reached', lfr1b: 'not_reached', lfr1c: 'not_reached',
      lfr2a: 'not_reached', lfr2b: 'not_reached',
      lfr3a: 'not_reached', lfr3b: 'not_reached',
    },
  },

  {
    id: 's58', klassId: 'k3', vorname: 'Christian', nachname: 'Wyss',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached',           lde2b: 'reached',           lde2c: 'reached',
      lma4a: 'reached',           lma4b: 'partially_reached',
      lnm3a: 'reached',           lnm3b: 'reached',           lnm3c: 'reached',
      lnm4a: 'reached',           lnm4b: 'reached',
      lfr1a: 'reached',           lfr1b: 'partially_reached', lfr1c: 'partially_reached',
      lfr2a: 'reached',           lfr2b: 'reached',
      lfr3a: 'partially_reached', lfr3b: 'not_reached',
    },
  },

  {
    id: 's59', klassId: 'k3', vorname: 'Eva', nachname: 'Lüthi',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'partially_reached', c4: 'partially_reached', c5: 'partially_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde2a: 'partially_reached', lde2b: 'partially_reached', lde2c: 'not_reached',
      lma4a: 'not_reached',        lma4b: 'not_reached',
      lnm3a: 'partially_reached',  lnm3b: 'not_reached',        lnm3c: 'not_reached',
      lnm4a: 'partially_reached',  lnm4b: 'not_reached',
      lfr1a: 'partially_reached',  lfr1b: 'not_reached',        lfr1c: 'not_reached',
      lfr2a: 'not_reached',        lfr2b: 'not_reached',
      lfr3a: 'not_reached',        lfr3b: 'not_reached',
    },
  },

  {
    id: 's60', klassId: 'k3', vorname: 'Karin', nachname: 'Gut',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'not_reached', c3: 'partially_reached', c4: 'reached', c5: 'not_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde2a: 'reached',           lde2b: 'not_reached',        lde2c: 'not_reached',
      lma4a: 'partially_reached', lma4b: 'not_reached',
      lnm3a: 'reached',           lnm3b: 'partially_reached',  lnm3c: 'not_reached',
      lnm4a: 'partially_reached', lnm4b: 'not_reached',
      lfr1a: 'not_reached',        lfr1b: 'not_reached',        lfr1c: 'not_reached',
      lfr2a: 'not_reached',        lfr2b: 'not_reached',
      lfr3a: 'not_reached',        lfr3b: 'not_reached',
    },
  },

  {
    id: 's61', klassId: 'k3', vorname: 'Jana', nachname: 'Bachmann',
    note: '',
    competencyStatus: { c1: 'reached', c2: 'reached', c3: 'reached', c4: 'reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached', lde2b: 'reached', lde2c: 'reached',
      lma4a: 'reached', lma4b: 'reached',
      lnm3a: 'reached', lnm3b: 'reached', lnm3c: 'reached',
      lnm4a: 'reached', lnm4b: 'reached',
      lfr1a: 'reached', lfr1b: 'reached', lfr1c: 'reached',
      lfr2a: 'reached', lfr2b: 'reached',
      lfr3a: 'reached', lfr3b: 'reached',
    },
  },

  {
    // Negative-trend: keys reordered so French + partial others form the early batch.
    // Late LZ span every subject → ALL lines (Deutsch, Mathe, NMG, Français) drop at LATE_INTRO
    id: 'sNeg3', klassId: 'k3', vorname: 'Kira', nachname: 'Rüegg',
    note: 'Sehr guter Start, nach neuen Lernzielen in allen Fächern eingebrochen.',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'partially_reached', c4: 'reached', c5: 'reached', c6: 'partially_reached' },
    lernzielStatus: {
      // First 10 keys → early batch (all reached)
      lfr1a: 'reached', lfr1b: 'reached', lfr1c: 'reached',
      lfr2a: 'reached', lfr2b: 'reached',
      lde2a: 'reached',
      lma4a: 'reached',
      lnm3a: 'reached', lnm3b: 'reached',
      lnm4a: 'reached',
      // Last 7 keys → late batch (all not_reached)
      lfr3a: 'not_reached', lfr3b: 'not_reached',
      lde2b: 'not_reached', lde2c: 'not_reached',
      lma4b: 'not_reached',
      lnm3c: 'not_reached', lnm4b: 'not_reached',
    },
  },

  {
    id: 's62', klassId: 'k3', vorname: 'Niclas', nachname: 'Knecht',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'partially_reached', c3: 'not_reached', c4: 'not_reached', c5: 'partially_reached', c6: 'partially_reached' },
    lernzielStatus: {
      lde2a: 'partially_reached', lde2b: 'partially_reached',  lde2c: 'not_reached',
      lma4a: 'not_reached',        lma4b: 'not_reached',
      lnm3a: 'partially_reached',  lnm3b: 'partially_reached',  lnm3c: 'not_reached',
      lnm4a: 'partially_reached',  lnm4b: 'not_reached',
      lfr1a: 'partially_reached',  lfr1b: 'not_reached',        lfr1c: 'not_reached',
      lfr2a: 'partially_reached',  lfr2b: 'partially_reached',
      lfr3a: 'not_reached',         lfr3b: 'not_reached',
    },
  },

  {
    id: 's63', klassId: 'k3', vorname: 'Amelie', nachname: 'Steiger',
    note: '',
    competencyStatus: { c1: 'partially_reached', c2: 'reached', c3: 'reached', c4: 'partially_reached', c5: 'reached', c6: 'reached' },
    lernzielStatus: {
      lde2a: 'reached',           lde2b: 'reached',           lde2c: 'partially_reached',
      lma4a: 'partially_reached', lma4b: 'not_reached',
      lnm3a: 'reached',           lnm3b: 'partially_reached',  lnm3c: 'not_reached',
      lnm4a: 'reached',           lnm4b: 'partially_reached',
      lfr1a: 'reached',           lfr1b: 'partially_reached',  lfr1c: 'not_reached',
      lfr2a: 'reached',           lfr2b: 'partially_reached',
      lfr3a: 'partially_reached', lfr3b: 'not_reached',
    },
  },
] as StudentSeed[]).map((s, i) => ({ ...s, progressHistory: generateHistory(s.lernzielStatus, i) }))

export const SEED_KOMMENTARE: AssessmentKommentar[] = []
