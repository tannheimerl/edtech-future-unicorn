import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
  Heights are anchored to the 8px grid (--spacing: 0.5rem):
    xs  → h-3  = 24px
    sm  → h-4  = 32px
    default → h-5 = 40px
    lg  → h-6  = 48px
    icon variants mirror the same scale
*/
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/85",
        outline:
          "border-border bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-5 gap-1.5 px-3",
        xs: "h-3 gap-1 rounded-sm px-1.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-4 gap-1 rounded-sm px-2 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-6 gap-2 px-4 text-base",
        icon: "size-5",
        "icon-xs": "size-3 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-4 rounded-sm [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = ({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) => {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
