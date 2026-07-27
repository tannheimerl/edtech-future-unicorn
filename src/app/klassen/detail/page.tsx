'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Icon } from "@/components/ui/Icon"
import { useData } from '@/contexts/DataContext'
import { ClassAnalytics } from '@/components/analytics/ClassAnalytics'
import { BeurteilungTab } from '@/components/beurteilung/BeurteilungTab'
import { BerichteTab } from '@/components/berichte/BerichteTab'
import { LernzieleTab } from '@/components/klassen/LernzieleTab'
import { KlasseTabBar, type KlasseTab } from '@/components/klassen/KlasseTabBar'
import { SchuelerFormModal } from '@/components/klassen/SchuelerFormModal'
import { SchuelerBearbeitenModal } from '@/components/klassen/SchuelerBearbeitenModal'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableSortHeader, TableEmpty } from '@/components/ui/table'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { InputModal } from '@/components/shared/InputModal'
import { EmptyState } from '@/components/shared/EmptyState'
import { SearchBar } from '@/components/shared/SearchBar'
import { GefahrenzoneSettings } from '@/components/einstellungen/GefahrenzoneSettings'
import { cn, getFachColor, scoreColor, scoreBarColor } from '@/lib/utils'
import { getInitials, getAvatarColor } from '@/lib/avatar-utils'
import { competencyPct } from '@/lib/student-kpis'

// ── Page ──────────────────────────────────────────────────────────────────

const KlasseDetailPage = () => {
  const searchParams = useSearchParams()
  const klassId = searchParams.get('klassId') ?? ''
  const router = useRouter()
  const {
    getClass,
    updateClass,
    deleteClass,
    getStudentsForClass,
    createStudent,
    updateStudent,
    deleteStudent,
    faecher,
    lernziele,
    competencies,
    getThemenForKlasse,
    setRilzFach,
    setBvsa,
  } = useData()

  const klasse = getClass(klassId)
  const students = getStudentsForClass(klassId)
  const assignedThemen = getThemenForKlasse(klassId)

  const [tab, setTab] = useState<KlasseTab>('schueler')
  const [editingName, setEditingName] = useState(false)
  const [adminSearch, setAdminSearch] = useState('')
  const [sortCol, setSortCol] = useState<'vorname' | 'nachname' | 'progress'>('vorname')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [editStudentId, setEditStudentId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const handleSortCol = (col: 'vorname' | 'nachname' | 'progress') => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const sortedStudents = [...students]
    .filter(s => !adminSearch.trim() || (s.vorname + ' ' + s.nachname).toLowerCase().includes(adminSearch.trim().toLowerCase()))
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortCol === 'vorname') return dir * a.vorname.localeCompare(b.vorname, 'de')
      if (sortCol === 'nachname') return dir * a.nachname.localeCompare(b.nachname, 'de')
      return dir * (competencyPct(a, competencies) - competencyPct(b, competencies))
    })

  if (!klasse) {
    return (
      <div className="page-container py-8 text-muted-foreground text-sm">
        Klasse nicht gefunden.{' '}
        <Button variant="secondary" className="h-auto border-transparent bg-transparent p-0" onClick={() => router.push('/klassen')}>Zur Übersicht</Button>
      </div>
    )
  }

  return (
    <div className="page-container py-3">
      <div>
        <KlasseTabBar
          active={tab}
          onChange={setTab}
          title={klasse.name}
          onEditTitle={() => setEditingName(true)}
        />

        <InputModal
          open={editingName}
          onOpenChange={setEditingName}
          title="Klasse umbenennen"
          label="Klassenname"
          placeholder="z. B. 205"
          initialValue={klasse.name}
          submitLabel="Speichern"
          onSubmit={(name) => updateClass(klassId, name)}
        />
      </div>

      {/* Schüler tab */}
      {tab === 'schueler' && (
        <>
          {students.length === 0 && (
            <EmptyState
              icon={<Icon name="person" size={24} className="text-accent-foreground" />}
              title="Noch keine Schüler"
              description="Füge Schüler zu dieser Klasse hinzu."
              action={<Button onClick={() => setCreateOpen(true)}>Ersten Schüler hinzufügen</Button>}
            />
          )}
          {students.length > 0 && (
            <>
              {/* Toolbar */}
              <SearchBar
                value={adminSearch}
                onChange={setAdminSearch}
                placeholder="Schüler suchen …"
                className="mb-2"
                right={
                  <Button className="h-auto" onClick={() => setCreateOpen(true)}>
                    <Icon name="add" size={14} />
                    Neuer Schüler
                  </Button>
                }
              />

              {/* Admin table */}
              <Table>
                <TableHeader>
                  <TableHead className="w-7 pr-0" />
                  <TableSortHeader
                    active={sortCol === 'vorname'}
                    direction={sortDir}
                    onClick={() => handleSortCol('vorname')}
                    className="w-24"
                  >
                    Vorname
                  </TableSortHeader>
                  <TableSortHeader
                    active={sortCol === 'nachname'}
                    direction={sortDir}
                    onClick={() => handleSortCol('nachname')}
                    className="w-24"
                  >
                    Nachname
                  </TableSortHeader>
                  <TableHead className="w-full">Kategorie</TableHead>
                  <TableSortHeader
                    active={sortCol === 'progress'}
                    direction={sortDir}
                    onClick={() => handleSortCol('progress')}
                    className="w-28"
                  >
                    Fortschritt
                  </TableSortHeader>
                  <TableHead className="w-20" />
                </TableHeader>

                <TableBody>
                  {sortedStudents.length === 0 && (
                    <TableEmpty colSpan={6}>
                      Keine Schüler gefunden für „{adminSearch}"
                    </TableEmpty>
                  )}
                  {sortedStudents.map(student => {
                    const cp = competencyPct(student, competencies)
                    const pctColor = scoreColor(cp)
                    const barColor = scoreBarColor(cp)
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="pr-0">
                          <Avatar size="sm" className="shrink-0">
                            <AvatarFallback className={cn('text-xs', getAvatarColor(student.vorname + ' ' + student.nachname))}>
                              {getInitials(student.vorname + ' ' + student.nachname)}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>

                        {/* Vorname */}
                        <TableCell>
                          <span className="text-sm font-medium truncate block">{student.vorname}</span>
                        </TableCell>

                        {/* Nachname */}
                        <TableCell>
                          <span className="text-sm text-muted-foreground truncate block">{student.nachname}</span>
                        </TableCell>

                        {/* Kategorie */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                            {(() => {
                              const badges: { key: string; node: React.ReactNode }[] = []
                              if (student.bvsa) badges.push({ key: 'bvsa', node: <Badge variant="bvsa" className="font-semibold">bVSA</Badge> })
                              for (const fachId of student.rilzFachIds ?? []) {
                                const fach = faecher.find(f => f.id === fachId)
                                if (fach) {
                                  const fc = getFachColor(fach.id, faecher.map(f => f.id), fach.colorIndex)
                                  badges.push({ key: fachId, node: <span className={cn('rounded px-1.5 py-0.5 text-3xs font-semibold shrink-0', fc.bg, fc.text)}>RILZ {fach.name}</span> })
                                }
                              }
                              if (badges.length === 0) return null
                              const MAX = 4
                              const overflow = badges.length - MAX
                              return (
                                <>
                                  {badges.slice(0, MAX).map(b => <span key={b.key} className="contents">{b.node}</span>)}
                                  {overflow > 0 && (
                                    <Badge className="font-semibold">+{overflow}</Badge>
                                  )}
                                </>
                              )
                            })()}
                          </div>
                        </TableCell>

                        {/* Mini progress bar */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {competencies.length > 0 ? (
                              <>
                                <div className="flex-1">
                                  <ProgressBar segments={[{ value: cp, className: barColor }]} total={100} size="xs" />
                                </div>
                                <span className={cn('text-3xs font-semibold tabular-nums w-6 text-right shrink-0', pctColor)}>
                                  {Math.round(cp)}%
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="secondary"
                              size="icon-sm"
                              onClick={(e) => { e.stopPropagation(); setEditStudentId(student.id) }}
                              aria-label="Schüler bearbeiten"
                            >
                              <Icon name="edit" size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </>
          )}
        </>
      )}

      {/* Beurteilung tab */}
      {tab === 'beurteilung' && (
        <BeurteilungTab klassId={klassId} />
      )}

      {/* Klassenübersicht tab */}
      {tab === 'klassenübersicht' && (
        <div>
          <ClassAnalytics
            klassId={klassId}
            students={students}
            themen={assignedThemen}
            lernziele={lernziele}
            faecher={faecher}
          />
        </div>
      )}

      {/* Lernziele tab */}
      {tab === 'lernziele' && (
        <LernzieleTab klassId={klassId} />
      )}

      {/* Berichte tab */}
      {tab === 'berichte' && (
        <BerichteTab klassId={klassId} />
      )}

      {/* Einstellungen tab */}
      {tab === 'einstellungen' && (
        <GefahrenzoneSettings
          klassName={klasse.name}
          onDelete={() => { deleteClass(klassId); router.push('/klassen') }}
        />
      )}

      {/* Modals */}
      <SchuelerBearbeitenModal
        open={editStudentId !== null}
        onOpenChange={(v) => { if (!v) setEditStudentId(null) }}
        studentId={editStudentId}
        students={students}
        faecher={faecher}
        setRilzFach={setRilzFach}
        setBvsa={setBvsa}
        updateStudent={updateStudent}
        deleteStudent={(id) => { deleteStudent(id); setEditStudentId(null) }}
      />
      <SchuelerFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(vorname, nachname) => createStudent(klassId, vorname, nachname)}
      />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <KlasseDetailPage />
    </Suspense>
  )
}
