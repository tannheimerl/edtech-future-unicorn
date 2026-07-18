'use client'

// ── Layout constants — kompakt für Überblick ────────────────────────────────

const PAD = { top: 12, right: 6, bottom: 16, left: 6 }
const W = 240
const H = 88
const innerW = W - PAD.left - PAD.right
const innerH = H - PAD.top - PAD.bottom

type DistributionBucket = {
  x: number
  count: number
}

type DistributionBarsProps = {
  buckets: DistributionBucket[] // one bucket per axis value, count 0 allowed
  domainMin: number
  domainMax: number
  ticks: number[] // x-axis label positions
  formatTick?: (v: number) => string
  ariaLabel?: string
}

export const DistributionBars = ({
  buckets,
  domainMin,
  domainMax,
  ticks,
  formatTick = String,
  ariaLabel,
}: DistributionBarsProps) => {
  const maxCount = Math.max(1, ...buckets.map(b => b.count))
  const hasData = buckets.some(b => b.count > 0)

  if (!hasData) {
    return (
      <p className="py-5 text-center text-xs text-muted-foreground">
        Noch keine Bewertungen.
      </p>
    )
  }

  const span = domainMax - domainMin || 1
  const xPos = (v: number) => PAD.left + ((v - domainMin) / span) * innerW
  const baselineY = PAD.top + innerH

  // Balkenbreite aus dem Bucket-Abstand (ein kleiner Spalt dazwischen)
  const slot = innerW / Math.max(1, buckets.length)
  const barW = Math.max(2, slot * 0.7)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={ariaLabel}>
      {/* Grundlinie */}
      <line x1={PAD.left} y1={baselineY} x2={W - PAD.right} y2={baselineY} stroke="currentColor" strokeOpacity={0.12} />

      {/* Balken — Modus (höchster) hervorgehoben */}
      {buckets.map(b => {
        if (b.count === 0) return null
        const h = (b.count / maxCount) * innerH
        const cx = xPos(b.x)
        const isMode = b.count === maxCount
        return (
          <g key={b.x}>
            <rect
              x={cx - barW / 2}
              y={baselineY - h}
              width={barW}
              height={h}
              rx={1}
              fill="var(--primary)"
              fillOpacity={isMode ? 1 : 0.3}
            />
            {isMode && (
              <text
                x={cx} y={baselineY - h - 2}
                textAnchor="middle"
                fontSize={8} fill="currentColor" fillOpacity={0.6}
                className="font-bold"
              >
                {b.count}
              </text>
            )}
          </g>
        )
      })}

      {/* X-Achsen-Ticks */}
      {ticks.map(t => (
        <text
          key={t}
          x={xPos(t)} y={H - 4}
          textAnchor="middle"
          fontSize={8} fill="currentColor" fillOpacity={0.45}
        >
          {formatTick(t)}
        </text>
      ))}
    </svg>
  )
}
