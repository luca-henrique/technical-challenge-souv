'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { hojeEmRecife } from '@bemviver/shared'
import Alert from '@/components/atoms/Alert/alert'
import Button from '@/components/atoms/Button/button'
import Card from '@/components/atoms/Card/card'
import Skeleton from '@/components/atoms/Skeleton/skeleton'
import SeletorData from '@/components/molecules/SeletorData/seletorData'
import SeletorHorario from '@/components/molecules/SeletorHorario/seletorHorario'
import SeletorProfissional from '@/components/molecules/SeletorProfissional/seletorProfissional'
import SeletorTipoConsulta from '@/components/molecules/SeletorTipoConsulta/seletorTipoConsulta'
import { useAgendarConsulta } from '@/hooks/useAgendarConsulta'
import { useHorarios } from '@/hooks/useHorarios'
import { useProfissionais } from '@/hooks/useProfissionais'
import { agendarConsultaPacienteSchema, type DadosAgendarConsultaPaciente } from './schema'
import type { AgendarConsultaProps } from './types'

export default function AgendarConsulta({
  className = '',
  onSucesso,
  opcoesTipoConsulta,
}: AgendarConsultaProps) {
  const router = useRouter()
  const [erroMutacao, setErroMutacao] = useState('')

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DadosAgendarConsultaPaciente>({
    resolver: zodResolver(agendarConsultaPacienteSchema),
    defaultValues: {
      profissionalId: '',
      data: '',
      tipo: 'primeira',
      hora: '',
    },
  })

  const formProfissionalId = useWatch({ control, name: 'profissionalId' })
  const formData = useWatch({ control, name: 'data' })
  const formTipo = useWatch({ control, name: 'tipo' })
  const formHora = useWatch({ control, name: 'hora' })

  const {
    data: profissionais = [],
    isLoading: carregandoProfissionais,
    error: erroProfissionais,
  } = useProfissionais(formData ? { data: formData } : undefined)

  const {
    data: horarios = [],
    isLoading: carregandoHorarios,
    error: erroHorarios,
  } = useHorarios(formProfissionalId, formData, formTipo)

  const { mutateAsync: agendar, isPending: enviando } = useAgendarConsulta()

  const onSubmit = handleSubmit(async (valores) => {
    setErroMutacao('')
    try {
      await agendar({
        profissionalId: valores.profissionalId,
        data: valores.data,
        hora: valores.hora,
        tipo: valores.tipo,
      })
      if (onSucesso) {
        onSucesso()
      } else {
        router.push('/paciente')
      }
    } catch (e) {
      setErroMutacao((e as Error).message)
    }
  })

  const erroGeral = erroMutacao || erroProfissionais?.message || erroHorarios?.message

  return (
    <div className={`mx-auto max-w-md space-y-4 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Marcar consulta</h1>
        <Link href="/paciente" className="text-sm text-teal-700 underline">
          Voltar
        </Link>
      </div>

      <Card className="space-y-4">
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <Controller
            name="profissionalId"
            control={control}
            render={({ field }) => (
              <SeletorProfissional
                profissionais={profissionais}
                valor={field.value}
                permitirVazio
                onChange={(id) => {
                  field.onChange(id)
                  setValue('hora', '', { shouldValidate: true })
                }}
                erro={errors.profissionalId?.message}
              />
            )}
          />

          <Controller
            name="data"
            control={control}
            render={({ field }) => (
              <SeletorData
                min={hojeEmRecife()}
                valor={field.value}
                onChange={(novaData) => {
                  field.onChange(novaData)
                  setValue('hora', '', { shouldValidate: true })
                }}
                erro={errors.data?.message}
              />
            )}
          />

          <Controller
            name="tipo"
            control={control}
            render={({ field }) => (
              <SeletorTipoConsulta
                opcoes={opcoesTipoConsulta}
                valor={field.value}
                onChange={(novoTipo) => {
                  field.onChange(novoTipo)
                  setValue('hora', '', { shouldValidate: true })
                }}
                erro={errors.tipo?.message}
              />
            )}
          />

          {formProfissionalId && formData && (
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700">Horário</legend>
              {carregandoHorarios ? (
                <div className="mt-2 space-y-2" role="status" aria-label="Carregando horários">
                  <Skeleton className="h-9 w-full" />
                  <span className="sr-only">Carregando horários disponíveis...</span>
                </div>
              ) : (
                <SeletorHorario
                  horarios={horarios}
                  selecionado={formHora}
                  onSelecionar={(horaEscolhida) => {
                    setValue('hora', horaEscolhida, { shouldValidate: true })
                  }}
                />
              )}
              {errors.hora && (
                <p className="mt-1 text-sm text-red-600">{errors.hora.message}</p>
              )}
            </fieldset>
          )}

          {erroGeral && <Alert>{erroGeral}</Alert>}

          <Button
            type="submit"
            disabled={!formHora || enviando || carregandoProfissionais}
            className="w-full"
          >
            {enviando ? 'Marcando...' : 'Confirmar consulta'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
