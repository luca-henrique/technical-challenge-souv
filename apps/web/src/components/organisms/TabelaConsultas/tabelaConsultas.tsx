import Badge from '@/components/atoms/Badge/badge'
import Table from '@/components/atoms/Table/table'
import EmptyState from '@/components/molecules/EmptyState/emptyState'
import { NOME_STATUS, NOME_TIPO } from '@/lib/formato'
import type { TabelaConsultasProps } from './types'

export default function TabelaConsultas({ consultas = [], acoes }: TabelaConsultasProps) {
  if (!consultas || consultas.length === 0) {
    return <EmptyState variante="inline" titulo="Nenhuma consulta neste dia." />
  }

  return (
    <Table caption="Escala diária de atendimentos do profissional">
      <Table.Header className="text-gray-500 dark:text-gray-400">
        <Table.Row>
          <Table.Head>Horário</Table.Head>
          <Table.Head>Paciente</Table.Head>
          <Table.Head>Tipo</Table.Head>
          <Table.Head>Situação</Table.Head>
          {acoes && (
            <Table.Head className="text-right">
              <span className="sr-only">Ações</span>
            </Table.Head>
          )}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {consultas.map((consulta) => (
          <Table.Row
            key={consulta.id}
            className={consulta.status === 'cancelada' ? 'text-gray-400' : ''}
          >
            <Table.Cell className="font-medium">{consulta.hora}</Table.Cell>
            <Table.Cell>{consulta.pacienteNome}</Table.Cell>
            <Table.Cell>{NOME_TIPO[consulta.tipo]}</Table.Cell>
            <Table.Cell>
              <span>{NOME_STATUS[consulta.status]}</span>
              {consulta.status === 'agendada' &&
                (consulta.confirmadaEm ? (
                  <Badge variante="sucesso" tamanho="sm" className="ml-2">
                    Confirmada
                  </Badge>
                ) : (
                  <Badge variante="neutro" tamanho="sm" className="ml-2">
                    Pendente
                  </Badge>
                ))}
            </Table.Cell>
            {acoes && <Table.Cell className="text-right whitespace-nowrap">{acoes(consulta)}</Table.Cell>}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

