import Badge from '@/components/atoms/Badge/badge'
import { NOME_STATUS, NOME_TIPO } from '@/lib/formato'
import type { TabelaConsultasProps } from './types'

export default function TabelaConsultas({ consultas, acoes }: TabelaConsultasProps) {
  if (consultas.length === 0) {
    return (
      <p role="status" className="text-sm text-gray-500 dark:text-gray-400">
        Nenhuma consulta neste dia.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Escala diária de atendimentos do profissional</caption>
        <thead className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
          <tr>
            <th scope="col" className="py-2 pr-4 font-medium">Horário</th>
            <th scope="col" className="py-2 pr-4 font-medium">Paciente</th>
            <th scope="col" className="py-2 pr-4 font-medium">Tipo</th>
            <th scope="col" className="py-2 pr-4 font-medium">Situação</th>
            {acoes && (
              <th scope="col" className="py-2 text-right">
                <span className="sr-only">Ações</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {consultas.map((consulta) => (
            <tr
              key={consulta.id}
              className={`border-b border-gray-100 ${consulta.status === 'cancelada' ? 'text-gray-400' : ''}`}
            >
              <td className="py-2 pr-4 font-medium">{consulta.hora}</td>
              <td className="py-2 pr-4">{consulta.pacienteNome}</td>
              <td className="py-2 pr-4">{NOME_TIPO[consulta.tipo]}</td>
              <td className="py-2 pr-4">
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
              </td>
              {acoes && <td className="py-2 text-right whitespace-nowrap">{acoes(consulta)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
