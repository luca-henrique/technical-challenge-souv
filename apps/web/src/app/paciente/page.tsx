import type { Metadata } from 'next'
import MinhasConsultasPage from '@/components/pages/MinhasConsultasPage/minhasConsultasPage'

export const metadata: Metadata = {
  title: 'Minhas Consultas | Clínica Bem Viver',
  description: 'Consulte suas próximas consultas e histórico médico na Clínica Bem Viver.',
}

export default function Page() {
  return <MinhasConsultasPage />
}
