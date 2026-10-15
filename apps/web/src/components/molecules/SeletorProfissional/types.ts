import type { Profissional } from '@bemviver/shared'

export interface SeletorProfissionalProps {
  profissionais: Profissional[]
  valor: string
  onChange: (id: string) => void
  label?: string
  permitirVazio?: boolean
  textoVazio?: string
  className?: string
  erro?: string
}
