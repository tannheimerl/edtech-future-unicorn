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
import { cn } from "@/lib/utils";
import type { LernzielKategorie } from "@/types/domain";

export const CreateLernkontrolleModal = ({
  open,
  onOpenChange,
  fachId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  fachId: string;
  onCreated?: (lernkontrolleId: string) => void;
}) => {
  const { faecher, createLernkontrolle, createLernziel } = useData();

  const [step, setStep] = useState<"meta" | "lernziele">("meta");

  // Meta state
  const [name, setName] = useState("");
  const [localFachId, setLocalFachId] = useState("");
  const [typ, setTyp] = useState<"standard" | "rilz" | undefined>();
  const [stufe, setStufe] = useState<number | undefined>();
  const [openRowId, setOpenRowId] = useState<string | null>(null);

  // Lernziele state
  const [lernziele, setLernziele] = useState<
    { id: string; label: string; kategorie: LernzielKategorie }[]
  >([]);
  const [newLzG, setNewLzG] = useState("");
  const [newLzA, setNewLzA] = useState("");

  useEffect(() => {
    if (open) {
      setStep("meta");
      setName("");
      setLocalFachId("");
      setTyp(undefined);
      setStufe(undefined);
      setOpenRowId(null);
      setLernziele([]);
      setNewLzG("");
      setNewLzA("");
    }
  }, [open, fachId]);

  // Wenn nur ein Fach existiert, wird die Fach-Zeile gar nicht angezeigt —
  // dann greift automatisch das einzige Fach statt einer echten Auswahl.
  const resolvedFachId =
    faecher.length > 1 ? localFachId : fachId;

  const openRow = (id: string, isOpen: boolean) => {
    setOpenRowId(isOpen ? id : null);
  };

  const renderSimpleOptions = (
    opts: { value: string; label: string }[],
    current: string,
    onSelect: (v: string) => void,
    clearLabel?: string,
  ) => {
    return (
      <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto">
        {clearLabel && current && (
          <button
            onClick={() => {
              onSelect("");
              setOpenRowId(null);
            }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted/60 text-left"
          >
            <Icon name="close" size={16} className="shrink-0" />
            {clearLabel}
          </button>
        )}
        {opts.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              onSelect(opt.value);
              setOpenRowId(null);
            }}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors text-left",
              opt.value === current
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-muted/60 text-foreground",
            )}
          >
            {opt.value === current ? (
              <Icon name="check" size={16} className="shrink-0" />
            ) : (
              <span className="size-3 shrink-0" />
            )}
            {opt.label}
          </button>
        ))}
      </div>
    );
  };

  const addLzG = () => {
    if (!newLzG.trim()) return;
    setLernziele((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: newLzG.trim(),
        kategorie: "grundlegend",
      },
    ]);
    setNewLzG("");
  };

  const addLzA = () => {
    if (!newLzA.trim()) return;
    setLernziele((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: newLzA.trim(),
        kategorie: "anspruchsvoll",
      },
    ]);
    setNewLzA("");
  };

  const canSubmitMeta =
    name.trim().length > 0 &&
    stufe !== undefined &&
    !!typ &&
    !!resolvedFachId;

  const submit = () => {
    if (!canSubmitMeta || stufe === undefined || !typ || !resolvedFachId)
      return;
    const id = createLernkontrolle(resolvedFachId, name.trim(), typ, [stufe]);
    for (const lz of lernziele) {
      createLernziel(id, lz.label, lz.kategorie);
    }
    onCreated?.(id);
    onOpenChange(false);
  };

  const grundlegendLZ = lernziele.filter(
    (lz) => lz.kategorie === "grundlegend",
  );
  const anspruchsvollLZ = lernziele.filter(
    (lz) => lz.kategorie === "anspruchsvoll",
  );

  return (
    <>
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title="Neue Lernkontrolle"
        size="md"
        footer={
          step === "meta" ? (
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <Button
                onClick={() => setStep("lernziele")}
                disabled={!canSubmitMeta}
              >
                Weiter{" "}
                <Icon name="chevron_right" size={16} className="ml-0.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full gap-2">
              <Button
                variant="secondary"
                onClick={() => setStep("meta")}
                className="text-muted-foreground"
              >
                <Icon name="chevron_left" size={16} className="mr-0.5" /> Zurück
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => onOpenChange(false)}>
                  Abbrechen
                </Button>
                <Button onClick={submit} disabled={!canSubmitMeta}>
                  Erstellen
                </Button>
              </div>
            </div>
          )
        }
      >
        {/* Step 1: Meta */}
        {step === "meta" && (
          <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Bezeichnung
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z. B. Zahlen & Rechnen"
                autoFocus
              />
            </div>

            <div className="space-y-1 border-t border-border/40 pt-2">
              {/* Fach — only if multiple Fächer exist */}
              {faecher.length > 1 && (
                <ModalRow
                  label="Fach"
                  displayValue={faecher.find((f) => f.id === localFachId)?.name}
                  placeholder="auswählen (Pflichtfeld)"
                  open={openRowId === "fach"}
                  onOpenChange={(v) => openRow("fach", v)}
                >
                  {renderSimpleOptions(
                    faecher.map((f) => ({ value: f.id, label: f.name })),
                    localFachId,
                    setLocalFachId,
                  )}
                </ModalRow>
              )}

              {/* Typ */}
              <ModalRow
                label="Typ"
                displayValue={
                  typ ? (typ === "rilz" ? "RILZ" : "Standard") : undefined
                }
                placeholder="auswählen (Pflichtfeld)"
                open={openRowId === "typ"}
                onOpenChange={(v) => openRow("typ", v)}
              >
                {renderSimpleOptions(
                  [
                    { value: "standard", label: "Standard" },
                    { value: "rilz", label: "RILZ" },
                  ],
                  typ ?? "",
                  (v) => setTyp(v as "standard" | "rilz"),
                )}
              </ModalRow>

              {/* Schulstufe */}
              <ModalRow
                label="Schulstufe"
                displayValue={stufe ? `Kl. ${stufe}` : undefined}
                placeholder="auswählen (Pflichtfeld)"
                open={openRowId === "stufe"}
                onOpenChange={(v) => openRow("stufe", v)}
              >
                {renderSimpleOptions(
                  [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
                    value: String(n),
                    label: `Kl. ${n}`,
                  })),
                  stufe ? String(stufe) : "",
                  (v) => setStufe(v ? Number(v) : undefined),
                )}
              </ModalRow>
            </div>
          </div>
        )}

        {/* Step 2: Lernziele */}
        {step === "lernziele" && (
          <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden">
            {/* Grundlegend */}
            <div className="border-b border-border/40">
              <div className="px-1 py-1 bg-muted/20">
                <span className="text-xs font-semibold tracking-wide text-category-grundlegend-fg">
                  Grundlegend
                </span>
              </div>
              {grundlegendLZ.length === 0 && (
                <p className="px-1 py-1.5 text-xs text-muted-foreground/50">
                  Noch keine grundlegenden Lernziele.
                </p>
              )}
              {grundlegendLZ.map((lz) => (
                <div
                  key={lz.id}
                  className="flex items-center gap-2 px-1 py-1.5 border-t border-border/30"
                >
                  <span className="flex-1 text-xs leading-snug">
                    {lz.label}
                  </span>
                  <IconButton
                    onClick={() =>
                      setLernziele((prev) => prev.filter((x) => x.id !== lz.id))
                    }
                    className="text-muted-foreground/40 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Entfernen"
                  >
                    <Icon name="delete" size={16} />
                  </IconButton>
                </div>
              ))}
              <div className="flex items-center gap-1.5 px-1 py-1.5 border-t border-border/30">
                <Input
                  value={newLzG}
                  onChange={(e) => setNewLzG(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addLzG();
                    }
                  }}
                  placeholder="Grundlegendes Lernziel…"
                  className="h-6 text-xs flex-1"
                />
                <IconButton onClick={addLzG} disabled={!newLzG.trim()}>
                  <Icon name="add" size={16} />
                </IconButton>
              </div>
            </div>

            {/* Anspruchsvoll */}
            <div>
              <div className="px-1 py-1 bg-muted/20">
                <span className="text-xs font-semibold tracking-wide text-category-anspruchsvoll-fg">
                  Anspruchsvoll
                </span>
              </div>
              {anspruchsvollLZ.length === 0 && (
                <p className="px-1 py-1.5 text-xs text-muted-foreground/50">
                  Noch keine anspruchsvollen Lernziele.
                </p>
              )}
              {anspruchsvollLZ.map((lz) => (
                <div
                  key={lz.id}
                  className="flex items-center gap-2 px-1 py-1.5 border-t border-border/30"
                >
                  <span className="flex-1 text-xs leading-snug">
                    {lz.label}
                  </span>
                  <IconButton
                    onClick={() =>
                      setLernziele((prev) => prev.filter((x) => x.id !== lz.id))
                    }
                    className="text-muted-foreground/40 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Entfernen"
                  >
                    <Icon name="delete" size={16} />
                  </IconButton>
                </div>
              ))}
              <div className="flex items-center gap-1.5 px-1 py-1.5 border-t border-border/30">
                <Input
                  value={newLzA}
                  onChange={(e) => setNewLzA(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addLzA();
                    }
                  }}
                  placeholder="Anspruchsvolles Lernziel…"
                  className="h-6 text-xs flex-1"
                />
                <IconButton onClick={addLzA} disabled={!newLzA.trim()}>
                  <Icon name="add" size={16} />
                </IconButton>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
