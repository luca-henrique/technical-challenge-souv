import type { Metadata } from 'next'
import { DoctorScheduleView } from '@/views/doctor/ui/doctor-schedule-view'

export const metadata: Metadata = {
  title: 'Minha Agenda | Clínica Bem Viver',
  description: 'Gerenciamento de consultas e horários de atendimento do profissional de saúde.',
}

export default function Page() {
  return <DoctorScheduleView />
}
