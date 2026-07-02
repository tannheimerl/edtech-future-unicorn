import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
  Small soft-filled label/pill. Colors map to the semantic design tokens
  (see globals.css). Sizes follow the two scales used across the app:
    sm      → text-4xs  px-1   py-px   (single-letter tags: G, A, bVSA, RILZ)
    default → text-3xs px-1.5 py-0.5  (counts, status chips)
  Use `className="rounded-full …"` for a pill shape.
*/
const badgeVariants = cva(
  "inline-flex shrink-0 items-center rounded whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        primary: "bg-primary/10 text-primary",
        rilz: "bg-rilz-soft text-rilz-foreground",
        bvsa: "bg-category-bvsa-soft text-category-bvsa-fg",
        grundlegend:
          "bg-category-grundlegend-soft text-category-grundlegend-fg",
        anspruchsvoll:
          "bg-category-anspruchsvoll-soft text-category-anspruchsvoll-fg",
      },
      size: {
        default: "px-1.5 py-0.5 text-3xs font-medium",
        sm: "px-1 py-px text-4xs font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Badge = ({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) => {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
