"use client";

import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { cn } from "@/lib/utils";
import { PruefungBerichtFlow } from "@/components/berichte/PruefungBerichtFlow";
import { LernzielBerichtFlow } from "@/components/berichte/LernzielBerichtFlow";

export const BerichteTab = ({ klassId }: { klassId: string }) => {
  const { lernkontrollen } = useData();
  const allThemen = lernkontrollen;

  // Basis selection: 'lz' = Lernziel-Basis, 'pruefung' = Prüfungs-Basis
  const [basis, setBasis] = useState<"lz" | "pruefung">("lz");

  if (allThemen.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Es sind noch keine Lernkontrollen im Katalog.
        </p>
        <p className="text-xs text-muted-foreground">
          Füge zuerst Lernkontrollen unter{" "}
          <strong>Vorlagen für Lernkontrollen</strong> hinzu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-w-2xl">
      {/* Subtitle */}
      <p className="text-sm text-muted-foreground pb-1">
        Wähle Berichtsbasis, Lernkontrolle und Schüler:innen — dann kannst du
        individuelle Berichte herunterladen.
      </p>

      {/* Basis selector */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold">Berichtsbasis</p>
        <div className="flex gap-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div
              className={cn(
                "mt-0.5 size-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors",
                basis === "lz"
                  ? "border-primary bg-primary"
                  : "border-border group-hover:border-primary/50",
              )}
              onClick={() => setBasis("lz")}
            >
              {basis === "lz" && (
                <div className="size-1.5 rounded-full bg-primary-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Lernziel-Basis</p>
              <p className="text-xs text-muted-foreground">
                Bericht über eine Lernkontrolle mit Lernzielen
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer group ml-6">
            <div
              className={cn(
                "mt-0.5 size-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors",
                basis === "pruefung"
                  ? "border-primary bg-primary"
                  : "border-border group-hover:border-primary/50",
              )}
              onClick={() => setBasis("pruefung")}
            >
              {basis === "pruefung" && (
                <div className="size-1.5 rounded-full bg-primary-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Lernkontrolle-Basis</p>
              <p className="text-xs text-muted-foreground">
                Bericht zu einer Lernkontrolle mit Ergebnis
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Beide Flows bleiben gemountet, damit Auswahl/Kommentare beim
          Umschalten der Basis erhalten bleiben. */}
      <div className={cn("space-y-2", basis !== "pruefung" && "hidden")}>
        <PruefungBerichtFlow klassId={klassId} />
      </div>
      <div className={cn("space-y-2", basis !== "lz" && "hidden")}>
        <LernzielBerichtFlow klassId={klassId} />
      </div>
    </div>
  );
};
