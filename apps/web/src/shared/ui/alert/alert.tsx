import type { HTMLAttributes, ReactNode } from 'react'

export type AlertVariant = 'danger' | 'warning' | 'info' | 'success'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  children: ReactNode
}

export function Alert({
  variant = 'danger',
  className = '',
  children,
  ...props
}: AlertProps) {
  let variantClasses = ''

  switch (variant) {
    case 'warning':
      variantClasses =
        'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300'
      break
    case 'info':
      variantClasses =
        'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300'
      break
    case 'success':
      variantClasses =
        'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
      break
    case 'danger':
    default:
      variantClasses =
        'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300'
      break
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`rounded-lg border p-4 text-sm leading-relaxed ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
