"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import type { TagKategorie } from "@/types/domain";

export const BUILTIN_KOLONNEN = [
  { id: "fach", label: "Fach" },
  { id: "typ", label: "Typ" },
  { id: "stufe", label: "Schulstufe" },
] as const;

export const MAX_SPALTEN = 5;

export const AddSpalteButton = ({
  aktiveKolonnen,
  tagKategorien,
  onAdd,
  onNewKategorie,
}: {
  aktiveKolonnen: string[];
  tagKategorien: TagKategorie[];
  onAdd: (id: string) => void;
  onNewKategorie: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const atMax = aktiveKolonnen.length >= MAX_SPALTEN;

  const builtinAvailable = BUILTIN_KOLONNEN.filter(
    (k) => !aktiveKolonnen.includes(k.id),
  );
  const customAvailable = tagKategorien.filter(
    (k) => !aktiveKolonnen.includes(k.id),
  );

  if (atMax) {
    return (
      <span className="flex items-center gap-1 rounded-full border border-status-partial-fg/25 bg-status-partial-soft px-3 py-1.5 text-xs text-status-partial-fg font-medium shrink-0">
        <span className="tabular-nums">
          {MAX_SPALTEN}/{MAX_SPALTEN}
        </span>
        <span className="text-status-partial-fg/70">Spalten</span>
      </span>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors shrink-0">
        <Icon name="add" size={12} />
        Spalte
        <span className="text-muted-foreground/50 tabular-nums">
          {aktiveKolonnen.length}/{MAX_SPALTEN}
        </span>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-52" align="start">
        <Command>
          <CommandList>
            {builtinAvailable.length > 0 && (
              <CommandGroup heading="Standardfelder">
                {builtinAvailable.map((k) => (
                  <CommandItem
                    key={k.id}
                    value={k.id}
                    onSelect={() => {
                      onAdd(k.id);
                      setOpen(false);
                    }}
                    className="text-xs"
                  >
                    {k.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {customAvailable.length > 0 && (
              <>
                {builtinAvailable.length > 0 && <CommandSeparator />}
                <CommandGroup heading="Eigene">
                  {customAvailable.map((k) => (
                    <CommandItem
                      key={k.id}
                      value={k.id}
                      onSelect={() => {
                        onAdd(k.id);
                        setOpen(false);
                      }}
                      className="text-xs"
                    >
                      {k.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            {builtinAvailable.length === 0 && customAvailable.length === 0 && (
              <div className="py-2 text-xs text-center text-muted-foreground">
                Alle Kategorien sind aktiv.
              </div>
            )}
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                value="__new_kategorie__"
                onSelect={() => {
                  onNewKategorie();
                  setOpen(false);
                }}
                className="text-xs text-primary"
              >
                <Icon name="add" size={12} className="mr-1.5" />
                Neue Kategorie erstellen
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
