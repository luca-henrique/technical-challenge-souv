import type { HTMLAttributes, ReactNode } from 'react'

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'agendada'
  | 'cancelada'
  | 'realizada'
  | 'faltou'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: ReactNode
}

export function Badge({
  variant = 'neutral',
  className = '',
  children,
  ...props
}: BadgeProps) {
  let variantClasses = ''

  switch (variant) {
    case 'success':
    case 'realizada':
      variantClasses =
        'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 border-green-200 dark:border-green-800'
      break
    case 'warning':
    case 'agendada':
      variantClasses =
        'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800'
      break
    case 'danger':
    case 'cancelada':
    case 'faltou':
      variantClasses =
        'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800'
      break
    case 'info':
      variantClasses =
        'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      break
    case 'neutral':
    default:
      variantClasses =
        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
      break
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
