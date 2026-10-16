import type { ButtonProps, TamanhoBotao, VarianteBotao } from './types'

const VARIANTES: Record<VarianteBotao, string> = {
  primario: 'bg-teal-700 text-white hover:bg-teal-800 focus-visible:ring-teal-600',
  secundario: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 focus-visible:ring-teal-600',
  perigo: 'bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-600',
  'outline-primario': 'border border-teal-600 bg-transparent text-teal-700 hover:bg-teal-50 dark:border-teal-500 dark:text-teal-400 dark:hover:bg-teal-950/30 focus-visible:ring-teal-600',
  fantasma: 'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 focus-visible:ring-teal-600',
  sucesso: 'bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-600',
}

const TAMANHOS: Record<TamanhoBotao, string> = {
  normal: 'h-10 px-4 py-2 text-sm',
  compacto: 'h-9 px-3 py-1.5 text-sm',
  estreito: 'h-9 px-2 text-sm',
}

export function classesDoBotao(variante: VarianteBotao = 'primario', tamanho: TamanhoBotao = 'normal') {
  return `inline-flex items-center justify-center shrink-0 rounded-md font-medium whitespace-nowrap transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 ${VARIANTES[variante]} ${TAMANHOS[tamanho]}`
}

export default function Button({ variante, tamanho, type = 'button', className = '', ...props }: ButtonProps) {
  return <button type={type} className={`${classesDoBotao(variante, tamanho)} ${className}`} {...props} />
}
