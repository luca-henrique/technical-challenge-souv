'use client'

import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { diaUtil, hojeEmRecife } from '@bemviver/shared'
import Alert from '@/components/atoms/Alert/alert'
import Button from '@/components/atoms/Button/button'
import Card from '@/components/atoms/Card/card'
import Heading from '@/components/atoms/Heading/heading'
import IconButton from '@/components/atoms/IconButton/iconButton'
import Skeleton from '@/components/atoms/Skeleton/skeleton'
import SeletorData from '@/components/molecules/SeletorData/seletorData'
import SeletorHorario from '@/components/molecules/SeletorHorario/seletorHorario'
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

  useEffect(() => {
    if (!aberto) return
    function aoPressionarTecla(e: KeyboardEvent) {
      if (e.key === 'Escape' && !remarcando) onFechar()
    }
    window.addEventListener('keydown', aoPressionarTecla)
    return () => window.removeEventListener('keydown', aoPressionarTecla)
  }, [aberto, remarcando, onFechar])

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-remarcar-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <Card className="w-full max-w-md space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
          <div>
            <Heading id="modal-remarcar-titulo" as="h2" variante="modal">
              Remarcar consulta
            </Heading>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {consulta.profissionalNome} ({consulta.especialidade})
            </p>
          </div>
          <IconButton
            onClick={onFechar}
            aria-label="Fechar modal de remarcação"
          >
            ✕
          </IconButton>
        </div>

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
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Novo horário
              </legend>
              {carregandoHorarios ? (
                <div className="mt-2 space-y-2" role="status" aria-label="Carregando horários">
                  <Skeleton className="h-9 w-full" />
                </div>
              ) : (
                <SeletorHorario
                  horarios={horarios}
                  selecionado={formNovaHora}
                  onSelecionar={(hora) => setValue('novaHora', hora, { shouldValidate: true })}
                />
              )}
              {errors.novaHora && (
                <p className="mt-1 text-sm text-red-600">{errors.novaHora.message}</p>
              )}
            </fieldset>
          )}

          {(erroMutacao || erroHorarios?.message) && (
            <Alert>{erroMutacao || erroHorarios?.message}</Alert>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-800">
            <Button type="button" variante="secundario" onClick={onFechar} disabled={remarcando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formNovaHora || remarcando}>
              {remarcando ? 'Remarcando...' : 'Confirmar nova data'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
