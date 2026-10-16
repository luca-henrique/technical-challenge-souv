import SeletorData from '@/components/molecules/SeletorData/seletorData'
import type { SeletorIntervaloDatasProps } from './types'

export default function SeletorIntervaloDatas({
  dataInicio,
  dataFim,
  onChangeInicio,
  onChangeFim,
  labelInicio = 'Data de início',
  labelFim = 'Data de término',
  erroInicio,
  erroFim,
  required = true,
  className = 'flex flex-wrap items-start gap-4',
  itemClassName = 'flex-1 min-w-44',
}: SeletorIntervaloDatasProps) {
  return (
    <div className={className}>
      <SeletorData
        id="seletor-data-inicio"
        valor={dataInicio}
        onChange={onChangeInicio}
        label={labelInicio}
        erro={erroInicio}
        required={required}
        className={itemClassName}
      />
      <SeletorData
        id="seletor-data-fim"
        valor={dataFim}
        onChange={onChangeFim}
        label={labelFim}
        erro={erroFim}
        required={required}
        className={itemClassName}
      />
    </div>
  )
}
