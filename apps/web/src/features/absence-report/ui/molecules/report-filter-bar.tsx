import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { Profissional } from '@bemviver/shared'
import { Button } from '@/shared/ui/button/button'
import SeletorData from '@/components/molecules/SeletorData/seletorData'
import SeletorProfissional from '@/components/molecules/SeletorProfissional/seletorProfissional'
import type { AbsenceReportFilterInput } from '../../model/absence-report.schema'

export interface ReportFilterBarProps {
  control: Control<AbsenceReportFilterInput>
  professionals: Profissional[]
  onSubmit: () => void
  onReset: () => void
  className?: string
}

export function ReportFilterBar({
  control,
  professionals,
  onSubmit,
  onReset,
  className = '',
}: ReportFilterBarProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className={`flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 print:hidden ${className}`}
    >
      <Controller
        name="startDate"
        control={control}
        render={({ field }) => (
          <SeletorData
            valor={field.value ?? ''}
            onChange={field.onChange}
            label="Data de início"
            required={false}
          />
        )}
      />

      <Controller
        name="endDate"
        control={control}
        render={({ field }) => (
          <SeletorData
            valor={field.value ?? ''}
            onChange={field.onChange}
            label="Data de término"
            required={false}
          />
        )}
      />

      <Controller
        name="doctorId"
        control={control}
        render={({ field }) => (
          <SeletorProfissional
            profissionais={professionals}
            valor={field.value ?? ''}
            onChange={field.onChange}
            label="Filtrar médico"
            className="min-w-56"
          />
        )}
      />

      <div className="flex gap-2">
        <Button type="submit" size="compact" className="min-h-11 px-4">
          Filtrar
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="compact"
          onClick={onReset}
          className="min-h-11 px-4"
        >
          Limpar
        </Button>
      </div>
    </form>
  )
}
