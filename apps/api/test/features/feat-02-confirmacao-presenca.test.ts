import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { app } from '../../src/app'
import { prisma } from '../../src/prisma'
import { criarConsulta, criarUsuario, proximaSegunda } from '../ajuda'

describe('FEAT-02: Confirmação de presença pelo paciente (API)', () => {
  let profissional: Awaited<ReturnType<typeof criarUsuario>>
  let paciente: Awaited<ReturnType<typeof criarUsuario>>
  let paciente2: Awaited<ReturnType<typeof criarUsuario>>
  let recepcao: Awaited<ReturnType<typeof criarUsuario>>

  beforeEach(async () => {
    profissional = await criarUsuario('profissional')
    paciente = await criarUsuario('paciente')
    paciente2 = await criarUsuario('paciente')
    recepcao = await criarUsuario('recepcao')
  })

  it('permite que o paciente confirme sua presença com antecedência', async () => {
    const data = proximaSegunda()
    const consulta = await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data,
      hora: '10:00',
      tipo: 'primeira',
      status: 'agendada',
    })

    const res = await request(app)
      .post(`/consultas/${consulta.id}/confirmar`)
      .set('Authorization', paciente.auth)

    expect(res.status).toBe(200)
    expect(res.body.confirmadaEm).not.toBeNull()

    const noBanco = await prisma.consulta.findUnique({ where: { id: consulta.id } })
    expect(noBanco?.confirmadaEm).not.toBeNull()
  })

  it('é idempotente ao confirmar uma consulta já confirmada', async () => {
    const data = proximaSegunda()
    const consulta = await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data,
      hora: '10:00',
      tipo: 'retorno',
      status: 'agendada',
    })

    await request(app)
      .post(`/consultas/${consulta.id}/confirmar`)
      .set('Authorization', paciente.auth)

    const resSegundaVez = await request(app)
      .post(`/consultas/${consulta.id}/confirmar`)
      .set('Authorization', paciente.auth)

    expect(resSegundaVez.status).toBe(200)
    expect(resSegundaVez.body.confirmadaEm).not.toBeNull()
  })

  it('impede confirmação de consulta cancelada ou não agendada', async () => {
    const data = proximaSegunda()
    const consulta = await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data,
      hora: '10:00',
      tipo: 'retorno',
      status: 'cancelada',
    })

    const res = await request(app)
      .post(`/consultas/${consulta.id}/confirmar`)
      .set('Authorization', paciente.auth)

    expect(res.status).toBe(409)
    expect(res.body.erro).toMatch(/agendada/i)
  })

  it('impede que um paciente confirme a consulta de outro paciente', async () => {
    const data = proximaSegunda()
    const consulta = await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data,
      hora: '10:00',
      tipo: 'retorno',
      status: 'agendada',
    })

    const res = await request(app)
      .post(`/consultas/${consulta.id}/confirmar`)
      .set('Authorization', paciente2.auth)

    expect(res.status).toBe(403)
    expect(res.body.erro).toMatch(/suas próprias consultas/i)
  })

  it('permite que a recepção confirme a presença do paciente', async () => {
    const data = proximaSegunda()
    const consulta = await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data,
      hora: '11:00',
      tipo: 'retorno',
      status: 'agendada',
    })

    const res = await request(app)
      .post(`/consultas/${consulta.id}/confirmar`)
      .set('Authorization', recepcao.auth)

    expect(res.status).toBe(200)
    expect(res.body.confirmadaEm).not.toBeNull()
  })
})
