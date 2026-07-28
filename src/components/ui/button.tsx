import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/*
  Two button variants only: primary (default) and secondary.
  Text buttons are a single fixed size — h-6 = 48px, px-4 = 32px,
  rounded-md = 12px (--radius). Icon-only buttons keep a compact
  square scale since forcing 48px onto a single icon breaks dense
  tables/rows. `destructive` stays as the one necessary exception
  for color-coding irreversible actions.
*/
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:brightness-90",
        secondary:
          "border-primary bg-background text-primary hover:bg-primary/10",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
      },
      size: {
        default: "h-6 gap-2 px-4",
        icon: "size-5",
        "icon-xs": "size-3 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-4 rounded-sm [&_svg:not([class*='size-'])]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

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
  );
};

export { Button, buttonVariants };
