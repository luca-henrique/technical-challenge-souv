import type { Metadata } from 'next'
import ProfissionalPage from '@/components/pages/ProfissionalPage/profissionalPage'

export const metadata: Metadata = {
  title: 'Minha Agenda | Clínica Bem Viver',
  description: 'Gerenciamento de consultas e horários de atendimento do profissional de saúde.',
}

export default function Page() {
  return <ProfissionalPage />
}
