import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  children: ReactNode
}

export function Card({
  interactive = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const interactiveClasses = interactive
    ? 'transition-all duration-200 hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 cursor-pointer'
    : 'transition-colors'

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
