import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { WithClassName } from "@/types"

interface FooterProps extends WithClassName {
  siteName?: string
}

export function Footer({ siteName = "Unicorn", className }: FooterProps) {
  return (
    <footer className={cn("w-full mt-auto", className)}>
      <Separator />
      <div className="flex h-8 items-center justify-between px-6">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteName}
        </p>
        <p className="text-xs text-muted-foreground">
          Built with Next.js &amp; shadcn/ui
        </p>
      </div>
    </footer>
  )
}
