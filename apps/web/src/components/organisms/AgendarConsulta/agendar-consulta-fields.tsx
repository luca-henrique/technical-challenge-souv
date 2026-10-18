import { Controller, type Control, type FieldErrors, type UseFormSetValue } from 'react-hook-form'
import { diaUtil, hojeEmRecife, type Profissional } from '@bemviver/shared'
import CardEntrarListaEspera from '@/components/molecules/CardEntrarListaEspera/cardEntrarListaEspera'
import SecaoHorario from '@/components/molecules/SecaoHorario/secaoHorario'
import SeletorData from '@/components/molecules/SeletorData/seletorData'
import SeletorEspecialidade from '@/components/molecules/SeletorEspecialidade/seletorEspecialidade'
import SeletorProfissional from '@/components/molecules/SeletorProfissional/seletorProfissional'
import SeletorTipoConsulta from '@/components/molecules/SeletorTipoConsulta/seletorTipoConsulta'
import type { OpcaoTipoConsulta } from '@/components/molecules/SeletorTipoConsulta/types'
import type { DadosAgendarConsultaPaciente } from './schema'

export interface AgendarConsultaFieldsProps {
  control: Control<DadosAgendarConsultaPaciente>
  setValue: UseFormSetValue<DadosAgendarConsultaPaciente>
  errors: FieldErrors<DadosAgendarConsultaPaciente>
  especialidades: string[]
  especialidadeFiltro: string
  setEspecialidadeFiltro: (esp: string) => void
  profissionais: Profissional[]
  opcoesTipoConsulta?: readonly OpcaoTipoConsulta[]
  formProfissionalId?: string
  formData?: string
  formTipo?: 'primeira' | 'retorno'
  formHora?: string
  horarios: string[]
  carregandoHorarios: boolean
}

export function AgendarConsultaFields({
  control,
  setValue,
  errors,
  especialidades,
  especialidadeFiltro,
  setEspecialidadeFiltro,
  profissionais,
  opcoesTipoConsulta,
  formProfissionalId,
  formData,
  formTipo = 'primeira',
  formHora,
  horarios,
  carregandoHorarios,
}: AgendarConsultaFieldsProps) {
  const resetHora = () => setValue('hora', '', { shouldValidate: true })

  return (
    <>
      {especialidades.length > 0 && (
        <SeletorEspecialidade
          especialidades={especialidades}
          valor={especialidadeFiltro}
          onChange={(esp) => { setEspecialidadeFiltro(esp); setValue('profissionalId', '', { shouldValidate: true }); resetHora() }}
        />
      )}

      <Controller
        name="profissionalId"
        control={control}
        render={({ field }) => (
          <SeletorProfissional
            profissionais={profissionais}
            valor={field.value}
            permitirVazio
            onChange={(id) => { field.onChange(id); resetHora() }}
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
            onChange={(novaData) => { field.onChange(novaData); resetHora() }}
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
            onChange={(novoTipo) => { field.onChange(novoTipo); resetHora() }}
            erro={errors.tipo?.message}
          />
        )}
      />

      {formProfissionalId && formData && diaUtil(formData) && (
        <SecaoHorario
          horarios={horarios}
          selecionado={formHora ?? ''}
          carregando={carregandoHorarios}
          erro={errors.hora?.message}
          onSelecionar={(hora) => setValue('hora', hora, { shouldValidate: true })}
          slotVazio={<CardEntrarListaEspera profissionalId={formProfissionalId} data={formData} tipo={formTipo} />}
        />
      )}
    </>
  )
}
