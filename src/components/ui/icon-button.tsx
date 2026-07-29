import { Button as ButtonPrimitive } from "@base-ui/react/button";

import { cn } from "@/lib/utils";

/*
  Base component for controls whose entire content is a single 16px icon (no
  label text). Fixed 40x40px footprint; color, rounding, and border match the
  `secondary` Button variant exactly, so every icon-only control in the app
  reads as one consistent control regardless of context.
*/

const IconButton = ({ className, ...props }: ButtonPrimitive.Props) => {
  return (
    <ButtonPrimitive
      data-slot="icon-button"
      className={cn(
        "group/button inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-primary bg-background text-primary bg-clip-padding transition-all outline-none select-none hover:bg-primary/10 hover:cursor-pointer focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
};

export { IconButton };
