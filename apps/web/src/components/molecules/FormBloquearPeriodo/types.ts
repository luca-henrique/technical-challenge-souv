import type { DadosBloquearPeriodo } from './schema'

export interface FormBloquearPeriodoProps {
  onConfirmar: (dados: DadosBloquearPeriodo) => Promise<void>
  onCancelar: () => void
  bloqueando?: boolean
}
