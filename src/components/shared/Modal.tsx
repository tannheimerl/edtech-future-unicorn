'use client'

import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const maxWidth =
    size === 'xs' ? 'sm:max-w-xs' :
    size === 'sm' ? 'sm:max-w-sm' :
    size === 'lg' ? 'sm:max-w-2xl' :
    size === 'xl' ? 'sm:max-w-4xl' : 'sm:max-w-lg'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={maxWidth}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children && <div className="py-1">{children}</div>}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}
