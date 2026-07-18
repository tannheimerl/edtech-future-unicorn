import { mkdir, writeFile, remove, exists, BaseDirectory } from '@tauri-apps/plugin-fs'
import { appDataDir, join } from '@tauri-apps/api/path'
import { convertFileSrc } from '@tauri-apps/api/core'

// Local file references are stored as `local-file://<absolute-path>` so the UI
// can tell them apart from any (legacy) http(s) URL and re-derive both the
// displayable asset:// src and the on-disk path for deletion.
const LOCAL_FILE_PREFIX = 'local-file://'

export const isLocalFileRef = (url: string) => url.startsWith(LOCAL_FILE_PREFIX)

export const toDisplaySrc = (url: string): string => {
  if (!isLocalFileRef(url)) return url
  const path = decodeURIComponent(url.slice(LOCAL_FILE_PREFIX.length))
  return convertFileSrc(path)
}

export const uploadPruefungAnhang = async (
  pruefungId: string,
  schuelerId: string,
  file: File,
): Promise<string> => {
  const ext = file.name.split('.').pop() ?? 'bin'
  const relDir = `lezio-anhaenge/${pruefungId}/${schuelerId}`
  await mkdir(relDir, { baseDir: BaseDirectory.AppData, recursive: true })

  const fileName = `${crypto.randomUUID()}.${ext}`
  const relPath = `${relDir}/${fileName}`
  const bytes = new Uint8Array(await file.arrayBuffer())
  await writeFile(relPath, bytes, { baseDir: BaseDirectory.AppData })

  const dataDir = await appDataDir()
  const absPath = await join(dataDir, relPath)
  return `${LOCAL_FILE_PREFIX}${encodeURIComponent(absPath)}`
}

export const deletePruefungAnhang = async (url: string): Promise<void> => {
  if (!isLocalFileRef(url)) return
  const path = decodeURIComponent(url.slice(LOCAL_FILE_PREFIX.length))
  if (await exists(path)) await remove(path)
}
