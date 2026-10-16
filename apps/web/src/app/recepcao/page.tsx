import type { Metadata } from 'next'
import RecepcaoPageView from '@/components/pages/RecepcaoPage/recepcaoPage'

export const metadata: Metadata = {
  title: 'Agenda da Recepção | Clínica Bem Viver',
  description: 'Visualização da agenda diária e controle de atendimentos pela equipe da recepção.',
}

export default function RecepcaoPage() {
  return <RecepcaoPageView />
}
