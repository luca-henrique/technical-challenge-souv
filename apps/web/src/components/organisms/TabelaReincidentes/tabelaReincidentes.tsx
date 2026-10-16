import Card from '@/components/atoms/Card/card'
import Paginacao from '@/components/molecules/Paginacao/paginacao'
import type { TabelaReincidentesProps } from './types'

export default function TabelaReincidentes({
  reincidentes,
  paginacao,
  aoMudarPagina,
}: TabelaReincidentesProps) {
  if (reincidentes.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nenhum paciente reincidente em faltas registrado no período.
        </p>
      </Card>
    )
  }

  return (
    <Card className="space-y-3">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        Pacientes com faltas no período
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
          <caption className="sr-only">Pacientes com faltas no período selecionado</caption>
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <th scope="col" className="py-2 pr-4">Paciente</th>
              <th scope="col" className="py-2 pr-4">E-mail</th>
              <th scope="col" className="py-2 text-right">Faltas registradas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {reincidentes.map((p) => (
              <tr key={p.pacienteId}>
                <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">{p.nome}</td>
                <td className="py-2 pr-4 text-gray-500 dark:text-gray-400">{p.email}</td>
                <td className="py-2 text-right font-semibold text-rose-600 dark:text-rose-400">
                  {p.totalFaltas} {p.totalFaltas === 1 ? 'falta' : 'faltas'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginacao && aoMudarPagina && (
        <Paginacao
          pagina={paginacao.pagina}
          totalPaginas={paginacao.totalPaginas}
          totalItens={paginacao.totalItens}
          aoMudarPagina={aoMudarPagina}
        />
      )}
    </Card>
  )
}
