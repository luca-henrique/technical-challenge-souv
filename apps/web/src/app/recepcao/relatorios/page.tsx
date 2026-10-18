import type { Metadata } from 'next'
import { AbsenceReportView } from '@/views/reception/ui/absence-report-view'

export const metadata: Metadata = {
  title: 'Relatório de Absenteísmo | Clínica Bem Viver',
  description: 'Métricas consolidadas de faltas, taxas de absenteísmo e histórico de pacientes reincidentes.',
}

export default function RelatoriosPage() {
  return <AbsenceReportView />
}
