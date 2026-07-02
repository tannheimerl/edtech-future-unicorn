import { cn } from "@/lib/utils"

/**
 * Material Symbols (Outlined) icon.
 *
 * Renders a single ligature glyph from the Material Symbols font loaded in the
 * root layout. Size is driven by `size` (px) rather than width/height utilities
 * because the glyph scales with `font-size`. Colour is inherited from
 * `currentColor`, so `text-*` utilities work as expected.
 *
 * @example <Icon name="add" size={12} className="text-muted-foreground" />
 */
type IconProps = {
  /** Material Symbols ligature name, e.g. "add", "delete", "chevron_right". */
  name: string
  /** Rendered size in px. Matches the former Tailwind `size-*` value. */
  size?: number
  /** Weight axis (100–700). */
  weight?: number
  /** Fill axis — `true` for the solid variant. */
  fill?: boolean
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "children">

export const Icon = ({
  name,
  size = 16,
  weight = 400,
  fill = false,
  className,
  style,
  ...props
}: IconProps) => (
  <span
    aria-hidden="true"
    translate="no"
    className={cn(
      "material-symbols-outlined inline-flex items-center justify-center",
      className,
    )}
    style={{
      fontSize: `${size}px`,
      width: `${size}px`,
      height: `${size}px`,
      fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
      ...style,
    }}
    {...props}
  >
    {name}
  </span>
)
