"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/shared/Modal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { sv } from "@/lib/utils";
import { themaCountsInStats } from "@/lib/student-kpis";

// TODO: Cleanup pages files -> only one function
// ── Helpers ───────────────────────────────────────────────────────────────

const isSpecial = (s: { bvsa?: boolean; rilzFachIds?: string[] }): boolean => {
  return !!(s.bvsa || s.rilzFachIds?.length);
};

// ── Klasse stats ──────────────────────────────────────────────────────────

const KlasseStats = ({ klassId }: { klassId: string }) => {
  const { getClass, getStudentsForClass, getThemenForKlasse, lernziele } =
    useData();
  const klasse = getClass(klassId);
  const students = getStudentsForClass(klassId);

  // TODO: Empty State Component
  if (students.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon name="group" size={12} />
        <span>Keine Schüler</span>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const classThemen = getThemenForKlasse(klassId).filter((t) =>
    themaCountsInStats(t, today),
  );
  const allLZ = classThemen.flatMap((t) =>
    lernziele.filter((lz) => lz.themaId === t.id),
  );
  const allLZIds = allLZ.map((lz) => lz.id);

  const regularStudents = students.filter((s) => !isSpecial(s));

  // TODO: Outsource all stats functionality (per student, class etc.) in a helper file
  let avgScore = 0;
  let atRisk = 0;
  let excellent = 0;

  if (allLZIds.length > 0 && regularStudents.length > 0) {
    const scores = regularStudents.map((s) => {
      const applicable = allLZ.filter((lz) => {
        if (lz.kategorie !== "anspruchsvoll") return true;
        if (!s.rilzFachIds?.length) return true;
        const thema = classThemen.find((t) => t.id === lz.themaId);
        return !thema || !s.rilzFachIds.includes(thema.fachId);
      });
      if (applicable.length === 0) return 0;
      return (
        (applicable.reduce(
          (sum, lz) => sum + sv(s.lernzielStatus[lz.id] ?? "not_reached"),
          0,
        ) /
          applicable.length) *
        100
      );
    });
    avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    atRisk = scores.filter((sc) => sc < 25).length;
    excellent = scores.filter((sc) => sc >= 75).length;
  }

  const reached = allLZIds.reduce(
    (sum, id) =>
      sum +
      regularStudents.filter((s) => s.lernzielStatus[id] === "reached").length,
    0,
  );
  const partial = allLZIds.reduce(
    (sum, id) =>
      sum +
      regularStudents.filter(
        (s) => s.lernzielStatus[id] === "partially_reached",
      ).length,
    0,
  );
  const total = allLZIds.length * (regularStudents.length || 1);

  const rp = total > 0 ? (reached / total) * 100 : 0;
  const pp = total > 0 ? (partial / total) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/70">
          {rp > 0 && (
            <div
              className="bg-status-reached transition-all"
              style={{ width: `${rp}%` }}
            />
          )}
          {pp > 0 && (
            <div
              className="bg-status-partial transition-all"
              style={{ width: `${pp}%` }}
            />
          )}
        </div>
      </div>

      {/* Metric row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-muted/60 rounded-md px-2 py-2 text-center ring-1 ring-border/40">
          <p className="text-3xs font-mono uppercase tracking-normal leading-none text-muted-foreground mb-0.5">
            Ø Score
          </p>
          <p
            className={`text-base font-bold tabular-nums ${avgScore >= 75 ? "text-status-reached" : avgScore >= 25 ? "text-status-partial" : "text-status-not-reached"}`}
          >
            {allLZIds.length > 0 ? `${avgScore}%` : "—"}
          </p>
        </div>
        <div className="bg-muted/60 rounded-md px-2 py-2 text-center ring-1 ring-border/40">
          <p className="text-3xs font-mono uppercase tracking-normal leading-none text-muted-foreground mb-0.5">
            Sehr gut
          </p>
          <p className="text-base font-bold tabular-nums text-status-reached">
            {excellent}
          </p>
        </div>
        <div className="bg-muted/60 rounded-md px-2 py-2 text-center ring-1 ring-border/40">
          <p className="text-3xs font-mono uppercase tracking-normal leading-none text-muted-foreground mb-0.5">
            Förderbedarf
          </p>
          <p
            className={`text-base font-bold tabular-nums ${atRisk > 0 ? "text-status-not-reached" : "text-muted-foreground"}`}
          >
            {atRisk}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Klasse form ───────────────────────────────────────────────────────────

type KlasseFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
};

const KlasseFormModal = ({ open, onOpenChange, onSubmit }: KlasseFormProps) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName("");
  }, [open]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim());
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Neue Klasse"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={() => handleSubmit()}>Speichern</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z. B. 5a"
          autoFocus
        />
      </form>
    </Modal>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────

const KlassenPage = () => {
  const router = useRouter();
  const {
    classes,
    currentLpId,
    getStudentsForClass,
    getPruefungenForKlasse,
    getPruefungErgebnisse,
    createClass,
    deleteClass,
  } = useData();
  const myClasses = classes
    .filter((k) => (k.lpZuweisungen ?? []).some((z) => z.lpId === currentLpId))
    .sort((a, b) => a.name.localeCompare(b.name, "de", { numeric: true }));
  const [createOpen, setCreateOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      {/* Empty state */}
      {myClasses.length === 0 && (
        <div>
          <EmptyState
            size="lg"
            icon={
              <Icon name="group" size={24} className="text-accent-foreground" />
            }
            title="Noch keine Klassen angelegt"
            description="Erstelle deine erste Klasse und füge Schüler hinzu."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                Erste Klasse erstellen
              </Button>
            }
          />
        </div>
      )}

      {/* Class grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {myClasses.map((klasse) => {
          const students = getStudentsForClass(klasse.id);
          const offeneNachpruefungen = getPruefungenForKlasse(
            klasse.id,
          ).flatMap((p) =>
            getPruefungErgebnisse(p.id).filter(
              (e) => e.zweiterVersuchAusstehend,
            ),
          );
          return (
            <div
              key={klasse.id}
              className="group cursor-pointer rounded-2xl border border-border bg-card p-4 transition-all duration-150 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
              onClick={() => router.push(`/klassen/${klasse.id}`)}
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h2 className="text-base font-bold tracking-tight">
                    {klasse.name}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center gap-1 text-xs font-semibold text-primary/70 bg-accent rounded-md px-2 py-1">
                    <Icon name="group" size={12} />
                    <span className="tabular-nums font-medium">
                      {students.length}
                    </span>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Popover
                      open={openMenuId === klasse.id}
                      onOpenChange={(isOpen: boolean) =>
                        setOpenMenuId(isOpen ? klasse.id : null)
                      }
                    >
                      <PopoverTrigger
                        className="flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground"
                        aria-label="Optionen"
                      >
                        <Icon name="more_horiz" size={16} />
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        side="bottom"
                        className="w-44 p-1"
                      >
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => {
                            setOpenMenuId(null);
                            setDeleteTarget({
                              id: klasse.id,
                              name: klasse.name,
                            });
                          }}
                        >
                          <Icon name="delete" size={14} />
                          Klasse löschen
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 -mx-4 mb-3" />
              {/* Stats */}
              <KlasseStats klassId={klasse.id} />
              {offeneNachpruefungen.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 rounded-md bg-status-partial-soft px-2 py-1.5 text-xs font-medium text-status-partial-fg">
                  <Icon name="restart_alt" size={12} className="shrink-0" />
                  <span>
                    {offeneNachpruefungen.length} offene
                    {offeneNachpruefungen.length === 1 ? "r" : ""} 2. Versuch
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Add new class card */}
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setCreateOpen(true)}
          className="size-10 text-muted-foreground"
        >
          <Icon name="add" size={20} />
        </Button>
      </div>

      {/* Create modal */}
      <KlasseFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(name) => {
          const id = createClass(name);
          router.push(`/klassen/${id}`);
        }}
      />

      {/* Delete confirmation modal */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Klasse löschen"
        description="Alle Schüler werden ebenfalls entfernt."
        confirmLabel="Löschen"
        onConfirm={() => {
          if (deleteTarget) deleteClass(deleteTarget.id);
        }}
      />
    </div>
  );
};

export default KlassenPage;
