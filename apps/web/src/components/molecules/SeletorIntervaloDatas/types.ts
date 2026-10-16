export interface SeletorIntervaloDatasProps {
  dataInicio: string
  dataFim: string
  onChangeInicio: (data: string) => void
  onChangeFim: (data: string) => void
  labelInicio?: string
  labelFim?: string
  erroInicio?: string
  erroFim?: string
  required?: boolean
  className?: string
  itemClassName?: string
}
