-- Vervollständigt die Demo-Prüfung „Schriftliche Prüfung – Zahlen & Geometrie"
-- (Klasse 5a / Mathematik): alle 21 relevanten Schüler:innen fertig bewertet,
-- ausser Anna (s14) = 2. Versuch offen und Paul (s15) = 3. Versuch offen.
-- Idempotent: kann mehrfach ausgeführt werden. Tenant-unabhängig.

WITH ziel_pruefungen AS (
  SELECT id AS pruefung_id, tenant_id
  FROM fact_pruefungen
  WHERE klasse_id = 'k1'
    AND fach_id   = 'f2'
    AND name LIKE 'Schriftliche Prüfung%'
),
soll (schueler_id, punkte, note, anzahl_versuche,
      zweiter_versuch_ausstehend, abgeschlossen, versuch_snapshots, status) AS (
  VALUES
    -- ── Fertig bewertet (abgeschlossen, mit Note + Punkten) ──────────────
    ('s1',    18, '5.5', 1, false, true, '[]'::jsonb, 'reached'),
    ('s2',    14, '4.5', 1, false, true, '[]'::jsonb, 'reached'),
    ('s4',    16, '5.0', 1, false, true, '[]'::jsonb, 'reached'),
    ('s13',   11, '3.5', 1, false, true, '[]'::jsonb, 'partially_reached'),
    ('s16',   16, '5.0', 1, false, true, '[]'::jsonb, 'reached'),
    ('s17',   12, '4.0', 1, false, true, '[]'::jsonb, 'partially_reached'),
    ('s18',   20, '6.0', 1, false, true, '[]'::jsonb, 'reached'),
    ('s19',   14, '4.5', 1, false, true, '[]'::jsonb, 'reached'),
    ('s20',   12, '4.0', 1, false, true, '[]'::jsonb, 'partially_reached'),
    ('s21',   16, '5.0', 1, false, true, '[]'::jsonb, 'reached'),
    ('s22',   18, '5.5', 1, false, true, '[]'::jsonb, 'reached'),
    ('s23',   10, '3.5', 1, false, true, '[]'::jsonb, 'partially_reached'),
    ('s24',   14, '4.5', 1, false, true, '[]'::jsonb, 'reached'),
    ('s25',   18, '5.5', 1, false, true, '[]'::jsonb, 'reached'),
    ('s26',   12, '4.0', 1, false, true, '[]'::jsonb, 'partially_reached'),
    ('s27',   14, '4.5', 1, false, true, '[]'::jsonb, 'reached'),
    ('s28',   10, '3.5', 1, false, true, '[]'::jsonb, 'partially_reached'),
    ('sNeg1',  8, '3.0', 1, false, true, '[]'::jsonb, 'not_reached'),
    ('s29',   16, '5.0', 1, false, true, '[]'::jsonb, 'reached'),
    -- ── Anna Huber: 2. Versuch noch offen ───────────────────────────────
    ('s14', NULL, NULL, 1, true, false,
      '[{"nr":1,"date":"2026-05-14","punkte":9,"note":"3.0","status":"not_reached"}]'::jsonb,
      NULL),
    -- ── Paul Koch: 3. Versuch noch offen ────────────────────────────────
    ('s15', NULL, NULL, 2, true, false,
      '[{"nr":1,"date":"2026-05-14","punkte":8,"note":"3.0","status":"not_reached"},
        {"nr":2,"date":"2026-05-28","punkte":11,"note":"3.5","status":"partially_reached"}]'::jsonb,
      NULL)
)
INSERT INTO fact_pruefung_ergebnisse (
  id, pruefung_id, schueler_id, punkte, note, anzahl_versuche,
  zweiter_versuch_ausstehend, abgeschlossen, versuch_snapshots,
  kommentar, anhang_urls, status, tenant_id
)
SELECT
  'demo-erg-' || s.schueler_id || '-' || p.tenant_id,
  p.pruefung_id, s.schueler_id, s.punkte, s.note, s.anzahl_versuche,
  s.zweiter_versuch_ausstehend, s.abgeschlossen, s.versuch_snapshots,
  NULL, '{}', s.status, p.tenant_id
FROM ziel_pruefungen p
CROSS JOIN soll s
ON CONFLICT (pruefung_id, schueler_id) DO UPDATE SET
  punkte                     = EXCLUDED.punkte,
  note                       = EXCLUDED.note,
  anzahl_versuche            = EXCLUDED.anzahl_versuche,
  zweiter_versuch_ausstehend = EXCLUDED.zweiter_versuch_ausstehend,
  abgeschlossen              = EXCLUDED.abgeschlossen,
  versuch_snapshots          = EXCLUDED.versuch_snapshots,
  status                     = EXCLUDED.status;

-- ── Kontroll-Abfrage (optional, nach dem Lauf ausführen) ────────────────
-- Erwartung pro Tenant: fertig = 19, offen_2_versuch = 1, offen_3_versuch = 1, total = 21
--
-- SELECT e.tenant_id,
--        count(*) FILTER (WHERE e.abgeschlossen)                              AS fertig,
--        count(*) FILTER (WHERE e.zweiter_versuch_ausstehend
--                           AND coalesce(e.anzahl_versuche,1) < 2)            AS offen_2_versuch,
--        count(*) FILTER (WHERE e.zweiter_versuch_ausstehend
--                           AND coalesce(e.anzahl_versuche,1) >= 2)           AS offen_3_versuch,
--        count(*)                                                            AS total
-- FROM fact_pruefung_ergebnisse e
-- JOIN fact_pruefungen p ON p.id = e.pruefung_id
-- WHERE p.klasse_id = 'k1' AND p.fach_id = 'f2'
--   AND p.name LIKE 'Schriftliche Prüfung%'
-- GROUP BY e.tenant_id;
