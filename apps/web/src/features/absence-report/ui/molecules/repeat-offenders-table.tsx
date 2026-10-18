import type { Paginacao as PaginacaoType } from '@bemviver/shared'
import { Card } from '@/shared/ui/card/card'
import { EmptyState } from '@/shared/ui/empty-state/empty-state'
import Paginacao from '@/components/molecules/Paginacao/paginacao'

export interface RepeatOffender {
  pacienteId: string
  nome: string
  email: string
  totalFaltas: number
}

export interface RepeatOffendersTableProps {
  repeatOffenders: RepeatOffender[]
  pagination?: PaginacaoType
  onPageChange?: (page: number) => void
  className?: string
}

export function RepeatOffendersTable({
  repeatOffenders,
  pagination,
  onPageChange,
  className = '',
}: RepeatOffendersTableProps) {
  if (repeatOffenders.length === 0) {
    return (
      <EmptyState
        variant="card"
        title="Nenhum paciente reincidente em faltas registrado no período."
      />
    )
  }

  return (
    <Card className={`p-4 sm:p-6 space-y-4 ${className}`}>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        Pacientes com faltas no período
      </h3>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Pacientes com faltas no período selecionado</caption>
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-4 py-3">Paciente</th>
              <th scope="col" className="px-4 py-3">E-mail</th>
              <th scope="col" className="px-4 py-3 text-right">Faltas registradas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {repeatOffenders.map((patient) => (
              <tr key={patient.pacienteId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                  {patient.nome}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {patient.email}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-rose-600 dark:text-rose-400">
                  {patient.totalFaltas} {patient.totalFaltas === 1 ? 'falta' : 'faltas'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && onPageChange && (
        <Paginacao
          pagina={pagination.pagina}
          totalPaginas={pagination.totalPaginas}
          totalItens={pagination.totalItens}
          aoMudarPagina={onPageChange}
        />
      )}
    </Card>
  )
}
