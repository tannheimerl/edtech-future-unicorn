import { cn } from "@/lib/utils"
import type { WithChildrenAndClassName } from "@/types"

interface SectionProps extends WithChildrenAndClassName {
  title?: string
  description?: string
}

export function Section({ title, description, children, className }: SectionProps) {
  return (
    <section className={cn("py-12", className)}>
      {(title || description) && (
        <div className="mb-8">
          {title && (
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}
