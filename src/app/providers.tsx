'use client'

import { DataProvider } from '@/contexts/DataContext'
import type { WithChildren } from '@/types'

export function Providers({ children }: WithChildren) {
  return (
    <DataProvider>
      {children}
    </DataProvider>
  )
}
