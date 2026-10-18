import type { Metadata } from 'next'
import { ReceptionPage } from '@/pages/reception/ui/reception-page'

export const metadata: Metadata = {
  title: 'Agenda da Recepção | Clínica Bem Viver',
  description: 'Visualização da agenda diária e controle de atendimentos pela equipe da recepção.',
}

export default function Page() {
  return <ReceptionPage />
}
