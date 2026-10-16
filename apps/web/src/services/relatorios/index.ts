import type { RelatorioFaltas } from '@bemviver/shared'
import { api } from '@/lib/api'
import { lerSessao } from '@/lib/sessao'
import type { FiltrosRelatorioFaltas } from './types'

export async function buscarRelatorioFaltas(filtros?: FiltrosRelatorioFaltas): Promise<RelatorioFaltas> {
  const params = new URLSearchParams()
  if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio)
  if (filtros?.dataFim) params.append('dataFim', filtros.dataFim)
  if (filtros?.profissionalId) params.append('profissionalId', filtros.profissionalId)
  if (filtros?.pagina) params.append('pagina', String(filtros.pagina))
  if (filtros?.limite) params.append('limite', String(filtros.limite))

  const query = params.toString() ? `?${params.toString()}` : ''
  return api<RelatorioFaltas>(`/relatorios/faltas${query}`)
}

export interface SolicitacaoPdfPayload {
  tipo: 'agenda' | 'absenteismo'
  filtros?: {
    data?: string
    profissionalId?: string
    dataInicio?: string
    dataFim?: string
    especialidade?: string
  }
}

export interface StatusJobPdf {
  id: string
  status: 'esperando' | 'processando' | 'concluido' | 'falha'
  progresso?: number
  resultado?: { arquivoNome: string; caminho: string }
  erro?: string
}

export async function solicitarGeracaoPdf(payload: SolicitacaoPdfPayload): Promise<{ jobId: string; status: string }> {
  return api<{ jobId: string; status: string }>('/relatorios/pdf', {
    metodo: 'POST',
    corpo: payload,
  })
}

export async function consultarStatusPdf(jobId: string): Promise<StatusJobPdf> {
  return api<StatusJobPdf>(`/relatorios/pdf/status/${jobId}`)
}

export async function baixarArquivoPdf(jobId: string, nomeArquivo: string): Promise<void> {
  const sessao = lerSessao()
  const resposta = await fetch(`/api/relatorios/pdf/download/${jobId}`, {
    headers: {
      ...(sessao ? { Authorization: `Bearer ${sessao.token}` } : {}),
    },
  })

  if (!resposta.ok) {
    throw new Error('Falha ao baixar o arquivo PDF')
  }

  const blob = await resposta.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export const relatoriosService = {
  buscarRelatorioFaltas,
  solicitarGeracaoPdf,
  consultarStatusPdf,
  baixarArquivoPdf,
}
