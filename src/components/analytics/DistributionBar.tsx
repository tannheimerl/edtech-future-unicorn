'use client'

import { ProgressBar } from '@/components/shared/ProgressBar'

// Verteilung der Schüler:innen auf die drei Leistungsbänder.
export const DistributionBar = ({
  excellent, progressing, struggling, total,
}: {
  excellent: number; progressing: number; struggling: number; total: number
}) => {
  if (total === 0) return null
  return (
    <ProgressBar
      size="lg"
      rounded={false}
      segments={[
        { value: excellent, className: 'bg-status-reached', label: <span className="text-white text-4xs font-bold tabular-nums">{excellent}</span> },
        { value: progressing, className: 'bg-status-partial', label: <span className="text-white text-4xs font-bold tabular-nums">{progressing}</span> },
        { value: struggling, className: 'bg-status-not-reached', label: <span className="text-white text-4xs font-bold tabular-nums">{struggling}</span> },
      ]}
      legend={[
        { label: `${excellent} sehr gut (≥75%)`, className: 'bg-status-reached' },
        { label: `${progressing} im Aufbau (25–74%)`, className: 'bg-status-partial' },
        { label: <>{struggling} Förderbedarf (&lt;25%)</>, className: 'bg-status-not-reached' },
      ]}
    />
  )
}
