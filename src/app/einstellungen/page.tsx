"use client";

import { Icon } from "@/components/ui/Icon";
import { useData } from "@/contexts/DataContext";
import { FACH_COLORS, getFachColor, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { DatenbankSettings } from "@/components/einstellungen/DatenbankSettings";
import { BerichtIconSettings } from "@/components/einstellungen/BerichtIconSettings";
import { IconLink } from "@/components/ui/icon-link";

const COLOR_LABELS = [
  "Blau",
  "Violett",
  "Grün",
  "Rot",
  "Gelb",
  "Türkis",
  "Pink",
  "Indigo",
];

const EinstellungenPage = () => {
  const { faecher, updateFachColor, loadError, reloadData } = useData();
  const allFachIds = faecher.map((f) => f.id);

  return (
    <div className="page-container py-8">
      <h1 className="mb-6">Passe Lezio nach deinen Wünschen an.</h1>

      <DatenbankSettings onDataChanged={reloadData} />

      <BerichtIconSettings />

      {faecher.length === 0 ? (
        loadError ? (
          <EmptyState
            icon={
              <Icon
                name="cloud_off"
                size={24}
                className="text-accent-foreground"
              />
            }
            title="Daten konnten nicht geladen werden"
            description="Die lokale Datenbank konnte nicht geöffnet werden. Prüfe den Speicherort oben."
            action={
              <Button variant="secondary" onClick={() => reloadData()}>
                Erneut laden
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={
              <Icon
                name="palette"
                size={24}
                className="text-accent-foreground"
              />
            }
            title="Noch keine Fächer vorhanden"
            description={
              <IconLink href="/lernziele">
                Fächer in der Lernzielsammlung erstellen
              </IconLink>
            }
          />
        )
      ) : (
        <ul className="divide-y divide-border">
          {faecher.map((fach) => {
            const currentColor = getFachColor(
              fach.id,
              allFachIds,
              fach.colorIndex,
            );
            return (
              <li key={fach.id} className="flex items-center gap-4 py-3 px-2">
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={cn(
                      "size-2 rounded-full shrink-0",
                      currentColor.dot,
                    )}
                  />
                  <span className="font-medium">{fach.name}</span>
                </div>
                <div className="flex flex-1 items-center justify-end gap-1.5">
                  {FACH_COLORS.map((c, idx) => {
                    const isActive =
                      fach.colorIndex === idx ||
                      (fach.colorIndex === undefined &&
                        getFachColor(fach.id, allFachIds) === c);
                    return (
                      <button
                        key={idx}
                        title={COLOR_LABELS[idx]}
                        onClick={() => updateFachColor(fach.id, idx)}
                        className={cn(
                          "relative size-5 rounded-2xl transition-all",
                          c.dot,
                          isActive
                            ? "ring-2 ring-primary"
                            : "opacity-60 hover:opacity-100 hover:cursor-pointer",
                        )}
                      >
                        {isActive && (
                          <Icon
                            name="check"
                            size={16}
                            weight={700}
                            className="absolute inset-0 m-auto text-primary drop-shadow"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default EinstellungenPage;
