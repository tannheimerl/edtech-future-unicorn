"use client";

import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { useData } from "@/contexts/DataContext";
import { themaCountsInStats, computeKlasseStats } from "@/lib/student-kpis";
import { todayISO } from "@/lib/dates";
import { scoreColor } from "@/lib/utils";

// Kennzahlen-Bausteine der Klassenkarte auf /klassen.

export const MetricPill = ({
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

export const KlasseStats = ({ klassId }: { klassId: string }) => {
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

export const LernzielProgress = ({ klassId }: { klassId: string }) => {
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
