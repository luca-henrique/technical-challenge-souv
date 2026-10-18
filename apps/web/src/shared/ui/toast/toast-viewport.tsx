import type { ToastItem } from './toast.types'
import { ToastCard } from './toast-card'

export interface ToastViewportProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex max-w-sm w-full flex-col gap-2 pointer-events-none p-4"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  )
}
