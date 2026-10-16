import Card from '@/components/atoms/Card/card'
import type { CardMetricaProps } from './types'

export default function CardMetrica({
  rotulo,
  valor,
  badge,
  valorClassName = 'text-gray-900 dark:text-gray-100',
  className = '',
}: CardMetricaProps) {
  return (
    <Card className={`space-y-1 ${className}`.trim()}>
      <div className="flex items-center justify-between">
        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">{rotulo}</dt>
        {badge}
      </div>
      <dd className={`text-2xl font-bold ${valorClassName}`}>{valor}</dd>
    </Card>
  )
}
