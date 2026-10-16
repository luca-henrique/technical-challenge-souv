import type { Metadata } from 'next'
import AgendarConsultaPage from '@/components/pages/AgendarConsultaPage/agendarConsultaPage'

export const metadata: Metadata = {
  title: 'Agendar Consulta | Clínica Bem Viver',
  description: 'Escolha um profissional e reserve seu horário de consulta na Clínica Bem Viver.',
}

export default function Page() {
  return <AgendarConsultaPage />
}
