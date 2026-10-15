import type { OpcaoTipoConsulta } from '@/components/molecules/SeletorTipoConsulta/types'

export interface AgendarConsultaProps {
  className?: string
  onSucesso?: () => void
  opcoesTipoConsulta?: readonly OpcaoTipoConsulta[]
}
