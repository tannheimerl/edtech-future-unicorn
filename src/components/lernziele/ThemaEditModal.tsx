"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { InputModal } from "@/components/shared/InputModal";
import { Modal } from "@/components/shared/Modal";
import { ModalRow } from "@/components/shared/ModalRow";
import { ModalOptionList } from "@/components/shared/ModalOptionList";
import { LernzielEditSection } from "@/components/shared/LernzielEditSection";

export const ThemaEditModal = ({
  themaId,
  onClose,
  onRequestDelete,
}: {
  themaId: string;
  onClose: () => void;
  onRequestDelete: () => void;
}) => {
  const {
    themen,
    faecher,
    updateThema,
    exportThema,
    tagKategorien,
    deleteTagKategorie,
    getTagWerte,
    createTagKategorie,
  } = useData();
  const thema = themen.find((t) => t.id === themaId);

  // Step
  const [editStep, setEditStep] = useState<"meta" | "lernziele">("meta");

  // Meta state
  const [localName, setLocalName] = useState(thema?.name ?? "");
  const [localFachId, setLocalFachId] = useState(thema?.fachId ?? "");
  const [localTyp, setLocalTyp] = useState<"standard" | "rilz">(
    thema?.typ ?? "standard",
  );
  const [stufe, setStufe] = useState<number | undefined>(thema?.stufe?.[0]);
  const [localTagValues, setLocalTagValues] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        Object.entries(thema?.tags ?? {}).map(([k, v]) => [
          k,
          Array.isArray(v) ? (v[0] ?? "") : "",
        ]),
      ),
  );
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [deleteKatId, setDeleteKatId] = useState<string | null>(null);
  const [addValueKatId, setAddValueKatId] = useState<string | null>(null);
  const [newKatOpen, setNewKatOpen] = useState(false);

  useEffect(() => {
    if (!thema) return;
    setLocalName(thema.name);
    setLocalFachId(thema.fachId);
    setLocalTyp(thema.typ ?? "standard");
    setStufe(thema.stufe?.[0]);
    setLocalTagValues(
      Object.fromEntries(
        Object.entries(thema.tags ?? {}).map(([k, v]) => [
          k,
          Array.isArray(v) ? (v[0] ?? "") : "",
        ]),
      ),
    );
    setOpenRowId(null);
    setEditStep("meta");
  }, [themaId]);

  if (!thema) return null;

  const save = () => {
    if (!localName.trim()) return;
    updateThema(themaId, {
      name: localName.trim(),
      fachId: localFachId,
      typ: localTyp,
      stufe: stufe ? [stufe] : undefined,
      tags: Object.fromEntries(
        Object.entries(localTagValues)
          .filter(([, v]) => v.trim())
          .map(([k, v]) => [k, [v]]),
      ),
    });
    onClose();
  };

  const openRow = (id: string, isOpen: boolean) => {
    setOpenRowId(isOpen ? id : null);
  };

  const setTagValue = (katId: string, value: string) => {
    setLocalTagValues((prev) => ({
      ...prev,
      [katId]: prev[katId] === value ? "" : value,
    }));
    setOpenRowId(null);
  };

  return (
    <>
      <Modal
        open
        onOpenChange={(v) => {
          if (!v) onClose();
        }}
        title={thema.name}
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
                  onClick={() => exportThema(themaId)}
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
                placeholder="Themabezeichnung"
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

              {/* Tag categories — one row each, list with add-value dialog */}
              {tagKategorien.map((kat) => {
                const currentVal = localTagValues[kat.id] ?? "";
                const allVals = getTagWerte(kat.id);

                return (
                  <ModalRow
                    key={kat.id}
                    label={kat.name}
                    displayValue={currentVal || undefined}
                    open={openRowId === kat.id}
                    onOpenChange={(v) => openRow(kat.id, v)}
                  >
                    <ModalOptionList
                      options={allVals.map((v) => ({ value: v, label: v }))}
                      current={currentVal}
                      onSelect={(v) => setTagValue(kat.id, v)}
                      clearLabel="Auswahl aufheben"
                    />
                    <div className="border-t border-border/40 mt-0.5 pt-0.5">
                      <button
                        onClick={() => setAddValueKatId(kat.id)}
                        className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs text-primary hover:bg-primary/5 transition-colors"
                      >
                        <Icon name="add" size={12} className="shrink-0" />
                        Wert hinzufügen
                      </button>
                      <button
                        onClick={() => {
                          setDeleteKatId(kat.id);
                          setOpenRowId(null);
                        }}
                        className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                      >
                        <Icon name="delete" size={12} className="shrink-0" />
                        Kategorie löschen
                      </button>
                    </div>
                  </ModalRow>
                );
              })}

              {/* Add category */}
              <button
                onClick={() => setNewKatOpen(true)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 w-full"
              >
                <Icon name="add" size={12} />
                Kategorie hinzufügen
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Lernziele */}
        {editStep === "lernziele" && <LernzielEditSection themaId={themaId} />}

        <ConfirmDialog
          open={!!deleteKatId}
          onOpenChange={(o) => {
            if (!o) setDeleteKatId(null);
          }}
          title="Kategorie löschen"
          description="Soll diese Tag-Kategorie wirklich gelöscht werden? Alle zugewiesenen Werte in den Themen bleiben erhalten, sind aber nicht mehr filterbar."
          confirmLabel="Löschen"
          onConfirm={() => {
            if (deleteKatId) {
              deleteTagKategorie(deleteKatId);
              setDeleteKatId(null);
            }
          }}
        />
      </Modal>

      <InputModal
        open={newKatOpen}
        onOpenChange={setNewKatOpen}
        title="Neue Tag-Kategorie"
        label="Bezeichnung"
        placeholder="z. B. Semester, Lerngruppe …"
        onSubmit={(name) => {
          createTagKategorie(name);
        }}
      />

      <InputModal
        open={!!addValueKatId}
        onOpenChange={(o) => {
          if (!o) setAddValueKatId(null);
        }}
        title="Wert hinzufügen"
        label="Wert"
        placeholder="z. B. 1"
        onSubmit={(v) => {
          if (addValueKatId) setTagValue(addValueKatId, v);
        }}
      />
    </>
  );
};
