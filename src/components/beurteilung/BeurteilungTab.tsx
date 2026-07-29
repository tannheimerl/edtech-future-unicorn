"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { PruefungErstellenModal } from "@/components/pruefungen/PruefungErstellenModal";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { BeurteilungGrid } from "./BeurteilungGrid";
import { cn } from "@/lib/utils";
import { formatDateCH } from "@/lib/dates";

type Props = {
  klassId: string;
};

export const BeurteilungTab = ({ klassId }: Props) => {
  const {
    getPruefungenForKlasse,
    getPruefungErgebnisse,
    getStudentsForClass,
    faecher,
    deletePruefung,
    updatePruefung,
  } = useData();

  const pruefungen = getPruefungenForKlasse(klassId).sort((a, b) =>
    b.datum.localeCompare(a.datum),
  );
  const students = getStudentsForClass(klassId);

  const [activePruefungId, setActivePruefungId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filterFachId, setFilterFachId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "alle" | "laufend" | "abgeschlossen"
  >("alle");

  // Zeigt bei gelöschter/unbekannter Prüfung automatisch wieder die Liste —
  // abgeleitet statt setState während des Renderns.
  const activePruefung = activePruefungId
    ? (pruefungen.find((p) => p.id === activePruefungId) ?? null)
    : null;

  const pruefungenFachIds = new Set(pruefungen.map((p) => p.fachId));
  const filterableFaecher = faecher.filter((f) => pruefungenFachIds.has(f.id));

  const filteredPruefungen = pruefungen
    .filter((p) => filterFachId === null || p.fachId === filterFachId)
    .filter((p) => filterStatus === "alle" || p.status === filterStatus);

  // ── Shared header ─────────────────────────────────────────────────────────
  const header = (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        {activePruefung ? (
          <nav className="flex items-center gap-1.5 text-sm">
            <Button
              variant="secondary"
              onClick={() => setActivePruefungId(null)}
              className="gap-1 text-muted-foreground"
            >
              <Icon name="chevron_left" size={16} />
              Beurteilung
            </Button>
            <span className="text-muted-foreground/40">/</span>
            <span className="font-semibold text-foreground">
              {activePruefung?.name}
            </span>
          </nav>
        ) : (
          <h2 className="text-lg font-semibold">Lernzielkontrollen</h2>
        )}
      </div>
      <div className="flex items-center gap-2">
        {!activePruefung && (
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Icon name="add" size={16} /> Neue Lernzielkontrolle
          </Button>
        )}
      </div>
    </div>
  );

  // ── Detailansicht: Prüfungs-Grid ─────────────────────────────────────────
  if (activePruefung) {
    return (
      <div className="space-y-4">
        {header}
        <BeurteilungGrid pruefungId={activePruefung.id} klassId={klassId} />
        <ConfirmDialog
          open={confirmDeleteId !== null}
          onOpenChange={(v) => {
            if (!v) setConfirmDeleteId(null);
          }}
          title="Lernzielkontrolle löschen?"
          description="Alle Ergebnisse dieser Lernzielkontrolle werden unwiderruflich gelöscht."
          confirmLabel="Löschen"
          onConfirm={() => {
            if (confirmDeleteId) {
              deletePruefung(confirmDeleteId);
              setConfirmDeleteId(null);
              setActivePruefungId(null);
            }
          }}
        />
      </div>
    );
  }

  // ── Listenansicht ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {header}

      {/* Filter-Leiste */}
      {pruefungen.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {filterableFaecher.length > 1 && (
            <SegmentedControl
              label="Fach"
              value={filterFachId ?? ""}
              onChange={(v) => setFilterFachId(v === "" ? null : v)}
              options={[
                { key: "", label: "Alle" },
                ...filterableFaecher.map((f) => ({ key: f.id, label: f.name })),
              ]}
            />
          )}
          <SegmentedControl<"alle" | "laufend" | "abgeschlossen">
            label="Status"
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { key: "alle", label: "Alle" },
              { key: "laufend", label: "Laufend" },
              { key: "abgeschlossen", label: "Abgeschlossen" },
            ]}
          />
        </div>
      )}

      {/* Karten-Grid oder EmptyState */}
      {pruefungen.length === 0 ? (
        <EmptyState
          icon={
            <Icon
              name="assignment"
              size={24}
              className="text-muted-foreground"
            />
          }
          title="Noch keine Lernzielkontrollen"
          description="Erstelle eine Lernzielkontrolle aus den Lernzielen dieser Klasse."
          action={
            <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Icon name="add" size={16} /> Neue Lernzielkontrolle
            </Button>
          }
        />
      ) : filteredPruefungen.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Keine Lernzielkontrollen für die gewählten Filter.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPruefungen.map((p) => {
            const ergebnisse = getPruefungErgebnisse(p.id);
            const relevantStudents = p.nurRilz
              ? students.filter((s) => p.rilzSchuelerIds.includes(s.id))
              : students.filter((s) => !s.rilzFachIds?.includes(p.fachId));
            const rilzExcluded = p.nurRilz
              ? 0
              : students.filter((s) => s.rilzFachIds?.includes(p.fachId))
                  .length;
            const bewertet = relevantStudents.filter((s) =>
              ergebnisse.some((e) => e.schuelerId === s.id && e.abgeschlossen),
            ).length;
            const fach = faecher.find((f) => f.id === p.fachId);
            const pct =
              relevantStudents.length > 0
                ? Math.round((bewertet / relevantStudents.length) * 100)
                : 0;
            return (
              <div
                key={p.id}
                className="group relative flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md cursor-pointer"
                onClick={() => setActivePruefungId(p.id)}
              >
                <IconButton
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteId(p.id);
                  }}
                  className="absolute right-3 top-3 hidden text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:flex"
                  title="Lernzielkontrolle löschen"
                >
                  <Icon name="delete" size={16} />
                </IconButton>

                <div className="flex items-start justify-between gap-2 pr-6">
                  <p className="font-semibold leading-tight">{p.name}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updatePruefung(p.id, {
                        status:
                          p.status === "laufend" ? "abgeschlossen" : "laufend",
                      });
                    }}
                    className={cn(
                      "shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
                      p.status === "abgeschlossen"
                        ? "bg-secondary text-muted-foreground hover:bg-muted"
                        : "bg-status-reached-soft text-status-reached-fg hover:bg-status-reached-soft/80",
                    )}
                  >
                    {p.status === "abgeschlossen" ? "Abgeschlossen" : "Laufend"}
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="calendar_month" size={16} />
                    {formatDateCH(p.datum)}
                  </span>
                  {fach && (
                    <span className="flex items-center gap-1">
                      <Icon name="menu_book" size={16} />
                      {fach.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {p.lernzielIds.length} Lernziel
                    {p.lernzielIds.length !== 1 ? "e" : ""}
                  </span>
                  {p.maxPunkte != null && (
                    <span>· max. {p.maxPunkte} Pkt.</span>
                  )}
                </div>

                <div className="mt-1 space-y-0.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {bewertet}/{relevantStudents.length} abgeschlossen
                      {rilzExcluded > 0 && (
                        <span className="ml-1 text-rilz-foreground">
                          · {rilzExcluded} RILZ
                        </span>
                      )}
                    </span>
                    <span
                      className={
                        pct === 100 ? "text-status-reached font-medium" : ""
                      }
                    >
                      {pct}%
                    </span>
                  </div>
                  <ProgressBar
                    segments={[
                      {
                        value: pct,
                        className:
                          pct === 100 ? "bg-status-reached" : "bg-primary",
                      },
                    ]}
                    total={100}
                    size="xs"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PruefungErstellenModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        klassId={klassId}
        onCreated={(id) => setActivePruefungId(id)}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(v) => {
          if (!v) setConfirmDeleteId(null);
        }}
        title="Lernzielkontrolle löschen?"
        description="Alle Ergebnisse dieser Lernzielkontrolle werden unwiderruflich gelöscht."
        confirmLabel="Löschen"
        onConfirm={() => {
          if (confirmDeleteId) {
            deletePruefung(confirmDeleteId);
            setConfirmDeleteId(null);
          }
        }}
      />
    </div>
  );
};
