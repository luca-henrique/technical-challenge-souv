import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { app } from '../../src/app'
import { prisma } from '../../src/prisma'
import { criarUsuario, proximaSegunda } from '../ajuda'

describe('FEAT-04: Lista de espera para horários que forem liberados (API)', () => {
  let profissional: Awaited<ReturnType<typeof criarUsuario>>
  let paciente: Awaited<ReturnType<typeof criarUsuario>>
  let paciente2: Awaited<ReturnType<typeof criarUsuario>>
  let recepcao: Awaited<ReturnType<typeof criarUsuario>>

  beforeEach(async () => {
    profissional = await criarUsuario('profissional')
    paciente = await criarUsuario('paciente')
    paciente2 = await criarUsuario('paciente')
    recepcao = await criarUsuario('recepcao')

    await prisma.listaEspera.deleteMany({
      where: { profissionalId: profissional.id },
    })
  })

  it('permite que o paciente se inscreva na lista de espera para um médico e data', async () => {
    const data = proximaSegunda()

    const res = await request(app)
      .post('/lista-espera')
      .set('Authorization', paciente.auth)
      .send({
        profissionalId: profissional.id,
        data,
        tipo: 'primeira',
        turno: 'manha',
      })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data,
      tipo: 'primeira',
      turno: 'manha',
      status: 'aguardando',
    })
  })

  it('impede inscrição duplicada do mesmo paciente no mesmo dia e médico', async () => {
    const data = proximaSegunda()

    await request(app)
      .post('/lista-espera')
      .set('Authorization', paciente.auth)
      .send({
        profissionalId: profissional.id,
        data,
        tipo: 'primeira',
        turno: 'qualquer',
      })

    const resDuplicado = await request(app)
      .post('/lista-espera')
      .set('Authorization', paciente.auth)
      .send({
        profissionalId: profissional.id,
        data,
        tipo: 'retorno',
        turno: 'qualquer',
      })

    expect(resDuplicado.status).toBe(409)
    expect(resDuplicado.body.erro).toMatch(/já está na lista de espera/i)
  })

  it('valida que a data não pode ser em final de semana ou no passado', async () => {
    const resPassado = await request(app)
      .post('/lista-espera')
      .set('Authorization', paciente.auth)
      .send({
        profissionalId: profissional.id,
        data: '2020-01-01',
        tipo: 'primeira',
      })

    expect(resPassado.status).toBe(400)
    expect(resPassado.body.erro).toMatch(/passado/i)

    const resSabado = await request(app)
      .post('/lista-espera')
      .set('Authorization', paciente.auth)
      .send({
        profissionalId: profissional.id,
        data: '2026-10-17', // Sábado
        tipo: 'primeira',
      })

    expect(resSabado.status).toBe(400)
    expect(resSabado.body.erro).toMatch(/úteis/i)
  })

  it('permite que a recepção liste as inscrições e filtre por profissional ou data', async () => {
    const data = proximaSegunda()

    await request(app)
      .post('/lista-espera')
      .set('Authorization', paciente.auth)
      .send({ profissionalId: profissional.id, data, tipo: 'retorno', turno: 'manha' })

    await request(app)
      .post('/lista-espera')
      .set('Authorization', paciente2.auth)
      .send({ profissionalId: profissional.id, data, tipo: 'primeira', turno: 'tarde' })

    const res = await request(app)
      .get(`/lista-espera?profissionalId=${profissional.id}&data=${data}`)
      .set('Authorization', recepcao.auth)

    expect(res.status).toBe(200)
    expect(res.body.length).toBe(2)
    expect(res.body[0].pacienteId).toBe(paciente.id)
    expect(res.body[1].pacienteId).toBe(paciente2.id)
  })

  it('notifica automaticamente o primeiro paciente compatível da fila ao cancelar uma consulta', async () => {
    const data = proximaSegunda()

    // 1. Agenda uma consulta às 09:00 (turno manhã)
    const resAgendamento = await request(app)
      .post('/consultas')
      .set('Authorization', paciente.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '09:00',
        tipo: 'retorno',
      })
    expect(resAgendamento.status).toBe(201)
    const consultaId = resAgendamento.body.id

    // 2. Paciente 2 entra na lista de espera para a manhã do mesmo dia
    const resEspera = await request(app)
      .post('/lista-espera')
      .set('Authorization', paciente2.auth)
      .send({
        profissionalId: profissional.id,
        data,
        tipo: 'primeira',
        turno: 'manha',
      })
    expect(resEspera.status).toBe(201)
    const esperaId = resEspera.body.id

    // 3. Cancela a consulta
    const resCancelamento = await request(app)
      .post(`/consultas/${consultaId}/cancelar`)
      .set('Authorization', paciente.auth)

    expect(resCancelamento.status).toBe(200)
    expect(resCancelamento.body.pacienteNotificadoListaEspera).toBeDefined()
    expect(resCancelamento.body.pacienteNotificadoListaEspera.id).toBe(esperaId)
    expect(resCancelamento.body.pacienteNotificadoListaEspera.pacienteId).toBe(paciente2.id)

    // 4. Verifica no banco que a inscrição foi atualizada para 'notificado'
    const registroEspera = await prisma.listaEspera.findUnique({ where: { id: esperaId } })
    expect(registroEspera?.status).toBe('notificado')
    expect(registroEspera?.notificadoEm).not.toBeNull()
  })

  it('permite que o paciente cancele sua inscrição na lista de espera', async () => {
    const data = proximaSegunda()

    const resInscricao = await request(app)
      .post('/lista-espera')
      .set('Authorization', paciente.auth)
      .send({ profissionalId: profissional.id, data, tipo: 'retorno' })

    const id = resInscricao.body.id

    const resRemover = await request(app)
      .delete(`/lista-espera/${id}`)
      .set('Authorization', paciente.auth)

    expect(resRemover.status).toBe(200)

    const registro = await prisma.listaEspera.findUnique({ where: { id } })
    expect(registro?.status).toBe('cancelado')
  })
})
