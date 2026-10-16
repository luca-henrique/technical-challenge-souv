import Card from '@/components/atoms/Card/card'
import Skeleton from '@/components/atoms/Skeleton/skeleton'
import type { RecepcaoSkeletonProps } from './types'

export default function RecepcaoSkeleton({ className = '' }: RecepcaoSkeletonProps) {
  return (
    <div
      className={`space-y-6 ${className}`}
      role="status"
      aria-busy="true"
      aria-label="Carregando dados da recepção"
    >
      <span className="sr-only">Carregando dados da recepção...</span>
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-64 flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="w-44 space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-3 pt-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
        <Card className="space-y-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </div>

      <span className="sr-only">Carregando profissionais e agenda...</span>
    </div>
  )
}
