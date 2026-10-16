import Badge from '@/components/atoms/Badge/badge'
import type { VarianteBadge } from '@/components/atoms/Badge/types'
import type { BadgeTaxaProps } from './types'

export default function BadgeTaxa({ taxa, className = '' }: BadgeTaxaProps) {
  let variante: VarianteBadge = 'sucesso'

  if (taxa > 15) {
    variante = 'erro'
  } else if (taxa > 5) {
    variante = 'aviso'
  }

  return (
    <Badge
      variante={variante}
      className={`rounded-full font-semibold px-2 ${className}`.trim()}
    >
      {taxa.toFixed(1)}%
    </Badge>
  )
}
