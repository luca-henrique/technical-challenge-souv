'use client'

import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { diaUtil, hojeEmRecife } from '@bemviver/shared'
import Alert from '@/components/atoms/Alert/alert'
import Button from '@/components/atoms/Button/button'
import Modal from '@/components/molecules/Modal/modal'
import SecaoHorario from '@/components/molecules/SecaoHorario/secaoHorario'
import SeletorData from '@/components/molecules/SeletorData/seletorData'
import { useHorarios } from '@/hooks/useHorarios'
import { useRemarcarConsulta } from '@/hooks/useRemarcarConsulta'
import { formatarData } from '@/lib/formato'
import { remarcarConsultaSchema, type DadosRemarcarConsultaForm } from './schema'
import type { ModalRemarcarConsultaProps } from './types'

export default function ModalRemarcarConsulta({
  consulta,
  aberto,
  onFechar,
  onSucesso,
}: ModalRemarcarConsultaProps) {
  const [erroMutacao, setErroMutacao] = useState('')

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DadosRemarcarConsultaForm>({
    resolver: zodResolver(remarcarConsultaSchema),
    defaultValues: {
      novaData: '',
      novaHora: '',
    },
  })

  const formNovaData = useWatch({ control, name: 'novaData' })
  const formNovaHora = useWatch({ control, name: 'novaHora' })

  const {
    data: horarios = [],
    isLoading: carregandoHorarios,
    error: erroHorarios,
  } = useHorarios(consulta.profissionalId, formNovaData, consulta.tipo)

  const { mutateAsync: remarcar, isPending: remarcando } = useRemarcarConsulta()

  if (!aberto) return null

  const onSubmit = handleSubmit(async (valores) => {
    setErroMutacao('')
    try {
      await remarcar({
        id: consulta.id,
        novaData: valores.novaData,
        novaHora: valores.novaHora,
      })
      if (onSucesso) onSucesso()
      onFechar()
    } catch (e) {
      setErroMutacao((e as Error).message)
    }
  })

  return (
    <Modal aberto={aberto} onFechar={onFechar} tituloId="modal-remarcar-titulo">
      <Modal.Header
        id="modal-remarcar-titulo"
        titulo="Remarcar consulta"
        subtitulo={`${consulta.profissionalNome} (${consulta.especialidade})`}
        onFechar={onFechar}
      />
      <Modal.Body>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Horário atual: <strong>{formatarData(consulta.data)} às {consulta.hora}</strong>.
          Selecione a nova data e o horário desejado:
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <Controller
            name="novaData"
            control={control}
            render={({ field }) => (
              <SeletorData
                label="Nova data"
                min={hojeEmRecife()}
                valor={field.value}
                onChange={(dataEscolhida) => {
                  field.onChange(dataEscolhida)
                  setValue('novaHora', '', { shouldValidate: true })
                }}
                erro={errors.novaData?.message}
              />
            )}
          />

          {formNovaData && diaUtil(formNovaData) && (
            <SecaoHorario
              label="Novo horário"
              horarios={horarios}
              selecionado={formNovaHora}
              carregando={carregandoHorarios}
              erro={errors.novaHora?.message}
              onSelecionar={(hora) => setValue('novaHora', hora, { shouldValidate: true })}
            />
          )}

          {(erroMutacao || erroHorarios?.message) && (
            <Alert>{erroMutacao || erroHorarios?.message}</Alert>
          )}

          <Modal.Footer>
            <Button type="button" variante="secundario" onClick={onFechar} disabled={remarcando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formNovaHora || remarcando}>
              {remarcando ? 'Remarcando...' : 'Confirmar nova data'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </Modal>
  )
}
