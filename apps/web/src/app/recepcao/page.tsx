"use client";

import { Controller } from "react-hook-form";
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
      <form
        className="flex flex-wrap items-end gap-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <Controller
          name="profissionalId"
          control={control}
          render={({ field }) => (
            <SeletorProfissional
              profissionais={profissionais}
              valor={field.value}
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
