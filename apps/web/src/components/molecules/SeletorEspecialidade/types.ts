export interface SeletorEspecialidadeProps {
  especialidades: string[]
  valor: string
  onChange: (especialidade: string) => void
  label?: string
  permitirVazio?: boolean
  textoVazio?: string
  className?: string
  erro?: string
}
