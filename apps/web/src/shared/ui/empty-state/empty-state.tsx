import type { HTMLAttributes, ReactNode } from 'react'

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  variant?: 'dashed' | 'card' | 'inline'
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  variant = 'dashed',
  className = '',
  ...props
}: EmptyStateProps) {
  const defaultIcon = (
    <svg
      className="h-12 w-12 text-gray-400 dark:text-gray-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  )

  const content = (
    <>
      <div className="mb-3 transition-transform duration-200 hover:scale-105">
        {icon ?? defaultIcon}
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </>
  )

  if (variant === 'inline') {
    return (
      <div
        role="status"
        aria-label={title}
        className={`py-4 text-center ${className}`}
        {...props}
      >
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {title}
        </p>
        {description && (
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {description}
          </p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div
        role="status"
        aria-label={title}
        className={`flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-12 ${className}`}
        {...props}
      >
        {content}
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-label={title}
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-8 text-center transition-colors dark:border-gray-800 dark:bg-gray-900/30 sm:p-12 ${className}`}
      {...props}
    >
      {content}
    </div>
  )
}
