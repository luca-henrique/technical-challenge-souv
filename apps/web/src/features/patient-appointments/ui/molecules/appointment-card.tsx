import type { Consulta } from '@bemviver/shared'
import { Card } from '@/shared/ui/card/card'
import { Badge } from '@/shared/ui/badge/badge'
import { Button } from '@/shared/ui/button/button'

export interface AppointmentCardProps {
  appointment: Consulta
  isHistory?: boolean
  onCancelRequest?: (appointment: Consulta) => void
}

export function AppointmentCard({
  appointment,
  isHistory = false,
  onCancelRequest,
}: AppointmentCardProps) {
  const isCancellable =
    !isHistory &&
    appointment.status === 'agendada' &&
    Boolean(onCancelRequest)

  return (
    <Card interactive className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {appointment.profissionalNome ?? 'Profissional'}
          </h3>
          <Badge variant={appointment.status}>{appointment.status}</Badge>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {appointment.especialidade}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>
            Data: <strong className="text-gray-700 dark:text-gray-200">{appointment.data}</strong>
          </span>
          <span>•</span>
          <span>
            Horário: <strong className="text-gray-700 dark:text-gray-200">{appointment.hora}</strong>
          </span>
          <span>•</span>
          <span className="capitalize">{appointment.tipo} consulta</span>
        </div>
      </div>

      {isCancellable && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCancelRequest?.(appointment)}
          className="self-end sm:self-auto text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
        >
          Desmarcar
        </Button>
      )}
    </Card>
  )
}
