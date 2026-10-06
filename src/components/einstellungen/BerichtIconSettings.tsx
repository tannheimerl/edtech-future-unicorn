"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/shared/Modal";
import { SectionBlock } from "@/components/shared/SectionBlock";
import { useData } from "@/contexts/DataContext";
import { BERICHT_ICON_CATALOG, normalizeIconImage } from "@/lib/berichtIcons";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/types/domain";
import type { BerichtIcon, Status } from "@/types/domain";

// Reihenfolge wie im Bericht: von links nach rechts durch die Statusspalten.
const STATUS_ORDER: Status[] = [
  "not_reached",
  "partially_reached",
  "reached",
];

const STATUS_HINTS: Record<Status, string> = {
  not_reached: "Spalte «noch nicht erreicht» in beiden Tabellen",
  partially_reached: "Spalte «teilweise erreicht», nur bei anspruchsvollen Lernzielen",
  reached: "Spalte «erreicht» in beiden Tabellen",
};

/** Zeigt ein konfiguriertes Icon so, wie es im Bericht erscheint. */
const IconPreview = ({
  icon,
  size = 24,
}: {
  icon: BerichtIcon;
  size?: number;
}) =>
  icon.kind === "image" ? (
    // eslint-disable-next-line @next/next/no-img-element -- Data-URL aus der
    // lokalen DB; next/image kann hier weder optimieren noch ausliefern.
    <img
      src={icon.dataUrl}
      alt=""
      className="object-contain"
      style={{ width: size, height: size }}
    />
  ) : (
    <Icon name={icon.name} size={size} className="text-primary" />
  );

export const BerichtIconSettings = () => {
  const { berichtIcons, setBerichtIcon, resetBerichtIcon } = useData();
  const [pickerStatus, setPickerStatus] = useState<Status | null>(null);
  const [uploadStatus, setUploadStatus] = useState<Status | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openUpload = (status: Status) => {
    setUploadStatus(status);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    // Zurücksetzen, damit dieselbe Datei erneut gewählt werden kann.
    e.target.value = "";
    if (!file || !uploadStatus) return;
    try {
      setBerichtIcon(uploadStatus, await normalizeIconImage(file));
      toast.success("Bild übernommen.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Bild konnte nicht gelesen werden.",
      );
    } finally {
      setUploadStatus(null);
    }
  };

  const activeIcon = pickerStatus ? berichtIcons[pickerStatus] : null;

  return (
    <SectionBlock
      title="Icons im Bericht"
      description="Legt fest, welches Zeichen im Spaltenkopf der Lernziel-Tabellen für einen Status steht — in der PDF-Vorschau, im Export und in der Word-Vorlage."
      className="mb-6"
    >
      <ul className="divide-y divide-border">
        {STATUS_ORDER.map((status) => (
          <li key={status} className="flex items-center gap-4 py-3 px-2">
            <div className="flex size-8 shrink-0 items-center justify-center">
              <IconPreview icon={berichtIcons[status]} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{STATUS_LABELS[status]}</p>
              <p className="text-xs text-muted-foreground">
                {STATUS_HINTS[status]}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={() => setPickerStatus(status)}>
                Icon wählen
              </Button>
              <Button variant="secondary" onClick={() => openUpload(status)}>
                Bild hochladen
              </Button>
              <Button variant="secondary" onClick={() => resetBerichtIcon(status)}>
                Zurücksetzen
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleFileChange}
      />

      <Modal
        open={pickerStatus !== null}
        onOpenChange={(open) => { if (!open) setPickerStatus(null) }}
        title={pickerStatus ? `Icon für «${STATUS_LABELS[pickerStatus]}»` : ""}
        description="Das gewählte Symbol wird beim Erzeugen des Berichts in der Akzentfarbe gezeichnet."
        size="lg"
      >
        <div className="space-y-4">
          {BERICHT_ICON_CATALOG.map(({ gruppe, names }) => (
            <div key={gruppe}>
              <p className="mb-2 text-xs text-muted-foreground">{gruppe}</p>
              <div className="flex flex-wrap gap-2">
                {names.map((name) => {
                  const isActive =
                    activeIcon?.kind === "symbol" && activeIcon.name === name;
                  return (
                    <button
                      key={name}
                      title={name}
                      onClick={() => {
                        if (pickerStatus) setBerichtIcon(pickerStatus, { kind: "symbol", name });
                        setPickerStatus(null);
                      }}
                      className={cn(
                        "flex size-10 items-center justify-center rounded-lg border transition-colors",
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground/80 hover:cursor-pointer hover:bg-muted",
                      )}
                    >
                      <Icon name={name} size={24} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </SectionBlock>
  );
};
