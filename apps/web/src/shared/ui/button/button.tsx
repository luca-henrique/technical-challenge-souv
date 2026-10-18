import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'compact'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  loadingText?: string
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none min-h-11'

  let variantClasses = ''
  switch (variant) {
    case 'primary':
      variantClasses =
        'bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700 shadow-sm'
      break
    case 'secondary':
      variantClasses =
        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
      break
    case 'danger':
      variantClasses =
        'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 shadow-sm'
      break
    case 'outline':
      variantClasses =
        'border border-teal-600 text-teal-700 hover:bg-teal-50 dark:border-teal-500 dark:text-teal-400 dark:hover:bg-teal-950'
      break
    case 'ghost':
      variantClasses =
        'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      break
  }

  let sizeClasses = ''
  switch (size) {
    case 'sm':
    case 'compact':
      sizeClasses = 'px-3 py-1.5 text-xs'
      break
    case 'lg':
      sizeClasses = 'px-6 py-3 text-base'
      break
    case 'md':
    default:
      sizeClasses = 'px-4 py-2.5 text-sm'
      break
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          {loadingText ?? children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
