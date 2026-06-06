'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpenCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WithClassName } from "@/types"

const NAV_ITEMS = [
  { label: "Übersicht", href: "/", exact: true },
  { label: "Klassen", href: "/klassen" },
  { label: "Lernziele", href: "/lernziele" },
  { label: "Berichte", href: "/berichte" },
]

interface HeaderProps extends WithClassName {
  siteName?: string
}

export function Header({ siteName = "Lezio", className }: HeaderProps) {
  const pathname = usePathname()

  return (
    <header className={cn("sticky top-0 z-50 w-full bg-card border-b border-border/70 shadow-sm", className)}>
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-primary font-bold text-sm tracking-tight hover:opacity-80 transition-opacity"
        >
          <BookOpenCheck className="size-4" />
          {siteName}
        </Link>

        <nav>
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                    )}
                  >
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
