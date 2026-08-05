"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Modal } from "@/components/shared/Modal";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { SearchBar } from "@/components/shared/SearchBar";
import { PruefungErstellenModal } from "@/components/pruefungen/PruefungErstellenModal";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { KpiTile } from "@/components/analytics/shared";
import { BeurteilungGrid } from "./BeurteilungGrid";
import { cn } from "@/lib/utils";
import { formatDateCH } from "@/lib/dates";
import { isPruefungStudentBewertet } from "@/lib/student-kpis";

type Props = {
  klassId: string;
};

export const BeurteilungTab = ({ klassId }: Props) => {
  const {
    getPruefungenForKlasse,
    getStudentsForClass,
    lernziele,
    lernkontrollen,
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
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterFachId, setFilterFachId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "" | "laufend" | "abgeschlossen"
  >("");

  // Zeigt bei gelöschter/unbekannter Prüfung automatisch wieder die Liste —
  // abgeleitet statt setState während des Renderns.
  const activePruefung = activePruefungId
    ? (pruefungen.find((p) => p.id === activePruefungId) ?? null)
    : null;

  const pruefungenFachIds = new Set(pruefungen.map((p) => p.fachId));
  const filterableFaecher = faecher.filter((f) => pruefungenFachIds.has(f.id));

  const q = search.trim().toLowerCase();

  const filteredPruefungen = pruefungen
    .filter((p) => filterFachId === null || p.fachId === filterFachId)
    .filter((p) => filterStatus === "" || p.status === filterStatus)
    .filter((p) => !q || p.name.toLowerCase().includes(q));

  const activePruefungRelevantStudents = activePruefung
    ? students.filter((s) => activePruefung.schuelerIds.includes(s.id))
    : [];
  const activePruefungAlleBewertet =
    activePruefungRelevantStudents.length > 0 &&
    !!activePruefung &&
    activePruefungRelevantStudents.every((s) =>
      isPruefungStudentBewertet(
        activePruefung.lernzielIds,
        s,
        lernziele,
        lernkontrollen,
        activePruefung.nurRilz,
      ),
    );

  const activePruefungen = pruefungen.filter((p) => p.status === "laufend");
  const zuBeurteilendeSchueler = activePruefungen.reduce((sum, p) => {
    const relevantStudents = students.filter((s) =>
      p.schuelerIds.includes(s.id),
    );
    const bewertet = relevantStudents.filter((s) =>
      isPruefungStudentBewertet(
        p.lernzielIds,
        s,
        lernziele,
        lernkontrollen,
        p.nurRilz,
      ),
    ).length;
    return sum + (relevantStudents.length - bewertet);
  }, 0);

  // ── Shared header ─────────────────────────────────────────────────────────
  const header = (
    <>
      {activePruefung && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1.5 text-sm">
              <button
                type="button"
                onClick={() => setActivePruefungId(null)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="chevron_left" size={16} />
                Beurteilungen
              </button>
              <span className="text-muted-foreground/40">/</span>
              <span className="font-semibold text-foreground">
                {activePruefung?.name}
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              onClick={() => setEditOpen(true)}
              title="Lernkontrolle bearbeiten"
              aria-label="Lernkontrolle bearbeiten"
            >
              <Icon name="edit" size={16} />
            </IconButton>
            <IconButton
              onClick={() => setConfirmDeleteId(activePruefung.id)}
              title="Lernkontrolle löschen"
              aria-label="Lernkontrolle löschen"
            >
              <Icon name="delete" size={16} />
            </IconButton>
            {activePruefung.status === "abgeschlossen" ? (
              <Button
                variant="secondary"
                onClick={() =>
                  updatePruefung(activePruefung.id, { status: "laufend" })
                }
              >
                <Icon name="undo" size={16} /> Abschluss aufheben
              </Button>
            ) : (
              <Button
                onClick={() => setConfirmCompleteOpen(true)}
                disabled={!activePruefungAlleBewertet}
                title={
                  activePruefungAlleBewertet
                    ? undefined
                    : "Alle Schüler*innen müssen bewertet sein"
                }
              >
                <Icon name="check" size={16} /> Lernkontrolle abschliessen
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );

  // ── Detailansicht: Prüfungs-Grid ─────────────────────────────────────────
  if (activePruefung) {
    return (
      <div className="space-y-4">
        {header}
        <BeurteilungGrid pruefungId={activePruefung.id} klassId={klassId} />
        <PruefungErstellenModal
          open={editOpen}
          onOpenChange={setEditOpen}
          klassId={klassId}
          editPruefung={activePruefung}
        />
        <ConfirmDialog
          open={confirmDeleteId !== null}
          onOpenChange={(v) => {
            if (!v) setConfirmDeleteId(null);
          }}
          title="Lernkontrolle löschen?"
          description="Alle Ergebnisse dieser Lernkontrolle werden unwiderruflich gelöscht."
          confirmLabel="Löschen"
          onConfirm={() => {
            if (confirmDeleteId) {
              deletePruefung(confirmDeleteId);
              setConfirmDeleteId(null);
              setActivePruefungId(null);
            }
          }}
        />
        <Modal
          open={confirmCompleteOpen}
          onOpenChange={setConfirmCompleteOpen}
          title="Lernkontrolle abschliessen?"
          description="Die Lernkontrolle wird als abgeschlossen markiert. Du kannst den Abschluss jederzeit wieder aufheben."
          size="sm"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setConfirmCompleteOpen(false)}
              >
                Abbrechen
              </Button>
              <Button
                onClick={() => {
                  updatePruefung(activePruefung.id, {
                    status: "abgeschlossen",
                  });
                  setConfirmCompleteOpen(false);
                }}
              >
                <Icon name="check" size={16} /> Abschliessen
              </Button>
            </>
          }
        />
      </div>
    );
  }

  // ── Listenansicht ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {header}

      {/* Stats */}
      {pruefungen.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <KpiTile
            surface="flat"
            label="Zu beurteilende Schüler*innen"
            value={zuBeurteilendeSchueler}
          />
          <KpiTile
            surface="flat"
            label="Aktive Lernkontrollen"
            value={activePruefungen.length}
          />
          <KpiTile
            surface="flat"
            label="Anzahl Lernkontrollen"
            value={pruefungen.length}
          />
        </div>
      )}

      <div className="space-y-2">
        {/* Suche + Neue Lernkontrolle */}
        {pruefungen.length > 0 && (
          <div className="flex items-center gap-2">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Suchen …"
              className="flex-1"
            />
            <Button onClick={() => setCreateOpen(true)}>
              <Icon name="add" size={16} /> Neue Lernkontrolle
            </Button>
          </div>
        )}

        {/* Filter-Leiste */}
        {pruefungen.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              label="Fach"
              value={filterFachId ?? ""}
              onChange={(v) => setFilterFachId(v === "" ? null : v)}
              options={[
                { value: "", label: "Alle" },
                ...filterableFaecher.map((f) => ({
                  value: f.id,
                  label: f.name,
                })),
              ]}
            />
            <FilterDropdown
              label="Status"
              value={filterStatus}
              onChange={(v) => setFilterStatus(v as typeof filterStatus)}
              options={[
                { value: "", label: "Alle" },
                { value: "laufend", label: "Laufend" },
                { value: "abgeschlossen", label: "Abgeschlossen" },
              ]}
            />
          </div>
        )}
      </div>

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
          title="Noch keine Lernkontrollen"
          description="Erstelle eine Lernkontrolle aus den Lernzielen dieser Klasse."
          action={
            <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Icon name="add" size={16} /> Neue Lernkontrolle
            </Button>
          }
        />
      ) : filteredPruefungen.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Keine Lernkontrollen für die gewählten Filter.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPruefungen.map((p) => {
            const relevantStudents = students.filter((s) =>
              p.schuelerIds.includes(s.id),
            );
            const bewertet = relevantStudents.filter((s) =>
              isPruefungStudentBewertet(
                p.lernzielIds,
                s,
                lernziele,
                lernkontrollen,
                p.nurRilz,
              ),
            ).length;
            const fach = faecher.find((f) => f.id === p.fachId);
            const pct =
              relevantStudents.length > 0
                ? Math.round((bewertet / relevantStudents.length) * 100)
                : 0;
            return (
              <div
                key={p.id}
                className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md cursor-pointer"
                onClick={() => setActivePruefungId(p.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold leading-tight">{p.name}</p>
                  <span
                    className={cn(
                      "shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      p.status === "abgeschlossen"
                        ? "bg-secondary text-muted-foreground"
                        : "bg-status-reached-soft text-status-reached-fg",
                    )}
                  >
                    {p.status === "abgeschlossen" ? "Abgeschlossen" : "Laufend"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="calendar_month" size={16} />
                    Fällig am: {formatDateCH(p.datum)}
                  </span>
                  {fach && (
                    <span className="flex items-center gap-1">
                      <Icon name="menu_book" size={16} />
                      Fach: {fach.name}
                    </span>
                  )}
                </div>

                <div className="mt-1 space-y-0.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {bewertet}/{relevantStudents.length} abgeschlossen
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
    </div>
  );
};
