import type { IconButtonProps } from './types'

export default function IconButton({
  children,
  className = '',
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
