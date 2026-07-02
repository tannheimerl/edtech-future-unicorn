import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
  A row inside a dropdown / popover menu. Full-width, left-aligned, with a soft
  hover. Use `selected` for the currently-active option and the `variant` to
  colour intent (primary action, destructive action, muted).
    size default → px-2 py-1.5 (compact popovers)
    size lg      → px-3 py-2   (wider dropdowns)
*/
const menuItemVariants = cva(
  "flex w-full items-center gap-1.5 rounded-md text-left text-xs transition-colors outline-none focus-visible:bg-muted/60 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-foreground hover:bg-muted/60",
        muted: "text-muted-foreground hover:bg-muted/60",
        primary: "text-primary hover:bg-primary/5",
        destructive:
          "text-muted-foreground hover:bg-destructive/5 hover:text-destructive",
        none: "",
      },
      size: {
        default: "px-2 py-1.5",
        lg: "px-3 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function MenuItem({
  className,
  variant,
  size,
  selected = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof menuItemVariants> & { selected?: boolean }) {
  return (
    <button
      data-slot="menu-item"
      className={cn(
        selected
          ? menuItemVariants({
              variant: "none",
              size,
              className: "bg-primary/10 font-medium text-primary",
            })
          : menuItemVariants({ variant, size }),
        className
      )}
      {...props}
    />
  )
}

export { MenuItem, menuItemVariants }
