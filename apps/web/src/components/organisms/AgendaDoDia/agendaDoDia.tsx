'use client'

import Alert from '@/components/atoms/Alert/alert'
import Button from '@/components/atoms/Button/button'
import CardAgendaDia from '@/components/organisms/CardAgendaDia/cardAgendaDia'
import MarcarConsulta from '@/components/organisms/MarcarConsulta/marcarConsulta'
import { ProvedorAgenda, useAgendaContext } from '@/providers/provedorAgenda'
import type { AgendaDoDiaProps } from './types'

function ConteudoAgendaDoDia() {
  const context = useAgendaContext()
  if (!context) return null

  const {
    agenda,
    carregando,
    erro,
    cancelando,
    registrandoFalta,
    executarAcao,
  } = context

  if (carregando && !agenda) {
    return <p className="text-sm text-gray-500">Carregando agenda...</p>
  }

  if (erro && !agenda) {
    return <Alert>{erro}</Alert>
  }

  if (!agenda) {
    return null
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
      <CardAgendaDia
        mensagemFolga="Dia bloqueado como folga do profissional."
        acoes={(consulta) =>
          consulta.status === 'agendada' && (
            <div className="flex justify-end gap-2">
              {new Date(consulta.inicio) <= new Date() && (
                <Button
                  variante="secundario"
                  tamanho="compacto"
                  disabled={registrandoFalta}
                  onClick={() => executarAcao('falta', consulta.id)}
                >
                  {registrandoFalta ? 'Registrando...' : 'Registrar falta'}
                </Button>
              )}
              <Button
                variante="secundario"
                tamanho="compacto"
                disabled={cancelando}
                onClick={() => executarAcao('cancelar', consulta.id)}
              >
                {cancelando ? 'Cancelando...' : 'Cancelar'}
              </Button>
            </div>
          )
        }
      />

      <MarcarConsulta />
    </div>
  )
}

export default function AgendaDoDia({
  profissionalId,
  data,
}: AgendaDoDiaProps) {
  return (
    <ProvedorAgenda profissionalId={profissionalId} data={data}>
      <ConteudoAgendaDoDia />
    </ProvedorAgenda>
  )
}
