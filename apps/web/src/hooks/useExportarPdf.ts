'use client'

import { useState } from 'react'
import {
  baixarArquivoPdf,
  consultarStatusPdf,
  solicitarGeracaoPdf,
  type SolicitacaoPdfPayload,
} from '@/services/relatorios'

export interface OpcoesExportacaoPdf {
  tipo: 'agenda' | 'absenteismo'
  filtros?: {
    data?: string
    profissionalId?: string
    dataInicio?: string
    dataFim?: string
    especialidade?: string
  }
  nomeArquivo?: string
}

export function useExportarPdf() {
  const [gerando, setGerando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [erro, setErro] = useState<string | null>(null)

  async function exportar(opcoes: OpcoesExportacaoPdf) {
    setGerando(true)
    setProgresso(5)
    setErro(null)

    try {
      const payload: SolicitacaoPdfPayload = {
        tipo: opcoes.tipo,
        filtros: opcoes.filtros,
      }

      const { jobId } = await solicitarGeracaoPdf(payload)
      setProgresso(20)

      // Polling do status do job no BullMQ
      const intervalo = 1000
      const tempoMaximoMs = 60000 // 60s timeout
      const inicio = Date.now()

      const aguardarConclusao = async (): Promise<string> => {
        while (Date.now() - inicio < tempoMaximoMs) {
          await new Promise((resolve) => setTimeout(resolve, intervalo))
          const status = await consultarStatusPdf(jobId)

          if (status.progresso) {
            setProgresso(Math.max(20, status.progresso))
          }

          if (status.status === 'concluido') {
            return status.resultado?.arquivoNome || `${opcoes.tipo}-${jobId}.pdf`
          }

          if (status.status === 'falha') {
            throw new Error(status.erro || 'Falha no processamento do documento pelo worker')
          }
        }
        throw new Error('Tempo limite excedido ao gerar o documento na fila')
      }

      const arquivoNome = await aguardarConclusao()
      setProgresso(95)

      // Download autenticado do PDF gerado
      const nomeFinal = opcoes.nomeArquivo || arquivoNome
      await baixarArquivoPdf(jobId, nomeFinal)
      setProgresso(100)
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao exportar PDF'
      setErro(mensagem)
      console.error('[Exportar PDF]', err)
    } finally {
      setTimeout(() => {
        setGerando(false)
        setProgresso(0)
      }, 500)
    }
  }

  return {
    exportar,
    gerando,
    progresso,
    erro,
  }
}
