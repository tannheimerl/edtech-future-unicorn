"use client";

import { cn, getFachColor } from "@/lib/utils";
import type { Fach } from "@/types/domain";

type FachChipFilterProps = {
  faecher: Fach[];
  allFachIds: string[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export const FachChipFilter = ({
  faecher,
  allFachIds,
  selectedIds,
  onChange,
}: FachChipFilterProps) => {
  if (faecher.length <= 1) return null;

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-semibold tracking-widest text-muted-foreground/60 shrink-0">
        Fach
      </span>
      <button
        onClick={() => onChange([])}
        className={cn(
          "h-7 px-2 rounded-md text-xs font-medium transition-all whitespace-nowrap",
          selectedIds.length === 0
            ? "bg-foreground text-background shadow-sm"
            : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        Alle
      </button>
      {faecher.map((f) => {
        const fc = getFachColor(f.id, allFachIds, f.colorIndex);
        const isActive = selectedIds.includes(f.id);
        return (
          <button
            key={f.id}
            onClick={() => toggle(f.id)}
            className={cn(
              "h-7 px-2 rounded-md text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5",
              isActive
                ? cn("shadow-sm", fc.bg, fc.text)
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <span className={cn("size-2 rounded-full shrink-0", fc.dot)} />
            {f.name}
          </button>
        );
      })}
    </div>
  );
};
