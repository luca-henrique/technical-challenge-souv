import BadgeTaxa from '@/components/atoms/BadgeTaxa/badgeTaxa'
import Card from '@/components/atoms/Card/card'
import type { MetricasRelatorioProps } from './types'

export default function MetricasRelatorio({ relatorio }: MetricasRelatorioProps) {
  const { totais, taxaFaltas } = relatorio

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card className="space-y-1">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total agendadas</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totais.agendadas}</p>
      </Card>

      <Card className="space-y-1">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Realizadas</p>
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totais.realizadas}</p>
      </Card>

      <Card className="space-y-1">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Canceladas</p>
        <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">{totais.canceladas}</p>
      </Card>

      <Card className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Faltas (No-Show)</p>
          <BadgeTaxa taxa={taxaFaltas} />
        </div>
        <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{totais.faltas}</p>
      </Card>
    </div>
  )
}
