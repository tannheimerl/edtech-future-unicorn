"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useData } from "@/contexts/DataContext";
import { fullName } from "@/lib/utils";
import { formatDateCH } from "@/lib/dates";
import { downloadBerichte, sanitizeFilename } from "@/lib/berichtUtils";
import type { SchuelerBerichtPDFProps } from "@/components/berichte/SchuelerBerichtPDF";
import { BerichtPreviewModal } from "@/components/berichte/BerichtPreviewModal";
import { StepCard } from "@/components/berichte/StepCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Berichte auf Basis einer Lernkontrolle (inkl. Versuch-Auswahl).
export const PruefungBerichtFlow = ({ klassId }: { klassId: string }) => {
  const {
    getClass,
    getStudentsForClass,
    getPruefungenForKlasse,
    faecher,
    lernziele: allLernziele,
  } = useData();

  const klasse = getClass(klassId)!;
  const students = getStudentsForClass(klassId);
  const pruefungen = getPruefungenForKlasse(klassId).sort((a, b) =>
    b.datum.localeCompare(a.datum),
  );

  // Fallback auf die neueste Prüfung erst zur Renderzeit ableiten — die Daten
  // laden asynchron und sind beim ersten Mount noch leer, ein useState-
  // Initialwert bliebe dauerhaft null.
  const [chosenPruefungId, setPSelectedPruefungId] = useState<string | null>(
    null,
  );
  const pSelectedPruefungId = chosenPruefungId ?? pruefungen[0]?.id ?? null;
  const [pStudentMode, setPStudentMode] = useState<"all" | "individual" | null>(
    null,
  );
  const [pSelectedStudentIds, setPSelectedStudentIds] = useState<Set<string>>(
    new Set(),
  );
  const [pReportKommentare, setPReportKommentare] = useState<
    Record<string, string>
  >({});
  const [pIsGenerating, setPIsGenerating] = useState(false);
  const [pOpenStep, setPOpenStep] = useState<1 | 2 | 3 | null>(1);
  const [pPreviewStudentId, setPPreviewStudentId] = useState<string | null>(
    null,
  );

  const pPruefung = pSelectedPruefungId
    ? pruefungen.find((p) => p.id === pSelectedPruefungId)
    : null;
  const pFach = pPruefung
    ? faecher.find((f) => f.id === pPruefung.fachId)
    : null;
  const pLernziele = pPruefung
    ? pPruefung.lernzielIds
        .map((id) => allLernziele.find((l) => l.id === id))
        .filter((l): l is NonNullable<typeof l> => l != null)
    : [];
  const pTargetStudents =
    pStudentMode === "all"
      ? students
      : pStudentMode === "individual"
        ? students.filter((s) => pSelectedStudentIds.has(s.id))
        : [];
  const pCanDownload =
    !!pPruefung && pTargetStudents.length > 0 && !pIsGenerating;

  const handlePruefungDownload = async () => {
    if (!pCanDownload || !pPruefung || !pFach) return;
    setPIsGenerating(true);
    try {
      const dateStr = formatDateCH(pPruefung.datum, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      await downloadBerichte(
        pTargetStudents.map((student) => {
          const props: SchuelerBerichtPDFProps = {
            studentName: fullName(student),
            klassenName: klasse.name,
            fachName: pFach.name,
            themaName: pPruefung.name,
            date: dateStr,
            lernziele: pLernziele.map((lz) => ({
              label: lz.label,
              kategorie: lz.kategorie,
              status: student.lernzielStatus[lz.id] ?? "not_reached",
            })),
            kommentar: pReportKommentare[student.id] || undefined,
          };
          return {
            filename: `Bericht_${sanitizeFilename(fullName(student))}_${sanitizeFilename(pPruefung.name)}.pdf`,
            props,
          };
        }),
        `Berichte_${sanitizeFilename(klasse.name)}_${sanitizeFilename(pPruefung.name)}.zip`,
      );
    } finally {
      setPIsGenerating(false);
    }
  };

  if (pruefungen.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Noch keine Lernkontrollen vorhanden.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* P-Step 1: Prüfung */}
      <StepCard
        step={1}
        title="Lernkontrolle"
        summary={
          pPruefung
            ? `${pPruefung.name} (${formatDateCH(pPruefung.datum)})`
            : undefined
        }
        isOpen={pOpenStep === 1}
        onToggle={() => setPOpenStep((prev) => (prev === 1 ? null : 1))}
      >
        <div className="flex flex-wrap gap-2">
          {pruefungen.map((p) => {
            const fach = faecher.find((f) => f.id === p.fachId);
            return (
              <Button
                key={p.id}
                variant={pSelectedPruefungId === p.id ? "default" : "secondary"}
                onClick={() => {
                  setPSelectedPruefungId(p.id);
                  setPStudentMode(null);
                  setPSelectedStudentIds(new Set());
                  setPOpenStep(2);
                }}
                className="px-4 py-1.5 text-left"
              >
                <span className="font-medium">{p.name}</span>
                <span className="ml-2 text-xs opacity-70">
                  {fach?.name} · {formatDateCH(p.datum)}
                </span>
              </Button>
            );
          })}
        </div>
      </StepCard>

      {/* P-Step 2: Schüler */}
      {pSelectedPruefungId && (
        <StepCard
          step={2}
          title="Schüler/innen"
          summary={
            pStudentMode === "all"
              ? `Alle (${students.length})`
              : pStudentMode === "individual"
                ? `${pTargetStudents.length} von ${students.length}`
                : undefined
          }
          isOpen={pOpenStep === 2}
          onToggle={() => setPOpenStep((prev) => (prev === 2 ? null : 2))}
        >
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant={pStudentMode === "all" ? "default" : "secondary"}
                onClick={() => {
                  setPStudentMode("all");
                  setPOpenStep(3);
                }}
                className="px-4 py-1.5"
              >
                <Icon name="group" size={16} /> Alle ({students.length})
              </Button>
              <Button
                variant={
                  pStudentMode === "individual" ? "default" : "secondary"
                }
                onClick={() => {
                  setPStudentMode("individual");
                  setPSelectedStudentIds(new Set());
                }}
                className="px-4 py-1.5"
              >
                <Icon name="person" size={16} /> Einzelne
              </Button>
            </div>
            {pStudentMode === "individual" && (
              <div className="flex flex-wrap gap-2">
                {students.map((s) => (
                  <Button
                    key={s.id}
                    variant={
                      pSelectedStudentIds.has(s.id) ? "default" : "secondary"
                    }
                    onClick={() => {
                      setPSelectedStudentIds((prev) => {
                        const next = new Set(prev);
                        next.has(s.id) ? next.delete(s.id) : next.add(s.id);
                        return next;
                      });
                    }}
                    className="px-3 py-1.5"
                  >
                    {s.vorname} {s.nachname}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </StepCard>
      )}

      {/* P-Step 3: Felder + Kommentar */}
      {pSelectedPruefungId && pStudentMode !== null && (
        <StepCard
          step={3}
          title="Kommentar"
          summary="optional"
          isOpen={pOpenStep === 3}
          onToggle={() => setPOpenStep((prev) => (prev === 3 ? null : 3))}
        >
          <div className="space-y-4">
            {pTargetStudents.map((s) => (
              <div key={s.id} className="space-y-1">
                {pTargetStudents.length > 1 && (
                  <span className="text-xs font-medium">
                    {s.vorname} {s.nachname}
                  </span>
                )}
                <Textarea
                  value={pReportKommentare[s.id] ?? ""}
                  onChange={(e) =>
                    setPReportKommentare((prev) => ({
                      ...prev,
                      [s.id]: e.target.value,
                    }))
                  }
                  onClick={() => setPPreviewStudentId(s.id)}
                  placeholder="Klicken für Vorschau und Kommentar…"
                  rows={2}
                  readOnly
                  className="field-sizing-fixed resize-none cursor-pointer"
                />
              </div>
            ))}
          </div>
        </StepCard>
      )}

      {/* P-Preview modal */}
      {pPreviewStudentId &&
        pPruefung &&
        pFach &&
        (() => {
          const s = students.find((st) => st.id === pPreviewStudentId)!;
          const fakeThema = {
            id: pPruefung.id,
            name: pPruefung.name,
            fachId: pFach.id,
          };
          return (
            <BerichtPreviewModal
              open={true}
              onClose={() => setPPreviewStudentId(null)}
              student={s}
              klasse={klasse}
              fach={pFach}
              thema={fakeThema as never}
              activeLz={pLernziele}
              kommentar={pReportKommentare[s.id] ?? ""}
              onKommentarChange={(val) =>
                setPReportKommentare((prev) => ({ ...prev, [s.id]: val }))
              }
            />
          );
        })()}

      {/* P-Download button */}
      {pSelectedPruefungId && pStudentMode !== null && (
        <div className="pt-1">
          <Button
            onClick={handlePruefungDownload}
            disabled={!pCanDownload}
            className="gap-2 px-5 py-2"
          >
            {pIsGenerating ? (
              <Icon
                name="progress_activity"
                size={16}
                className="animate-spin"
              />
            ) : pTargetStudents.length === 1 ? (
              <Icon name="description" size={16} />
            ) : (
              <Icon name="download" size={16} />
            )}
            {pIsGenerating
              ? "Wird erstellt…"
              : pTargetStudents.length === 1
                ? "PDF herunterladen"
                : `ZIP herunterladen (${pTargetStudents.length} PDFs)`}
          </Button>
          {pStudentMode === "individual" && pTargetStudents.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Bitte mindestens eine/n Schüler/in wählen.
            </p>
          )}
        </div>
      )}
    </>
  );
};
