import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  emailQueue,
  enfileirarEmail,
  gerarEmailCancelamento,
  gerarEmailConfirmacaoAgendamento,
  gerarEmailVagaLiberada,
} from '../../src/infra/jobs'
import { redisConnection } from '../../src/redis'

describe('Envio de E-mail Assíncrono com BullMQ + Worker', () => {
  afterAll(async () => {
    await emailQueue.close()
    await redisConnection.quit()
  })

  it('deve gerar template HTML de confirmação de agendamento corretamente', () => {
    const email = gerarEmailConfirmacaoAgendamento({
      pacienteNome: 'Lucas Silva',
      profissionalNome: 'Dra. Maria',
      especialidade: 'Cardiologia',
      data: '2026-10-20',
      hora: '14:00',
      tipo: 'primeira',
    })

    expect(email.assunto).toContain('Confirmação de Consulta')
    expect(email.html).toContain('Lucas Silva')
    expect(email.html).toContain('Dra. Maria')
    expect(email.html).toContain('Cardiologia')
    expect(email.html).toContain('Primeira consulta (60 min)')
  })

  it('deve gerar template HTML de cancelamento de consulta corretamente', () => {
    const email = gerarEmailCancelamento({
      pacienteNome: 'Lucas Silva',
      profissionalNome: 'Dra. Maria',
      especialidade: 'Cardiologia',
      data: '2026-10-20',
      hora: '14:00',
    })

    expect(email.assunto).toContain('Cancelamento de Consulta')
    expect(email.html).toContain('cancelada')
    expect(email.html).toContain('Lucas Silva')
  })

  it('deve gerar template HTML de vaga liberada na lista de espera corretamente', () => {
    const email = gerarEmailVagaLiberada({
      pacienteNome: 'João Santos',
      profissionalNome: 'Dr. Pedro',
      data: '2026-10-22',
      turno: 'manha',
    })

    expect(email.assunto).toContain('Vaga Liberada')
    expect(email.html).toContain('João Santos')
    expect(email.html).toContain('Manhã')
  })

  it('deve enfileirar um e-mail com sucesso na fila do BullMQ', async () => {
    const job = await enfileirarEmail({
      para: 'paciente.teste@clinicabemviver.com.br',
      assunto: 'Teste de Enfileiramento BullMQ',
      html: '<p>Mensagem de teste</p>',
      texto: 'Mensagem de teste',
      tipo: 'confirmacao_agendamento',
      metadados: { teste: true },
    })

    expect(job).toBeDefined()
    expect(job.id).toBeDefined()
    expect(job.data.para).toBe('paciente.teste@clinicabemviver.com.br')
    expect(job.data.tipo).toBe('confirmacao_agendamento')

    const jobBuscado = await emailQueue.getJob(job.id!)
    expect(jobBuscado).toBeDefined()
    expect(jobBuscado?.name).toBe('email-confirmacao_agendamento')
  })
})
