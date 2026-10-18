'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/shared/ui/modal/modal'
import { Button } from '@/shared/ui/button/button'
import { blockPeriodSchema, type BlockPeriodInput } from '../../model/block-schedule.schema'

export interface BlockPeriodModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { startDate: string; endDate: string }) => void
  isLoading?: boolean
}

const inputClass =
  'w-full min-h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'

export function BlockPeriodModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: BlockPeriodModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BlockPeriodInput>({
    resolver: zodResolver(blockPeriodSchema),
    defaultValues: { startDate: '', endDate: '' },
  })

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bloquear período de folga (férias/recesso)">
      <form onSubmit={handleSubmit(onConfirm)} className="space-y-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Nenhum paciente conseguirá agendar consultas nos dias selecionados (limite de 90 dias).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="block-start-date" className="block text-sm font-medium mb-1">
              Data de início
            </label>
            <input id="block-start-date" type="date" {...register('startDate')} className={inputClass} />
            {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate.message}</p>}
          </div>

          <div>
            <label htmlFor="block-end-date" className="block text-sm font-medium mb-1">
              Data de término
            </label>
            <input id="block-end-date" type="date" {...register('endDate')} className={inputClass} />
            {errors.endDate && <p className="mt-1 text-xs text-red-600">{errors.endDate.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="secondary" size="compact" onClick={handleClose} disabled={isLoading} className="min-h-11 px-4">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="compact" disabled={isLoading} className="min-h-11 px-4">
            {isLoading ? 'Bloqueando...' : 'Confirmar bloqueio'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
