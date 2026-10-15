import Card from '@/components/atoms/Card/card'
import Skeleton from '@/components/atoms/Skeleton/skeleton'
import type { MinhasConsultasSkeletonProps } from './types'

export default function MinhasConsultasSkeleton({
  className = '',
  quantidade = 3,
}: MinhasConsultasSkeletonProps) {
  const itens = Array.from({ length: quantidade }, (_, i) => i)

  return (
    <div
      className={`mx-auto max-w-md space-y-4 ${className}`}
      role="status"
      aria-busy="true"
      aria-label="Carregando consultas"
    >
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-9 w-36" />
      </div>

      <div className="space-y-3">
        {itens.map((i) => (
          <Card key={i} className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-28" />
            <div className="pt-2">
              <Skeleton className="h-8 w-full" />
            </div>
          </Card>
        ))}
      </div>

      <span className="sr-only">Carregando suas consultas...</span>
    </div>
  )
}
