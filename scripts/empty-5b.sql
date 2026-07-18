-- ════════════════════════════════════════════════════════════════════════════
-- 5b (Klasse k2) als leere Sandbox
-- ════════════════════════════════════════════════════════════════════════════
-- Die 5b wird geleert, damit Lehrpersonen sich darin frei ausprobieren können.
-- Die Klasse selbst und ihre LP-Zuweisung BLEIBEN erhalten (sie soll weiterhin
-- sichtbar und der Lehrperson zugeordnet sein) – nur Schüler und
-- Themen-Zuweisungen werden entfernt.
--
-- Im Supabase SQL-Editor einfügen und ausführen.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Vorschau (optional, vor dem Löschen prüfen) ──────────────────────────────
-- SELECT 'schueler'  AS tabelle, count(*) FROM dim_schueler        WHERE klasse_id = 'k2'
-- UNION ALL
-- SELECT 'themen_zuw', count(*) FROM bridge_klasse_themen          WHERE klasse_id = 'k2'
-- UNION ALL
-- SELECT 'pruefungen', count(*) FROM fact_pruefungen               WHERE klasse_id = 'k2';

BEGIN;

-- 1. Schüler der 5b löschen.
--    ON DELETE CASCADE entfernt automatisch die abhängigen Datensätze:
--    fact_lernziel_status, fact_kommentare, fact_thema_kommentare,
--    fact_rilz_lernziele und fact_pruefung_ergebnisse.
DELETE FROM dim_schueler        WHERE klasse_id = 'k2';

-- 2. Alle Themen-Zuweisungen der 5b entfernen.
DELETE FROM bridge_klasse_themen WHERE klasse_id = 'k2';

-- 3. Etwaige Prüfungen der 5b entfernen (Cascade entfernt deren Ergebnisse).
DELETE FROM fact_pruefungen      WHERE klasse_id = 'k2';

COMMIT;

-- ── Kontrolle (sollte überall 0 ergeben) ─────────────────────────────────────
SELECT 'schueler'   AS tabelle, count(*) AS verbleibend FROM dim_schueler         WHERE klasse_id = 'k2'
UNION ALL
SELECT 'themen_zuw',  count(*) FROM bridge_klasse_themen WHERE klasse_id = 'k2'
UNION ALL
SELECT 'pruefungen',  count(*) FROM fact_pruefungen      WHERE klasse_id = 'k2';
