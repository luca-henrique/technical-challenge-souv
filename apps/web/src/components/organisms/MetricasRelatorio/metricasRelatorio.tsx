import BadgeTaxa from '@/components/atoms/BadgeTaxa/badgeTaxa'
import Card from '@/components/atoms/Card/card'
import type { MetricasRelatorioProps } from './types'

export default function MetricasRelatorio({ relatorio }: MetricasRelatorioProps) {
  const { totais, taxaFaltas } = relatorio

  return (
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card className="space-y-1">
        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Total agendadas</dt>
        <dd className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totais.agendadas}</dd>
      </Card>

      <Card className="space-y-1">
        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Realizadas</dt>
        <dd className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totais.realizadas}</dd>
      </Card>

      <Card className="space-y-1">
        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Canceladas</dt>
        <dd className="text-2xl font-bold text-gray-600 dark:text-gray-300">{totais.canceladas}</dd>
      </Card>

      <Card className="space-y-1">
        <div className="flex items-center justify-between">
          <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">Faltas (No-Show)</dt>
          <BadgeTaxa taxa={taxaFaltas} />
        </div>
        <dd className="text-2xl font-bold text-rose-600 dark:text-rose-400">{totais.faltas}</dd>
      </Card>
    </dl>
  )
}
