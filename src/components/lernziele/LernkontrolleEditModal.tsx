"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/shared/Modal";
import { ModalRow } from "@/components/shared/ModalRow";
import { ModalOptionList } from "@/components/shared/ModalOptionList";
import {
  LernzielEditSection,
  type LernzielDraft,
} from "@/components/shared/LernzielEditSection";

export const LernkontrolleEditModal = ({
  lernkontrolleId,
  onClose,
  onRequestDelete,
}: {
  lernkontrolleId: string;
  onClose: () => void;
  onRequestDelete: () => void;
}) => {
  const {
    lernkontrollen,
    faecher,
    lernziele,
    updateLernkontrolle,
    exportLernkontrolle,
    createLernziel,
    updateLernziel,
    deleteLernziel,
  } = useData();
  const lernkontrolle = lernkontrollen.find((t) => t.id === lernkontrolleId);
  const lernkontrolleLZ = lernziele.filter(
    (lz) => lz.lernkontrolleId === lernkontrolleId,
  );

  // Step
  const [editStep, setEditStep] = useState<"meta" | "lernziele">("meta");

  // Meta state
  const [localName, setLocalName] = useState(lernkontrolle?.name ?? "");
  const [localFachId, setLocalFachId] = useState(lernkontrolle?.fachId ?? "");
  const [localTyp, setLocalTyp] = useState<"standard" | "rilz">(
    lernkontrolle?.typ ?? "standard",
  );
  const [stufe, setStufe] = useState<number | undefined>(
    lernkontrolle?.stufe?.[0],
  );
  const [openRowId, setOpenRowId] = useState<string | null>(null);

  // Lernziele state — nur lokal, wird erst beim Klick auf „Fertig" persistiert
  const [localLernziele, setLocalLernziele] = useState<LernzielDraft[]>([]);

  useEffect(() => {
    if (!lernkontrolle) return;
    setLocalName(lernkontrolle.name);
    setLocalFachId(lernkontrolle.fachId);
    setLocalTyp(lernkontrolle.typ ?? "standard");
    setStufe(lernkontrolle.stufe?.[0]);
    setLocalLernziele(
      lernkontrolleLZ.map(({ id, label, kategorie }) => ({
        id,
        label,
        kategorie,
      })),
    );
    setOpenRowId(null);
    setEditStep("meta");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lernkontrolleId]);

  if (!lernkontrolle) return null;

  const canSave = localName.trim().length > 0 && stufe !== undefined;

  const save = () => {
    if (!canSave || stufe === undefined) return;
    updateLernkontrolle(lernkontrolleId, {
      name: localName.trim(),
      fachId: localFachId,
      typ: localTyp,
      stufe: [stufe],
    });

    const finalLZ = localLernziele.filter((lz) => lz.label.trim());
    const finalIds = new Set(finalLZ.map((lz) => lz.id));
    for (const lz of finalLZ) {
      const original = lernkontrolleLZ.find((o) => o.id === lz.id);
      if (!original) {
        createLernziel(lernkontrolleId, lz.label.trim(), lz.kategorie, lz.id);
      } else if (
        original.label !== lz.label.trim() ||
        original.kategorie !== lz.kategorie
      ) {
        updateLernziel(lz.id, {
          label: lz.label.trim(),
          kategorie: lz.kategorie,
        });
      }
    }
    for (const lz of lernkontrolleLZ) {
      if (!finalIds.has(lz.id)) deleteLernziel(lz.id);
    }

    onClose();
  };

  const openRow = (id: string, isOpen: boolean) => {
    setOpenRowId(isOpen ? id : null);
  };

  return (
    <Modal
      open
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      title={lernkontrolle.name}
      size="md"
      footer={
        editStep === "meta" ? (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={onClose}>
                Abbrechen
              </Button>
              <Button
                onClick={() => setEditStep("lernziele")}
                disabled={!canSave}
              >
                Weiter{" "}
                <Icon name="chevron_right" size={16} className="ml-0.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full gap-2">
            <Button variant="secondary" onClick={() => setEditStep("meta")}>
              <Icon name="chevron_left" size={16} className="mr-0.5" /> Zurück
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={onClose}>
                Abbrechen
              </Button>
              <Button onClick={save} disabled={!canSave}>
                Fertig
              </Button>
            </div>
          </div>
        )
      }
    >
      {/* Step 1: Meta */}
      {editStep === "meta" && (
        <div className="space-y-3">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Bezeichnung</Label>
            <Input
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="Bezeichnung der Lernkontrolle"
            />
          </div>

          {/* Dropdown rows */}
          <div className="space-y-1 border-t border-border/40 pt-2">
            {/* Fach — only if multiple Fächer exist */}
            {faecher.length > 1 && (
              <ModalRow
                label="Fach"
                displayValue={faecher.find((f) => f.id === localFachId)?.name}
                open={openRowId === "fach"}
                onOpenChange={(v) => openRow("fach", v)}
              >
                <ModalOptionList
                  options={faecher.map((f) => ({ value: f.id, label: f.name }))}
                  current={localFachId}
                  onSelect={(v) => {
                    setLocalFachId(v);
                    setOpenRowId(null);
                  }}
                />
              </ModalRow>
            )}

            {/* Typ */}
            <ModalRow
              label="Typ"
              displayValue={localTyp === "rilz" ? "RILZ" : "Standard"}
              open={openRowId === "typ"}
              onOpenChange={(v) => openRow("typ", v)}
            >
              <ModalOptionList
                options={[
                  { value: "standard", label: "Standard" },
                  { value: "rilz", label: "RILZ" },
                ]}
                current={localTyp}
                onSelect={(v) => {
                  setLocalTyp(v as "standard" | "rilz");
                  setOpenRowId(null);
                }}
              />
            </ModalRow>

            {/* Schulstufe */}
            <ModalRow
              label="Schulstufe"
              displayValue={stufe ? `Kl. ${stufe}` : undefined}
              placeholder="auswählen (Pflichtfeld)"
              open={openRowId === "stufe"}
              onOpenChange={(v) => openRow("stufe", v)}
            >
              <ModalOptionList
                options={[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
                  value: String(n),
                  label: `Kl. ${n}`,
                }))}
                current={stufe ? String(stufe) : ""}
                onSelect={(v) => {
                  setStufe(v ? Number(v) : undefined);
                  setOpenRowId(null);
                }}
              />
            </ModalRow>
          </div>
        </div>
      )}

      {/* Step 2: Lernziele */}
      {editStep === "lernziele" && (
        <LernzielEditSection
          value={localLernziele}
          onChange={setLocalLernziele}
        />
      )}
    </Modal>
  );
};
