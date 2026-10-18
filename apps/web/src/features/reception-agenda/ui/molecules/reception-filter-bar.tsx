import type { Control, FieldErrors } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { Profissional } from '@bemviver/shared'
import SeletorProfissional from '@/components/molecules/SeletorProfissional/seletorProfissional'
import SeletorData from '@/components/molecules/SeletorData/seletorData'
import type { ReceptionAgendaFilterInput } from '../../model/reception-agenda.schema'

export interface ReceptionFilterBarProps {
  control: Control<ReceptionAgendaFilterInput>
  professionals: Profissional[]
  errors: FieldErrors<ReceptionAgendaFilterInput>
  className?: string
}

export function ReceptionFilterBar({
  control,
  professionals,
  errors,
  className = '',
}: ReceptionFilterBarProps) {
  return (
    <form
      className={`grid grid-cols-1 sm:grid-cols-2 gap-4 items-start ${className}`}
      onSubmit={(e) => e.preventDefault()}
    >
      <Controller
        name="professionalId"
        control={control}
        render={({ field }) => (
          <SeletorProfissional
            profissionais={professionals}
            valor={field.value ?? ''}
            permitirVazio
            onChange={field.onChange}
            erro={errors.professionalId?.message}
            className="w-full"
          />
        )}
      />

      <Controller
        name="date"
        control={control}
        render={({ field }) => (
          <SeletorData
            valor={field.value ?? ''}
            onChange={field.onChange}
            erro={errors.date?.message}
            hint=""
            className="w-full"
          />
        )}
      />
    </form>
  )
}
