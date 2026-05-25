import type { ReactNode } from "react"

export interface WithChildren {
  children: ReactNode
}

export interface WithClassName {
  className?: string
}

export interface WithChildrenAndClassName extends WithChildren, WithClassName {}

export type PropsWithClassName<T = unknown> = T & WithClassName
