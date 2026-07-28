"use client";

import { Icon } from "@/components/ui/Icon";
import { PillTabs } from "@/components/shared/PillTabs";

export type KlasseTab =
  | "schueler"
  | "beurteilung"
  | "berichte"
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
        {
          // TODO: Mit IconButton erserten
        }
        <button
          onClick={onEditTitle}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Klassenname bearbeiten"
        >
          <Icon name="edit_square" size={24} />
        </button>
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
