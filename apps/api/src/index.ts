import { app } from './app'
import { iniciarPdfWorker } from './infra/jobs'

const porta = Number(process.env.PORTA ?? 3333)

// Inicializa o worker do BullMQ para processamento em background
iniciarPdfWorker()

app.listen(porta, () => {
  console.log(`API rodando em http://localhost:${porta}`)
})
