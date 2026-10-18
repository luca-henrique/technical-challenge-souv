'use client'

import { Typography } from '@/shared/ui/typography/typography'
import { DoctorScheduleBoard } from '@/features/doctor-schedule/ui/organisms/doctor-schedule-board'

export interface DoctorScheduleViewProps {
  initialDate?: string
  className?: string
}

export function DoctorScheduleView({
  initialDate,
  className = '',
}: DoctorScheduleViewProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <Typography variant="title" className="text-2xl font-bold tracking-tight">
          Minha Agenda
        </Typography>
        <Typography variant="body" className="text-gray-500 dark:text-gray-400">
          Acompanhe seus atendimentos do dia e gerencie suas folgas e períodos de recesso.
        </Typography>
      </div>

      <DoctorScheduleBoard initialDate={initialDate} />
    </div>
  )
}
