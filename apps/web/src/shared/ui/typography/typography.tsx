import type { HTMLAttributes, ReactNode } from 'react'

export type TypographyVariant =
  | 'title'
  | 'page-title'
  | 'subtitle'
  | 'page-subtitle'
  | 'section-title'
  | 'body'
  | 'caption'

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
  children: ReactNode
}

export function Typography({
  variant = 'body',
  as,
  className = '',
  children,
  ...props
}: TypographyProps) {
  let Component: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' = as ?? 'p'
  let variantClasses = ''

  switch (variant) {
    case 'title':
    case 'page-title':
      Component = as ?? 'h1'
      variantClasses =
        'text-3xl font-bold text-gray-900 mb-1 tracking-tight dark:text-gray-100'
      break
    case 'subtitle':
    case 'page-subtitle':
      Component = as ?? 'p'
      variantClasses = 'text-gray-500 text-sm dark:text-gray-400'
      break
    case 'section-title':
      Component = as ?? 'h2'
      variantClasses =
        'text-lg font-semibold text-gray-900 dark:text-gray-100 first-letter:uppercase'
      break
    case 'caption':
      Component = as ?? 'span'
      variantClasses = 'text-xs text-gray-500 dark:text-gray-400'
      break
    case 'body':
    default:
      Component = as ?? 'p'
      variantClasses = 'text-sm text-gray-700 dark:text-gray-300'
      break
  }

  return (
    <Component className={`${variantClasses} ${className}`} {...props}>
      {children}
    </Component>
  )
}
