import type { ReactNode } from 'react'
import type { Consulta } from '@bemviver/shared'
import { Badge } from '@/shared/ui/badge/badge'
import { EmptyState } from '@/shared/ui/empty-state/empty-state'
import { NOME_STATUS, NOME_TIPO } from '@/lib/formato'

export interface ScheduleAppointmentsTableProps {
  appointments?: Consulta[]
  renderActions?: (appointment: Consulta) => ReactNode
  className?: string
}

export function ScheduleAppointmentsTable({
  appointments = [],
  renderActions,
  className = '',
}: ScheduleAppointmentsTableProps) {
  if (appointments.length === 0) {
    return (
      <EmptyState
        variant="inline"
        title="Nenhuma consulta neste dia."
        description="Nenhum atendimento foi agendado para a data selecionada."
      />
    )
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 ${className}`}>
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Escala diária de atendimentos do profissional</caption>
        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-4 py-3">Horário</th>
            <th scope="col" className="px-4 py-3">Paciente</th>
            <th scope="col" className="px-4 py-3">Tipo</th>
            <th scope="col" className="px-4 py-3">Situação</th>
            {renderActions && (
              <th scope="col" className="px-4 py-3 text-right">
                <span className="sr-only">Ações</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
          {appointments.map((appointment) => (
            <tr
              key={appointment.id}
              className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/40 ${
                appointment.status === 'cancelada' ? 'text-gray-400 opacity-60' : ''
              }`}
            >
              <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                {appointment.hora}
              </td>
              <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                {appointment.pacienteNome || 'Paciente não informado'}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {NOME_TIPO[appointment.tipo] || appointment.tipo}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span>{NOME_STATUS[appointment.status] || appointment.status}</span>
                  {appointment.status === 'agendada' &&
                    (appointment.confirmadaEm ? (
                      <Badge variant="success">
                        Confirmada
                      </Badge>
                    ) : (
                      <Badge variant="neutral">
                        Pendente
                      </Badge>
                    ))}
                </div>
              </td>
              {renderActions && (
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {renderActions(appointment)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
