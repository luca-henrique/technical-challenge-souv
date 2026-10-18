'use client'

import { Alert } from '@/shared/ui/alert/alert'
import { Button } from '@/shared/ui/button/button'
import { Card } from '@/shared/ui/card/card'
import { Skeleton } from '@/shared/ui/skeleton/skeleton'
import BotaoExportarPdf from '@/components/molecules/BotaoExportarPdf/botaoExportarPdf'
import { useDoctorSchedule } from '../../model/use-doctor-schedule'
import { ScheduleDateNav } from '../molecules/schedule-date-nav'
import { BlockDayAction } from '../molecules/block-day-action'
import { BlockPeriodModal } from '../molecules/block-period-modal'
import { ScheduleAppointmentsTable } from '../molecules/schedule-appointments-table'

export interface DoctorScheduleBoardProps {
  initialDate?: string
  className?: string
}

export function DoctorScheduleBoard({
  initialDate,
  className = '',
}: DoctorScheduleBoardProps) {
  const {
    doctorId,
    selectedDate,
    setSelectedDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    agenda,
    isLoading,
    error,
    isConfirmingDayOff,
    setIsConfirmingDayOff,
    isPeriodModalOpen,
    setIsPeriodModalOpen,
    blockDay,
    isBlockingDay,
    blockPeriod,
    isBlockingPeriod,
  } = useDoctorSchedule(initialDate)

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="p-4 sm:p-6 space-y-4">
        <ScheduleDateNav
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onPreviousDay={goToPreviousDay}
          onNextDay={goToNextDay}
          onToday={goToToday}
          disabled={isLoading}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-2">
            {agenda && !agenda.folga && (
              <BlockDayAction
                isConfirming={isConfirmingDayOff}
                onConfirmingChange={setIsConfirmingDayOff}
                onConfirm={blockDay}
                isLoading={isBlockingDay}
              />
            )}
            {!isConfirmingDayOff && (
              <Button
                variant="secondary"
                size="compact"
                onClick={() => setIsPeriodModalOpen(true)}
                className="min-h-11 px-4"
              >
                Bloquear período (férias)
              </Button>
            )}
          </div>

          {doctorId && selectedDate && (
            <BotaoExportarPdf
              tipo="agenda"
              tamanho="compacto"
              filtros={{ data: selectedDate, profissionalId: doctorId }}
            />
          )}
        </div>
      </Card>

      {agenda?.folga && (
        <Alert variant="warning">
          Este dia está bloqueado como folga.
        </Alert>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {isLoading && !agenda ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : (
        <Card className="p-4 sm:p-6">
          <ScheduleAppointmentsTable appointments={agenda?.consultas ?? []} />
        </Card>
      )}

      <BlockPeriodModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        onConfirm={blockPeriod}
        isLoading={isBlockingPeriod}
      />
    </div>
  )
}
