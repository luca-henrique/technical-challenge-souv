import Button from '@/components/atoms/Button/button'
import Text from '@/components/atoms/Text/text'
import type { PaginacaoProps } from './types'

export default function Paginacao({
  pagina,
  totalPaginas,
  totalItens,
  aoMudarPagina,
  className = '',
}: PaginacaoProps) {
  if (totalPaginas <= 1 && (!totalItens || totalItens === 0)) {
    return null
  }

  const primeiraPagina = pagina <= 1
  const ultimaPagina = pagina >= totalPaginas

  return (
    <nav
      aria-label="Navegação entre páginas"
      className={`flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800 ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <Text variante="legenda" cor="secundario">
          Página <span className="font-semibold text-gray-900 dark:text-gray-100">{pagina}</span> de{' '}
          <span className="font-semibold text-gray-900 dark:text-gray-100">{Math.max(totalPaginas, 1)}</span>
          {typeof totalItens === 'number' && (
            <span> ({totalItens} {totalItens === 1 ? 'paciente' : 'pacientes'})</span>
          )}
        </Text>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variante="secundario"
          tamanho="compacto"
          disabled={primeiraPagina}
          onClick={() => aoMudarPagina(pagina - 1)}
          aria-label="Ir para a página anterior"
        >
          Anterior
        </Button>
        <Button
          type="button"
          variante="secundario"
          tamanho="compacto"
          disabled={ultimaPagina}
          onClick={() => aoMudarPagina(pagina + 1)}
          aria-label="Ir para a próxima página"
        >
          Próxima
        </Button>
      </div>
    </nav>
  )
}
