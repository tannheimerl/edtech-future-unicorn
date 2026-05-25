import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { WithClassName } from "@/types"

interface NavItem {
  label: string
  href: string
}

const NAV_ITEMS: NavItem[] = [
  { label: "Klassen", href: "/klassen" },
  { label: "Design System", href: "/design-system" },
]

interface HeaderProps extends WithClassName {
  siteName?: string
}

export function Header({ siteName = "Unicorn", className }: HeaderProps) {
  return (
    <header className={cn("w-full", className)}>
      <div className="flex h-8 items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-foreground hover:opacity-70 transition-opacity"
        >
          {siteName}
        </Link>
        <nav>
          <ul className="flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <Separator />
    </header>
  )
}
