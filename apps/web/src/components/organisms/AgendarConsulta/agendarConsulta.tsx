'use client'

import Link from 'next/link'
import { diaUtil } from '@bemviver/shared'
import Alert from '@/components/atoms/Alert/alert'
import Button from '@/components/atoms/Button/button'
import Card from '@/components/atoms/Card/card'
import PageHeader from '@/components/molecules/PageHeader/pageHeader'
import { AgendarConsultaFields } from './agendar-consulta-fields'
import { useAgendarConsultaForm } from './use-agendar-consulta-form'
import type { AgendarConsultaProps } from './types'

export default function AgendarConsulta({
  className = '',
  onSucesso,
  opcoesTipoConsulta,
}: AgendarConsultaProps) {
  const form = useAgendarConsultaForm(onSucesso)

  return (
    <div className={`mx-auto max-w-md space-y-4 ${className}`}>
      <PageHeader
        titulo="Marcar consulta"
        acoes={
          <Link href="/paciente" className="text-sm text-teal-700 hover:text-teal-800 dark:text-teal-400 underline">
            Voltar
          </Link>
        }
      />
      <Card className="space-y-4">
        <form onSubmit={form.onSubmit} noValidate className="space-y-4">
          <AgendarConsultaFields
            control={form.control}
            setValue={form.setValue}
            errors={form.errors}
            especialidades={form.especialidades}
            especialidadeFiltro={form.especialidadeFiltro}
            setEspecialidadeFiltro={form.setEspecialidadeFiltro}
            profissionais={form.profissionais}
            opcoesTipoConsulta={opcoesTipoConsulta}
            formProfissionalId={form.formProfissionalId}
            formData={form.formData}
            formTipo={form.formTipo}
            formHora={form.formHora}
            horarios={form.horarios}
            carregandoHorarios={form.carregandoHorarios}
          />

          {form.erroGeral && <Alert>{form.erroGeral}</Alert>}

          <Button
            type="submit"
            disabled={!form.formHora || form.enviando || form.carregandoProfissionais || (Boolean(form.formData) && !diaUtil(form.formData))}
            className="w-full"
          >
            {form.enviando ? 'Marcando...' : 'Confirmar consulta'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
