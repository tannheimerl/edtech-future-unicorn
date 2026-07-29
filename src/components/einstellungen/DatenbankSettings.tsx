"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { SectionBlock } from "@/components/shared/SectionBlock";
import { toast } from "@/lib/toast";
import {
  getDbPath,
  createNewDb,
  loadExistingDb,
  importDb,
  exportDb,
} from "@/lib/db-settings";

type DatenbankSettingsProps = {
  /** Refetches app data after the active database connection changes. */
  onDataChanged: () => Promise<void>;
};

export const DatenbankSettings = ({
  onDataChanged,
}: DatenbankSettingsProps) => {
  const [path, setPath] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getDbPath()
      .then(setPath)
      .catch(() => toast.error("Datenbankpfad konnte nicht gelesen werden."));
  }, []);

  const runSwitch = async (
    action: () => Promise<string | null | boolean>,
    successMessage: string,
  ) => {
    setBusy(true);
    try {
      const result = await action();
      if (result === false || result === null) return;
      const newPath = await getDbPath();
      setPath(newPath);
      await onDataChanged();
      toast.success(successMessage);
    } catch {
      toast.error("Datenbankvorgang fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  const handleCreateNew = () =>
    runSwitch(createNewDb, "Neue Datenbank angelegt.");
  const handleLoadExisting = () =>
    runSwitch(loadExistingDb, "Datenbank geladen.");
  const handleImport = () => runSwitch(importDb, "Datenbank importiert.");

  const handleExport = async () => {
    setBusy(true);
    try {
      const dest = await exportDb();
      if (dest) toast.success("Datenbank exportiert.");
    } catch {
      toast.error("Export fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SectionBlock
      title="Datenbank"
      description="Speicherort deiner lokalen Lezio-Datenbank."
      className="mb-6"
    >
      <div className="grid gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 h-[48px]">
          <Icon
            name="database"
            size={16}
            className="shrink-0 text-muted-foreground"
          />
          <span
            className="truncate text-foreground/80"
            title={path ?? undefined}
          >
            {path ?? "Wird geladen…"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={busy} onClick={handleCreateNew}>
            Neue Datenbank anlegen
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={handleLoadExisting}
          >
            Bestehende Datenbank laden
          </Button>
          <Button variant="secondary" disabled={busy} onClick={handleImport}>
            Importieren
          </Button>
          <Button variant="secondary" disabled={busy} onClick={handleExport}>
            Exportieren
          </Button>
        </div>
      </div>
    </SectionBlock>
  );
};
