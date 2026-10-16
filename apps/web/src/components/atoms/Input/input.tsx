import type { InputProps } from './types'

export default function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 transition-colors ${className}`}
      {...props}
    />
  )
}
