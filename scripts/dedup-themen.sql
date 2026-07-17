-- ============================================================================
-- Dedup-Skript: Duplikate in dim_themen (Lernzielsammlung) bereinigen
-- ============================================================================
--
-- HINTERGRUND
--   Der .lezio/.zip-Import legt Themen IMMER neu an (crypto.randomUUID() in
--   importThemaData, DataContext.tsx) und macht KEIN Matching gegen bestehende
--   Themen. Dadurch entstehen identische Themen.
--
-- DUPLIKAT-DEFINITION (nur Name)
--   Zwei Themen sind Duplikate, wenn der name identisch ist (inkl. Groß-/Klein
--   & Leerzeichen). Fach und Typ sind egal.
--
-- STRATEGIE  "In-Use behalten, Rest löschen"
--   Pro Gruppe überlebt das Thema mit der höchsten Nutzung
--   (Klassen-Zuweisungen + Schüler-Status + Themen-Kommentare + RILZ-Lernziele);
--   Tie-Break: ältestes created_at, dann id.
--   Referenzen der Verlierer werden auf das Survivor-Thema umgehängt, danach
--   werden Verlierer-Lernziele und -Themen gelöscht.
--
-- AUSFÜHRUNG (Supabase SQL-Editor)
--   1) Zuerst Abschnitt 0 (VORSCHAU) allein ausführen -> Gruppen prüfen.
--   2) Dann Abschnitt 1-4 ausführen. Zum Testen am Ende ROLLBACK; statt COMMIT;
--      verwenden -> die Verifikation (Abschnitt 4) zeigt 0 verbleibende Duplikate.
--   3) Nach erfolgreicher Prüfung: COMMIT; (siehe Hinweis am Ende).
-- ============================================================================


-- ============================================================================
-- 0. VORSCHAU  (ändert nichts — separat ausführen)
-- ============================================================================
WITH usage AS (
  SELECT
    t.id, t.fach_id, COALESCE(t.typ, 'standard') AS typ,
    t.name, t.created_at,
      (SELECT count(*) FROM bridge_klasse_themen b WHERE b.thema_id = t.id)
    + (SELECT count(*) FROM fact_thema_kommentare k WHERE k.thema_id = t.id)
    + (SELECT count(*) FROM fact_rilz_lernziele  r WHERE r.thema_id = t.id)
    + (SELECT count(*) FROM fact_lernziel_status s
         JOIN dim_lernziele l ON l.id = s.lernziel_id
        WHERE l.thema_id = t.id)                              AS usage_score,
      (SELECT count(*) FROM dim_lernziele l WHERE l.thema_id = t.id) AS anz_lernziele
  FROM dim_themen t
),
groups AS (
  SELECT u.*,
    count(*)     OVER w AS grp_size,
    row_number() OVER (PARTITION BY name
                       ORDER BY usage_score DESC, created_at ASC NULLS LAST, id ASC) AS rn
  FROM usage u
  WINDOW w AS (PARTITION BY name)
)
SELECT
  name,
  grp_size                               AS anzahl_duplikate,
  count(*) FILTER (WHERE rn = 1)         AS behalten,
  count(*) FILTER (WHERE rn > 1)         AS werden_geloescht,
  (array_agg(id        ORDER BY rn))[1]  AS survivor_id,
  (array_agg(fach_id   ORDER BY rn))[1]  AS survivor_fach,
  array_agg(DISTINCT fach_id)            AS betroffene_faecher,
  array_agg(id ORDER BY rn) FILTER (WHERE rn > 1) AS loser_ids,
  array_agg(usage_score ORDER BY rn)     AS usage_scores
FROM groups
WHERE grp_size > 1
GROUP BY name, grp_size
ORDER BY anzahl_duplikate DESC, name;


-- ============================================================================
-- 1.-4.  BEREINIGUNG  (in einer Transaktion)
-- ============================================================================
BEGIN;

-- --- 1. Mapping loser_id -> survivor_id ------------------------------------
CREATE TEMP TABLE thema_dedup_map ON COMMIT DROP AS
WITH usage AS (
  SELECT
    t.id, t.fach_id, COALESCE(t.typ, 'standard') AS typ,
    t.name, t.created_at,
      (SELECT count(*) FROM bridge_klasse_themen b WHERE b.thema_id = t.id)
    + (SELECT count(*) FROM fact_thema_kommentare k WHERE k.thema_id = t.id)
    + (SELECT count(*) FROM fact_rilz_lernziele  r WHERE r.thema_id = t.id)
    + (SELECT count(*) FROM fact_lernziel_status s
         JOIN dim_lernziele l ON l.id = s.lernziel_id
        WHERE l.thema_id = t.id)                              AS usage_score
  FROM dim_themen t
),
groups AS (
  SELECT u.*,
    count(*)     OVER (PARTITION BY name) AS grp_size,
    first_value(id) OVER (PARTITION BY name
                          ORDER BY usage_score DESC, created_at ASC NULLS LAST, id ASC) AS survivor_id,
    row_number() OVER (PARTITION BY name
                       ORDER BY usage_score DESC, created_at ASC NULLS LAST, id ASC) AS rn
  FROM usage u
)
SELECT id AS loser_id, survivor_id
FROM groups
WHERE grp_size > 1 AND rn > 1;

-- Sicherheit: Loser darf nie gleich Survivor sein
DELETE FROM thema_dedup_map WHERE loser_id = survivor_id;


-- --- 2. Referenzen auf Survivor umhängen (VOR dem Löschen) -----------------

-- 2.1 bridge_klasse_themen: Survivor-Zuweisung anlegen, falls Survivor noch
--     keine hat. UNIQUE(thema_id) verlangt max. EINE Zuweisung -> DISTINCT ON
--     wählt eine aus. Loser-Zeilen verschwinden beim Themen-Delete via
--     ON DELETE CASCADE.
INSERT INTO bridge_klasse_themen (klasse_id, thema_id)
SELECT DISTINCT ON (m.survivor_id)
       b.klasse_id, m.survivor_id
FROM bridge_klasse_themen b
JOIN thema_dedup_map m ON m.loser_id = b.thema_id
WHERE NOT EXISTS (
  SELECT 1 FROM bridge_klasse_themen e
  WHERE e.thema_id = m.survivor_id
)
ORDER BY m.survivor_id, b.klasse_id
ON CONFLICT DO NOTHING;

-- 2.2 fact_thema_kommentare: Survivor-Kommentar je Schüler anlegen, falls noch
--     keiner existiert (Survivor hat Vorrang). Loser via CASCADE entfernt.
INSERT INTO fact_thema_kommentare (schueler_id, thema_id, text, updated_at)
SELECT DISTINCT ON (k.schueler_id, m.survivor_id)
       k.schueler_id, m.survivor_id, k.text, k.updated_at
FROM fact_thema_kommentare k
JOIN thema_dedup_map m ON m.loser_id = k.thema_id
ORDER BY k.schueler_id, m.survivor_id, k.updated_at DESC
ON CONFLICT (schueler_id, thema_id) DO NOTHING;

-- 2.3 fact_rilz_lernziele: kein CASCADE -> explizit umhängen.
UPDATE fact_rilz_lernziele r
SET thema_id = m.survivor_id
FROM thema_dedup_map m
WHERE r.thema_id = m.loser_id;

-- 2.4 Self-Reference standard_thema_id (RILZ-Eltern): umhängen.
UPDATE dim_themen t
SET standard_thema_id = m.survivor_id
FROM thema_dedup_map m
WHERE t.standard_thema_id = m.loser_id;

-- 2.5 dim_schueler.rilz_thema_ids (TEXT[]): Loser-IDs durch Survivor ersetzen
--     und deduplizieren — nur für betroffene Schüler.
UPDATE dim_schueler s
SET rilz_thema_ids = sub.new_ids
FROM (
  SELECT s2.id,
         (SELECT array_agg(DISTINCT COALESCE(m.survivor_id, x))
            FROM unnest(s2.rilz_thema_ids) AS x
            LEFT JOIN thema_dedup_map m ON m.loser_id = x) AS new_ids
  FROM dim_schueler s2
  WHERE EXISTS (
    SELECT 1 FROM unnest(s2.rilz_thema_ids) y
    JOIN thema_dedup_map m ON m.loser_id = y
  )
) sub
WHERE s.id = sub.id;


-- --- 3. Löschen ------------------------------------------------------------

-- 3.1 Loser-Lernziele löschen (kein CASCADE von dim_themen aus).
--     fact_lernziel_status + fact_kommentare cascaden über lernziel_id.
DELETE FROM dim_lernziele l
USING thema_dedup_map m
WHERE l.thema_id = m.loser_id;

-- 3.2 Loser-Themen löschen. CASCADE räumt verbliebene bridge_klasse_themen
--     und fact_thema_kommentare der Loser ab.
DELETE FROM dim_themen t
USING thema_dedup_map m
WHERE t.id = m.loser_id;


-- --- 4. Verifikation (muss 0 Zeilen liefern) ------------------------------
SELECT name, count(*) AS verbleibend
FROM dim_themen
GROUP BY name
HAVING count(*) > 1
ORDER BY verbleibend DESC;

-- Kontrolle: keine verwaisten Referenzen mehr auf gelöschte Themen
SELECT 'fact_rilz_lernziele' AS tabelle, count(*) AS verwaiste
FROM fact_rilz_lernziele r LEFT JOIN dim_themen t ON t.id = r.thema_id
WHERE t.id IS NULL
UNION ALL
SELECT 'standard_thema_id', count(*)
FROM dim_themen c LEFT JOIN dim_themen p ON p.id = c.standard_thema_id
WHERE c.standard_thema_id IS NOT NULL AND p.id IS NULL;


-- ============================================================================
-- ABSCHLUSS
--   Zum Testen:   ROLLBACK;   (nimmt alle Änderungen zurück)
--   Final:        COMMIT;
-- Genau EINE der folgenden Zeilen einkommentiert ausführen:
-- ============================================================================
-- ROLLBACK;
-- COMMIT;
