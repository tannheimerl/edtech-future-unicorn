import { invoke } from '@tauri-apps/api/core'
import { save } from '@tauri-apps/plugin-dialog'

// Browser-style blob-URL + `<a download>` clicks are a no-op in Tauri's
// webview (no download manager to intercept them). Saving a file here means
// asking the user where via a native dialog, then writing the bytes through
// a Rust command — the JS-side `writeFile` from `@tauri-apps/plugin-fs` is
// scoped to $APPDATA/** and can't reach a user-chosen destination.
export const saveBlobToDisk = async (
  blob: Blob,
  defaultPath: string,
  filters?: Array<{ name: string; extensions: string[] }>
): Promise<string | null> => {
  const target = await save({ defaultPath, filters })
  if (!target) return null
  const bytes = Array.from(new Uint8Array(await blob.arrayBuffer()))
  await invoke('write_binary_file', { path: target, data: bytes })
  return target
}
