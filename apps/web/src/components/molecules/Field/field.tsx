import type { FieldProps } from './types'

export default function Field({ label, erro, hint, id, className = '', children }: FieldProps) {
  if (id) {
    return (
      <div className={className}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
        {children}
        {hint && (
          <span id={`${id}-hint`} className="mt-1 block text-xs font-normal text-gray-500 dark:text-gray-400">
            {hint}
          </span>
        )}
        {erro && (
          <span id={`${id}-erro`} role="alert" className="mt-1 block text-xs font-normal text-red-600 dark:text-red-400">
            {erro}
          </span>
        )}
      </div>
    )
  }

  return (
    <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}>
      {label}
      {children}
      {hint && (
        <span className="mt-1 block text-xs font-normal text-gray-500 dark:text-gray-400">
          {hint}
        </span>
      )}
      {erro && (
        <span role="alert" className="mt-1 block text-xs font-normal text-red-600 dark:text-red-400">
          {erro}
        </span>
      )}
    </label>
  )
}
