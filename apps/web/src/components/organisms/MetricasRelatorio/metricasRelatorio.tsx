import BadgeTaxa from '@/components/atoms/BadgeTaxa/badgeTaxa'
import CardMetrica from '@/components/molecules/CardMetrica/cardMetrica'
import type { MetricasRelatorioProps } from './types'

export default function MetricasRelatorio({ relatorio }: MetricasRelatorioProps) {
  const { totais, taxaFaltas } = relatorio

  return (
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <CardMetrica
        rotulo="Total agendadas"
        valor={totais.agendadas}
      />
      <CardMetrica
        rotulo="Realizadas"
        valor={totais.realizadas}
        valorClassName="text-emerald-600 dark:text-emerald-400"
      />
      <CardMetrica
        rotulo="Canceladas"
        valor={totais.canceladas}
        valorClassName="text-gray-600 dark:text-gray-300"
      />
      <CardMetrica
        rotulo="Faltas (No-Show)"
        valor={totais.faltas}
        valorClassName="text-rose-600 dark:text-rose-400"
        badge={<BadgeTaxa taxa={taxaFaltas} />}
      />
    </dl>
  )
}
