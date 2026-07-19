'use client'

import { useEffect } from 'react'
import { checkForUpdate } from '@/lib/updater'

export const UpdateChecker = () => {
  useEffect(() => {
    void checkForUpdate()
  }, [])

  return null
}
