import type { FieldProps } from './types'

export default function Field({ label, erro, hint, id, className = '', children }: FieldProps) {
  return (
    <label htmlFor={id} className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}>
      {label}
      {children}
      {hint && (
        <span id={id ? `${id}-hint` : undefined} className="mt-1 block text-xs font-normal text-gray-500 dark:text-gray-400">
          {hint}
        </span>
      )}
      {erro && (
        <span id={id ? `${id}-erro` : undefined} role="alert" className="mt-1 block text-xs font-normal text-red-600 dark:text-red-400">
          {erro}
        </span>
      )}
    </label>
  )
}
