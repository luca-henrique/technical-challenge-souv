"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Alert from "@/components/atoms/Alert/alert";
import Button from "@/components/atoms/Button/button";
import LinkButton from "@/components/atoms/LinkButton/linkButton";
import Spinner from "@/components/atoms/Spinner/spinner";
import PageHeader from "@/components/molecules/PageHeader/pageHeader";
import BotaoExportarPdf from "@/components/molecules/BotaoExportarPdf/botaoExportarPdf";
import SeletorIntervaloDatas from "@/components/molecules/SeletorIntervaloDatas/seletorIntervaloDatas";
import SeletorProfissional from "@/components/molecules/SeletorProfissional/seletorProfissional";
import MetricasRelatorio from "@/components/organisms/MetricasRelatorio/metricasRelatorio";
import TabelaReincidentes from "@/components/organisms/TabelaReincidentes/tabelaReincidentes";

import { useProfissionais } from "@/hooks/useProfissionais";
import { useRelatorioFaltas } from "@/hooks/useRelatorioFaltas";
import { filtroRelatorioSchema, type DadosFiltroRelatorio } from "./schema";

export default function RelatoriosPage() {
  const [filtrosAtivos, setFiltrosAtivos] = useState<DadosFiltroRelatorio>({});
  const [pagina, setPagina] = useState(1);

  const { relatorio, carregando, erro } = useRelatorioFaltas({
    ...filtrosAtivos,
    pagina,
    limite: 10,
  });
  const { data: profissionais = [] } = useProfissionais();

  const { control, handleSubmit, reset } = useForm<DadosFiltroRelatorio>({
    resolver: zodResolver(filtroRelatorioSchema),
    defaultValues: {
      dataInicio: "",
      dataFim: "",
      profissionalId: "",
    },
  });

  function aplicarFiltro(dados: DadosFiltroRelatorio) {
    setPagina(1);
    setFiltrosAtivos({
      dataInicio: dados.dataInicio || undefined,
      dataFim: dados.dataFim || undefined,
      profissionalId: dados.profissionalId || undefined,
    });
  }

  function limparFiltros() {
    reset({ dataInicio: "", dataFim: "", profissionalId: "" });
    setPagina(1);
    setFiltrosAtivos({});
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Relatório de Absenteísmo (No-Show)"
        subtitulo="Métricas consolidadas de faltas e lista de pacientes reincidentes."
        acoes={
          <div className="flex items-center gap-2 print:hidden">
            <LinkButton href="/recepcao" variante="secundario">
              Voltar para Agenda
            </LinkButton>
            <BotaoExportarPdf
              rotulo="Exportar Relatório"
              tipo="absenteismo"
              filtros={{
                dataInicio: filtrosAtivos.dataInicio,
                dataFim: filtrosAtivos.dataFim,
                profissionalId: filtrosAtivos.profissionalId,
              }}
            />
          </div>
        }
      />

      {/* Filtros com React Hook Form e Zod */}
      <form
        onSubmit={handleSubmit(aplicarFiltro)}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 print:hidden"
      >
        <Controller
          name="dataInicio"
          control={control}
          render={({ field: fieldInicio }) => (
            <Controller
              name="dataFim"
              control={control}
              render={({ field: fieldFim }) => (
                <SeletorIntervaloDatas
                  dataInicio={fieldInicio.value ?? ""}
                  dataFim={fieldFim.value ?? ""}
                  onChangeInicio={fieldInicio.onChange}
                  onChangeFim={fieldFim.onChange}
                  required={false}
                  className="flex flex-wrap items-end gap-3"
                  itemClassName="w-auto"
                />
              )}
            />
          )}
        />

        <Controller
          name="profissionalId"
          control={control}
          render={({ field }) => (
            <SeletorProfissional
              profissionais={profissionais}
              valor={field.value ?? ""}
              onChange={field.onChange}
              label="Filtrar médico"
              className="min-w-56"
            />
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" tamanho="compacto">
            Filtrar
          </Button>
          <Button
            type="button"
            variante="secundario"
            tamanho="compacto"
            onClick={limparFiltros}
          >
            Limpar
          </Button>
        </div>
      </form>

      {erro && <Alert>{erro}</Alert>}

      {carregando && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500 dark:text-gray-400">
          <Spinner tamanho="md" aria-label="Carregando relatório..." />
          <span>Carregando relatório...</span>
        </div>
      )}

      {relatorio && (
        <div className="space-y-6">
          <MetricasRelatorio relatorio={relatorio} />
          <TabelaReincidentes
            reincidentes={relatorio.reincidentes}
            paginacao={relatorio.paginacao}
            aoMudarPagina={setPagina}
          />
        </div>
      )}
    </div>
  );
}
