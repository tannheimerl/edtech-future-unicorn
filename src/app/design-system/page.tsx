import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Section } from "@/components/shared/Section"
import { colors, spacing } from "@/config/tokens"

export const metadata = { title: "Design System — Edtech Future Unicorn" }

/* ─── Helpers ───────────────────────────────────────────────── */

function Token({ label, value, swatch }: { label: string; value: string; swatch?: string }) {
  return (
    <div className="flex items-center gap-3">
      {swatch && (
        <div
          className="size-5 rounded-sm border border-border flex-shrink-0"
          style={{ background: swatch }}
        />
      )}
      <div>
        <p className="text-xs font-mono text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{value}</p>
      </div>
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────────── */

export default function DesignSystemPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Design System</h1>
        <p className="mt-2 text-muted-foreground">
          Black &amp; white palette · 8px grid · shadcn/ui components
        </p>
      </div>

      {/* ── Colour ─────────────────────────────────────────────── */}
      <Section title="Colour" description="Strictly achromatic. Destructive red is the only hue.">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Black", value: colors.black },
              { label: "White", value: colors.white },
            ].map((c) => (
              <Token key={c.label} label={c.label} value={c.value} swatch={c.value} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
            {(Object.entries(colors.gray) as [string, string][]).map(([shade, val]) => (
              <div key={shade} className="space-y-1">
                <div
                  className="h-10 w-full rounded-md border border-border"
                  style={{ background: val }}
                />
                <p className="text-xs font-mono">gray-{shade}</p>
                <p className="text-xs text-muted-foreground">{val.replace("oklch(", "").replace(")", "")}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Separator />

      {/* ── Typography ─────────────────────────────────────────── */}
      <Section title="Typography" description="Geist Sans — weight 400 / 500 / 600 / 700">
        <div className="space-y-4">
          {[
            { label: "5xl · 3rem · Bold", className: "text-5xl font-bold" },
            { label: "4xl · 2.25rem · Bold", className: "text-4xl font-bold" },
            { label: "3xl · 1.875rem · Semibold", className: "text-3xl font-semibold" },
            { label: "2xl · 1.5rem · Semibold", className: "text-2xl font-semibold" },
            { label: "xl · 1.25rem · Medium", className: "text-xl font-medium" },
            { label: "lg · 1.125rem · Normal", className: "text-lg" },
            { label: "base · 1rem · Normal", className: "text-base" },
            { label: "sm · 0.875rem · Normal", className: "text-sm" },
            { label: "xs · 0.75rem · Normal", className: "text-xs" },
          ].map(({ label, className }) => (
            <div key={label} className="flex items-baseline gap-6">
              <span className="w-56 shrink-0 text-xs text-muted-foreground font-mono">{label}</span>
              <span className={className}>The quick brown fox</span>
            </div>
          ))}
        </div>
      </Section>

      <Separator />

      {/* ── Spacing ────────────────────────────────────────────── */}
      <Section title="Spacing" description="8px grid — 1 unit = 8px (--spacing: 0.5rem)">
        <div className="space-y-2">
          {(Object.entries(spacing) as [string, string][]).map(([unit, px]) => (
            <div key={unit} className="flex items-center gap-4">
              <span className="w-8 text-xs font-mono text-muted-foreground">{unit}</span>
              <span className="w-14 text-xs font-mono text-muted-foreground">{px}</span>
              <div
                className="h-4 bg-foreground rounded-sm"
                style={{ width: px === "0px" ? "1px" : px }}
              />
            </div>
          ))}
        </div>
      </Section>

      <Separator />

      {/* ── Buttons ────────────────────────────────────────────── */}
      <Section title="Buttons" description="variant × size">
        <div className="space-y-4">
          {/* Variants */}
          <div className="flex flex-wrap items-center gap-3">
            <Button>Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          {/* Sizes */}
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs">XSmall</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
          {/* Icon sizes */}
          <div className="flex flex-wrap items-center gap-3">
            <Button size="icon-xs" aria-label="icon xs">✕</Button>
            <Button size="icon-sm" aria-label="icon sm">✕</Button>
            <Button size="icon" aria-label="icon">✕</Button>
            <Button size="icon-lg" aria-label="icon lg">✕</Button>
          </div>
          {/* Disabled */}
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>Disabled outline</Button>
          </div>
        </div>
      </Section>

      <Separator />

      {/* ── Form Controls ──────────────────────────────────────── */}
      <Section title="Form controls" description="Input and Label">
        <div className="grid gap-4 max-w-sm">
          <div className="grid gap-1">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="disabled">Disabled</Label>
            <Input id="disabled" disabled placeholder="Cannot type here" />
          </div>
        </div>
      </Section>

      <Separator />

      {/* ── Badges ─────────────────────────────────────────────── */}
      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="ghost">Ghost</Badge>
        </div>
      </Section>

      <Separator />

      {/* ── Avatar ─────────────────────────────────────────────── */}
      <Section title="Avatars">
        <div className="flex items-center gap-3">
          {["AB", "CD", "EF", "GH"].map((initials) => (
            <Avatar key={initials}>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </Section>

      <Separator />

      {/* ── Card ───────────────────────────────────────────────── */}
      <Section title="Card">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Course progress</CardTitle>
              <CardDescription>Track your learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You have completed 4 of 12 modules in this course.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Continue</Button>
              <Button size="sm" variant="ghost">Pause</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>New assignment</CardTitle>
              <CardDescription>Due in 3 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-1">
                <Label htmlFor="submission">Your answer</Label>
                <Input id="submission" placeholder="Type here…" />
              </div>
            </CardContent>
            <CardFooter>
              <Button size="sm" className="w-full">Submit</Button>
            </CardFooter>
          </Card>
        </div>
      </Section>
    </div>
  )
}
