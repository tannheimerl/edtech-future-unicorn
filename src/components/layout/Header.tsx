'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { cn } from "@/lib/utils"
import type { WithClassName } from "@/types"

const NAV_ITEMS = [
  { label: "Deine Klassen", href: "/klassen", icon: "school" },
  { label: "Deine Lernzielsammlung", href: "/lernziele", icon: "target" },
  { label: "Einstellungen", href: "/einstellungen", icon: "settings" },
]

type HeaderProps = {
  siteName?: string
} & WithClassName

export const Header = ({ siteName = "Lezio", className }: HeaderProps) => {
  const pathname = usePathname()

  return (
    <header className={cn("sticky top-0 z-50 w-full bg-card border-b border-border/70 shadow-sm", className)}>
      <div className="mx-auto grid grid-cols-[1fr_auto_1fr] py-1.5 max-w-7xl items-center px-6">
        <Link
          href="/klassen"
          className="flex items-center text-primary font-bold tracking-tight hover:opacity-80 transition-opacity"
        >
          <span className="text-3xl font-bold tracking-tight">{siteName}</span>
        </Link>

        <div />

        <nav className="flex justify-end">
          <ul className="flex items-center gap-3">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                    )}
                  >
                    {item.icon && <Icon name={item.icon} size={14} />}
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </header>
  )
}
