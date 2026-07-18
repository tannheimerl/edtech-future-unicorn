import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon?: React.ReactNode
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  size = 'md',
  className,
}: EmptyStateProps) => {
  const padding = size === 'sm' ? 'py-8' : size === 'lg' ? 'py-20' : 'py-12'

  return (
    <div className={cn(
      'flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card text-center',
      padding,
      className,
    )}>
      {icon && (
        <div className="flex size-12 items-center justify-center rounded-2xl bg-accent">
          {icon}
        </div>
      )}
      <div className="space-y-0.5 px-4">
        <p className="font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
