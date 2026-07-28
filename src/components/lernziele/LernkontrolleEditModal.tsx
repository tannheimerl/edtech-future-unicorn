"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/shared/Modal";
import { ModalRow } from "@/components/shared/ModalRow";
import { ModalOptionList } from "@/components/shared/ModalOptionList";
import { LernzielEditSection } from "@/components/shared/LernzielEditSection";

export const LernkontrolleEditModal = ({
  lernkontrolleId,
  onClose,
  onRequestDelete,
}: {
  lernkontrolleId: string;
  onClose: () => void;
  onRequestDelete: () => void;
}) => {
  const { lernkontrollen, faecher, updateLernkontrolle, exportLernkontrolle } =
    useData();
  const lernkontrolle = lernkontrollen.find((t) => t.id === lernkontrolleId);

  // Step
  const [editStep, setEditStep] = useState<"meta" | "lernziele">("meta");

  // Meta state
  const [localName, setLocalName] = useState(lernkontrolle?.name ?? "");
  const [faelligAm, setFaelligAm] = useState(lernkontrolle?.faelligAm ?? "");
  const [localFachId, setLocalFachId] = useState(lernkontrolle?.fachId ?? "");
  const [localTyp, setLocalTyp] = useState<"standard" | "rilz">(
    lernkontrolle?.typ ?? "standard",
  );
  const [stufe, setStufe] = useState<number | undefined>(lernkontrolle?.stufe?.[0]);
  const [openRowId, setOpenRowId] = useState<string | null>(null);

  useEffect(() => {
    if (!lernkontrolle) return;
    setLocalName(lernkontrolle.name);
    setFaelligAm(lernkontrolle.faelligAm ?? "");
    setLocalFachId(lernkontrolle.fachId);
    setLocalTyp(lernkontrolle.typ ?? "standard");
    setStufe(lernkontrolle.stufe?.[0]);
    setOpenRowId(null);
    setEditStep("meta");
  }, [lernkontrolleId]);

  if (!lernkontrolle) return null;

  const save = () => {
    if (!localName.trim()) return;
    updateLernkontrolle(lernkontrolleId, {
      name: localName.trim(),
      fachId: localFachId,
      typ: localTyp,
      stufe: stufe ? [stufe] : undefined,
      faelligAm: faelligAm || undefined,
    });
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
              <button
                onClick={onRequestDelete}
                className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 transition-colors px-2 py-1 rounded-lg hover:bg-destructive/8"
              >
                <Icon name="delete" size={14} />
                Löschen
              </button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => exportLernkontrolle(lernkontrolleId)}
                  aria-label="Exportieren"
                  className="text-muted-foreground"
                >
                  <Icon name="download" size={14} />
                </Button>
                <Button variant="secondary" onClick={onClose}>
                  Abbrechen
                </Button>
                <Button
                  onClick={() => setEditStep("lernziele")}
                  disabled={!localName.trim()}
                >
                  Weiter{" "}
                  <Icon name="chevron_right" size={14} className="ml-0.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full gap-2">
              <Button
                variant="secondary"
                onClick={() => setEditStep("meta")}
                className="text-muted-foreground"
              >
                <Icon name="chevron_left" size={14} className="mr-0.5" /> Zurück
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={onClose}>
                  Abbrechen
                </Button>
                <Button onClick={save} disabled={!localName.trim()}>
                  Fertig
                </Button>
              </div>
            </div>
          )
        }
      >
        {/* Step 1: Meta */}
        {editStep === "meta" && (
          <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden space-y-3">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Bezeichnung
              </Label>
              <Input
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder="Bezeichnung der Lernkontrolle"
              />
            </div>

            {/* Fällig am */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Fällig am <span className="font-normal">(opt.)</span>
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  value={faelligAm}
                  onChange={(e) => setFaelligAm(e.target.value)}
                  className="pr-8 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                <Icon
                  name="calendar_today"
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
              </div>
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
                placeholder="keine"
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
                  clearLabel="Keine Auswahl"
                />
              </ModalRow>
            </div>
          </div>
        )}

        {/* Step 2: Lernziele */}
        {editStep === "lernziele" && (
          <LernzielEditSection lernkontrolleId={lernkontrolleId} />
        )}
      </Modal>
  );
};
