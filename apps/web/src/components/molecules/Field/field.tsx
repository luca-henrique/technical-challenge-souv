import type { FieldProps } from './types'

export default function Field({ label, erro, className = '', children }: FieldProps) {
  return (
    <label className={`block text-sm font-medium text-gray-700 ${className}`}>
      {label}
      {children}
      {erro && <span className="mt-1 block text-xs font-normal text-red-600">{erro}</span>}
    </label>
  )
}
