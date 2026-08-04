"use client";

import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/icon-button";
import { PillTabs } from "@/components/shared/PillTabs";

export type KlasseTab =
  | "schueler"
  | "beurteilung"
  | "berichte"
  | "statistik"
  | "einstellungen";

export const KlasseTabBar = ({
  active,
  onChange,
  title,
  onEditTitle,
}: {
  active: KlasseTab;
  onChange: (t: KlasseTab) => void;
  title: string;
  onEditTitle: () => void;
}) => {
  const tabs: { key: KlasseTab; label: string }[] = [
    { key: "schueler", label: "Schüler" },
    { key: "beurteilung", label: "Lernkontrollen" },
    { key: "berichte", label: "Berichte" },
    { key: "statistik", label: "Statistik" },
    { key: "einstellungen", label: "Einstellungen" }, // TODO: Keine doppelte Bezeichnung für Einstellungen
  ];
  return (
    <div className="mb-4">
      {/* Title */}
      <div className="flex items-center gap-2 py-4 mb-1">
        <h1>
          Klasse{" "}
          <span className="font-bold text-primary text-foreground">
            {title}
          </span>
        </h1>
        <IconButton onClick={onEditTitle} aria-label="Klassenname bearbeiten">
          <Icon name="edit_square" size={16} />
        </IconButton>
      </div>

      {/* Tab strip */}
      <div className="overflow-x-auto scrollbar-hide">
        <PillTabs
          variant="underline"
          options={tabs}
          value={active}
          onChange={onChange}
        />
      </div>
    </div>
  );
};
