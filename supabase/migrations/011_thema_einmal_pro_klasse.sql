-- Ein Thema kann nur einer Klasse pro Tenant zugewiesen sein.

-- Schritt 1: Bestehende Duplikate entfernen (behalte kleinste klasse_id je thema+tenant)
DELETE FROM bridge_klasse_themen b
WHERE klasse_id != (
  SELECT MIN(klasse_id)
  FROM bridge_klasse_themen b2
  WHERE b2.thema_id = b.thema_id
    AND b2.tenant_id = b.tenant_id
);

-- Schritt 2: UNIQUE-Constraint hinzufügen
ALTER TABLE bridge_klasse_themen
  ADD CONSTRAINT uq_thema_per_tenant UNIQUE (thema_id, tenant_id);
