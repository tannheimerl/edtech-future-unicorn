'use client'

import { Icon } from "@/components/ui/Icon"
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Aufklappbare Schritt-Karte der Berichts-Flows (nummeriert, mit ✓ nach Auswahl).
export const StepCard = ({
  step,
  title,
  summary,
  isOpen,
  onToggle,
  children,
}: {
  step?: number
  title: string
  summary?: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) => {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <Button
        variant="secondary"
        onClick={onToggle}
        className="flex w-full h-auto justify-start rounded-none gap-2 px-4 py-2 text-left hover:bg-accent/20"
      >
        {step !== undefined && (
          <span className={cn(
            'flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold',
            isOpen ? 'bg-primary text-primary-foreground' : summary ? 'bg-status-reached text-white' : 'bg-muted text-muted-foreground',
          )}>
            {summary && !isOpen ? '✓' : step}
          </span>
        )}
        {!step && (isOpen
          ? <Icon name="expand_more" size={16} className="text-muted-foreground shrink-0" />
          : <Icon name="chevron_right" size={16} className="text-muted-foreground shrink-0" />)}
        <span className="text-sm font-medium">{title}</span>
        {!isOpen && summary && (
          <span className="ml-auto text-sm text-primary font-medium truncate max-w-[50%]">{summary}</span>
        )}
        {step && isOpen && <Icon name="expand_more" size={16} className="text-muted-foreground shrink-0 ml-auto" />}
        {step && !isOpen && !summary && <Icon name="chevron_right" size={16} className="text-muted-foreground shrink-0 ml-auto" />}
      </Button>
      {isOpen && (
        <div className="px-4 pb-4 pt-3 border-t border-border">
          {children}
        </div>
      )}
    </div>
  )
}
