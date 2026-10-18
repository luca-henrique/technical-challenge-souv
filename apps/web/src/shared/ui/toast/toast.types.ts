export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

export interface ToastContextValue {
  toasts: ToastItem[]
  showToast: (toast: Omit<ToastItem, 'id'>) => string
  dismissToast: (id: string) => void
  success: (title: string, description?: string) => string
  error: (title: string, description?: string) => string
  info: (title: string, description?: string) => string
  warning: (title: string, description?: string) => string
}
