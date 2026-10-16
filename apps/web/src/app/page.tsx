import type { Metadata } from 'next'
import LoginPage from '@/components/pages/LoginPage/loginPage'

export const metadata: Metadata = {
  title: 'Login | Clínica Bem Viver',
  description: 'Acesse o sistema de agendamento e gestão da Clínica Bem Viver.',
}

export default function Page() {
  return <LoginPage />
}
