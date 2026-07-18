import * as React from "react"
import { Icon } from "@/components/ui/Icon"

import { cn } from "@/lib/utils"

/*
  Reusable table primitives. Styling mirrors the Schüler admin table
  (see /klassen/detail → "Schüler" tab) so every list/data table across
  the app shares one look:

    • card container   → rounded-2xl border bg-card
    • header row       → bg-muted, border-b, bold labels
    • body rows        → divided, hover:bg-accent/30
    • cells            → px-4 py-3, text-sm

  Compose as:
    <Table>
      <TableHeader>
        <TableHead>Vorname</TableHead>
        <TableSortHeader active={…} direction={…} onClick={…}>Score</TableSortHeader>
      </TableHeader>
      <TableBody>
        <TableRow onClick={…}>
          <TableCell>…</TableCell>
        </TableRow>
      </TableBody>
    </Table>

  `containerClassName` on <Table> tunes the outer card (e.g. add
  `max-h-[380px] overflow-y-auto` for a scroll area with a sticky header).
*/

type Align = "left" | "right" | "center"

const alignText: Record<Align, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
}

const alignJustify: Record<Align, string> = {
  left: "justify-start",
  right: "justify-end",
  center: "justify-center",
}

const Table = ({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<"table"> & { containerClassName?: string }) => {
  return (
    <div
      data-slot="table-container"
      className={cn(
        "w-full overflow-x-auto rounded-2xl border border-border bg-card",
        containerClassName,
      )}
    >
      <table
        data-slot="table"
        className={cn("w-full border-collapse text-sm", className)}
        {...props}
      />
    </div>
  )
}

const TableHeader = ({
  className,
  children,
  ...props
}: React.ComponentProps<"thead">) => {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-muted select-none", className)}
      {...props}
    >
      <tr className="border-b border-border">{children}</tr>
    </thead>
  )
}

const TableBody = ({ className, ...props }: React.ComponentProps<"tbody">) => {
  return (
    <tbody
      data-slot="table-body"
      className={cn("divide-y divide-border", className)}
      {...props}
    />
  )
}

const TableRow = ({
  className,
  onClick,
  ...props
}: React.ComponentProps<"tr">) => {
  return (
    <tr
      data-slot="table-row"
      onClick={onClick}
      className={cn(
        "transition-colors hover:bg-accent/30",
        onClick && "cursor-pointer",
        className,
      )}
      {...props}
    />
  )
}

const TableHead = ({
  className,
  align = "left",
  ...props
}: React.ComponentProps<"th"> & { align?: Align }) => {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "px-4 py-3 align-middle text-sm font-semibold text-foreground whitespace-nowrap",
        alignText[align],
        className,
      )}
      {...props}
    />
  )
}

const TableCell = ({
  className,
  align = "left",
  ...props
}: React.ComponentProps<"td"> & { align?: Align }) => {
  return (
    <td
      data-slot="table-cell"
      className={cn("px-4 py-3 align-middle", alignText[align], className)}
      {...props}
    />
  )
}

/*
  Sortable column header — chevron indicator matches the reference table:
  points down for ascending, flips up for descending, faint when inactive.
*/
const TableSortHeader = ({
  active,
  direction,
  onClick,
  align = "left",
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"th">, "onClick"> & {
  active: boolean
  direction: "asc" | "desc"
  onClick: () => void
  align?: Align
}) => {
  return (
    <TableHead align={align} className={cn("p-0", className)} {...props}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-0.5 px-4 py-3 transition-colors hover:text-foreground",
          alignJustify[align],
        )}
      >
        {children}
        <Icon
          name="expand_more"
          size={12}
          className={cn(
            "shrink-0 transition-transform",
            active ? "text-primary" : "opacity-30",
            active && direction === "desc" && "rotate-180",
          )}
        />
      </button>
    </TableHead>
  )
}

/*
  Full-width message row for empty / no-results states, styled to sit inside
  a <TableBody>. Pass `colSpan` matching the table's column count.
*/
const TableEmpty = ({
  colSpan,
  className,
  children,
  ...props
}: React.ComponentProps<"td"> & { colSpan: number }) => {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={cn(
          "px-4 py-6 text-center text-sm text-muted-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </td>
    </tr>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableSortHeader,
  TableEmpty,
}
