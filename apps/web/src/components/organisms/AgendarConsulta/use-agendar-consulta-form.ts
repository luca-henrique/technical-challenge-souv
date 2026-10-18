import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAgendarConsulta } from '@/hooks/useAgendarConsulta'
import { useEspecialidades } from '@/hooks/useEspecialidades'
import { useHorarios } from '@/hooks/useHorarios'
import { useProfissionais } from '@/hooks/useProfissionais'
import { agendarConsultaPacienteSchema, type DadosAgendarConsultaPaciente } from './schema'

export function useAgendarConsultaForm(onSucesso?: () => void) {
  const router = useRouter()
  const [erroMutacao, setErroMutacao] = useState('')

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DadosAgendarConsultaPaciente>({
    resolver: zodResolver(agendarConsultaPacienteSchema),
    mode: 'onChange',
    defaultValues: {
      profissionalId: '',
      data: '',
      tipo: 'primeira',
      hora: '',
    },
  })

  const [especialidadeFiltro, setEspecialidadeFiltro] = useState('')
  const { data: especialidades = [] } = useEspecialidades()

  const formProfissionalId = useWatch({ control, name: 'profissionalId' })
  const formData = useWatch({ control, name: 'data' })
  const formTipo = useWatch({ control, name: 'tipo' })
  const formHora = useWatch({ control, name: 'hora' })

  const {
    data: profissionais = [],
    isLoading: carregandoProfissionais,
    error: erroProfissionais,
  } = useProfissionais({
    ...(formData ? { data: formData } : {}),
    ...(especialidadeFiltro ? { especialidade: especialidadeFiltro } : {}),
  })

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
      setValue('hora', '', { shouldValidate: true })
    }
  })

  const erroGeral = erroMutacao || erroProfissionais?.message || erroHorarios?.message

  return {
    control,
    setValue,
    errors,
    onSubmit,
    especialidades,
    especialidadeFiltro,
    setEspecialidadeFiltro,
    profissionais,
    carregandoProfissionais,
    formProfissionalId,
    formData,
    formTipo,
    formHora,
    horarios,
    carregandoHorarios,
    enviando,
    erroGeral,
  }
}
