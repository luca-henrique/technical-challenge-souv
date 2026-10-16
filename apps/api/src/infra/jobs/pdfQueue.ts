import { Queue } from 'bullmq'
import { redisConnection } from '../../redis'

export interface JobPdfPayload {
  tipo: 'agenda' | 'absenteismo'
  filtros: {
    data?: string
    profissionalId?: string
    dataInicio?: string
    dataFim?: string
    especialidade?: string
  }
  solicitanteId: string
  solicitanteNome?: string
}

export const FILA_PDF_NOME = 'geracao-pdf'

export const pdfQueue = new Queue<JobPdfPayload, { arquivoNome: string; caminho: string }>(
  FILA_PDF_NOME,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 3600, // Mantém jobs concluídos por 1 hora
        count: 100,
      },
      removeOnFail: {
        age: 86400, // Mantém falhas por 24 horas para diagnóstico
      },
    },
  }
)
