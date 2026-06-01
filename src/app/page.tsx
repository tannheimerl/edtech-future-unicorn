'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GraduationCap, Users, Target, BookOpen, ArrowRight } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { Card, CardContent } from '@/components/ui/card'
import type { Status } from '@/types/domain'

function ClassProgressBar({ klassId }: { klassId: string }) {
  const { getStudentsForClass, competencies } = useData()
  const students = getStudentsForClass(klassId)

  if (students.length === 0) {
    return <div className="h-1 w-full rounded-full bg-muted" />
  }

  const all: Status[] = students.flatMap((s) =>
    competencies.map((c) => s.competencyStatus[c.id] ?? 'not_reached')
  )
  const total = all.length
  const reached = all.filter((s) => s === 'reached').length
  const partial = all.filter((s) => s === 'partially_reached').length

  return (
    <div className="flex h-1 w-full overflow-hidden rounded-full bg-status-not-reached/15">
      <div className="bg-status-reached transition-all" style={{ width: `${(reached / total) * 100}%` }} />
      <div className="bg-status-partial transition-all" style={{ width: `${(partial / total) * 100}%` }} />
    </div>
  )
}

export default function OverviewPage() {
  const router = useRouter()
  const { classes, students, lernziele, faecher, getStudentsForClass } = useData()

  const stats = [
    { icon: GraduationCap, label: 'Klassen',   value: classes.length,   cls: 'bg-accent text-accent-foreground' },
    { icon: Users,         label: 'Schüler',   value: students.length,  cls: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
    { icon: Target,        label: 'Lernziele', value: lernziele.length, cls: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400' },
    { icon: BookOpen,      label: 'Fächer',    value: faecher.length,   cls: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' },
  ]

  const quickLinks = [
    { icon: GraduationCap, label: 'Klassen',   desc: 'Schüler & Fortschritt verwalten',      href: '/klassen',   cls: 'bg-accent text-accent-foreground' },
    { icon: Target,        label: 'Lernziele', desc: 'Fächer, Themen & Ziele strukturieren', href: '/lernziele', cls: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400' },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-4 space-y-4">

      {/* Hero */}
      <div className="py-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Willkommen, Lukas</h1>
      </div>

      {/* Stats — 4 compact chips */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, cls }) => (
          <Card key={label} className="py-1.5">
            <CardContent className="flex items-center gap-2 px-3">
              <div className={`flex size-4 shrink-0 items-center justify-center rounded-md ${cls}`}>
                <Icon className="size-2.5" />
              </div>
              <span className="text-base font-bold tabular-nums leading-none">{value}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Schnellzugriff</p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {quickLinks.map(({ icon: Icon, label, desc, href, cls }) => (
            <Card
              key={href}
              className="cursor-pointer py-1 transition-all hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => router.push(href)}
            >
              <CardContent className="flex items-center justify-between gap-3 px-3">
                <div className="flex items-center gap-2">
                  <div className={`flex size-4 shrink-0 items-center justify-center rounded-md ${cls}`}>
                    <Icon className="size-2.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
                <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Class progress */}
      {classes.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Klassenfortschritt</p>
            <Link href="/klassen" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Alle anzeigen →
            </Link>
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((klasse) => {
              const studentCount = getStudentsForClass(klasse.id).length
              return (
                <Card
                  key={klasse.id}
                  className="cursor-pointer py-1.5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  onClick={() => router.push(`/klassen/${klasse.id}`)}
                >
                  <CardContent className="space-y-1.5 px-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{klasse.name}</p>
                      <span className="text-xs text-muted-foreground">{studentCount} Schüler</span>
                    </div>
                    <ClassProgressBar klassId={klasse.id} />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
