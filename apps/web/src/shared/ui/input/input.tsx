import { forwardRef, type InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', hasError = false, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={hasError}
        className={`w-full min-h-11 rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60 dark:disabled:bg-gray-800 ${
          hasError
            ? 'border-red-500 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:bg-red-950/20 dark:text-red-200'
            : 'border-gray-300 bg-white text-gray-900 focus:border-teal-500 focus:ring-teal-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-teal-400'
        } ${className}`}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
