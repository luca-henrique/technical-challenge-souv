import { Worker, type Job } from 'bullmq'
import { redisConnection } from '../../redis'
import { mailTransporter, REMETENTE_PADRAO } from '../mail/mailTransporter'
import { FILA_EMAIL_NOME, type JobEmailPayload } from './emailQueue'

export function iniciarEmailWorker() {
  const worker = new Worker<JobEmailPayload, { messageId?: string; sucesso: boolean }>(
    FILA_EMAIL_NOME,
    async (job: Job<JobEmailPayload>) => {
      console.log(
        `[Email Worker] Enviando e-mail Job #${job.id} (Tipo: ${job.data.tipo}, Para: ${job.data.para})`
      )

      const info = await mailTransporter.sendMail({
        from: REMETENTE_PADRAO,
        to: job.data.para,
        subject: job.data.assunto,
        html: job.data.html,
        text: job.data.texto,
      })

      console.log(`[Email Worker] E-mail Job #${job.id} despachado com sucesso. MessageID: ${info.messageId}`)

      return {
        messageId: info.messageId,
        sucesso: true,
      }
    },
    {
      connection: redisConnection,
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 1000, // Máximo de 10 e-mails por segundo (Rate Limit)
      },
    }
  )

  worker.on('completed', (job) => {
    console.log(`[Email Worker] Job #${job.id} concluído com sucesso.`)
  })

  worker.on('failed', (job, err) => {
    console.error(`[Email Worker] Job #${job?.id} falhou ao enviar e-mail:`, err.message)
  })

  return worker
}
