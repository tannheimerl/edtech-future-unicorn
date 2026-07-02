'use client'

import { DataProvider } from '@/contexts/DataContext'
import type { WithChildren } from '@/types'

export const Providers = ({ children }: WithChildren) => {
  return (
    <DataProvider>
      {children}
    </DataProvider>
  )
}
