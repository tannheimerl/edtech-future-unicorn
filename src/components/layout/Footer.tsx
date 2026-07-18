'use client'

import { cn } from "@/lib/utils"
import type { WithClassName } from "@/types"

type FooterProps = {
  siteName?: string
} & WithClassName

export const Footer = ({ siteName = "Lezio", className }: FooterProps) => {
  return (
    <footer className={cn("w-full mt-auto border-t border-border/60", className)}>
      <div className="page-container flex h-7 items-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteName}
        </p>
      </div>
    </footer>
  )
}
