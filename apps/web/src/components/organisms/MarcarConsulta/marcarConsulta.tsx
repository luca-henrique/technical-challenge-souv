'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { GRADE, gradePorTipo } from '@bemviver/shared'
import Alert from '@/components/atoms/Alert/alert'
import Button from '@/components/atoms/Button/button'
import Card from '@/components/atoms/Card/card'
import Select from '@/components/atoms/Select/select'
import Field from '@/components/molecules/Field/field'
import { useAgenda } from '@/hooks/useAgenda'
import { usePacientes } from '@/hooks/usePacientes'
import { NOME_TIPO_COM_DURACAO } from '@/lib/formato'
import { useAgendaContext } from '@/providers/provedorAgenda'
import { agendarConsultaSchema, type DadosAgendarConsulta } from './schema'
import type { MarcarConsultaProps } from './types'

export default function MarcarConsulta({
  profissionalId: propProfissionalId,
  data: propData,
  onMarcada,
}: MarcarConsultaProps) {
  const context = useAgendaContext()
  const profissionalId = propProfissionalId ?? context?.profissionalId ?? ''
  const data = propData ?? context?.data ?? ''

  const { data: pacientes = [], isLoading: carregandoPacientes, error: erroPacientes } = usePacientes()

  // Se já estiver dentro de um AgendaContext, reutiliza a mutation do context evitando re-execuções.
  const fallbackAgenda = useAgenda(
    context ? '' : profissionalId,
    context ? '' : data,
  )

  const agendarConsulta = context?.agendarConsulta ?? fallbackAgenda.agendarConsulta
  const agendando = context?.agendando ?? fallbackAgenda.agendando

  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [erroMutacao, setErroMutacao] = useState('')

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DadosAgendarConsulta>({
    resolver: zodResolver(agendarConsultaSchema),
    defaultValues: {
      pacienteId: '',
      tipo: 'primeira',
      hora: GRADE[0],
    },
  })

  const formTipo = useWatch({ control, name: 'tipo' })
  const gradeDisponivel = gradePorTipo(formTipo ?? 'primeira')

  const onSubmit = handleSubmit(async (valores) => {
    setMensagemSucesso('')
    setErroMutacao('')
    try {
      await agendarConsulta({
        profissionalId,
        data,
        pacienteId: valores.pacienteId,
        tipo: valores.tipo,
        hora: valores.hora,
      })
      setMensagemSucesso('Consulta marcada com sucesso.')
      reset({
        pacienteId: '',
        tipo: 'primeira',
        hora: GRADE[0],
      })
      onMarcada?.()
    } catch (e) {
      setErroMutacao((e as Error).message)
    }
  })

  return (
    <Card>
      <form onSubmit={onSubmit} noValidate className="space-y-3">
        <h2 className="text-lg font-semibold">Marcar consulta</h2>
        <Field label="Paciente" erro={errors.pacienteId?.message}>
          <Select
            {...register('pacienteId')}
            aria-invalid={Boolean(errors.pacienteId)}
            disabled={carregandoPacientes}
          >
            <option value="">
              {carregandoPacientes ? 'Carregando pacientes...' : 'Selecione'}
            </option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tipo" erro={errors.tipo?.message}>
          <Select {...register('tipo')} aria-invalid={Boolean(errors.tipo)}>
            <option value="primeira">{NOME_TIPO_COM_DURACAO.primeira}</option>
            <option value="retorno">{NOME_TIPO_COM_DURACAO.retorno}</option>
          </Select>
        </Field>
        <Field label="Horário" erro={errors.hora?.message}>
          <Select {...register('hora')} aria-invalid={Boolean(errors.hora)}>
            {gradeDisponivel.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" disabled={agendando} className="w-full">
          {agendando ? 'Marcando...' : 'Marcar'}
        </Button>
        {mensagemSucesso && (
          <p role="status" className="text-sm text-teal-700">
            {mensagemSucesso}
          </p>
        )}
        {erroMutacao && <Alert>{erroMutacao}</Alert>}
        {erroPacientes && <Alert>{erroPacientes.message}</Alert>}
      </form>
    </Card>
  )
}
