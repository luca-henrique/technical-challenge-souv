import type { ReactNode } from 'react'

export interface FormFieldProps {
  id?: string
  label?: string
  errorText?: string
  hint?: string
  required?: boolean
  className?: string
  children: ReactNode
}

export function FormField({
  id,
  label,
  errorText,
  hint,
  required = false,
  className = '',
  children,
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !errorText && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      {errorText && (
        <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
          {errorText}
        </p>
      )}
    </div>
  )
}
