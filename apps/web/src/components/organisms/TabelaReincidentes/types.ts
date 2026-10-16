export interface PacienteReincidente {
  pacienteId: string
  nome: string
  email: string
  totalFaltas: number
}

export interface TabelaReincidentesProps {
  reincidentes: PacienteReincidente[]
}
