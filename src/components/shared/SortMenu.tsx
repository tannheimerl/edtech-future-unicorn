"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ModalOptionList } from "@/components/shared/ModalOptionList";

export type SortMenuOption<T extends string> = { value: T; label: string };

/**
 * Link-styled trigger ("Sortieren: Name (A–Z)") that opens a flyout with all
 * sort options — built on the shared `Popover` primitive and the existing
 * `ModalOptionList` for the option rows, so it stays visually consistent with
 * every other dropdown in the app.
 */
export const SortMenu = <T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: SortMenuOption<T>[];
  onChange: (v: T) => void;
}) => {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
        <span>
          {label}: <span className="font-medium text-foreground">{current?.label}</span>
        </span>
        <Icon name="expand_more" size={12} className="shrink-0" />
      </PopoverTrigger>
      <PopoverContent className="p-1.5 w-52" align="start" side="bottom">
        <ModalOptionList
          options={options}
          current={value}
          onSelect={(v) => {
            onChange(v as T);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
