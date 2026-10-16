import type { ButtonProps, TamanhoBotao, VarianteBotao } from './types'

const VARIANTES: Record<VarianteBotao, string> = {
  primario: 'bg-teal-700 text-white hover:bg-teal-800 focus-visible:ring-teal-600',
  secundario: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 focus-visible:ring-teal-600',
  perigo: 'bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-600',
}

const TAMANHOS: Record<TamanhoBotao, string> = {
  normal: 'px-4 py-2',
  compacto: 'px-3 py-1 text-sm',
  estreito: 'px-1 py-2',
}

export function classesDoBotao(variante: VarianteBotao = 'primario', tamanho: TamanhoBotao = 'normal') {
  return `rounded-md font-medium transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 ${VARIANTES[variante]} ${TAMANHOS[tamanho]}`
}

export default function Button({ variante, tamanho, type = 'button', className = '', ...props }: ButtonProps) {
  return <button type={type} className={`${classesDoBotao(variante, tamanho)} ${className}`} {...props} />
}
