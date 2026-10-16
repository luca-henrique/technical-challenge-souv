export { pdfQueue, FILA_PDF_NOME, type JobPdfPayload } from './pdfQueue'
export { iniciarPdfWorker } from './pdfWorker'

export {
  emailQueue,
  FILA_EMAIL_NOME,
  enfileirarEmail,
  type JobEmailPayload,
} from './emailQueue'
export { iniciarEmailWorker } from './emailWorker'
export {
  gerarEmailConfirmacaoAgendamento,
  gerarEmailCancelamento,
  gerarEmailVagaLiberada,
} from './templates/emailTemplates'
