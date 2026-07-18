import { cn } from '@/lib/utils'

type SectionBlockProps = {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export const SectionBlock = ({ title, description, action, className, children }: SectionBlockProps) => {
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-4 shadow-sm', className)}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h6>{title}</h6>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  )
}
