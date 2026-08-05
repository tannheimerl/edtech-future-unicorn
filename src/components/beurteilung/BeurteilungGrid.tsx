"use client";

import React, { useEffect, useRef, useState } from "react";

import { useData } from "@/contexts/DataContext";
import { StudentRow } from "@/components/beurteilung/BeurteilungStudentRow";

import { cn, statusAvgPct, scoreChipClasses } from "@/lib/utils";
import { formatDateCH } from "@/lib/dates";
import { Badge } from "@/components/ui/badge";
import { isPruefungStudentBewertet } from "@/lib/student-kpis";

type Props = {
  pruefungId: string;
  klassId: string;
};

export const BeurteilungGrid = ({ pruefungId, klassId }: Props) => {
  const {
    pruefungen,
    getPruefungErgebnisse,
    getStudentsForClass,
    lernziele,
    lernkontrollen,
    faecher,
    setLernzielVersuche,
    upsertPruefungErgebnis,
  } = useData();

  const pruefung = pruefungen.find((p) => p.id === pruefungId);
  const ergebnisse = getPruefungErgebnisse(pruefungId);

  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [tableScrollWidth, setTableScrollWidth] = useState(0);

  const allStudents = getStudentsForClass(klassId).sort((a, b) =>
    a.vorname.localeCompare(b.vorname, "de"),
  );

  const pruefungFachId = pruefung?.fachId ?? "";
  const nurRilz = pruefung?.nurRilz ?? false;
  // Teilnehmer werden beim Erstellen explizit gewählt (Schritt 2 des Modals).
  const teilnehmerIds = new Set(pruefung?.schuelerIds ?? []);
  const mainStudents = allStudents.filter((s) => teilnehmerIds.has(s.id));

  // Build LZ groups from pruefung.lernzielIds → grouped by Thema → split G/A
  const lzGroups = (() => {
    if (!pruefung) return [];
    // collect unique lernkontrolle ids in order
    const themaOrder: string[] = [];
    for (const lzId of pruefung.lernzielIds) {
      const lz = lernziele.find((l) => l.id === lzId);
      if (lz && !themaOrder.includes(lz.lernkontrolleId))
        themaOrder.push(lz.lernkontrolleId);
    }
    return themaOrder.map((themaId) => {
      const thema = lernkontrollen.find((t) => t.id === themaId)!;
      const lzsForThema = pruefung.lernzielIds
        .map((id) => lernziele.find((l) => l.id === id))
        .filter(
          (l): l is NonNullable<typeof l> =>
            l != null && l.lernkontrolleId === themaId,
        );
      return {
        thema,
        grundlegend: lzsForThema.filter((l) => l.kategorie === "grundlegend"),
        anspruchsvoll: lzsForThema.filter(
          (l) => l.kategorie === "anspruchsvoll",
        ),
      };
    });
  })();

  const allLzIds = pruefung?.lernzielIds ?? [];

  useEffect(() => {
    if (tableScrollRef.current)
      setTableScrollWidth(tableScrollRef.current.scrollWidth);
  }, [allLzIds.length]);

  const selectedFachObj = faecher.find((f) => f.id === pruefungFachId);

  if (!pruefung) return null;

  const locked = pruefung.status === "abgeschlossen";
  const nichtTeilnehmend = allStudents.length - mainStudents.length;

  const bewertet = mainStudents.filter((s) =>
    isPruefungStudentBewertet(pruefung.lernzielIds, s, lernziele, lernkontrollen, nurRilz),
  ).length;

  return (
    <div className="space-y-3">
      {/* Meta */}
      <div
        className="flex justify-between items-center pl-1 pr-3
      "
      >
        <p className="text-sm text-muted-foreground">
          {selectedFachObj?.name} · {formatDateCH(pruefung.datum)} ·{" "}
          {allLzIds.length} Lernziel{allLzIds.length !== 1 ? "e" : ""} ·{" "}
          {bewertet}/{mainStudents.length} abgeschlossen
          {nichtTeilnehmend > 0 && ` · ${nichtTeilnehmend} nehmen nicht teil`}
        </p>

        {/* Legend */}
        <div className="flex justify-end gap-3">
          {(
            [
              ["bg-status-reached", "Erreicht"],
              ["bg-status-partial", "Teilweise"],
              [
                "bg-status-not-reached-soft border border-status-not-reached",
                "Nicht erreicht",
              ],
              ["bg-status-none-soft", "Nicht bewertet"],
            ] as const
          ).map(([cls, label]) => (
            <span
              key={label}
              className="flex items-center gap-1 text-xs text-muted-foreground/70"
            >
              <span
                className={cn("inline-block size-2.5 rounded-sm shrink-0", cls)}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Top scroll mirror */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div
          ref={topScrollRef}
          onScroll={() => {
            if (tableScrollRef.current)
              tableScrollRef.current.scrollLeft =
                topScrollRef.current!.scrollLeft;
          }}
          className="overflow-x-auto border-b border-border/40"
          style={{ height: 12 }}
        >
          <div style={{ width: tableScrollWidth, height: 1 }} />
        </div>

        <div
          ref={tableScrollRef}
          onScroll={() => {
            if (topScrollRef.current)
              topScrollRef.current.scrollLeft =
                tableScrollRef.current!.scrollLeft;
          }}
          className="overflow-x-auto outline-none"
        >
          <table className="border-collapse w-max min-w-full">
            <thead>
              {/* Thema group row */}
              {lzGroups.length > 0 && (
                <tr className="border-b border-border/50">
                  <th className="sticky left-0 z-10 bg-card border-r border-border" />
                  {lzGroups.map((group, gi) => {
                    const colSpan =
                      group.grundlegend.length + group.anspruchsvoll.length;
                    const isLast = gi === lzGroups.length - 1;
                    return (
                      <th
                        key={group.thema.id}
                        colSpan={colSpan}
                        className={cn(
                          "px-2 py-1 text-xs font-semibold text-center bg-muted/20",
                          !isLast && "border-r-2 border-border/60",
                        )}
                      >
                        {group.thema.name}
                      </th>
                    );
                  })}
                  {/* % + Kommentar */}
                  <th className="sticky z-10 bg-card border-l border-border" />
                  <th className="bg-card border-l border-border/40" />
                </tr>
              )}

              {/* G/A + LZ label headers */}
              <tr className="border-b border-border bg-muted/20">
                <th className="sticky left-0 z-10 bg-card w-32 min-w-32 border-r border-border px-2 py-1.5 align-bottom shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]" />

                {lzGroups.map((group, gi) => {
                  const isLastGroup = gi === lzGroups.length - 1;
                  return (
                    <React.Fragment key={group.thema.id}>
                      {group.grundlegend.map((lz, lzIdx) => (
                        <th
                          key={lz.id}
                          className={cn(
                            "bg-muted/20 px-1.5 py-2 text-left align-top",
                            lzIdx === group.grundlegend.length - 1 &&
                              group.anspruchsvoll.length > 0 &&
                              "border-r border-dashed border-border/60",
                          )}
                          style={{ width: 72, minWidth: 72 }}
                        >
                          <div className="flex flex-col gap-0.5">
                            <Badge
                              variant="grundlegend"
                              size="sm"
                              className="w-fit"
                            >
                              G
                            </Badge>
                            <span className="text-xs font-medium text-foreground leading-snug">
                              {lz.label}
                            </span>
                          </div>
                        </th>
                      ))}
                      {group.anspruchsvoll.map((lz, lzIdx) => (
                        <th
                          key={lz.id}
                          className={cn(
                            "bg-muted/20 px-1.5 py-2 text-left align-top",
                            !isLastGroup &&
                              lzIdx === group.anspruchsvoll.length - 1 &&
                              "border-r-2 border-border/50",
                          )}
                          style={{ width: 72, minWidth: 72 }}
                        >
                          <div className="flex flex-col gap-0.5">
                            <Badge
                              variant="anspruchsvoll"
                              size="sm"
                              className="w-fit"
                            >
                              A
                            </Badge>
                            <span className="text-xs font-medium text-foreground leading-snug">
                              {lz.label}
                            </span>
                          </div>
                        </th>
                      ))}
                    </React.Fragment>
                  );
                })}

                <th
                  className="sticky z-10 bg-card px-2 text-center text-xs font-semibold text-muted-foreground w-12 min-w-12 border-l border-border"
                  style={{ verticalAlign: "bottom", paddingBottom: 6 }}
                >
                  %
                </th>

                <th
                  className="bg-card px-2 py-2 text-left text-xs font-semibold text-muted-foreground border-l border-border/40 whitespace-nowrap"
                  style={{ verticalAlign: "bottom" }}
                >
                  Kommentar
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {mainStudents.map((student, rowIdx) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  pruefungId={pruefungId}
                  lzGroups={lzGroups}
                  allLzIds={allLzIds}
                  ergebnis={ergebnisse.find((e) => e.schuelerId === student.id)}
                  rowIdx={rowIdx}
                  rilzFachIds={nurRilz ? [] : (student.rilzFachIds ?? [])}
                  pruefungFachId={pruefungFachId}
                  locked={locked}
                  onUpsert={upsertPruefungErgebnis}
                  onSetVersuche={setLernzielVersuche}
                />
              ))}
            </tbody>

            {/* Class avg footer */}
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30">
                <td className="sticky left-0 z-10 bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground border-r border-border">
                  Klasse (Ø)
                </td>
                {lzGroups.map((group, gi) => {
                  const isLastGroup = gi === lzGroups.length - 1;
                  return (
                    <React.Fragment key={group.thema.id}>
                      {[...group.grundlegend, ...group.anspruchsvoll].map(
                        (lz, lzIdx) => {
                          const pct = statusAvgPct(
                            mainStudents.map((s) => s.lernzielStatus[lz.id]),
                          );
                          const color = scoreChipClasses(pct);
                          const isAEnd =
                            lz.kategorie === "anspruchsvoll" &&
                            !isLastGroup &&
                            lzIdx ===
                              group.grundlegend.length +
                                group.anspruchsvoll.length -
                                1;
                          const isGEnd =
                            lz.kategorie === "grundlegend" &&
                            group.anspruchsvoll.length > 0 &&
                            lzIdx === group.grundlegend.length - 1;
                          return (
                            <td
                              key={lz.id}
                              className={cn(
                                "px-1 py-1.5 text-center",
                                isAEnd && "border-r-2 border-border/50",
                                isGEnd &&
                                  "border-r border-dashed border-border/60",
                              )}
                            >
                              <span
                                className={cn(
                                  "inline-block text-xs font-bold tabular-nums rounded-md px-1 py-0.5",
                                  color,
                                )}
                              >
                                {pct}%
                              </span>
                            </td>
                          );
                        },
                      )}
                    </React.Fragment>
                  );
                })}
                <td className="sticky z-10 bg-card border-l border-border" />
                <td className="border-l border-border/40" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
