'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ToastItem, ToastContextValue, ToastType } from './toast.types'
import { ToastViewport } from './toast-viewport'

export type { ToastItem, ToastContextValue, ToastType }
export { ToastCard } from './toast-card'
export { ToastViewport } from './toast-viewport'

const ToastContext = createContext<ToastContextValue | null>(null)

const fallbackToastValue: ToastContextValue = {
  toasts: [],
  showToast: () => '',
  dismissToast: () => {},
  success: () => '',
  error: () => '',
  info: () => '',
  warning: () => '',
}

export function useToast() {
  const context = useContext(ToastContext)
  return context ?? fallbackToastValue
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const showToast = useCallback(
    ({ type, title, description, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newItem: ToastItem = { id, type, title, description, duration }

      setToasts((prev) => [...prev, newItem])

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id)
        }, duration)
      }

      return id
    },
    [dismissToast],
  )

  const success = useCallback(
    (title: string, description?: string) =>
      showToast({ type: 'success', title, description }),
    [showToast],
  )

  const error = useCallback(
    (title: string, description?: string) =>
      showToast({ type: 'error', title, description }),
    [showToast],
  )

  const info = useCallback(
    (title: string, description?: string) =>
      showToast({ type: 'info', title, description }),
    [showToast],
  )

  const warning = useCallback(
    (title: string, description?: string) =>
      showToast({ type: 'warning', title, description }),
    [showToast],
  )

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      dismissToast,
      success,
      error,
      info,
      warning,
    }),
    [toasts, showToast, dismissToast, success, error, info, warning],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}
