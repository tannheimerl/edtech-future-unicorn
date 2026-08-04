"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CreateLernkontrolleModal } from "@/components/shared/CreateLernkontrolleModal";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { InputModal } from "@/components/shared/InputModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { Highlight } from "@/components/shared/Highlight";
import { LernkontrolleAddPickerModal } from "@/components/shared/LernkontrolleAddPickerModal";
import { SearchBar } from "@/components/shared/SearchBar";
import { SortMenu } from "@/components/shared/SortMenu";
import { LernkontrolleLZSection } from "@/components/lernziele/LernkontrolleLZSection";
import { LernkontrolleEditModal } from "@/components/lernziele/LernkontrolleEditModal";
import { cn, getFachColor } from "@/lib/utils";
import { useLezioImport } from "@/hooks/useLezioImport";
import { LezioImportModal } from "@/components/shared/LezioImportModal";
import type { Lernkontrolle } from "@/types/domain";

const KOLONNEN = ["fach", "typ", "stufe"] as const;
const KOLONNEN_LABELS: Record<(typeof KOLONNEN)[number], string> = {
  fach: "Fach",
  typ: "Typ",
  stufe: "Schulstufe",
};

type SortOption = "name-asc" | "name-desc" | "stufe-asc" | "stufe-desc";
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "stufe-asc", label: "Schulstufe (aufsteigend)" },
  { value: "stufe-desc", label: "Schulstufe (absteigend)" },
];

const compareLernkontrollen = (
  a: Lernkontrolle,
  b: Lernkontrolle,
  sort: SortOption,
) => {
  if (sort === "name-asc") return a.name.localeCompare(b.name, "de-CH");
  if (sort === "name-desc") return b.name.localeCompare(a.name, "de-CH");
  const stufeA = a.stufe?.[0] ?? Infinity;
  const stufeB = b.stufe?.[0] ?? Infinity;
  if (stufeA !== stufeB)
    return sort === "stufe-asc" ? stufeA - stufeB : stufeB - stufeA;
  return a.name.localeCompare(b.name, "de-CH");
};

// ── Page ──────────────────────────────────────────────────────────────────

const LernzielePage = () => {
  const {
    faecher,
    lernkontrollen,
    createFach,
    exportLernkontrolle,
    exportFach,
    deleteLernkontrolle,
    deleteFach,
    loadError,
    reloadData,
  } = useData();

  const [kolonnenFilter, setKolonnenFilter] = useState<Record<string, string>>(
    {},
  );
  const [expandedLernkontrollen, setExpandedLernkontrollen] = useState<
    Set<string>
  >(new Set());
  const [fachCreateOpen, setFachCreateOpen] = useState(false);
  const [fachCreateMode, setFachCreateMode] = useState<
    "withLernkontrolle" | "only"
  >("withLernkontrolle");
  const [lernkontrolleCreateFachId, setLernkontrolleCreateFachId] = useState<
    string | null
  >(null);
  const [lernkontrollePickerFachId, setLernkontrollePickerFachId] = useState<
    string | null
  >(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("name-asc");
  const lezio = useLezioImport();
  const [editLernkontrolleId, setEditLernkontrolleId] = useState<string | null>(
    null,
  );
  const [deleteLernkontrolleId, setDeleteLernkontrolleId] = useState<
    string | null
  >(null);
  const [deleteFachId, setDeleteFachId] = useState<string | null>(null);
  const newLernkontrolleFachId = faecher[0]?.id ?? null;

  const toggleLernkontrolle = (id: string) => {
    setExpandedLernkontrollen((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleFachCreated = (name: string) => {
    const newFachId = createFach(name);
    setFachCreateOpen(false);
    setLernkontrolleCreateFachId(newFachId);
  };

  const handleFachOnlyCreated = (name: string) => {
    createFach(name);
    setFachCreateOpen(false);
  };

  const handlePickerNeuErstellen = () => {
    setLernkontrolleCreateFachId(lernkontrollePickerFachId);
    setLernkontrollePickerFachId(null);
  };

  const handlePickerImportieren = () => {
    setLernkontrollePickerFachId(null);
    // 50ms defer: Radix Dialog must unmount before native file dialog opens
    setTimeout(() => lezio.openFileDialog(), 50);
  };

  const q = search.trim().toLowerCase();

  const visibleFaecher = kolonnenFilter["fach"]
    ? faecher.filter((f) => f.id === kolonnenFilter["fach"])
    : faecher;

  const tableData = visibleFaecher.map((fach) => ({
    fach,
    lernkontrollen: lernkontrollen
      .filter((t) => {
        if (t.fachId !== fach.id) return false;
        if (q && !t.name.toLowerCase().includes(q)) return false;
        const typFilter = kolonnenFilter["typ"];
        if (typFilter && (t.typ ?? "standard") !== typFilter) return false;
        const stufeFilter = kolonnenFilter["stufe"];
        if (stufeFilter && !(t.stufe ?? []).includes(parseInt(stufeFilter)))
          return false;
        return true;
      })
      .sort((a, b) => compareLernkontrollen(a, b, sort)),
  }));
  const hasAnyLernkontrollen = tableData.some(
    (d) => d.lernkontrollen.length > 0,
  );

  const hasActiveFilters =
    q || Object.values(kolonnenFilter).some((v) => v !== "");

  const renderTypChip = (lernkontrolle: Lernkontrolle) =>
    lernkontrolle.typ === "rilz" ? (
      <span className="shrink-0 rounded px-1.5 py-0.5 text-xs bg-rilz-soft text-rilz-foreground">
        RILZ
      </span>
    ) : (
      <span className="shrink-0 rounded px-1.5 py-0.5 text-xs bg-muted text-muted-foreground">
        Standard
      </span>
    );

  return (
    <div className="page-container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1>Vorlagen für Lernkontrollen</h1>
        <div className="flex items-center gap-3">
          {lezio.feedback && (
            <span
              className={cn(
                "text-xs",
                lezio.feedback.ok
                  ? "text-status-reached"
                  : "text-status-not-reached",
              )}
            >
              {lezio.feedback.msg}
            </span>
          )}
          <button
            onClick={lezio.openFileDialog}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-foreground transition-colors"
          >
            <Icon name="upload" size={16} /> Importieren
          </button>
        </div>
      </div>
      {/* Empty / load-error state */}
      {faecher.length === 0 &&
        (loadError ? (
          <EmptyState
            size="lg"
            icon={
              <Icon
                name="cloud_off"
                size={24}
                className="text-accent-foreground"
              />
            }
            title="Daten konnten nicht geladen werden"
            description="Die lokale Datenbank konnte nicht geöffnet werden. Prüfe den Speicherort unter Einstellungen › Datenbank."
            action={
              <Button variant="secondary" onClick={() => reloadData()}>
                Erneut laden
              </Button>
            }
          />
        ) : (
          <EmptyState
            size="lg"
            icon={
              <Icon
                name="menu_book"
                size={24}
                className="text-accent-foreground"
              />
            }
            title="Noch keine Fächer angelegt"
            description="Erstelle dein erstes Fach, um Lernziele zu verwalten."
            action={
              <Button
                onClick={() => {
                  setFachCreateMode("withLernkontrolle");
                  setFachCreateOpen(true);
                }}
              >
                Erstes Fach erstellen
              </Button>
            }
          />
        ))}

      {faecher.length > 0 && (
        <>
          <div className="mb-5">
            {/* Search row */}
            <div className="flex items-center gap-2 mb-3">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Lernkontrolle suchen…"
                className="flex-1"
              />
              <Button
                variant="secondary"
                onClick={() => {
                  setFachCreateMode("only");
                  setFachCreateOpen(true);
                }}
              >
                <Icon name="add" size={16} /> Neues Fach
              </Button>
              {newLernkontrolleFachId && (
                <Button
                  onClick={() =>
                    setLernkontrolleCreateFachId(newLernkontrolleFachId)
                  }
                >
                  <Icon name="add" size={16} /> Lernkontrolle
                </Button>
              )}
            </div>
            {/* Filter row */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {KOLONNEN.map((colId) => {
                const label = KOLONNEN_LABELS[colId];

                let options: { value: string; label: string; dot?: string }[];
                let showSearch = false;

                if (colId === "fach") {
                  const faecherMitLernkontrollen = faecher.filter((f) =>
                    lernkontrollen.some((t) => t.fachId === f.id),
                  );
                  options = [
                    { value: "", label: "Alle Fächer" },
                    ...faecherMitLernkontrollen.map((f) => ({
                      value: f.id,
                      label: f.name,
                      dot: getFachColor(
                        f.id,
                        faecher.map((x) => x.id),
                        f.colorIndex,
                      ).dot,
                    })),
                  ];
                  showSearch = faecherMitLernkontrollen.length > 4;
                } else if (colId === "typ") {
                  const typenImData = [
                    ...new Set(
                      lernkontrollen.map((t) => t.typ).filter(Boolean),
                    ),
                  ] as string[];
                  options = [
                    { value: "", label: "Alle Typen" },
                    ...(typenImData.includes("standard")
                      ? [{ value: "standard", label: "Standard" }]
                      : []),
                    ...(typenImData.includes("rilz")
                      ? [{ value: "rilz", label: "RILZ" }]
                      : []),
                  ];
                } else {
                  const availableStufen = [
                    ...new Set(lernkontrollen.flatMap((t) => t.stufe ?? [])),
                  ].sort((a, b) => a - b);
                  options = [
                    { value: "", label: "Alle Stufen" },
                    ...availableStufen.map((n) => ({
                      value: String(n),
                      label: `Klasse ${n}`,
                    })),
                  ];
                }

                return (
                  <FilterDropdown
                    key={colId}
                    label={label}
                    value={kolonnenFilter[colId] ?? ""}
                    options={options}
                    onChange={(v) =>
                      setKolonnenFilter((prev) => ({ ...prev, [colId]: v }))
                    }
                    showSearch={showSearch}
                  />
                );
              })}

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSearch("");
                    setKolonnenFilter({});
                  }}
                  className="flex items-center gap-1 text-xs text-primary hover:text-foreground transition-colors"
                >
                  <Icon name="close" size={16} /> Filter zurücksetzen
                </button>
              )}

              <div className="ml-auto">
                <SortMenu
                  label="Sortieren"
                  value={sort}
                  options={SORT_OPTIONS}
                  onChange={setSort}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {!hasAnyLernkontrollen && hasActiveFilters ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Keine Lernkontrollen entsprechen den gewählten Filtern.
            </p>
          ) : !hasAnyLernkontrollen ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-14 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Noch keine Lernkontrollen angelegt
              </p>
              {newLernkontrolleFachId && (
                <Button
                  variant="secondary"
                  onClick={() =>
                    setLernkontrollePickerFachId(newLernkontrolleFachId)
                  }
                >
                  <Icon name="add" size={16} /> Erste Lernkontrolle erstellen
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {tableData.map(({ fach, lernkontrollen: fachLernkontrollen }) => {
                const fachColor = getFachColor(
                  fach.id,
                  faecher.map((f) => f.id),
                  fach.colorIndex,
                );

                return (
                  <div key={fach.id}>
                    {/* Fach title — outside the card */}
                    <div className="flex justify-between items-center px-1 mb-3 select-none">
                      <h2 className="flex items-center gap-2">
                        <span
                          className={cn(
                            "size-2 rounded-full shrink-0",
                            fachColor.dot,
                          )}
                        />
                        {fach.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            void exportFach(fach.id);
                          }}
                          aria-label={`${fach.name} exportieren`}
                        >
                          <Icon name="download" size={16} />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteFachId(fach.id);
                          }}
                          aria-label={`${fach.name} löschen`}
                        >
                          <Icon name="delete" size={16} />
                        </IconButton>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "rounded-2xl border bg-card overflow-hidden shadow-sm",
                      )}
                    >
                      <div className="divide-y divide-border/40">
                        {fachLernkontrollen.map((lernkontrolle) => {
                          const isExpanded = expandedLernkontrollen.has(
                            lernkontrolle.id,
                          );

                          return (
                            <div key={lernkontrolle.id}>
                              <div className="group flex items-center gap-2 px-3 py-2 hover:bg-accent/20 transition-colors">
                                <button
                                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                                  onClick={() =>
                                    toggleLernkontrolle(lernkontrolle.id)
                                  }
                                >
                                  {isExpanded ? (
                                    <Icon
                                      name="expand_more"
                                      size={16}
                                      className="text-primary shrink-0"
                                    />
                                  ) : (
                                    <Icon
                                      name="chevron_right"
                                      size={16}
                                      className="text-primary shrink-0"
                                    />
                                  )}
                                  <h6 className="font-normal! truncate flex-1 max-w-[420px]">
                                    <Highlight
                                      text={lernkontrolle.name}
                                      query={search}
                                    />
                                  </h6>
                                  <span className="w-14 shrink-0 text-muted-foreground">
                                    {lernkontrolle.stufe?.length
                                      ? `Kl. ${lernkontrolle.stufe[0]}`
                                      : ""}
                                  </span>
                                  <span className="w-16 shrink-0">
                                    {renderTypChip(lernkontrolle)}
                                  </span>
                                </button>

                                {/* Actions — hover reveal */}
                                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditLernkontrolleId(lernkontrolle.id);
                                    }}
                                    aria-label="Lernkontrolle bearbeiten"
                                  >
                                    <Icon name="edit" size={16} />
                                  </IconButton>
                                  <IconButton
                                    className="text-muted-foreground"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      exportLernkontrolle(lernkontrolle.id);
                                    }}
                                    aria-label="Lernkontrolle exportieren"
                                  >
                                    <Icon name="download" size={16} />
                                  </IconButton>
                                </div>
                              </div>

                              {isExpanded && (
                                <LernkontrolleLZSection
                                  lernkontrolleId={lernkontrolle.id}
                                />
                              )}
                            </div>
                          );
                        })}

                        {fachLernkontrollen.length === 0 && (
                          <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground">
                            {hasActiveFilters
                              ? "Keine Lernkontrollen entsprechen den Filtern."
                              : "Noch keine Lernkontrollen angelegt."}
                          </div>
                        )}

                        {/* <button
                          onClick={() => setLernkontrollePickerFachId(fach.id)}
                          className="flex w-full items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground/60 hover:text-primary hover:bg-accent/20 transition-colors"
                        >
                          <Icon name="add" size={16} /> Lernkontrolle hinzufügen
                        </button> */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <InputModal
        open={fachCreateOpen}
        onOpenChange={setFachCreateOpen}
        title="Neues Fach"
        label="Fachbezeichnung"
        placeholder="z. B. Mathematik"
        onSubmit={
          fachCreateMode === "only" ? handleFachOnlyCreated : handleFachCreated
        }
      />

      {lernkontrolleCreateFachId && (
        <CreateLernkontrolleModal
          open={!!lernkontrolleCreateFachId}
          onOpenChange={(o) => {
            if (!o) setLernkontrolleCreateFachId(null);
          }}
          fachId={lernkontrolleCreateFachId}
        />
      )}

      {lernkontrollePickerFachId && (
        <LernkontrolleAddPickerModal
          open={!!lernkontrollePickerFachId}
          onOpenChange={(o) => {
            if (!o) setLernkontrollePickerFachId(null);
          }}
          fachName={
            faecher.find((f) => f.id === lernkontrollePickerFachId)?.name ?? ""
          }
          onImportieren={handlePickerImportieren}
          onNeuErstellen={handlePickerNeuErstellen}
        />
      )}

      {editLernkontrolleId && (
        <LernkontrolleEditModal
          lernkontrolleId={editLernkontrolleId}
          onClose={() => setEditLernkontrolleId(null)}
          onRequestDelete={() => {
            setDeleteLernkontrolleId(editLernkontrolleId);
            setEditLernkontrolleId(null);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteLernkontrolleId}
        onOpenChange={(o) => {
          if (!o) setDeleteLernkontrolleId(null);
        }}
        title="Lernkontrolle löschen"
        description="Soll diese Lernkontrolle und alle zugehörigen Lernziele wirklich dauerhaft gelöscht werden?"
        confirmLabel="Löschen"
        onConfirm={() => {
          if (deleteLernkontrolleId) deleteLernkontrolle(deleteLernkontrolleId);
        }}
      />
      <ConfirmDialog
        open={!!deleteFachId}
        onOpenChange={(o) => {
          if (!o) setDeleteFachId(null);
        }}
        title="Fach löschen"
        description="Soll dieses Fach mit allen zugehörigen Lernkontrollen und Lernzielen wirklich dauerhaft gelöscht werden?"
        confirmLabel="Löschen"
        onConfirm={() => {
          if (deleteFachId) {
            deleteFach(deleteFachId);
            setDeleteFachId(null);
          }
        }}
      />

      <LezioImportModal imp={lezio} />
    </div>
  );
};

export default LernzielePage;
