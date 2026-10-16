import Card from '@/components/atoms/Card/card'
import Heading from '@/components/atoms/Heading/heading'
import Text from '@/components/atoms/Text/text'
import type { EmptyStateProps } from './types'

export default function EmptyState({
  titulo,
  descricao,
  icone,
  acao,
  variante = 'dashed',
  className = '',
}: EmptyStateProps) {
  if (variante === 'inline') {
    return (
      <div role="status" className={`py-4 text-center ${className}`}>
        {icone && <div className="mb-2 text-gray-400 dark:text-gray-500">{icone}</div>}
        <Text variante="corpo" cor="secundario">
          {titulo}
        </Text>
        {descricao && (
          <Text variante="suporte" cor="secundario" className="mt-1">
            {descricao}
          </Text>
        )}
        {acao && <div className="mt-2">{acao}</div>}
      </div>
    )
  }

  const conteudo = (
    <>
      {icone && <div className="mb-3 text-gray-400 dark:text-gray-500">{icone}</div>}
      <Heading as="h3" variante="card" className="text-gray-800 dark:text-gray-200">
        {titulo}
      </Heading>
      {descricao && (
        <Text variante="corpo" cor="secundario" className="mt-1.5 max-w-md">
          {descricao}
        </Text>
      )}
      {acao && <div className="mt-4">{acao}</div>}
    </>
  )

  if (variante === 'card') {
    return (
      <Card
        role="status"
        aria-label={titulo}
        className={`flex flex-col items-center justify-center p-8 text-center sm:p-12 ${className}`}
      >
        {conteudo}
      </Card>
    )
  }

  return (
    <div
      role="status"
      aria-label={titulo}
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-800 p-8 text-center bg-gray-50/50 dark:bg-gray-900/30 ${className}`}
    >
      {conteudo}
    </div>
  )
}

