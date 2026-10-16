import { useState } from 'react'
import Button from '@/components/atoms/Button/button'
import Badge from '@/components/atoms/Badge/badge'
import Card from '@/components/atoms/Card/card'
import InlineConfirmButton from '@/components/molecules/InlineConfirmButton/inlineConfirmButton'
import ModalRemarcarConsulta from '@/components/molecules/ModalRemarcarConsulta/modalRemarcarConsulta'
import { useConfirmarConsulta } from '@/hooks/useConfirmarConsulta'
import { NOME_STATUS, NOME_TIPO, formatarData } from '@/lib/formato'
import type { CartaoConsultaProps } from './types'

export default function CartaoConsulta({
  consulta,
  onCancelar,
  historico = false,
}: CartaoConsultaProps) {
  const [confirmando, setConfirmando] = useState(false)
  const [remarcando, setRemarcando] = useState(false)
  const { mutate: confirmarPresenca, isPending: confirmandoPresenca } = useConfirmarConsulta()

  const ehPassadaOuHistorico = historico
  const statusExibicao = NOME_STATUS[consulta.status].toLowerCase()

  return (
    <>
      <Card className="space-y-1">
        <p className="font-medium first-letter:uppercase">
          {formatarData(consulta.data)} às {consulta.hora}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          {consulta.profissionalNome} ({consulta.especialidade})
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {NOME_TIPO[consulta.tipo]}, {statusExibicao}
        </p>

        {consulta.confirmadaEm ? (
          <div className="pt-1">
            <Badge variante="sucesso" tamanho="md">
              ✓ Presença confirmada
            </Badge>
          </div>
        ) : !ehPassadaOuHistorico && consulta.status === 'agendada' ? (
          <div className="pt-1">
            <Button
              variante="outline-primario"
              tamanho="compacto"
              disabled={confirmandoPresenca}
              onClick={() => confirmarPresenca(consulta.id)}
              aria-label={`Confirmar presença na consulta com ${consulta.profissionalNome} no dia ${formatarData(consulta.data)} às ${consulta.hora}`}
            >
              {confirmandoPresenca ? 'Confirmando...' : 'Confirmar presença'}
            </Button>
          </div>
        ) : null}

        {!ehPassadaOuHistorico && consulta.status === 'agendada' && (
          <div className="flex gap-2 pt-2">
            {!confirmando && (
              <Button
                variante="secundario"
                tamanho="compacto"
                onClick={() => setRemarcando(true)}
                className="flex-1"
              >
                Remarcar
              </Button>
            )}
            <InlineConfirmButton
              labelTrigger="Cancelar consulta"
              labelConfirmar="Confirmar cancelamento"
              labelCancelar="Voltar"
              confirmando={confirmando}
              onConfirmandoChange={setConfirmando}
              onConfirmar={() => onCancelar(consulta.id)}
              varianteTrigger="secundario"
              varianteConfirmar="perigo"
              varianteCancelar="secundario"
              tamanho="compacto"
              classNameTrigger="flex-1 text-red-600 hover:text-red-700"
              classNameContainer="contents"
            />
          </div>
        )}
      </Card>

      <ModalRemarcarConsulta
        consulta={consulta}
        aberto={remarcando}
        onFechar={() => setRemarcando(false)}
      />
    </>
  )
}
