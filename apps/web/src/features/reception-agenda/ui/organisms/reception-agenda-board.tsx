'use client'

import { Alert } from '@/shared/ui/alert/alert'
import AgendaDoDia from '@/components/organisms/AgendaDoDia/agendaDoDia'
import RecepcaoSkeleton from '@/components/organisms/RecepcaoSkeleton/recepcaoSkeleton'
import SemProfissionalSelecionado from '@/components/molecules/SemProfissionalSelecionado/semProfissionalSelecionado'
import { useReceptionAgenda } from '../../model/use-reception-agenda'
import { ReceptionFilterBar } from '../molecules/reception-filter-bar'

export interface ReceptionAgendaBoardProps {
  initialDate?: string
  className?: string
}

export function ReceptionAgendaBoard({
  initialDate,
  className = '',
}: ReceptionAgendaBoardProps) {
  const {
    control,
    professionals,
    selectedProfessionalId,
    selectedDate,
    isLoading,
    error,
    errors,
  } = useReceptionAgenda(initialDate)

  if (isLoading && professionals.length === 0) {
    return <RecepcaoSkeleton />
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <ReceptionFilterBar
        control={control}
        professionals={professionals}
        errors={errors}
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {selectedProfessionalId ? (
        <AgendaDoDia profissionalId={selectedProfessionalId} data={selectedDate} />
      ) : (
        <SemProfissionalSelecionado />
      )}
    </div>
  )
}
