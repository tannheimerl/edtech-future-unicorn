"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/shared/Modal";
import { ModalRow } from "@/components/shared/ModalRow";
import { SearchBar } from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useData } from "@/contexts/DataContext";
import { cn, fullName } from "@/lib/utils";
import { todayISO } from "@/lib/dates";
import type { Pruefung, PruefungTyp } from "@/types/domain";
import { PRUEFUNG_TYP_GRUPPEN } from "@/types/domain";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  klassId: string;
  onCreated?: (pruefungId: string) => void;
  /** Wenn gesetzt, wird die bestehende Lernkontrolle bearbeitet statt eine neue zu erstellen. */
  editPruefung?: Pruefung;
};

export const PruefungErstellenModal = ({
  open,
  onOpenChange,
  klassId,
  onCreated,
  editPruefung,
}: Props) => {
  const {
    faecher,
    lernkontrollen: themen,
    lernziele,
    createPruefung,
    updatePruefung,
    deletePruefungErgebnis,
    getPruefungErgebnisse,
    setLernzielVersuche,
    getStudentsForClass,
  } = useData();

  const isEdit = !!editPruefung;

  const [step, setStep] = useState(1);
  const [openRowId, setOpenRowId] = useState<string | null>(null);

  // Step 1: Inhalt & Termin
  const [typ, setTyp] = useState<PruefungTyp>("pruefung_schriftlich");
  const [name, setName] = useState("");
  const [datum, setDatum] = useState(() => todayISO());
  const [fachId, setFachId] = useState("");
  const [selectedThemaIds, setSelectedThemaIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedLzIds, setSelectedLzIds] = useState<Set<string>>(new Set());
  const [nurRilz, setNurRilz] = useState(false);

  // Step 2: Teilnehmende Schüler. `null` = noch nichts angefasst → die
  // Vorauswahl wird zur Renderzeit aus Fach/RILZ abgeleitet (die Schülerdaten
  // laden asynchron, ein useState-Initialwert bliebe leer).
  const [chosenSchuelerIds, setChosenSchuelerIds] =
    useState<Set<string> | null>(null);
  const [search, setSearch] = useState("");
  const [onlyRilz, setOnlyRilz] = useState(false);

  // Schnappschuss der ursprünglich Teilnehmenden beim Öffnen im Bearbeiten-Modus —
  // dient beim Speichern dazu, entfernte Schüler*innen zu erkennen.
  const [originalSchuelerIds, setOriginalSchuelerIds] = useState<Set<string>>(
    new Set(),
  );

  const availableFaecher = faecher.filter((f) =>
    themen.some((t) => t.fachId === f.id && t.typ !== "rilz"),
  );

  const filteredThemen = themen.filter(
    (t) => t.fachId === fachId && (nurRilz ? true : t.typ !== "rilz"),
  );

  const klassenSchueler = getStudentsForClass(klassId)
    .slice()
    .sort((a, b) => fullName(a).localeCompare(fullName(b), "de"));

  const rilzSchuelerInFach = fachId
    ? klassenSchueler.filter((s) => s.rilzFachIds?.includes(fachId))
    : [];

  // Vorauswahl: eine RILZ-Lernkontrolle richtet sich an die RILZ-Schüler des
  // Fachs, eine reguläre an alle übrigen — beides bleibt in Schritt 2 änderbar.
  const defaultSchuelerIds = new Set(
    (nurRilz
      ? rilzSchuelerInFach
      : klassenSchueler.filter((s) => !s.rilzFachIds?.includes(fachId))
    ).map((s) => s.id),
  );
  const selectedSchuelerIds = chosenSchuelerIds ?? defaultSchuelerIds;

  const visibleSchueler = klassenSchueler
    .filter((s) => !onlyRilz || s.rilzFachIds?.includes(fachId))
    .filter((s) =>
      fullName(s).toLowerCase().includes(search.trim().toLowerCase()),
    );
  const allVisibleSelected =
    visibleSchueler.length > 0 &&
    visibleSchueler.every((s) => selectedSchuelerIds.has(s.id));

  const themenWithLz = filteredThemen
    .filter((t) => selectedThemaIds.has(t.id))
    .map((t) => ({
      thema: t,
      lernziele: lernziele.filter((l) => l.lernkontrolleId === t.id),
    }))
    .filter((t) => t.lernziele.length > 0);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setSearch("");
    setOnlyRilz(false);
    setOpenRowId(null);
    if (editPruefung) {
      setTyp(editPruefung.typ);
      setName(editPruefung.name);
      setDatum(editPruefung.datum);
      setFachId(editPruefung.fachId);
      setNurRilz(editPruefung.nurRilz);
      const themaIds = new Set(
        editPruefung.lernzielIds
          .map((id) => lernziele.find((l) => l.id === id)?.lernkontrolleId)
          .filter((id): id is string => !!id),
      );
      setSelectedThemaIds(themaIds);
      setSelectedLzIds(new Set(editPruefung.lernzielIds));
      setChosenSchuelerIds(new Set(editPruefung.schuelerIds));
      setOriginalSchuelerIds(new Set(editPruefung.schuelerIds));
    } else {
      setTyp("pruefung_schriftlich");
      setName("");
      setDatum(todayISO());
      setFachId("");
      setSelectedThemaIds(new Set());
      setSelectedLzIds(new Set());
      setNurRilz(false);
      setChosenSchuelerIds(null);
      setOriginalSchuelerIds(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleFachChange = (id: string) => {
    setFachId(id);
    setSelectedThemaIds(new Set());
    setSelectedLzIds(new Set());
    setChosenSchuelerIds(null);
  };

  const toggleThemaChip = (themaId: string) => {
    const lzIdsForThema = lernziele
      .filter((l) => l.lernkontrolleId === themaId)
      .map((l) => l.id);
    if (selectedThemaIds.has(themaId)) {
      setSelectedThemaIds((prev) => {
        const n = new Set(prev);
        n.delete(themaId);
        return n;
      });
      setSelectedLzIds((prev) => {
        const n = new Set(prev);
        lzIdsForThema.forEach((id) => n.delete(id));
        return n;
      });
    } else {
      setSelectedThemaIds((prev) => {
        const n = new Set(prev);
        n.add(themaId);
        return n;
      });
      const thema = filteredThemen.find((t) => t.id === themaId);
      if (thema && name.trim().length === 0) {
        setName(thema.name);
      }
    }
  };

  const toggleLz = (id: string) => {
    setSelectedLzIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAllLzForThema = (lzIds: string[]) => {
    const allSelected = lzIds.every((id) => selectedLzIds.has(id));
    setSelectedLzIds((prev) => {
      const n = new Set(prev);
      lzIds.forEach((id) => (allSelected ? n.delete(id) : n.add(id)));
      return n;
    });
  };

  const toggleSchueler = (id: string) => {
    setChosenSchuelerIds((prev) => {
      const n = new Set(prev ?? selectedSchuelerIds);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  // (De-)Selektiert genau die Schüler, die Suche + Filter gerade übriglassen.
  const toggleAllVisible = () => {
    setChosenSchuelerIds((prev) => {
      const n = new Set(prev ?? selectedSchuelerIds);
      visibleSchueler.forEach((s) =>
        allVisibleSelected ? n.delete(s.id) : n.add(s.id),
      );
      return n;
    });
  };

  const canProceedStep1 =
    name.trim().length > 0 && !!fachId && selectedLzIds.size > 0;
  const canSubmit = selectedSchuelerIds.size > 0;

  const handleCreate = () => {
    const id = createPruefung({
      klasseId: klassId,
      fachId,
      name: name.trim(),
      typ,
      status: "laufend",
      datum,
      lernzielIds: Array.from(selectedLzIds),
      nurRilz,
      schuelerIds: Array.from(selectedSchuelerIds),
    });
    onOpenChange(false);
    onCreated?.(id);
  };

  const handleSave = () => {
    if (!editPruefung) return;
    // Wird ein/e Schüler*in entfernt, verlieren ihre/seine Bewertungen für
    // diese Lernkontrolle jede Bedeutung — Ergebnis und Lernziel-Versuche
    // dieser Lernkontrolle werden daher gelöscht.
    const removedStudentIds = Array.from(originalSchuelerIds).filter(
      (id) => !selectedSchuelerIds.has(id),
    );
    for (const studentId of removedStudentIds) {
      const ergebnis = getPruefungErgebnisse(editPruefung.id).find(
        (e) => e.schuelerId === studentId,
      );
      if (ergebnis) deletePruefungErgebnis(ergebnis.id);
      for (const lzId of editPruefung.lernzielIds) {
        setLernzielVersuche(studentId, lzId, []);
      }
    }
    updatePruefung(editPruefung.id, {
      name: name.trim(),
      typ,
      datum,
      lernzielIds: Array.from(selectedLzIds),
      schuelerIds: Array.from(selectedSchuelerIds),
    });
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={
        step === 1
          ? isEdit
            ? "Lernkontrolle bearbeiten — Inhalt & Termin"
            : "Neue Lernkontrolle — Inhalt & Termin"
          : isEdit
            ? "Lernkontrolle bearbeiten — Teilnehmende"
            : "Neue Lernkontrolle — Teilnehmende"
      }
      size="lg"
      footer={
        step === 1 ? (
          <>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
              Weiter <Icon name="chevron_right" size={16} className="ml-1" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setStep(1)}>
              <Icon name="chevron_left" size={16} className="mr-1" /> Zurück
            </Button>
            <Button
              onClick={isEdit ? handleSave : handleCreate}
              disabled={!canSubmit}
            >
              {isEdit ? "Änderungen speichern" : "Lernkontrolle erstellen"}
            </Button>
          </>
        )
      }
    >
      {/* ── Step 1: Inhalt & Termin ─────────────────────────────────────────── */}
      {step === 1 && (
        <div className="grid gap-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid gap-1.5">
            <ModalRow
              label="Fach"
              displayValue={faecher.find((f) => f.id === fachId)?.name}
              placeholder="auswählen (Pflichtfeld)"
              open={openRowId === "fach"}
              onOpenChange={(v) => setOpenRowId(v ? "fach" : null)}
              disabled={isEdit}
            >
              <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto">
                {availableFaecher.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      handleFachChange(f.id);
                      setOpenRowId(null);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors text-left",
                      f.id === fachId
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted/60 text-foreground",
                    )}
                  >
                    {f.id === fachId ? (
                      <Icon name="check" size={16} className="shrink-0" />
                    ) : (
                      <span className="size-3 shrink-0" />
                    )}
                    {f.name}
                  </button>
                ))}
              </div>
            </ModalRow>
          </div>

          {fachId && filteredThemen.length > 0 && (
            <div className="grid gap-1.5">
              <ModalRow
                label="Lernkontrolle"
                displayValue={
                  selectedThemaIds.size > 0
                    ? filteredThemen
                        .filter((t) => selectedThemaIds.has(t.id))
                        .map((t) => t.name)
                        .join(", ")
                    : undefined
                }
                placeholder="auswählen (Pflichtfeld)"
                open={openRowId === "thema"}
                onOpenChange={(v) => setOpenRowId(v ? "thema" : null)}
                disabled={isEdit}
              >
                <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto">
                  {filteredThemen.map((t) => {
                    const checked = selectedThemaIds.has(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleThemaChip(t.id)}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors text-left",
                          checked
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted/60 text-foreground",
                        )}
                      >
                        {checked ? (
                          <Icon name="check" size={16} className="shrink-0" />
                        ) : (
                          <span className="size-3 shrink-0" />
                        )}
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </ModalRow>
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="prf-name">Bezeichnung</Label>
            <Input
              id="prf-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Lernkontrolle Zahlenraum"
              autoFocus
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="prf-typ">Art der Leistung</Label>
            <Select
              id="prf-typ"
              value={typ}
              onChange={(e) => setTyp(e.target.value as PruefungTyp)}
            >
              {PRUEFUNG_TYP_GRUPPEN.map(({ gruppe, optionen }) => (
                <optgroup key={gruppe} label={gruppe}>
                  {optionen.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="prf-datum">Fälligkeitsdatum</Label>
            <Input
              id="prf-datum"
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
            />
          </div>

          {!isEdit && fachId && (
            <div className="grid gap-1.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nurRilz}
                  onChange={(e) => {
                    setNurRilz(e.target.checked);
                    setSelectedThemaIds(new Set());
                    setSelectedLzIds(new Set());
                    setChosenSchuelerIds(null);
                  }}
                  className="shrink-0 accent-rilz"
                />
                <div>
                  <p className="text-sm font-medium leading-none">
                    RILZ-Lernkontrolle
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Individuelle Beurteilung durch Heilpädagog*innen — im
                    nächsten Schritt sind die RILZ-Schüler*innen dieses Fachs
                    vorausgewählt
                  </p>
                </div>
              </label>
            </div>
          )}

          {themenWithLz.length > 0 && (
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label>Lernziele</Label>
                <span className="text-xs text-muted-foreground">
                  {selectedLzIds.size} gewählt
                </span>
              </div>
              <div className="space-y-2">
                {themenWithLz.map(({ thema, lernziele: lzs }) => {
                  const themaLzIds = lzs.map((l) => l.id);
                  const allSelected = themaLzIds.every((id) =>
                    selectedLzIds.has(id),
                  );
                  const someSelected = themaLzIds.some((id) =>
                    selectedLzIds.has(id),
                  );
                  return (
                    <div
                      key={thema.id}
                      className="rounded-2xl border border-border overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleAllLzForThema(themaLzIds)}
                        className="flex w-full items-center justify-between gap-2 bg-muted px-3 py-2 text-left text-sm font-semibold hover:bg-accent transition-colors"
                      >
                        <span>{thema.name}</span>
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-xs",
                            allSelected
                              ? "bg-primary text-primary-foreground"
                              : someSelected
                                ? "bg-status-partial-soft text-status-partial-fg"
                                : "bg-background text-muted-foreground",
                          )}
                        >
                          {allSelected
                            ? "Alle"
                            : someSelected
                              ? "Teilweise"
                              : "Keine"}
                        </span>
                      </button>
                      <ul className="divide-y divide-border">
                        {lzs.map((lz) => (
                          <li key={lz.id}>
                            <label className="flex cursor-pointer items-start gap-3 px-3 py-2 hover:bg-accent/50 transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedLzIds.has(lz.id)}
                                onChange={() => toggleLz(lz.id)}
                                className="mt-0.5 shrink-0 accent-primary"
                              />
                              <span className="flex-1 text-sm">
                                {lz.label}
                                <span
                                  className={cn(
                                    "ml-2 rounded px-1 py-0.5 text-xs",
                                    lz.kategorie === "grundlegend"
                                      ? "bg-category-grundlegend-soft text-category-grundlegend-fg"
                                      : "bg-category-anspruchsvoll-soft text-category-anspruchsvoll-fg",
                                  )}
                                >
                                  {lz.kategorie === "grundlegend" ? "G" : "A"}
                                </span>
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Teilnehmende Schüler ────────────────────────────────────── */}
      {step === 2 && (
        <div className="grid gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Suchen…"
            right={
              rilzSchuelerInFach.length > 0 ? (
                <Button
                  type="button"
                  variant={onlyRilz ? "default" : "secondary"}
                  onClick={() => setOnlyRilz((v) => !v)}
                  className="h-auto gap-1.5"
                >
                  <Icon name="filter_alt" size={16} />
                  Nur RILZ ({rilzSchuelerInFach.length})
                </Button>
              ) : undefined
            }
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {selectedSchuelerIds.size} von {klassenSchueler.length} nehmen
              teil
            </span>
            <button
              type="button"
              onClick={toggleAllVisible}
              disabled={visibleSchueler.length === 0}
              className="font-medium text-primary hover:underline disabled:opacity-40 disabled:no-underline"
            >
              {allVisibleSelected ? "Alle abwählen" : "Alle auswählen"}
            </button>
          </div>

          <Table containerClassName="max-h-[45vh] overflow-y-auto">
            <TableHeader>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  disabled={visibleSchueler.length === 0}
                  aria-label="Alle sichtbaren Schüler*innen auswählen"
                  className="shrink-0 accent-primary align-middle"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead align="right">RILZ</TableHead>
            </TableHeader>
            <TableBody>
              {visibleSchueler.length === 0 ? (
                <TableEmpty colSpan={3}>
                  {klassenSchueler.length === 0
                    ? "Diese Klasse hat noch keine Schüler*innen."
                    : "Keine Schüler*innen für Suche und Filter."}
                </TableEmpty>
              ) : (
                visibleSchueler.map((s) => (
                  <TableRow
                    key={s.id}
                    onClick={() => toggleSchueler(s.id)}
                    className="hover:bg-accent/50"
                  >
                    <TableCell className="w-10">
                      <input
                        type="checkbox"
                        checked={selectedSchuelerIds.has(s.id)}
                        onChange={() => toggleSchueler(s.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={fullName(s)}
                        className="shrink-0 accent-primary align-middle"
                      />
                    </TableCell>
                    <TableCell>{fullName(s)}</TableCell>
                    <TableCell align="right">
                      {s.rilzFachIds?.includes(fachId) && (
                        <Badge variant="rilz" size="sm">
                          RILZ
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!canSubmit && (
            <p className="text-xs text-muted-foreground">
              Bitte mindestens eine*n Schüler*in auswählen.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
};
