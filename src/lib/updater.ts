import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { ask } from '@tauri-apps/plugin-dialog'
import { toast } from '@/lib/toast'

// Runs once on app start. Logs every step so a failed/errored check is
// visible in devtools instead of silently looking like "no update".
export const checkForUpdate = async (): Promise<void> => {
  let update
  try {
    console.log('[updater] checking for update...')
    update = await check()
  } catch (error) {
    console.error('[updater] check failed', error)
    return
  }

  if (!update) {
    console.log('[updater] no update available')
    return
  }

  console.log(
    `[updater] update available: ${update.version} (current: ${update.currentVersion})`
  )

  try {
    const shouldInstall = await ask(
      `Version ${update.version} ist verfügbar. Jetzt installieren und neu starten?`,
      { title: 'Update verfügbar', kind: 'info' }
    )
    if (!shouldInstall) {
      console.log('[updater] update declined by user')
      return
    }

    let downloaded = 0
    let contentLength = 0
    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started':
          contentLength = event.data.contentLength ?? 0
          console.log(`[updater] download started (${contentLength} bytes)`)
          break
        case 'Progress':
          downloaded += event.data.chunkLength
          console.log(`[updater] downloaded ${downloaded}/${contentLength}`)
          break
        case 'Finished':
          console.log('[updater] download finished')
          break
      }
    })
    console.log('[updater] update installed, relaunching')
    await relaunch()
  } catch (error) {
    console.error('[updater] download/install failed', error)
    toast.error('Update konnte nicht installiert werden.')
  }
}
