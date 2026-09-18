import { createElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { SchuelerBerichtPDFProps } from "@/components/berichte/SchuelerBerichtPDF";
import type { BerichtIcons } from "@/types/domain";
import { DEFAULT_BERICHT_ICONS } from "@/types/domain";
import {
  resolveBerichtIcons,
  type ResolvedBerichtIcons,
} from "@/lib/berichtIcons";
import { saveBlobToDisk } from "@/lib/tauriFile";

// Die `*WithResolved`-Varianten nehmen bereits gerasterte Icons entgegen,
// damit downloadBerichte für einen ganzen Stapel nur einmal rastern muss statt
// einmal pro Schüler/in. Die exportierten Funktionen darunter erledigen das
// Auflösen selbst und bleiben für Einzelaufrufe bequem.
const renderSingle = async (
  props: SchuelerBerichtPDFProps,
  statusIcons: ResolvedBerichtIcons,
): Promise<Blob> => {
  const [{ pdf }, { SchuelerBerichtPDF }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/berichte/SchuelerBerichtPDF"),
  ]);
  const el = createElement(SchuelerBerichtPDF, {
    ...props,
    statusIcons,
  }) as unknown as ReactElement<DocumentProps>;
  return pdf(el).toBlob();
};

const renderCombined = async (
  berichte: SchuelerBerichtPDFProps[],
  statusIcons: ResolvedBerichtIcons,
): Promise<Blob> => {
  const [{ pdf }, { GesamtBerichtPDF }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/berichte/SchuelerBerichtPDF"),
  ]);
  const el = createElement(GesamtBerichtPDF, {
    berichte,
    statusIcons,
  }) as unknown as ReactElement<DocumentProps>;
  return pdf(el).toBlob();
};

export const generatePdfBlob = async (
  props: SchuelerBerichtPDFProps,
  icons: BerichtIcons = DEFAULT_BERICHT_ICONS,
): Promise<Blob> => renderSingle(props, await resolveBerichtIcons(icons));

// Ein einzelnes PDF mit allen übergebenen Berichten, je Schüler/in eigene Seite(n).
export const generateCombinedPdfBlob = async (
  berichte: SchuelerBerichtPDFProps[],
  icons: BerichtIcons = DEFAULT_BERICHT_ICONS,
): Promise<Blob> => renderCombined(berichte, await resolveBerichtIcons(icons));

// Unterordner für die Einzel-PDFs im ZIP, wenn ein Gesamt-PDF mitgeliefert wird.
const EINZELBERICHTE_FOLDER = "Einzelberichte";

export const downloadZip = async (
  entries: Array<{ filename: string; blob: Blob }>,
  zipName: string,
  combined?: { filename: string; blob: Blob },
): Promise<string | null> => {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  if (combined) {
    // Gesamt-PDF sichtbar auf oberster Ebene, Einzel-PDFs sauber in einem Unterordner.
    zip.file(combined.filename, combined.blob);
    const folder = zip.folder(EINZELBERICHTE_FOLDER)!;
    for (const { filename, blob } of entries) {
      folder.file(filename, blob);
    }
  } else {
    for (const { filename, blob } of entries) {
      zip.file(filename, blob);
    }
  }
  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
  });
  return triggerDownload(zipBlob, zipName);
};

// Gibt den gewählten Zielpfad zurück bzw. null, wenn der Speichern-Dialog
// abgebrochen wurde — Aufrufer sollen einen Abbruch nicht als Erfolg werten.
export const triggerDownload = async (
  blob: Blob,
  filename: string,
): Promise<string | null> => {
  const extension = filename.includes(".")
    ? filename.split(".").pop()
    : undefined;
  return saveBlobToDisk(
    blob,
    filename,
    extension
      ? [{ name: extension.toUpperCase(), extensions: [extension] }]
      : undefined,
  );
};

// Entfernt Pfad-/Sonderzeichen aus Namensbestandteilen (Schüler- und
// Themennamen sind Freitext) und ersetzt Whitespace durch Unterstriche.
export const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[\\/:*?"<>|]/g, "")
    .trim()
    .replace(/\s+/g, "_");
};

/**
 * Erzeugt alle Berichts-PDFs und lädt sie in genau einem Speichern-Dialog
 * herunter: bei einer/einem Schüler/in das einzelne PDF direkt, sonst ein ZIP
 * mit dem Gesamt-PDF zuoberst und den Einzel-PDFs in Einzelberichte/.
 */
export const downloadBerichte = async (
  berichte: Array<{ filename: string; props: SchuelerBerichtPDFProps }>,
  zipName: string,
  combinedFilename: string,
  icons: BerichtIcons = DEFAULT_BERICHT_ICONS,
): Promise<void> => {
  if (berichte.length === 0) return;
  // Einmal rastern für den ganzen Stapel; die Data-URLs leben nur bis zum Ende
  // dieser Funktion und werden nirgends gespeichert.
  const statusIcons = await resolveBerichtIcons(icons);
  // Bei einer/einem Schüler/in wäre das Gesamt-PDF eine Kopie des
  // Einzelberichts — dann lohnt sich weder der Umweg über ein ZIP noch die
  // zweite Rendering-Runde.
  const withCombined = berichte.length > 1;
  const [entries, combinedBlob] = await Promise.all([
    Promise.all(
      berichte.map(async ({ filename, props }) => ({
        filename,
        blob: await renderSingle(props, statusIcons),
      })),
    ),
    withCombined
      ? renderCombined(berichte.map(({ props }) => props), statusIcons)
      : null,
  ]);
  if (!combinedBlob) {
    await triggerDownload(entries[0].blob, entries[0].filename);
    return;
  }
  await downloadZip(entries, zipName, {
    filename: combinedFilename,
    blob: combinedBlob,
  });
};
