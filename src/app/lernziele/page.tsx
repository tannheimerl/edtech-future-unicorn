"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CreateThemaModal } from "@/components/shared/CreateThemaModal";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { InputModal } from "@/components/shared/InputModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { ThemaAddPickerModal } from "@/components/shared/ThemaAddPickerModal";
import { SearchBar } from "@/components/shared/SearchBar";
import {
  AddSpalteButton,
  BUILTIN_KOLONNEN,
  MAX_SPALTEN,
} from "@/components/lernziele/AddSpalteButton";
import { ThemaLZSection } from "@/components/lernziele/ThemaLZSection";
import { ThemaEditModal } from "@/components/lernziele/ThemaEditModal";
import { cn, getFachColor } from "@/lib/utils";
import { useLezioImport } from "@/hooks/useLezioImport";
import { LezioImportModal } from "@/components/shared/LezioImportModal";
import type { Thema } from "@/types/domain";

const LS_KEY = "lezio_lz_sichtbare_spalten";

// ── Page ──────────────────────────────────────────────────────────────────

const LernzielePage = () => {
  const {
    faecher,
    themen,
    lernziele,
    createFach,
    exportThema,
    exportFach,
    deleteThema,
    deleteFach,
    tagKategorien,
    createTagKategorie,
    getTagWerte,
    loadError,
    reloadData,
  } = useData();

  const [aktiveKolonnen, setAktiveKolonnen] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) ?? '["fach","typ"]');
    } catch {
      return ["fach", "typ"];
    }
  });
  const [kolonnenFilter, setKolonnenFilter] = useState<Record<string, string>>(
    {},
  );
  const [katCreateOpen, setKatCreateOpen] = useState(false);
  const [expandedThemen, setExpandedThemen] = useState<Set<string>>(new Set());
  const [collapsedFaecher, setCollapsedFaecher] = useState<Set<string>>(
    new Set(),
  );
  const [fachCreateOpen, setFachCreateOpen] = useState(false);
  const [fachCreateMode, setFachCreateMode] = useState<"withThema" | "only">(
    "withThema",
  );
  const [themaCreateFachId, setThemaCreateFachId] = useState<string | null>(
    null,
  );
  const [themaPickerFachId, setThemaPickerFachId] = useState<string | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const lezio = useLezioImport();
  const [editThemaId, setEditThemaId] = useState<string | null>(null);
  const [deleteThemaId, setDeleteThemaId] = useState<string | null>(null);
  const [deleteFachId, setDeleteFachId] = useState<string | null>(null);

  const toggleThema = (id: string) => {
    setExpandedThemen((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleFach = (id: string) => {
    setCollapsedFaecher((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleFachCreated = (name: string) => {
    const newFachId = createFach(name);
    setFachCreateOpen(false);
    setThemaCreateFachId(newFachId);
  };

  const handleFachOnlyCreated = (name: string) => {
    createFach(name);
    setFachCreateOpen(false);
  };

  const handlePickerNeuErstellen = () => {
    setThemaCreateFachId(themaPickerFachId);
    setThemaPickerFachId(null);
  };

  const handlePickerImportieren = () => {
    setThemaPickerFachId(null);
    // 50ms defer: Radix Dialog must unmount before native file dialog opens
    setTimeout(() => lezio.openFileDialog(), 50);
  };

  const addKolonne = (id: string) => {
    if (aktiveKolonnen.length >= MAX_SPALTEN || aktiveKolonnen.includes(id))
      return;
    const next = [...aktiveKolonnen, id];
    setAktiveKolonnen(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  };

  const removeKolonne = (id: string) => {
    const next = aktiveKolonnen.filter((k) => k !== id);
    setAktiveKolonnen(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    setKolonnenFilter((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
  };

  const q = search.trim().toLowerCase();

  const visibleFaecher = kolonnenFilter["fach"]
    ? faecher.filter((f) => f.id === kolonnenFilter["fach"])
    : faecher;

  const tableData = visibleFaecher.map((fach) => ({
    fach,
    themen: themen.filter((t) => {
      if (t.fachId !== fach.id) return false;
      if (q && !t.name.toLowerCase().includes(q)) return false;
      for (const colId of aktiveKolonnen) {
        const val = kolonnenFilter[colId] ?? "";
        if (!val) continue;
        if (colId === "typ") {
          if ((t.typ ?? "standard") !== val) return false;
        } else if (colId === "stufe") {
          if (!(t.stufe ?? []).includes(parseInt(val))) return false;
        } else if (colId !== "fach") {
          if (!(t.tags?.[colId] ?? []).includes(val)) return false;
        }
      }
      return true;
    }),
  }));
  const hasAnyThemen = tableData.some((d) => d.themen.length > 0);
  const newThemaFachId = faecher[0]?.id ?? null;

  const hasActiveFilters =
    q || Object.values(kolonnenFilter).some((v) => v !== "");

  const renderChips = (thema: Thema) => {
    const fachIdList = faecher.map((f) => f.id);
    return aktiveKolonnen.flatMap((spalteId, idx) => {
      if (spalteId === "fach") {
        const fach = faecher.find((f) => f.id === thema.fachId);
        if (!fach) return [];
        const color = getFachColor(thema.fachId, fachIdList, fach?.colorIndex);
        return [
          <span
            key="fach"
            className={cn(
              "shrink-0 rounded-full px-1.5 py-0.5 text-3xs font-medium",
              color.bg,
            )}
          >
            {fach.name}
          </span>,
        ];
      }
      if (spalteId === "typ") {
        return thema.typ === "rilz"
          ? [
              <span
                key="typ"
                className="shrink-0 rounded px-1.5 py-0.5 text-3xs font-medium bg-rilz-soft text-rilz-foreground"
              >
                RILZ
              </span>,
            ]
          : [
              <span
                key="typ"
                className="shrink-0 rounded px-1.5 py-0.5 text-3xs font-medium bg-muted text-muted-foreground"
              >
                Standard
              </span>,
            ];
      }
      if (spalteId === "stufe") {
        if (!thema.stufe?.length) return [];
        return [
          <span
            key="stufe"
            className="shrink-0 text-3xs rounded px-1.5 py-0.5 bg-muted text-muted-foreground"
          >
            Kl. {thema.stufe[0]}
          </span>,
        ];
      }
      const vals = thema.tags?.[spalteId];
      if (!vals?.length) return [];
      return vals.map((v) => (
        <span
          key={`${idx}-${v}`}
          className="shrink-0 rounded-full px-1.5 py-0.5 text-3xs font-medium bg-accent text-accent-foreground"
        >
          {v}
        </span>
      ));
    });
  };

  return (
    <div className="page-container py-8">
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
            description="Prüfe deine Internetverbindung und versuche es erneut."
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
                  setFachCreateMode("withThema");
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
          <h1 className="mb-6">Deine Lernzielsammlung</h1>
          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {aktiveKolonnen.map((colId) => {
              const builtin = BUILTIN_KOLONNEN.find((k) => k.id === colId);
              const custom = tagKategorien.find((k) => k.id === colId);
              const label = builtin?.label ?? custom?.name ?? colId;

              let options: { value: string; label: string; dot?: string }[];
              let showSearch = false;

              if (colId === "fach") {
                const faecherMitThemen = faecher.filter((f) =>
                  themen.some((t) => t.fachId === f.id),
                );
                options = [
                  { value: "", label: "Alle Fächer" },
                  ...faecherMitThemen.map((f) => ({
                    value: f.id,
                    label: f.name,
                    dot: getFachColor(
                      f.id,
                      faecher.map((x) => x.id),
                      f.colorIndex,
                    ).dot,
                  })),
                ];
                showSearch = faecherMitThemen.length > 4;
              } else if (colId === "typ") {
                const typenImData = [
                  ...new Set(themen.map((t) => t.typ).filter(Boolean)),
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
              } else if (colId === "stufe") {
                const availableStufen = [
                  ...new Set(themen.flatMap((t) => t.stufe ?? [])),
                ].sort((a, b) => a - b);
                options = [
                  { value: "", label: "Alle Stufen" },
                  ...availableStufen.map((n) => ({
                    value: String(n),
                    label: `Klasse ${n}`,
                  })),
                ];
              } else {
                const vals = getTagWerte(colId);
                options = [
                  { value: "", label: `Alle ${label}` },
                  ...vals.map((v) => ({ value: v, label: v })),
                ];
                showSearch = vals.length > 4;
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
                  onRemove={() => removeKolonne(colId)}
                  showSearch={showSearch}
                />
              );
            })}

            <AddSpalteButton
              aktiveKolonnen={aktiveKolonnen}
              tagKategorien={tagKategorien}
              onAdd={addKolonne}
              onNewKategorie={() => setKatCreateOpen(true)}
            />

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearch("");
                  setKolonnenFilter({});
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="close" size={12} /> Filter zurücksetzen
              </button>
            )}
          </div>

          {/* Search + Import row */}
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Thema suchen…"
            className="mb-6"
            right={
              <>
                {lezio.feedback && (
                  <span
                    className={cn(
                      "self-center text-xs",
                      lezio.feedback.ok
                        ? "text-status-reached"
                        : "text-status-not-reached",
                    )}
                  >
                    {lezio.feedback.msg}
                  </span>
                )}
                <Button className="h-auto" onClick={lezio.openFileDialog}>
                  <Icon name="upload" size={14} /> Importieren
                </Button>
              </>
            }
          />

          {/* Table */}
          {!hasAnyThemen && hasActiveFilters ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Keine Themen entsprechen den gewählten Filtern.
            </p>
          ) : !hasAnyThemen ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-14 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Noch keine Themen angelegt
              </p>
              {newThemaFachId && (
                <Button
                  variant="secondary"
                  onClick={() => setThemaPickerFachId(newThemaFachId)}
                >
                  <Icon name="add" size={12} /> Erstes Thema erstellen
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {tableData.map(({ fach, themen: fachThemen }) => {
                const fachColor = getFachColor(
                  fach.id,
                  faecher.map((f) => f.id),
                  fach.colorIndex,
                );
                const fachCollapsed = collapsedFaecher.has(fach.id);
                const fachLZCount = fachThemen.reduce(
                  (s, t) =>
                    s + lernziele.filter((lz) => lz.themaId === t.id).length,
                  0,
                );
                return (
                  <div
                    key={fach.id}
                    className={cn(
                      "rounded-2xl border bg-card overflow-hidden shadow-sm border-l-4",
                      fachColor.border,
                    )}
                  >
                    {/* Fach header */}
                    <div
                      className={cn(
                        "group flex items-center gap-2 px-3 py-1.5 select-none",
                        fachColor.bg,
                      )}
                    >
                      <button
                        onClick={() => toggleFach(fach.id)}
                        className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                      >
                        {fachCollapsed ? (
                          <Icon
                            name="chevron_right"
                            size={14}
                            className="text-muted-foreground shrink-0"
                          />
                        ) : (
                          <Icon
                            name="expand_more"
                            size={14}
                            className="text-muted-foreground shrink-0"
                          />
                        )}
                        <span className="text-xs font-semibold uppercase tracking-wider text-foreground flex-1 text-left">
                          {fach.name}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {fachLZCount} LZ
                        </span>
                      </button>
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          void exportFach(fach.id);
                        }}
                        aria-label={`${fach.name} exportieren`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground"
                      >
                        <Icon name="download" size={14} />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteFachId(fach.id);
                        }}
                        aria-label={`${fach.name} löschen`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-destructive"
                      >
                        <Icon name="delete" size={14} />
                      </Button>
                    </div>

                    {!fachCollapsed && (
                      <div className="divide-y divide-border/40">
                        {fachThemen.map((thema) => {
                          const isExpanded = expandedThemen.has(thema.id);

                          return (
                            <div key={thema.id}>
                              <div className="group flex items-center gap-2 px-3 py-2 hover:bg-accent/20 transition-colors">
                                {/* Name inline with Stufe-Chip und RILZ-Badge */}
                                <button
                                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                  onClick={() => toggleThema(thema.id)}
                                >
                                  {isExpanded ? (
                                    <Icon
                                      name="expand_more"
                                      size={12}
                                      className="text-muted-foreground shrink-0"
                                    />
                                  ) : (
                                    <Icon
                                      name="chevron_right"
                                      size={12}
                                      className="text-muted-foreground shrink-0"
                                    />
                                  )}
                                  <span className="text-sm font-medium truncate">
                                    {thema.name}
                                  </span>
                                  {renderChips(thema)}
                                </button>

                                {/* Actions — hover reveal */}
                                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="icon-sm"
                                    variant="secondary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditThemaId(thema.id);
                                    }}
                                    aria-label="Thema bearbeiten"
                                  >
                                    <Icon name="edit" size={14} />
                                  </Button>
                                  <Button
                                    size="icon-sm"
                                    variant="secondary"
                                    className="text-muted-foreground"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      exportThema(thema.id);
                                    }}
                                    aria-label="Thema exportieren"
                                  >
                                    <Icon name="download" size={12} />
                                  </Button>
                                </div>
                              </div>

                              {isExpanded && (
                                <ThemaLZSection themaId={thema.id} />
                              )}
                            </div>
                          );
                        })}

                        {fachThemen.length === 0 && (
                          <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground">
                            {hasActiveFilters
                              ? "Keine Themen entsprechen den Filtern."
                              : "Noch keine Themen angelegt."}
                          </div>
                        )}

                        <button
                          onClick={() => setThemaPickerFachId(fach.id)}
                          className="flex w-full items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground/60 hover:text-primary hover:bg-accent/20 transition-colors"
                        >
                          <Icon name="add" size={12} /> Thema hinzufügen
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Neues Fach — ganz unten in der Lernzielsammlung */}
          <button
            onClick={() => {
              setFachCreateMode("only");
              setFachCreateOpen(true);
            }}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border py-2 text-xs text-muted-foreground hover:text-primary hover:bg-accent/20 transition-colors"
          >
            <Icon name="add" size={12} /> Neues Fach
          </button>
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

      <InputModal
        open={katCreateOpen}
        onOpenChange={setKatCreateOpen}
        title="Neue Tag-Kategorie"
        label="Bezeichnung"
        placeholder="z. B. Semester, Lerngruppe …"
        onSubmit={(name) => {
          createTagKategorie(name);
          setKatCreateOpen(false);
        }}
      />

      {themaCreateFachId && (
        <CreateThemaModal
          open={!!themaCreateFachId}
          onOpenChange={(o) => {
            if (!o) setThemaCreateFachId(null);
          }}
          fachId={themaCreateFachId}
        />
      )}

      {themaPickerFachId && (
        <ThemaAddPickerModal
          open={!!themaPickerFachId}
          onOpenChange={(o) => {
            if (!o) setThemaPickerFachId(null);
          }}
          fachName={faecher.find((f) => f.id === themaPickerFachId)?.name ?? ""}
          onImportieren={handlePickerImportieren}
          onNeuErstellen={handlePickerNeuErstellen}
        />
      )}

      {editThemaId && (
        <ThemaEditModal
          themaId={editThemaId}
          onClose={() => setEditThemaId(null)}
          onRequestDelete={() => {
            setDeleteThemaId(editThemaId);
            setEditThemaId(null);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteThemaId}
        onOpenChange={(o) => {
          if (!o) setDeleteThemaId(null);
        }}
        title="Thema löschen"
        description="Soll dieses Thema und alle zugehörigen Lernziele wirklich dauerhaft gelöscht werden?"
        confirmLabel="Löschen"
        onConfirm={() => {
          if (deleteThemaId) deleteThema(deleteThemaId);
        }}
      />
      <ConfirmDialog
        open={!!deleteFachId}
        onOpenChange={(o) => {
          if (!o) setDeleteFachId(null);
        }}
        title="Fach löschen"
        description="Soll dieses Fach mit allen zugehörigen Themen und Lernzielen wirklich dauerhaft gelöscht werden?"
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
