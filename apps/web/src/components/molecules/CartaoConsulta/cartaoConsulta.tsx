import { useState } from 'react'
import Button from '@/components/atoms/Button/button'
import Badge from '@/components/atoms/Badge/badge'
import Card from '@/components/atoms/Card/card'
import ModalRemarcarConsulta from '@/components/molecules/ModalRemarcarConsulta/modalRemarcarConsulta'
import { useConfirmarConsulta } from '@/hooks/useConfirmarConsulta'
import { NOME_STATUS, NOME_TIPO, formatarData } from '@/lib/formato'
import type { CartaoConsultaProps } from './types'

export default function CartaoConsulta({ consulta, onCancelar }: CartaoConsultaProps) {
  const [confirmando, setConfirmando] = useState(false)
  const [remarcando, setRemarcando] = useState(false)
  const { mutate: confirmarPresenca, isPending: confirmandoPresenca } = useConfirmarConsulta()

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
          {NOME_TIPO[consulta.tipo]}, {NOME_STATUS[consulta.status].toLowerCase()}
        </p>

        {consulta.confirmadaEm ? (
          <div className="pt-1">
            <Badge variante="sucesso" tamanho="md">
              ✓ Presença confirmada
            </Badge>
          </div>
        ) : consulta.status === 'agendada' ? (
          <div className="pt-1">
            <Button
              variante="secundario"
              tamanho="compacto"
              disabled={confirmandoPresenca}
              onClick={() => confirmarPresenca(consulta.id)}
              aria-label={`Confirmar presença na consulta com ${consulta.profissionalNome} no dia ${formatarData(consulta.data)} às ${consulta.hora}`}
              className="text-xs text-teal-700 hover:text-teal-800 border-teal-300"
            >
              {confirmandoPresenca ? 'Confirmando...' : 'Confirmar presença'}
            </Button>
          </div>
        ) : null}
        {consulta.status === 'agendada' &&
          (confirmando ? (
            <div className="flex gap-2 pt-2">
              <Button
                variante="perigo"
                onClick={() => onCancelar(consulta.id)}
                aria-label={`Confirmar cancelamento da consulta com ${consulta.profissionalNome}`}
                className="flex-1"
              >
                Confirmar cancelamento
              </Button>
              <Button
                variante="secundario"
                onClick={() => setConfirmando(false)}
                aria-label="Desistir do cancelamento"
              >
                Voltar
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 pt-2">
              <Button
                variante="secundario"
                onClick={() => setRemarcando(true)}
                aria-label={`Remarcar consulta com ${consulta.profissionalNome}`}
                className="flex-1"
              >
                Remarcar
              </Button>
              <Button
                variante="secundario"
                onClick={() => setConfirmando(true)}
                aria-label={`Cancelar consulta com ${consulta.profissionalNome}`}
                className="flex-1 text-red-600 hover:text-red-700"
              >
                Cancelar consulta
              </Button>
            </div>
          ))}
      </Card>

      <ModalRemarcarConsulta
        consulta={consulta}
        aberto={remarcando}
        onFechar={() => setRemarcando(false)}
      />
    </>
  )
}
