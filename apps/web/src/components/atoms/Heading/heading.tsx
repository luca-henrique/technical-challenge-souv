import type { HeadingProps, VarianteHeading } from './types'

const VARIANTES: Record<VarianteHeading, string> = {
  pagina: 'text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100',
  secao: 'text-lg font-semibold text-gray-900 dark:text-gray-100',
  card: 'text-base font-semibold text-gray-900 dark:text-gray-100',
  modal: 'text-lg font-semibold text-gray-900 dark:text-gray-100',
}

export default function Heading({
  as: Tag = 'h2',
  variante = 'secao',
  className = '',
  children,
  ...props
}: HeadingProps) {
  return (
    <Tag className={`${VARIANTES[variante]} ${className}`} {...props}>
      {children}
    </Tag>
  )
}
