"use client";

import { useData } from "@/contexts/DataContext";

export const LernkontrolleLZSection = ({
  lernkontrolleId,
}: {
  lernkontrolleId: string;
}) => {
  const { lernziele } = useData();
  const lernkontrolleLZ = lernziele.filter(
    (lz) => lz.lernkontrolleId === lernkontrolleId,
  );
  const grundlegendLZ = lernkontrolleLZ.filter(
    (lz) => lz.kategorie === "grundlegend",
  );
  const anspruchsvollLZ = lernkontrolleLZ.filter(
    (lz) => lz.kategorie === "anspruchsvoll",
  );

  return (
    <div className="border-t border-b border-border/80 bg-muted/40 py-2">
      {/* Grundlegend */}
      <div className="ml-8 pr-3 pb-1">
        <span className="text-sm font-medium">Grundlegend</span>
      </div>
      <div>
        {grundlegendLZ.length === 0 && (
          <p className="ml-8 pr-3 py-1.5 text-sm text-muted-foreground/50">
            Noch keine grundlegenden Lernziele.
          </p>
        )}
        {grundlegendLZ.map((lz, i) => (
          <div key={lz.id} className="flex items-center gap-2 ml-8 pr-3 py-1.5">
            <span className="w-2 shrink-0 text-sm text-muted-foreground/60">
              {i + 1}
            </span>
            <span className="flex-1 text-sm leading-snug">{lz.label}</span>
          </div>
        ))}
      </div>

      {/* Anspruchsvoll */}
      <div className="ml-8 pr-3 pt-2 pb-1">
        <span className="text-sm font-medium">Anspruchsvoll</span>
      </div>
      <div>
        {anspruchsvollLZ.length === 0 && (
          <p className="ml-8 pr-3 py-1.5 text-sm text-muted-foreground/50">
            Noch keine anspruchsvollen Lernziele.
          </p>
        )}
        {anspruchsvollLZ.map((lz, i) => (
          <div key={lz.id} className="flex items-center gap-2 ml-8 pr-3 py-1.5">
            <span className="w-2 shrink-0 text-sm text-muted-foreground/60">
              {i + 1}
            </span>
            <span className="flex-1 text-sm leading-snug">{lz.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
