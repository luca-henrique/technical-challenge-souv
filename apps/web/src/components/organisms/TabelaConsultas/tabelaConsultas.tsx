import { NOME_STATUS, NOME_TIPO } from '@/lib/formato'
import type { TabelaConsultasProps } from './types'

export default function TabelaConsultas({ consultas, acoes }: TabelaConsultasProps) {
  if (consultas.length === 0) {
    return <p className="text-sm text-gray-500">Nenhuma consulta neste dia.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 text-gray-500">
          <tr>
            <th className="py-2 pr-4 font-medium">Horário</th>
            <th className="py-2 pr-4 font-medium">Paciente</th>
            <th className="py-2 pr-4 font-medium">Tipo</th>
            <th className="py-2 pr-4 font-medium">Situação</th>
            {acoes && <th className="py-2" />}
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
                    <span className="ml-2 inline-flex items-center rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                      Confirmada
                    </span>
                  ) : (
                    <span className="ml-2 inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      Pendente
                    </span>
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
