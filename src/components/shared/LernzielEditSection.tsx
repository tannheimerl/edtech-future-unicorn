"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LernzielKategorie } from "@/types/domain";

export type LernzielDraft = {
  id: string;
  label: string;
  kategorie: LernzielKategorie;
};

type Row = LernzielDraft & { isPending: boolean };

/**
 * Schritt „Lernziele" der Lernkontrolle-Erstellung/-Bearbeitung: Lernziele
 * nach Kategorie gruppiert anzeigen, inline anlegen, umbenennen, löschen und
 * per Drag & Drop zwischen den Kategorien verschieben.
 *
 * Rein lokal über value/onChange gesteuert — nichts wird hier persistiert;
 * der Aufrufer entscheidet, wann (z. B. beim Klick auf „Fertig") die
 * Änderungen tatsächlich gespeichert werden.
 *
 * Jede Kategorie rendert ihre Lernziele plus genau eine leere "pending"
 * Zeile am Ende. Beim ersten Zeichen wird diese Zeile Teil von `value`
 * (gleiche id, damit React den Input als dasselbe Element behandelt und der
 * Fokus erhalten bleibt) und eine neue leere Zeile mit frischer id folgt.
 */
export const LernzielEditSection = ({
  value,
  onChange,
}: {
  value: LernzielDraft[];
  onChange: (next: LernzielDraft[]) => void;
}) => {
  const grundlegend = value.filter((lz) => lz.kategorie === "grundlegend");
  const anspruchsvoll = value.filter((lz) => lz.kategorie === "anspruchsvoll");

  const [pendingGId, setPendingGId] = useState(() => crypto.randomUUID());
  const [pendingGLabel, setPendingGLabel] = useState("");
  const [pendingAId, setPendingAId] = useState(() => crypto.randomUUID());
  const [pendingALabel, setPendingALabel] = useState("");

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverKategorie, setDragOverKategorie] =
    useState<LernzielKategorie | null>(null);
  const [dragOverRowId, setDragOverRowId] = useState<string | null>(null);

  const grundlegendRows: Row[] = [
    ...grundlegend.map((lz) => ({ ...lz, isPending: false })),
    {
      id: pendingGId,
      label: pendingGLabel,
      kategorie: "grundlegend" as const,
      isPending: true,
    },
  ];
  const anspruchsvollRows: Row[] = [
    ...anspruchsvoll.map((lz) => ({ ...lz, isPending: false })),
    {
      id: pendingAId,
      label: pendingALabel,
      kategorie: "anspruchsvoll" as const,
      isPending: true,
    },
  ];

  const handleRowChange = (
    row: Row,
    kategorie: LernzielKategorie,
    label: string,
  ) => {
    if (!row.isPending) {
      onChange(value.map((lz) => (lz.id === row.id ? { ...lz, label } : lz)));
      return;
    }
    const setPendingId =
      kategorie === "grundlegend" ? setPendingGId : setPendingAId;
    const setPendingLabel =
      kategorie === "grundlegend" ? setPendingGLabel : setPendingALabel;
    onChange([...value, { id: row.id, label, kategorie }]);
    setPendingId(crypto.randomUUID());
    setPendingLabel("");
  };

  const handleDelete = (id: string) => {
    onChange(value.filter((lz) => lz.id !== id));
  };

  const handleBlur = (row: Row) => {
    if (row.isPending) return;
    if (!row.label.trim()) handleDelete(row.id);
  };

  // Verschiebt `id` an die Position direkt vor `beforeId` (oder ans Ende der
  // Kategorie, falls `beforeId` null oder nicht Teil von `value` ist) und
  // setzt dabei ggf. die Kategorie um.
  const moveItem = (
    id: string,
    kategorie: LernzielKategorie,
    beforeId: string | null,
  ) => {
    const item = value.find((lz) => lz.id === id);
    if (!item) return;
    const rest = value.filter((lz) => lz.id !== id);
    const updated = { ...item, kategorie };

    let insertIndex = rest.findIndex((lz) => lz.id === beforeId);
    if (insertIndex === -1) {
      insertIndex = rest.length;
      for (let i = rest.length - 1; i >= 0; i--) {
        if (rest[i].kategorie === kategorie) {
          insertIndex = i + 1;
          break;
        }
      }
    }

    onChange([
      ...rest.slice(0, insertIndex),
      updated,
      ...rest.slice(insertIndex),
    ]);
  };

  const handleDrop = (
    kategorie: LernzielKategorie,
    e: React.DragEvent<HTMLDivElement>,
    beforeId: string | null = null,
  ) => {
    const id = draggedId ?? e.dataTransfer.getData("text/plain");
    if (id && id !== beforeId) moveItem(id, kategorie, beforeId);
    setDraggedId(null);
    setDragOverKategorie(null);
    setDragOverRowId(null);
  };

  const renderRow = (row: Row, idx: number, kategorie: LernzielKategorie) => {
    return (
      <div
        key={row.id}
        onDragOver={
          row.isPending
            ? undefined
            : (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = "move";
                setDragOverKategorie(kategorie);
                setDragOverRowId(row.id);
              }
        }
        onDrop={
          row.isPending
            ? undefined
            : (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDrop(kategorie, e, row.id);
              }
        }
        className={cn(
          "group relative flex items-center gap-2 py-1.5 hover:bg-accent/20 transition-colors px-1",
          draggedId === row.id && "opacity-40",
        )}
      >
        {dragOverRowId === row.id && draggedId && draggedId !== row.id && (
          <span className="absolute inset-x-1 -top-px h-0.5 rounded-full bg-primary" />
        )}
        <span className="relative w-4 h-4 shrink-0">
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center text-xs text-muted-foreground transition-opacity",
              !row.isPending && "group-hover:opacity-0",
            )}
          >
            {idx + 1}
          </span>
          {!row.isPending && (
            <span
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", row.id);
                setDraggedId(row.id);
              }}
              onDragEnd={() => {
                setDraggedId(null);
                setDragOverKategorie(null);
                setDragOverRowId(null);
              }}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-primary"
              aria-hidden="true"
            >
              <Icon name="drag_indicator" size={16} />
            </span>
          )}
        </span>
        <Input
          value={row.label}
          onChange={(e) => handleRowChange(row, kategorie, e.target.value)}
          onBlur={() => handleBlur(row)}
          placeholder={
            row.isPending
              ? kategorie === "grundlegend"
                ? "Grundlegendes Lernziel…"
                : "Anspruchsvolles Lernziel…"
              : undefined
          }
          className="h-6 text-xs flex-1 px-1.5"
        />
        {!row.isPending && (
          <IconButton onClick={() => handleDelete(row.id)} aria-label="Löschen">
            <Icon name="delete" size={16} />
          </IconButton>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Grundlegend */}
      <div
        className={cn(
          "border-b border-border/40",
          dragOverKategorie === "grundlegend" && "bg-category-grundlegend/5",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setDragOverKategorie("grundlegend");
        }}
        onDragLeave={() =>
          setDragOverKategorie((prev) => (prev === "grundlegend" ? null : prev))
        }
        onDrop={(e) => {
          e.preventDefault();
          handleDrop("grundlegend", e);
        }}
      >
        <div className="py-1 bg-muted/20 px-1">
          <span className="text-xs font-semibold tracking-wide text-category-grundlegend-fg">
            Grundlegend
          </span>
        </div>
        <div className="divide-y divide-border/30">
          {grundlegendRows.map((row, i) => renderRow(row, i, "grundlegend"))}
        </div>
      </div>

      {/* Anspruchsvoll */}
      <div
        className={cn(
          dragOverKategorie === "anspruchsvoll" &&
            "bg-category-anspruchsvoll/5",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setDragOverKategorie("anspruchsvoll");
        }}
        onDragLeave={() =>
          setDragOverKategorie((prev) =>
            prev === "anspruchsvoll" ? null : prev,
          )
        }
        onDrop={(e) => {
          e.preventDefault();
          handleDrop("anspruchsvoll", e);
        }}
      >
        <div className="py-1 bg-muted/20 px-1">
          <span className="text-xs font-semibold tracking-wide text-category-anspruchsvoll-fg">
            Anspruchsvoll
          </span>
        </div>
        <div className="divide-y divide-border/30">
          {anspruchsvollRows.map((row, i) =>
            renderRow(row, i, "anspruchsvoll"),
          )}
        </div>
      </div>
    </div>
  );
};
