import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../src/app'
import { pdfQueue } from '../../src/infra/jobs/pdfQueue'
import { redisConnection } from '../../src/redis'
import { criarUsuario } from '../ajuda'

describe('FEAT-09: Geração Assíncrona de PDF com BullMQ + Redis + Worker', () => {
  let recepcao: Awaited<ReturnType<typeof criarUsuario>>
  let paciente: Awaited<ReturnType<typeof criarUsuario>>
  let profissional: Awaited<ReturnType<typeof criarUsuario>>

  beforeAll(async () => {
    recepcao = await criarUsuario('recepcao', 'Recepção Teste')
    paciente = await criarUsuario('paciente', 'Paciente Teste')
    profissional = await criarUsuario('profissional', 'Médico Teste')
  })

  afterAll(async () => {
    await pdfQueue.close()
    await redisConnection.quit()
  })

  it('deve rejeitar solicitação sem autenticação com status 401', async () => {
    const res = await request(app)
      .post('/relatorios/pdf')
      .send({ tipo: 'absenteismo' })

    expect(res.status).toBe(401)
  })

  it('deve rejeitar solicitação de paciente com 403 (apenas recepção e profissional podem exportar)', async () => {
    const res = await request(app)
      .post('/relatorios/pdf')
      .set('Authorization', paciente.auth)
      .send({ tipo: 'absenteismo' })

    expect(res.status).toBe(403)
  })

  it('deve enfileirar com sucesso um job para PDF de Relatório de Absenteísmo', async () => {
    const res = await request(app)
      .post('/relatorios/pdf')
      .set('Authorization', recepcao.auth)
      .send({
        tipo: 'absenteismo',
        filtros: {
          dataInicio: '2026-10-01',
          dataFim: '2026-10-31',
        },
      })

    expect(res.status).toBe(202)
    expect(res.body).toHaveProperty('jobId')
    expect(res.body.status).toBe('pendente')

    // Consulta status do job enfileirado
    const statusRes = await request(app)
      .get(`/relatorios/pdf/status/${res.body.jobId}`)
      .set('Authorization', recepcao.auth)

    expect(statusRes.status).toBe(200)
    expect(['esperando', 'processando', 'concluido']).toContain(statusRes.body.status)
  })

  it('deve enfileirar com sucesso um job para PDF da Agenda do Dia', async () => {
    const res = await request(app)
      .post('/relatorios/pdf')
      .set('Authorization', profissional.auth)
      .send({
        tipo: 'agenda',
        filtros: {
          data: '2026-10-16',
          profissionalId: profissional.id,
        },
      })

    expect(res.status).toBe(202)
    expect(res.body).toHaveProperty('jobId')
    expect(res.body.status).toBe('pendente')
  })

  it('deve retornar 400 se o tipo de relatório for inválido', async () => {
    const res = await request(app)
      .post('/relatorios/pdf')
      .set('Authorization', recepcao.auth)
      .send({
        tipo: 'relatorio_invalido',
      })

    expect(res.status).toBe(400)
  })
})
