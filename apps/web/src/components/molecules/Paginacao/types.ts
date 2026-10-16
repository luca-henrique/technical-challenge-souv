export interface PaginacaoProps {
  pagina: number
  totalPaginas: number
  totalItens?: number
  limite?: number
  aoMudarPagina: (novaPagina: number) => void
  className?: string
}
