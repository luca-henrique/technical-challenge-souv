'use client'

import Link from 'next/link'
import { Typography } from '@/shared/ui/typography/typography'
import { PatientScheduleForm } from '@/features/patient-schedule/ui/organisms/patient-schedule-form'

export function ScheduleAppointmentView() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="title">Marcar Consulta</Typography>
          <Typography variant="subtitle">
            Selecione a especialidade, médico e horário desejado
          </Typography>
        </div>
        <Link
          href="/paciente"
          className="text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-400 underline"
        >
          Voltar às consultas
        </Link>
      </div>

      <PatientScheduleForm />
    </div>
  )
}
