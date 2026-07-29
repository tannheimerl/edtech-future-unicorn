"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { IconLink } from "@/components/ui/icon-link";
import { useData } from "@/contexts/DataContext";
import { KlasseKpis } from "@/components/analytics/KlasseKpis";
import { BeurteilungTab } from "@/components/beurteilung/BeurteilungTab";
import { BerichteTab } from "@/components/berichte/BerichteTab";
import {
  KlasseTabBar,
  type KlasseTab,
} from "@/components/klassen/KlasseTabBar";
import { SchuelerFormModal } from "@/components/klassen/SchuelerFormModal";
import { SchuelerBearbeitenModal } from "@/components/klassen/SchuelerBearbeitenModal";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableSortHeader,
  TableEmpty,
} from "@/components/ui/table";
import { InputModal } from "@/components/shared/InputModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { Highlight } from "@/components/shared/Highlight";
import { SearchBar } from "@/components/shared/SearchBar";
import { GefahrenzoneSettings } from "@/components/einstellungen/GefahrenzoneSettings";
import { cn, getFachColor } from "@/lib/utils";
import { competencyPct } from "@/lib/student-kpis";

// ── Page ──────────────────────────────────────────────────────────────────

const KlasseDetailPage = () => {
  const searchParams = useSearchParams();
  const klassId = searchParams.get("klassId") ?? "";
  const router = useRouter();
  const {
    getClass,
    updateClass,
    deleteClass,
    getStudentsForClass,
    createStudent,
    updateStudent,
    deleteStudent,
    faecher,
    lernkontrollen,
    lernziele,
    competencies,
    setRilzFach,
    setBvsa,
  } = useData();

  const klasse = getClass(klassId);
  const students = getStudentsForClass(klassId);

  const [tab, setTab] = useState<KlasseTab>("schueler");
  const [editingName, setEditingName] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");
  const [sortCol, setSortCol] = useState<"vorname" | "nachname" | "progress">(
    "vorname",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [editStudentId, setEditStudentId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const handleSortCol = (col: "vorname" | "nachname" | "progress") => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const sortedStudents = [...students]
    .filter(
      (s) =>
        !adminSearch.trim() ||
        (s.vorname + " " + s.nachname)
          .toLowerCase()
          .includes(adminSearch.trim().toLowerCase()),
    )
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortCol === "vorname")
        return dir * a.vorname.localeCompare(b.vorname, "de");
      if (sortCol === "nachname")
        return dir * a.nachname.localeCompare(b.nachname, "de");
      return (
        dir * (competencyPct(a, competencies) - competencyPct(b, competencies))
      );
    });

  if (!klasse) {
    return (
      <div className="page-container py-8 text-muted-foreground text-sm">
        Klasse nicht gefunden.{" "}
        <IconLink href="/klassen">Zur Übersicht</IconLink>
      </div>
    );
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
      {tab === "schueler" && (
        <>
          {students.length === 0 && (
            <EmptyState
              icon={
                <Icon
                  name="person"
                  size={24}
                  className="text-accent-foreground"
                />
              }
              title="Noch keine Schüler"
              description="Füge Schüler zu dieser Klasse hinzu."
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  Ersten Schüler hinzufügen
                </Button>
              }
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
                  <Button
                    className="h-auto"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Icon name="add" size={16} />
                    Neuer Schüler
                  </Button>
                }
              />

              {/* Admin table */}
              <Table>
                <TableHeader>
                  <TableSortHeader
                    active={sortCol === "vorname"}
                    direction={sortDir}
                    onClick={() => handleSortCol("vorname")}
                    className="w-24"
                  >
                    Vorname
                  </TableSortHeader>
                  <TableSortHeader
                    active={sortCol === "nachname"}
                    direction={sortDir}
                    onClick={() => handleSortCol("nachname")}
                    className="w-24"
                  >
                    Nachname
                  </TableSortHeader>
                  <TableHead className="w-full">Kategorie</TableHead>
                  <TableHead className="w-20" />
                </TableHeader>

                <TableBody>
                  {sortedStudents.length === 0 && (
                    <TableEmpty colSpan={6}>
                      Keine Schüler gefunden für „{adminSearch}"
                    </TableEmpty>
                  )}
                  {sortedStudents.map((student) => {
                    return (
                      <TableRow key={student.id}>
                        {/* Vorname */}
                        <TableCell>
                          <span className="font-medium truncate block">
                            <Highlight
                              text={student.vorname}
                              query={adminSearch}
                            />
                          </span>
                        </TableCell>

                        {/* Nachname */}
                        <TableCell>
                          <span className="text-muted-foreground truncate block">
                            <Highlight
                              text={student.nachname}
                              query={adminSearch}
                            />
                          </span>
                        </TableCell>

                        {/* Kategorie */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                            {(() => {
                              const badges: {
                                key: string;
                                node: React.ReactNode;
                              }[] = [];
                              if (student.bvsa)
                                badges.push({
                                  key: "bvsa",
                                  node: (
                                    <Badge
                                      variant="bvsa"
                                      className="font-semibold"
                                    >
                                      bVSA
                                    </Badge>
                                  ),
                                });
                              for (const fachId of student.rilzFachIds ?? []) {
                                const fach = faecher.find(
                                  (f) => f.id === fachId,
                                );
                                if (fach) {
                                  const fc = getFachColor(
                                    fach.id,
                                    faecher.map((f) => f.id),
                                    fach.colorIndex,
                                  );
                                  badges.push({
                                    key: fachId,
                                    node: (
                                      <span
                                        className={cn(
                                          "rounded px-1.5 py-0.5 text-xs font-semibold shrink-0",
                                          fc.bg,
                                          fc.text,
                                        )}
                                      >
                                        RILZ {fach.name}
                                      </span>
                                    ),
                                  });
                                }
                              }
                              if (badges.length === 0) return null;
                              return (
                                <>
                                  {badges.map((b) => (
                                    <span key={b.key} className="contents">
                                      {b.node}
                                    </span>
                                  ))}
                                </>
                              );
                            })()}
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditStudentId(student.id);
                              }}
                              aria-label="Schüler bearbeiten"
                            >
                              <Icon name="edit" size={16} />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </>
          )}
        </>
      )}

      {/* Beurteilung tab */}
      {tab === "beurteilung" && (
        <div className="space-y-4">
          <KlasseKpis
            klassId={klassId}
            students={students}
            themen={lernkontrollen}
            lernziele={lernziele}
          />
          <BeurteilungTab klassId={klassId} />
        </div>
      )}

      {/* Berichte tab */}
      {tab === "berichte" && <BerichteTab klassId={klassId} />}

      {/* Einstellungen tab */}
      {tab === "einstellungen" && (
        <GefahrenzoneSettings
          klassName={klasse.name}
          onDelete={() => {
            deleteClass(klassId);
            router.push("/klassen");
          }}
        />
      )}

      {/* Modals */}
      <SchuelerBearbeitenModal
        open={editStudentId !== null}
        onOpenChange={(v) => {
          if (!v) setEditStudentId(null);
        }}
        studentId={editStudentId}
        students={students}
        faecher={faecher}
        setRilzFach={setRilzFach}
        setBvsa={setBvsa}
        updateStudent={updateStudent}
        deleteStudent={(id) => {
          deleteStudent(id);
          setEditStudentId(null);
        }}
      />
      <SchuelerFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        faecher={faecher}
        onSubmit={(vorname, nachname, patch) =>
          createStudent(klassId, vorname, nachname, patch)
        }
      />
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <KlasseDetailPage />
    </Suspense>
  );
}
