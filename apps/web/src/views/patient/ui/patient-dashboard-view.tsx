'use client'

import Link from 'next/link'
import { Typography } from '@/shared/ui/typography/typography'
import { Button } from '@/shared/ui/button/button'
import { PatientAppointmentsList } from '@/features/patient-appointments/ui/organisms/patient-appointments-list'
import MinhasInscricoesEspera from '@/components/organisms/MinhasInscricoesEspera/minhasInscricoesEspera'

export function PatientDashboardView() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography variant="title">Minhas Consultas</Typography>
          <Typography variant="subtitle">
            Acompanhe seus agendamentos e histórico médico
          </Typography>
        </div>
        <Link href="/paciente/agendar">
          <Button variant="primary" className="w-full sm:w-auto">
            Marcar Consulta
          </Button>
        </Link>
      </div>

      <PatientAppointmentsList />

      <MinhasInscricoesEspera />
    </div>
  )
}
