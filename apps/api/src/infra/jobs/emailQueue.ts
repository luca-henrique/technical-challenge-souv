import { Queue } from 'bullmq'
import { redisConnection } from '../../redis'

export interface JobEmailPayload {
  para: string
  assunto: string
  html: string
  texto?: string
  tipo: 'confirmacao_agendamento' | 'cancelamento' | 'lista_espera_liberada' | 'lembrete'
  metadados?: Record<string, unknown>
}

export const FILA_EMAIL_NOME = 'envio-email'

export const emailQueue = new Queue<JobEmailPayload, { messageId?: string; sucesso: boolean }>(
  FILA_EMAIL_NOME,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 3600, // 1 hora de histórico
        count: 500,
      },
      removeOnFail: {
        age: 86400, // 24 horas para diagnóstico de falha
      },
    },
  }
)

export async function enfileirarEmail(dados: JobEmailPayload) {
  return emailQueue.add(`email-${dados.tipo}`, dados)
}
