import type { HTMLAttributes } from 'react'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text'
}

export function Skeleton({
  variant = 'rectangular',
  className = '',
  ...props
}: SkeletonProps) {
  let variantClasses = ''

  switch (variant) {
    case 'circular':
      variantClasses = 'rounded-full'
      break
    case 'text':
      variantClasses = 'h-4 rounded'
      break
    case 'rectangular':
    default:
      variantClasses = 'rounded-lg'
      break
  }

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-gray-200 dark:bg-gray-800 ${variantClasses} ${className}`}
      {...props}
    />
  )
}
