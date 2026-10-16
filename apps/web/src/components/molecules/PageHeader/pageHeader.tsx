import Heading from '@/components/atoms/Heading/heading'
import Text from '@/components/atoms/Text/text'
import type { PageHeaderProps } from './types'

export default function PageHeader({
  titulo,
  subtitulo,
  acoes,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 ${className}`}>
      <div>
        <Heading as="h1" variante="pagina">
          {titulo}
        </Heading>
        {subtitulo && (
          <Text variante="corpo" cor="secundario">
            {subtitulo}
          </Text>
        )}
      </div>
      {acoes && <div className="flex items-center gap-2">{acoes}</div>}
    </div>
  )
}
