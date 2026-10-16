import { app } from './app'
import { iniciarEmailWorker, iniciarPdfWorker } from './infra/jobs'

const porta = Number(process.env.PORTA ?? 3333)

// Inicializa os workers do BullMQ para processamento em background
iniciarPdfWorker()
iniciarEmailWorker()

app.listen(porta, () => {
  console.log(`API rodando em http://localhost:${porta}`)
})
