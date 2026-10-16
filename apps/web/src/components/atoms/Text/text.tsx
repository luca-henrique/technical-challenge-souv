import type { CorTexto, TextProps, VarianteTexto } from './types'

const VARIANTES: Record<VarianteTexto, string> = {
  corpo: 'text-sm font-normal',
  suporte: 'text-xs font-normal',
  legenda: 'text-[11px] font-normal',
  destaque: 'text-sm font-semibold',
}

const CORES: Record<CorTexto, string> = {
  padrao: 'text-gray-900 dark:text-gray-100',
  secundario: 'text-gray-500 dark:text-gray-400',
  erro: 'text-red-600 dark:text-red-400',
  sucesso: 'text-emerald-600 dark:text-emerald-400',
  aviso: 'text-amber-700 dark:text-amber-300',
}

export default function Text({
  as: Tag = 'p',
  variante = 'corpo',
  cor = 'padrao',
  className = '',
  children,
  ...props
}: TextProps) {
  return (
    <Tag className={`${VARIANTES[variante]} ${CORES[cor]} ${className}`} {...props}>
      {children}
    </Tag>
  )
}
