"use client";

import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";

/**
 * Platzhalter für den Statistik-Tab der Klassendetailseite. Die Auswertungen
 * werden noch gebaut — bis dahin zeigt der Tab nur einen Hinweis.
 */
export const KlasseStatistikTab = () => (
  <EmptyState
    size="lg"
    icon={<Icon name="insights" size={24} className="text-accent-foreground" />}
    title="Statistiken sind in Arbeit"
    description="Hier entstehen Auswertungen zur Klasse, zum Lernfortschritt, zu Lernzielen und zur Entwicklung über die Zeit."
    action={
      <Badge variant="primary" className="rounded-full">
        Demnächst verfügbar
      </Badge>
    }
  />
);
