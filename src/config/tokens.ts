/*
  Design tokens — single source of truth for the B&W design system.
  All spacing values follow the 8px grid (1 unit = 8px).
*/

export const spacing = {
  0: "0px",
  "0.5": "4px",
  1: "8px",
  2: "16px",
  3: "24px",
  4: "32px",
  5: "40px",
  6: "48px",
  8: "64px",
  10: "80px",
  12: "96px",
  16: "128px",
  20: "160px",
  24: "192px",
} as const

export const colors = {
  black: "#000000",
  white: "#ffffff",
  gray: {
    50: "oklch(0.98 0 0)",
    100: "oklch(0.96 0 0)",
    200: "oklch(0.92 0 0)",
    300: "oklch(0.88 0 0)",
    400: "oklch(0.72 0 0)",
    500: "oklch(0.60 0 0)",
    600: "oklch(0.50 0 0)",
    700: "oklch(0.38 0 0)",
    800: "oklch(0.25 0 0)",
    900: "oklch(0.14 0 0)",
    950: "oklch(0.09 0 0)",
  },
} as const

export const typography = {
  fontFamily: {
    sans: "var(--font-geist-sans)",
    mono: "var(--font-geist-mono)",
  },
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }],
    sm: ["0.875rem", { lineHeight: "1.25rem" }],
    base: ["1rem", { lineHeight: "1.5rem" }],
    lg: ["1.125rem", { lineHeight: "1.75rem" }],
    xl: ["1.25rem", { lineHeight: "1.75rem" }],
    "2xl": ["1.5rem", { lineHeight: "2rem" }],
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
    "5xl": ["3rem", { lineHeight: "1" }],
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const

export const radius = {
  none: "0px",
  sm: "2px",
  md: "4px",
  lg: "8px",
  xl: "12px",
  full: "9999px",
} as const

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const

export type SpacingKey = keyof typeof spacing
export type GrayShade = keyof typeof colors.gray
export type BreakpointKey = keyof typeof breakpoints
