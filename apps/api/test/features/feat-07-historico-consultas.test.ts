import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { hojeEmRecife } from '@bemviver/shared'
import { app } from '../../src/app'
import { criarConsulta, criarUsuario, proximaSegunda, somarDias } from '../ajuda'

describe('FEAT-07: Histórico de consultas do paciente (API)', () => {
  let profissional: Awaited<ReturnType<typeof criarUsuario>>
  let paciente: Awaited<ReturnType<typeof criarUsuario>>
  let paciente2: Awaited<ReturnType<typeof criarUsuario>>

  beforeEach(async () => {
    profissional = await criarUsuario('profissional')
    paciente = await criarUsuario('paciente')
    paciente2 = await criarUsuario('paciente')
  })

  it('separa consultas ativas futuras do histórico de consultas passadas/concluídas', async () => {
    const dataFutura = proximaSegunda()
    const dataPassada = somarDias(hojeEmRecife(), -5)

    // 1. Consulta futura ativa (agendada)
    await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data: dataFutura,
      hora: '10:00',
      tipo: 'primeira',
      status: 'agendada',
    })

    // 2. Consulta passada (realizada)
    await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data: dataPassada,
      hora: '14:00',
      tipo: 'primeira',
      status: 'realizada',
    })

    // 3. Consulta futura cancelada
    await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data: dataFutura,
      hora: '15:00',
      tipo: 'retorno',
      status: 'cancelada',
    })

    // Teste 1: GET /consultas/minhas (ativas)
    const resAtivas = await request(app)
      .get('/consultas/minhas')
      .set('Authorization', paciente.auth)

    expect(resAtivas.status).toBe(200)
    expect(resAtivas.body.length).toBe(1)
    expect(resAtivas.body[0].data).toBe(dataFutura)
    expect(resAtivas.body[0].status).toBe('agendada')

    // Teste 2: GET /consultas/minhas?historico=true (histórico)
    const resHistorico = await request(app)
      .get('/consultas/minhas?historico=true')
      .set('Authorization', paciente.auth)

    expect(resHistorico.status).toBe(200)
    expect(resHistorico.body.length).toBe(2)
    const statuses = resHistorico.body.map((c: { status: string }) => c.status)
    expect(statuses).toContain('realizada')
    expect(statuses).toContain('cancelada')
  })

  it('permite que o profissional consulte o histórico completo do paciente', async () => {
    const dataPassada = somarDias(hojeEmRecife(), -10)

    await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data: dataPassada,
      hora: '09:00',
      tipo: 'primeira',
      status: 'realizada',
    })

    const res = await request(app)
      .get(`/pacientes/${paciente.id}/consultas`)
      .set('Authorization', profissional.auth)

    expect(res.status).toBe(200)
    expect(res.body.length).toBe(1)
    expect(res.body[0].pacienteId).toBe(paciente.id)
    expect(res.body[0].status).toBe('realizada')

    // Outro paciente não pode acessar essa rota (403)
    const resProibido = await request(app)
      .get(`/pacientes/${paciente.id}/consultas`)
      .set('Authorization', paciente2.auth)

    expect(resProibido.status).toBe(403)
  })
})
