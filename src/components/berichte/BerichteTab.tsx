"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { BerichtFlow } from "@/components/berichte/BerichtFlow";
import { generateBerichtWordTemplateBlob } from "@/lib/berichtWordTemplate";
import { triggerDownload } from "@/lib/berichtUtils";
import { useData } from "@/contexts/DataContext";

export const BerichteTab = ({ klassId }: { klassId: string }) => {
  const { berichtIcons } = useData();
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);

  const handleWordTemplateDownload = async () => {
    setIsGeneratingTemplate(true);
    try {
      const blob = await generateBerichtWordTemplateBlob(berichtIcons);
      triggerDownload(blob, "Bericht_Vorlage.docx");
    } finally {
      setIsGeneratingTemplate(false);
    }
  };

  return (
    <div className="space-y-2 max-w-2xl">
      <p className="text-sm text-muted-foreground pb-1">
        Wähle Lernkontrolle, Lernziele und Schüler:innen — dann kannst du
        individuelle Berichte herunterladen.
      </p>
      <Button
        variant="secondary"
        onClick={handleWordTemplateDownload}
        disabled={isGeneratingTemplate}
        className="gap-2 px-4 py-1.5"
      >
        <Icon
          name={isGeneratingTemplate ? "progress_activity" : "description"}
          size={16}
          className={isGeneratingTemplate ? "animate-spin" : undefined}
        />
        {isGeneratingTemplate ? "Wird erstellt…" : "Word-Vorlage herunterladen"}
      </Button>
      <BerichtFlow klassId={klassId} />
    </div>
  );
};
