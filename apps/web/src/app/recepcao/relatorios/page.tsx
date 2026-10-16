'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Alert from '@/components/atoms/Alert/alert'
import Button from '@/components/atoms/Button/button'
import Heading from '@/components/atoms/Heading/heading'
import LinkButton from '@/components/atoms/LinkButton/linkButton'
import Text from '@/components/atoms/Text/text'
import BotaoExportarPdf from '@/components/molecules/BotaoExportarPdf/botaoExportarPdf'
import SeletorData from '@/components/molecules/SeletorData/seletorData'
import SeletorProfissional from '@/components/molecules/SeletorProfissional/seletorProfissional'
import MetricasRelatorio from '@/components/organisms/MetricasRelatorio/metricasRelatorio'
import TabelaReincidentes from '@/components/organisms/TabelaReincidentes/tabelaReincidentes'
import AreaTemplate from '@/components/templates/AreaTemplate/areaTemplate'
import { useProfissionais } from '@/hooks/useProfissionais'
import { useRelatorioFaltas } from '@/hooks/useRelatorioFaltas'
import { filtroRelatorioSchema, type DadosFiltroRelatorio } from './schema'

export default function RelatoriosPage() {
  const [filtrosAtivos, setFiltrosAtivos] = useState<DadosFiltroRelatorio>({})

  const { relatorio, carregando, erro } = useRelatorioFaltas(filtrosAtivos)
  const { data: profissionais = [] } = useProfissionais()

  const { control, handleSubmit, reset } = useForm<DadosFiltroRelatorio>({
    resolver: zodResolver(filtroRelatorioSchema),
    defaultValues: {
      dataInicio: '',
      dataFim: '',
      profissionalId: '',
    },
  })

  function aplicarFiltro(dados: DadosFiltroRelatorio) {
    setFiltrosAtivos({
      dataInicio: dados.dataInicio || undefined,
      dataFim: dados.dataFim || undefined,
      profissionalId: dados.profissionalId || undefined,
    })
  }

  function limparFiltros() {
    reset({ dataInicio: '', dataFim: '', profissionalId: '' })
    setFiltrosAtivos({})
  }

  return (
    <AreaTemplate perfil="recepcao" titulo="Relatório de Faltas e Absenteísmo">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Heading as="h1" variante="pagina">
              Relatório de Absenteísmo (No-Show)
            </Heading>
            <Text variante="corpo" cor="secundario">
              Métricas consolidadas de faltas e lista de pacientes reincidentes.
            </Text>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <LinkButton href="/recepcao" variante="secundario">
              Voltar para Agenda
            </LinkButton>
            <BotaoExportarPdf rotulo="Exportar Relatório" />
          </div>
        </div>

        {/* Filtros com React Hook Form e Zod */}
        <form
          onSubmit={handleSubmit(aplicarFiltro)}
          className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 print:hidden"
        >
          <Controller
            name="dataInicio"
            control={control}
            render={({ field }) => (
              <SeletorData
                valor={field.value ?? ''}
                onChange={field.onChange}
                label="Data de início"
                required={false}
              />
            )}
          />

          <Controller
            name="dataFim"
            control={control}
            render={({ field }) => (
              <SeletorData
                valor={field.value ?? ''}
                onChange={field.onChange}
                label="Data de término"
                required={false}
              />
            )}
          />

          <Controller
            name="profissionalId"
            control={control}
            render={({ field }) => (
              <SeletorProfissional
                profissionais={profissionais}
                valor={field.value ?? ''}
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
            <Button type="button" variante="secundario" tamanho="compacto" onClick={limparFiltros}>
              Limpar
            </Button>
          </div>
        </form>

        {erro && <Alert>{erro}</Alert>}

        {carregando && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Carregando relatório...</p>
        )}

        {relatorio && (
          <div className="space-y-6">
            <MetricasRelatorio relatorio={relatorio} />
            <TabelaReincidentes reincidentes={relatorio.reincidentes} />
          </div>
        )}
      </div>
    </AreaTemplate>
  )
}
