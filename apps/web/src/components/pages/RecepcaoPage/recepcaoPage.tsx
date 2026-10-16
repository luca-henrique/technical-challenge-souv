'use client'

import { Controller } from 'react-hook-form'
import LinkButton from '@/components/atoms/LinkButton/linkButton'
import Alert from '@/components/atoms/Alert/alert'
import PageHeader from '@/components/molecules/PageHeader/pageHeader'
import SeletorData from '@/components/molecules/SeletorData/seletorData'
import SeletorProfissional from '@/components/molecules/SeletorProfissional/seletorProfissional'
import AgendaDoDia from '@/components/organisms/AgendaDoDia/agendaDoDia'
import RecepcaoSkeleton from '@/components/organisms/RecepcaoSkeleton/recepcaoSkeleton'
import SemProfissionalSelecionado from '@/components/molecules/SemProfissionalSelecionado/semProfissionalSelecionado'
import { useFiltroRecepcao } from '@/hooks/useFiltroRecepcao'

export default function RecepcaoPage() {
  const {
    control,
    profissionais,
    profissionalId,
    data,
    carregando,
    erro,
    errors,
  } = useFiltroRecepcao()

  if (carregando) {
    return <RecepcaoSkeleton />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Agenda da Recepção"
        acoes={
          <LinkButton href="/recepcao/relatorios" variante="secundario">
            Relatório de faltas
          </LinkButton>
        }
      />

      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start"
        onSubmit={(e) => e.preventDefault()}
      >
        <Controller
          name="profissionalId"
          control={control}
          render={({ field }) => (
            <SeletorProfissional
              profissionais={profissionais}
              valor={field.value}
              permitirVazio
              onChange={field.onChange}
              erro={errors.profissionalId?.message}
              className="w-full"
            />
          )}
        />
        <Controller
          name="data"
          control={control}
          render={({ field }) => (
            <SeletorData
              valor={field.value}
              onChange={field.onChange}
              erro={errors.data?.message}
              hint=""
              className="w-full"
            />
          )}
        />
      </form>

      {erro && <Alert>{erro}</Alert>}
      {profissionalId ? (
        <AgendaDoDia profissionalId={profissionalId} data={data} />
      ) : (
        <SemProfissionalSelecionado />
      )}
    </div>
  )
}
