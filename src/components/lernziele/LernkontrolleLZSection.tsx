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
    <div className="border-t border-border/40 bg-muted/10">
      {/* Grundlegend */}
      <div className="border-b border-border/40">
        <div className="pl-10 pr-3 py-1 bg-muted/20">
          <span className="text-3xs font-semibold uppercase tracking-wide text-category-grundlegend-fg">
            Grundlegend
          </span>
        </div>
        <div className="divide-y divide-border/30">
          {grundlegendLZ.length === 0 && (
            <p className="pl-10 pr-3 py-1.5 text-3xs text-muted-foreground/50">
              Noch keine grundlegenden Lernziele.
            </p>
          )}
          {grundlegendLZ.map((lz, i) => (
            <div
              key={lz.id}
              className="flex items-center gap-2 pl-10 pr-3 py-1.5"
            >
              <span className="w-4 shrink-0 text-3xs font-mono text-muted-foreground">
                {i + 1}
              </span>
              <span className="flex-1 text-xs leading-snug">{lz.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Anspruchsvoll */}
      <div>
        <div className="pl-10 pr-3 py-1 bg-muted/20">
          <span className="text-3xs font-semibold uppercase tracking-wide text-category-anspruchsvoll-fg">
            Anspruchsvoll
          </span>
        </div>
        <div className="divide-y divide-border/30">
          {anspruchsvollLZ.length === 0 && (
            <p className="pl-10 pr-3 py-1.5 text-3xs text-muted-foreground/50">
              Noch keine anspruchsvollen Lernziele.
            </p>
          )}
          {anspruchsvollLZ.map((lz, i) => (
            <div
              key={lz.id}
              className="flex items-center gap-2 pl-10 pr-3 py-1.5"
            >
              <span className="w-4 shrink-0 text-3xs font-mono text-muted-foreground">
                {i + 1}
              </span>
              <span className="flex-1 text-xs leading-snug">{lz.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
