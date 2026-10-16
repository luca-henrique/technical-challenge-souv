import Card from '@/components/atoms/Card/card'
import Table from '@/components/atoms/Table/table'
import EmptyState from '@/components/molecules/EmptyState/emptyState'
import Paginacao from '@/components/molecules/Paginacao/paginacao'
import type { TabelaReincidentesProps } from './types'

export default function TabelaReincidentes({
  reincidentes,
  paginacao,
  aoMudarPagina,
}: TabelaReincidentesProps) {
  if (reincidentes.length === 0) {
    return (
      <EmptyState
        variante="card"
        titulo="Nenhum paciente reincidente em faltas registrado no período."
      />
    )
  }

  return (
    <Card className="space-y-3">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        Pacientes com faltas no período
      </h3>
      <Table caption="Pacientes com faltas no período selecionado">
        <Table.Header>
          <Table.Row>
            <Table.Head>Paciente</Table.Head>
            <Table.Head>E-mail</Table.Head>
            <Table.Head className="text-right">Faltas registradas</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {reincidentes.map((p) => (
            <Table.Row key={p.pacienteId}>
              <Table.Cell className="font-medium text-gray-900 dark:text-gray-100">{p.nome}</Table.Cell>
              <Table.Cell className="text-gray-500 dark:text-gray-400">{p.email}</Table.Cell>
              <Table.Cell className="text-right font-semibold text-rose-600 dark:text-rose-400">
                {p.totalFaltas} {p.totalFaltas === 1 ? 'falta' : 'faltas'}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

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
