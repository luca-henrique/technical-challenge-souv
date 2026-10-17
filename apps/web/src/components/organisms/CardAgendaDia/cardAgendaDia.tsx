'use client'

import Alert from '@/components/atoms/Alert/alert'
import Card from '@/components/atoms/Card/card'
import BotaoExportarPdf from '@/components/molecules/BotaoExportarPdf/botaoExportarPdf'
import TabelaConsultas from '@/components/organisms/TabelaConsultas/tabelaConsultas'
import { formatarData } from '@/lib/formato'
import { useAgendaContext } from '@/providers/provedorAgenda'
import type { CardAgendaDiaProps } from './types'

export default function CardAgendaDia({
  agenda: agendaProp,
  profissionalId: profissionalIdProp,
  data: dataProp,
  acoes,
  erro: erroProp,
  erroAcao: erroAcaoProp,
  mensagemFolga = 'Dia bloqueado como folga do profissional.',
  className = '',
}: CardAgendaDiaProps) {
  const context = useAgendaContext()

  const agenda = agendaProp ?? context?.agenda
  const profissionalId = profissionalIdProp ?? context?.profissionalId
  const data = dataProp ?? context?.data ?? agenda?.data
  const erro = erroProp ?? context?.erro
  const erroAcao = erroAcaoProp ?? context?.erroAcao

  if (!agenda) return null

  return (
    <Card className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold first-letter:uppercase">
          {formatarData(agenda.data)}
        </h2>
        {profissionalId && data && (
          <BotaoExportarPdf
            tipo="agenda"
            tamanho="compacto"
            filtros={{
              data,
              profissionalId,
            }}
          />
        )}
      </div>

      {agenda.folga && (
        <Alert variante="aviso">
          {mensagemFolga}
        </Alert>
      )}

      {erro && <Alert>{erro}</Alert>}
      {erroAcao && <Alert>{erroAcao}</Alert>}

      <TabelaConsultas
        consultas={agenda.consultas}
        acoes={acoes}
      />
    </Card>
  )
}
