"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/shared/Modal";
import { EmptyState } from "@/components/shared/EmptyState";
import { themaCountsInStats, computeKlasseStats } from "@/lib/student-kpis";
import { todayISO } from "@/lib/dates";
import { scoreColor } from "@/lib/utils";
import { ProgressBar } from "@/components/shared/ProgressBar";

// ── Klasse stats ──────────────────────────────────────────────────────────

const MetricPill = ({
  value,
  label,
  valueClassName,
  className,
}: {
  value: React.ReactNode;
  label: string;
  valueClassName?: string;
  className?: string;
}) => (
  <div
    className={`flex min-w-0 flex-1 items-center gap-3 rounded-lg bg-muted/60 px-4 py-3 ring-1 ring-border/40 ${className ?? ""}`}
  >
    <span
      className={`text-base font-bold tabular-nums ${valueClassName ?? ""}`}
    >
      {value}
    </span>
    <span className="truncate text-sm text-muted-foreground">{label}</span>
  </div>
);

const GroupBadge = ({ count }: { count: number }) => (
  <div className="flex h-fit shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium">
    <Icon name="group" size={14} className="text-muted-foreground" />
    <span className="tabular-nums">{count}</span>
  </div>
);

const KlasseStats = ({ klassId }: { klassId: string }) => {
  const { getStudentsForClass, getThemenForKlasse, lernziele } = useData();
  const students = getStudentsForClass(klassId);

  if (students.length === 0) {
    return (
      <div className="flex flex-1 items-center gap-3 rounded-lg bg-muted/60 px-4 py-3 text-sm text-muted-foreground ring-1 ring-border/40">
        <Icon name="group" size={14} />
        <span>Keine Schüler</span>
      </div>
    );
  }

  const today = todayISO();
  const classThemen = getThemenForKlasse(klassId).filter((t) =>
    themaCountsInStats(t, today),
  );
  const { avgScore, atRisk, excellent, hasData } = computeKlasseStats(
    students,
    classThemen,
    lernziele,
  );

  return (
    <div className="flex-1 space-y-2">
      <MetricPill
        value={hasData ? `${avgScore}%` : "—"}
        label="Durchschnittliche Lernziel-Erreichung"
        valueClassName={scoreColor(avgScore)}
      />
      <MetricPill
        value={excellent}
        label="Sehr gute Schüler*innen"
        valueClassName="text-status-reached"
      />
      <MetricPill
        value={atRisk}
        label="Förderbedarf erkannt"
        valueClassName={
          atRisk > 0 ? "text-status-not-reached" : "text-muted-foreground"
        }
      />
    </div>
  );
};

const LernzielProgress = ({ klassId }: { klassId: string }) => {
  const { getStudentsForClass, getThemenForKlasse, lernziele } = useData();
  const students = getStudentsForClass(klassId);

  const today = todayISO();
  const classThemen = getThemenForKlasse(klassId).filter((t) =>
    themaCountsInStats(t, today),
  );
  const { reachedPct, partialPct } = computeKlasseStats(
    students,
    classThemen,
    lernziele,
  );

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">Lernziel-Fortschritt</p>
      <div className="max-w-[220px]">
        <ProgressBar
          size="md"
          trackClassName="bg-muted/70"
          segments={[
            { value: reachedPct, className: "bg-status-reached" },
            { value: partialPct, className: "bg-status-partial" },
          ]}
          total={100}
        />
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
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
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
    getStudentsForClass,
    getPruefungenForKlasse,
    getPruefungErgebnisse,
    createClass,
    loadError,
    reloadData,
  } = useData();
  const myClasses = classes
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "de", { numeric: true }));
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1>Deine Klassen</h1>
        {myClasses.length > 0 && (
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={() => setCreateOpen(true)}
          >
            <Icon name="add" size={16} />
            Neue Klasse erstellen
          </Button>
        )}
      </div>

      {/* Empty / load-error state */}
      {myClasses.length === 0 && (
        <div>
          {loadError ? (
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
                  name="group"
                  size={24}
                  className="text-accent-foreground"
                />
              }
              title="Noch keine Klassen angelegt"
              description="Erstelle deine erste Klasse und füge Schüler hinzu."
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  Erste Klasse erstellen
                </Button>
              }
            />
          )}
        </div>
      )}

      {/* Class list */}
      <div className="space-y-4">
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
              className="group cursor-pointer rounded-2xl border border-border bg-card p-6 transition-all duration-150 hover:shadow-md hover:border-primary/30"
              onClick={() =>
                router.push(`/klassen/detail?klassId=${klasse.id}`)
              }
            >
              <div className="flex items-center gap-6">
                {/* Left column: name + progress */}
                <div className="flex h-full min-w-[160px] shrink-0 flex-col justify-between gap-6 self-stretch">
                  <h4>{klasse.name}</h4>
                  <LernzielProgress klassId={klasse.id} />
                </div>

                {/* Right column: badge + metrics */}
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <GroupBadge count={students.length} />
                  <KlasseStats klassId={klasse.id} />
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                  <Icon
                    name="chevron_right"
                    size={20}
                    className="text-primary"
                  />
                </div>
              </div>

              {offeneNachpruefungen.length > 0 && (
                <div className="mt-4 flex items-center gap-1.5 rounded-md bg-status-partial-soft px-2 py-1.5 text-xs font-medium text-status-partial-fg">
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
      </div>

      {/* Create modal */}
      <KlasseFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(name) => {
          const id = createClass(name);
          router.push(`/klassen/detail?klassId=${id}`);
        }}
      />
    </div>
  );
};

export default KlassenPage;
