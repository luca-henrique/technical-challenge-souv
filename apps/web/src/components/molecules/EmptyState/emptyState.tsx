import Heading from '@/components/atoms/Heading/heading'
import Text from '@/components/atoms/Text/text'
import type { EmptyStateProps } from './types'

export default function EmptyState({
  titulo,
  descricao,
  icone,
  acao,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-800 p-8 text-center bg-gray-50/50 dark:bg-gray-900/30 ${className}`}
    >
      {icone && <div className="mb-3 text-gray-400 dark:text-gray-500">{icone}</div>}
      <Heading as="h3" variante="card" className="text-gray-800 dark:text-gray-200">
        {titulo}
      </Heading>
      {descricao && (
        <Text variante="corpo" cor="secundario" className="mt-1 max-w-sm">
          {descricao}
        </Text>
      )}
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  )
}
