import type { SelectProps } from './types'

export default function Select({ className = '', ...props }: SelectProps) {
  return (
    <select
      className={`mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 transition-colors ${className}`}
      {...props}
    />
  )
}
