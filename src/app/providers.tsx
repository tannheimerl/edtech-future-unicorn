'use client'

import { useEffect, useState } from 'react'
import { DataProvider } from '@/contexts/DataContext'
import { UpdateChecker } from '@/components/shared/UpdateChecker'
import { FirstRunDbSetup } from '@/components/shared/FirstRunDbSetup'
import { isDbConfigured } from '@/lib/db-settings'
import type { WithChildren } from '@/types'

export const Providers = ({ children }: WithChildren) => {
  const [configured, setConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    // On failure fall back to the setup dialog — staying at `null` would
    // render an empty window with no explanation and no way forward.
    isDbConfigured()
      .then(setConfigured)
      .catch(() => setConfigured(false))
  }, [])

  if (configured === null) return null

  if (!configured) {
    return <FirstRunDbSetup onConfigured={() => setConfigured(true)} />
  }

  return (
    <DataProvider>
      <UpdateChecker />
      {children}
    </DataProvider>
  )
}
