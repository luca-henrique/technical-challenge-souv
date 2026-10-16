"use client";

import { Controller } from "react-hook-form";
import Heading from "@/components/atoms/Heading/heading";
import LinkButton from "@/components/atoms/LinkButton/linkButton";
import Alert from "@/components/atoms/Alert/alert";
import SeletorData from "@/components/molecules/SeletorData/seletorData";
import SeletorProfissional from "@/components/molecules/SeletorProfissional/seletorProfissional";
import AgendaDoDia from "@/components/organisms/AgendaDoDia/agendaDoDia";
import RecepcaoSkeleton from "@/components/organisms/RecepcaoSkeleton/recepcaoSkeleton";
import SemProfissionalSelecionado from "@/components/molecules/SemProfissionalSelecionado/semProfissionalSelecionado";
import { useFiltroRecepcao } from "@/hooks/useFiltroRecepcao";

export default function RecepcaoPage() {
  const {
    control,
    profissionais,
    profissionalId,
    data,
    carregando,
    erro,
    errors,
  } = useFiltroRecepcao();

  if (carregando) {
    return <RecepcaoSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Heading as="h1" variante="pagina">
          Agenda da Recepção
        </Heading>
        <LinkButton href="/recepcao/relatorios" variante="secundario">
          Relatório de faltas
        </LinkButton>
      </div>

      <form
        className="flex flex-wrap  gap-4 justify-center"
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
              className="min-w-64 flex-1"
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
  );
}
