import type { Consulta } from '@bemviver/shared'
import { Modal } from '@/shared/ui/modal/modal'
import { Button } from '@/shared/ui/button/button'

export interface CancelAppointmentModalProps {
  appointment: Consulta | null
  isOpen: boolean
  isCancelling: boolean
  onClose: () => void
  onConfirm: () => void
}

export function CancelAppointmentModal({
  appointment,
  isOpen,
  isCancelling,
  onClose,
  onConfirm,
}: CancelAppointmentModalProps) {
  if (!appointment) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancelar Consulta"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Tem certeza de que deseja cancelar este agendamento?
        </p>
        <div className="rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-800">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {appointment.profissionalNome ?? 'Médico Especialista'}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            {appointment.especialidade}
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Data: <strong className="text-gray-800 dark:text-gray-200">{appointment.data}</strong> às{' '}
            <strong className="text-gray-800 dark:text-gray-200">{appointment.hora}</strong>
          </p>
        </div>

        <p className="text-xs text-amber-700 dark:text-amber-400">
          Atenção: Cancelamentos devem respeitar as regras da clínica. O horário será liberado
          automaticamente para a lista de espera.
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isCancelling}>
            Voltar
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isCancelling}
            loadingText="Cancelando..."
          >
            Confirmar Cancelamento
          </Button>
        </div>
      </div>
    </Modal>
  )
}
