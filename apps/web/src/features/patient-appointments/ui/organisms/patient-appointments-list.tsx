'use client'

import Link from 'next/link'
import { EmptyState } from '@/shared/ui/empty-state/empty-state'
import { Skeleton } from '@/shared/ui/skeleton/skeleton'
import { Alert } from '@/shared/ui/alert/alert'
import { Button } from '@/shared/ui/button/button'
import { usePatientAppointments } from '../../model/use-patient-appointments'
import { AppointmentCard } from '../molecules/appointment-card'
import { CancelAppointmentModal } from '../molecules/cancel-appointment-modal'

export function PatientAppointmentsList() {
  const {
    activeTab,
    setActiveTab,
    appointments,
    isLoading,
    errorMessage,
    selectedForCancel,
    setSelectedForCancel,
    isCancelling,
    handleConfirmCancel,
  } = usePatientAppointments()

  return (
    <div className="space-y-4">
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`min-h-11 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'upcoming'
              ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Próximas Consultas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`min-h-11 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Histórico de Consultas
        </button>
      </div>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState
          title={
            activeTab === 'upcoming'
              ? 'Nenhuma consulta agendada'
              : 'Nenhuma consulta no histórico'
          }
          description={
            activeTab === 'upcoming'
              ? 'Você não possui consultas agendadas para os próximos dias.'
              : 'Seu histórico de atendimentos realizados ou cancelados aparecerá aqui.'
          }
          variant="card"
          action={
            activeTab === 'upcoming' ? (
              <Link href="/paciente/agendar">
                <Button variant="primary">Agendar Nova Consulta</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <ul className="space-y-3">
          {appointments.map((apt) => (
            <li key={apt.id}>
              <AppointmentCard
                appointment={apt}
                isHistory={activeTab === 'history'}
                onCancelRequest={(item) => setSelectedForCancel(item)}
              />
            </li>
          ))}
        </ul>
      )}

      <CancelAppointmentModal
        appointment={selectedForCancel}
        isOpen={Boolean(selectedForCancel)}
        isCancelling={isCancelling}
        onClose={() => setSelectedForCancel(null)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  )
}
