import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { hojeEmRecife } from '@bemviver/shared'
import { app } from '../../src/app'
import { prisma } from '../../src/prisma'
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

  it('cancela automaticamente consultas do mesmo dia cujo horário passou sem confirmação e as move para o histórico', async () => {
    const hoje = hojeEmRecife()
    const agora = new Date()

    // 1. Consulta hoje que já passou (início 1 hora atrás, não confirmada)
    const inicioPassado = new Date(agora.getTime() - 60 * 60 * 1000)
    const fimPassado = new Date(inicioPassado.getTime() + 30 * 60 * 1000)
    const consultaNaoConfirmada = await prisma.consulta.create({
      data: {
        profissionalId: profissional.id,
        pacienteId: paciente.id,
        data: hoje,
        hora: '08:00',
        inicio: inicioPassado,
        fim: fimPassado,
        tipo: 'retorno',
        status: 'agendada',
        confirmadaEm: null,
      },
    })

    // 2. Consulta hoje com horário futuro (daqui a 3 horas)
    const inicioFuturo = new Date(agora.getTime() + 3 * 60 * 60 * 1000)
    const fimFuturo = new Date(inicioFuturo.getTime() + 30 * 60 * 1000)
    const consultaFutura = await prisma.consulta.create({
      data: {
        profissionalId: profissional.id,
        pacienteId: paciente.id,
        data: hoje,
        hora: '17:00',
        inicio: inicioFuturo,
        fim: fimFuturo,
        tipo: 'retorno',
        status: 'agendada',
      },
    })

    // Próximas consultas (GET /consultas/minhas): deve conter APENAS a consulta futura
    const resProximas = await request(app)
      .get('/consultas/minhas')
      .set('Authorization', paciente.auth)

    expect(resProximas.status).toBe(200)
    expect(resProximas.body.map((c: { id: string }) => c.id)).toEqual([consultaFutura.id])

    // Verifica que a consulta expirada não confirmada foi cancelada no banco
    const noBanco = await prisma.consulta.findUnique({ where: { id: consultaNaoConfirmada.id } })
    expect(noBanco?.status).toBe('cancelada')
    expect(noBanco?.canceladaEm).not.toBeNull()

    // Histórico (GET /consultas/minhas?historico=true): a consulta cancelada deve estar presente
    const resHistorico = await request(app)
      .get('/consultas/minhas?historico=true')
      .set('Authorization', paciente.auth)

    expect(resHistorico.status).toBe(200)
    const idsHistorico = resHistorico.body.map((c: { id: string }) => c.id)
    expect(idsHistorico).toContain(consultaNaoConfirmada.id)
    const itemHistorico = resHistorico.body.find((c: { id: string }) => c.id === consultaNaoConfirmada.id)
    expect(itemHistorico.status).toBe('cancelada')
  })
})
