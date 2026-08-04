"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { KlasseFormModal } from "@/components/klassen/KlasseFormModal";

// ── Page ──────────────────────────────────────────────────────────────────

const KlassenPage = () => {
  const router = useRouter();
  const {
    classes,
    getStudentsForClass,
    createClass,
    loadError,
    reloadData,
  } = useData();
  const myClasses = classes
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "de", { numeric: true }));
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1>Deine Klassen</h1>
        {myClasses.length > 0 && (
          <Button variant="secondary" onClick={() => setCreateOpen(true)}>
            <Icon name="add" size={16} />
            Klasse erstellen
          </Button>
        )}
      </div>

      {/* Empty / load-error state */}
      {myClasses.length === 0 && (
        <div>
          {loadError ? (
            <EmptyState
              size="lg"
              icon={
                <Icon
                  name="cloud_off"
                  size={24}
                  className="text-accent-foreground"
                />
              }
              title="Daten konnten nicht geladen werden"
              description="Die lokale Datenbank konnte nicht geöffnet werden. Prüfe den Speicherort unter Einstellungen › Datenbank."
              action={
                <Button variant="secondary" onClick={() => reloadData()}>
                  Erneut laden
                </Button>
              }
            />
          ) : (
            <EmptyState
              size="lg"
              icon={
                <Icon
                  name="group"
                  size={24}
                  className="text-accent-foreground"
                />
              }
              title="Noch keine Klassen angelegt"
              description="Erstelle deine erste Klasse und füge Schüler hinzu."
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  Erste Klasse erstellen
                </Button>
              }
            />
          )}
        </div>
      )}

      {/* Class list */}
      <div className="space-y-4">
        {myClasses.map((klasse) => {
          const students = getStudentsForClass(klasse.id);

          return (
            <div
              key={klasse.id}
              className="group cursor-pointer rounded-2xl border border-border bg-card p-3 transition-all duration-150 hover:shadow-md"
              onClick={() =>
                router.push(`/klassen/detail?klassId=${klasse.id}`)
              }
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2 flex-col">
                  <h4>{klasse.name}</h4>
                  <span>{students.length} SchülerInnen</span>
                </div>

                {/* Actions */}
                <Icon name="chevron_right" size={24} className="text-primary" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Create modal */}
      <KlasseFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(name) => {
          const id = createClass(name);
          router.push(`/klassen/detail?klassId=${id}`);
        }}
      />
    </div>
  );
};

export default KlassenPage;
