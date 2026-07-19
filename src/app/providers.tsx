'use client'

import { DataProvider } from '@/contexts/DataContext'
import { UpdateChecker } from '@/components/shared/UpdateChecker'
import type { WithChildren } from '@/types'

export const Providers = ({ children }: WithChildren) => {
  return (
    <DataProvider>
      <UpdateChecker />
      {children}
    </DataProvider>
  )
}
