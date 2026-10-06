// Status-Icons für den Berichts-Output (PDF + Word-Vorlage).
//
// Gespeichert wird pro Status nur eine Kleinigkeit: entweder ein
// Material-Symbols-Ligaturname oder — bei einem eigenen Bild — dessen
// PNG-Data-URL (siehe dim_bericht_icons). Das für PDF/Word nötige PNG eines
// Symbols entsteht erst hier beim Rendern und wird danach wieder verworfen;
// es landet bewusst nie in der Datenbank, damit eine Änderung am Katalog oder
// an der Akzentfarbe nicht an einem veralteten Abbild vorbeiläuft.
//
// Canvas-gebunden, also nur im WebView/Browser aufrufbar — dieselbe
// Einschränkung, die die Word-Vorlage schon immer hatte.
import type { BerichtIcon, BerichtIcons, Status } from '@/types/domain'

// Palette des Berichts-Layouts. Einzige Quelle — SchuelerBerichtPDF.tsx und
// berichtWordTemplate.ts importieren von hier, statt die Hex-Werte je eigen
// zu führen.
export const BERICHT_ACCENT = '#1e3a8a'
export const BERICHT_BORDER = '#cbd5e1'

// Kuratierte Auswahl für den Icon-Picker in den Einstellungen. Es braucht
// keine Pfaddaten: die App zeigt die Namen über <Icon>, der Export rastert sie
// über den Canvas.
export const BERICHT_ICON_CATALOG: Array<{ gruppe: string; names: string[] }> = [
  {
    gruppe: 'Kreise',
    names: ['radio_button_unchecked', 'contrast', 'circle', 'radio_button_checked', 'donut_large'],
  },
  {
    gruppe: 'Haken & Kreuze',
    names: ['check', 'check_circle', 'task_alt', 'done_all', 'remove', 'close', 'cancel'],
  },
  {
    gruppe: 'Sterne',
    names: ['star', 'star_half', 'star_rate', 'grade'],
  },
  {
    gruppe: 'Smileys',
    names: ['sentiment_satisfied', 'sentiment_neutral', 'sentiment_dissatisfied'],
  },
  {
    gruppe: 'Weitere',
    names: ['thumb_up', 'thumb_down', 'trending_up', 'flag', 'bolt', 'eco'],
  },
]

const FONT_FAMILY = 'Material Symbols Outlined'
// 96px Quelle für 12pt Ausgabe — im Druck reichlich scharf.
const RENDER_SIZE = 96

/** Zeichnet die ursprünglichen Kreise nach, falls das Symbol nicht darstellbar ist. */
const drawFallbackCircle = (ctx: CanvasRenderingContext2D, status: Status, size: number) => {
  const c = size / 2
  const r = size / 2 - size * 0.08
  if (status === 'reached') {
    ctx.fillStyle = BERICHT_ACCENT
    ctx.beginPath()
    ctx.arc(c, c, r, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  ctx.strokeStyle = status === 'not_reached' ? BERICHT_BORDER : BERICHT_ACCENT
  ctx.lineWidth = size * 0.1
  ctx.beginPath()
  ctx.arc(c, c, r, 0, Math.PI * 2)
  ctx.stroke()
  if (status === 'partially_reached') {
    ctx.fillStyle = BERICHT_ACCENT
    ctx.beginPath()
    ctx.arc(c, c, r, -Math.PI / 2, Math.PI / 2)
    ctx.closePath()
    ctx.fill()
  }
}

/**
 * Rastert ein Material Symbol zu einer PNG-Data-URL.
 *
 * `status` dient nur dem Rückfall auf den passenden Kreis, wenn die Schrift
 * fehlt (offline ohne selbst gehosteten Font) oder die Ligatur nicht greift —
 * dann stünde sonst der Klartext „radio_button_unchecked“ im Bericht.
 */
const renderSymbolPng = async (name: string, status: Status, color: string): Promise<string> => {
  const canvas = document.createElement('canvas')
  canvas.width = RENDER_SIZE
  canvas.height = RENDER_SIZE
  const ctx = canvas.getContext('2d')!

  try {
    await document.fonts?.load(`400 ${RENDER_SIZE}px "${FONT_FAMILY}"`, name)
  } catch {
    // Font-Loading-API nicht verfügbar — die Breitenprüfung unten fängt das ab.
  }

  ctx.font = `${RENDER_SIZE}px "${FONT_FAMILY}"`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Greift die Ligatur, ist das Ergebnis ein einzelnes Glyph von rund einer
  // Em-Breite. Wird stattdessen der Name als Text gesetzt, ist er um ein
  // Vielfaches breiter — ein zuverlässigeres Signal als fonts.check(), das
  // auch bei geladener Schrift nichts über die Ligatur aussagt.
  if (ctx.measureText(name).width > RENDER_SIZE * 1.5) {
    drawFallbackCircle(ctx, status, RENDER_SIZE)
  } else {
    ctx.fillText(name, RENDER_SIZE / 2, RENDER_SIZE / 2)
  }

  return canvas.toDataURL('image/png')
}

/** Aufgelöste, direkt renderbare PNG-Data-URLs je Status. */
export type ResolvedBerichtIcons = Record<Status, string>

/**
 * Löst die konfigurierten Icons in PNG-Data-URLs auf, die react-pdf (<Image>)
 * und docx (ImageRun) direkt verarbeiten. Einmal pro Export aufrufen und das
 * Ergebnis durch alle Render-Durchgänge reichen.
 */
export const resolveBerichtIcons = async (
  icons: BerichtIcons,
  color: string = BERICHT_ACCENT,
): Promise<ResolvedBerichtIcons> => {
  const entries = await Promise.all(
    (Object.keys(icons) as Status[]).map(async (status) => {
      const icon = icons[status]
      const src = icon.kind === 'image'
        ? icon.dataUrl
        : await renderSymbolPng(icon.name, status, color)
      return [status, src] as const
    }),
  )
  return Object.fromEntries(entries) as ResolvedBerichtIcons
}

/** Wandelt eine PNG-Data-URL in die Bytes, die docx' ImageRun erwartet. */
export const dataUrlToBytes = (dataUrl: string): Uint8Array => {
  const binary = atob(dataUrl.split(',')[1] ?? '')
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

// Kantenlänge, auf die hochgeladene Bilder normalisiert werden. Klein genug,
// dass drei Icons die Datenbank nicht spürbar aufblähen, gross genug für
// scharfen Druck bei 12pt.
const UPLOAD_SIZE = 128
export const MAX_ICON_DATA_URL_BYTES = 256 * 1024

/**
 * Liest ein hochgeladenes Bild ein und normalisiert es auf ein quadratisches
 * PNG — unter Wahrung des Seitenverhältnisses, zentriert, mit transparentem
 * Rand. Das vereinheitlicht Format und Grösse in einem Schritt, sodass
 * downstream weder react-pdf noch docx Sonderfälle kennen müssen.
 */
export const normalizeIconImage = async (file: File): Promise<BerichtIcon> => {
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Bild konnte nicht gelesen werden.'))
    reader.readAsDataURL(file)
  })

  const img = new Image()
  img.src = source
  await img.decode()

  const canvas = document.createElement('canvas')
  canvas.width = UPLOAD_SIZE
  canvas.height = UPLOAD_SIZE
  const ctx = canvas.getContext('2d')!
  const scale = Math.min(UPLOAD_SIZE / img.naturalWidth, UPLOAD_SIZE / img.naturalHeight)
  const w = img.naturalWidth * scale
  const h = img.naturalHeight * scale
  ctx.drawImage(img, (UPLOAD_SIZE - w) / 2, (UPLOAD_SIZE - h) / 2, w, h)

  const dataUrl = canvas.toDataURL('image/png')
  if (dataUrl.length > MAX_ICON_DATA_URL_BYTES) {
    throw new Error('Das Bild ist zu gross. Bitte ein einfacheres Icon verwenden.')
  }
  return { kind: 'image', dataUrl }
}
