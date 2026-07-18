// Minimal pub/sub toast store — no external dependency. `toast.error/success`
// can be called from anywhere (event handlers, hooks, outside React state)
// and any mounted <Toaster /> will pick it up.

export type ToastItem = {
  id: string
  message: string
  variant: 'error' | 'success'
}

type Listener = (toasts: ToastItem[]) => void

let toasts: ToastItem[] = []
const listeners = new Set<Listener>()

const emit = () => listeners.forEach((listener) => listener(toasts))

export const subscribeToasts = (listener: Listener): (() => void) => {
  listeners.add(listener)
  listener(toasts)
  return () => { listeners.delete(listener) }
}

const push = (message: string, variant: ToastItem['variant']) => {
  const id = crypto.randomUUID()
  toasts = [...toasts, { id, message, variant }]
  emit()
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    emit()
  }, 5000)
}

export const toast = {
  error: (message: string) => push(message, 'error'),
  success: (message: string) => push(message, 'success'),
}

// Generic write-failure notice used across the data hooks — the underlying
// Postgres/network error is logged server-side (db-write.ts) but never shown
// verbatim to the user, so a friendly, consistent message is used instead.
export const notifyDbError = () =>
  toast.error('Änderung konnte nicht gespeichert werden. Bitte versuche es erneut.')
