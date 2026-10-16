import type { Consulta } from '@bemviver/shared'

export interface ModalRemarcarConsultaProps {
  consulta: Consulta
  aberto: boolean
  onFechar: () => void
  onSucesso?: () => void
}
