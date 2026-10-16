import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { prisma } from '../src/prisma'
import { criarConsulta, criarUsuario, proximaSegunda } from './ajuda'

describe('RN07: Bloqueio de Folgas do Profissional', () => {
  it('permite que o médico bloqueie folga e preserva integralmente as consultas já marcadas', async () => {
    const paciente = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')
    const data = proximaSegunda()

    // 1. Cria previamente uma consulta naquele dia
    const consultaPreexistente = await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data,
      hora: '09:00',
      tipo: 'retorno',
    })

    // 2. Médico bloqueia o dia como folga
    const resFolga = await request(app)
      .post(`/profissionais/${profissional.id}/folgas`)
      .set('Authorization', profissional.auth)
      .send({ data })

    expect(resFolga.status).toBe(201)
    expect(resFolga.body.data).toBe(data)
    expect(resFolga.body.profissionalId).toBe(profissional.id)

    // 3. A consulta pré-existente continua existindo e com status 'agendada' (não é apagada nem cancelada)
    const consultaNoBanco = await prisma.consulta.findUnique({
      where: { id: consultaPreexistente.id },
    })
    expect(consultaNoBanco).not.toBeNull()
    expect(consultaNoBanco?.status).toBe('agendada')

    // 4. A agenda do dia lista a folga e a consulta pré-existente
    const resAgenda = await request(app)
      .get(`/profissionais/${profissional.id}/agenda?data=${data}`)
      .set('Authorization', profissional.auth)

    expect(resAgenda.status).toBe(200)
    expect(resAgenda.body.folga).toBe(true)
    expect(resAgenda.body.consultas).toHaveLength(1)
    expect(resAgenda.body.consultas[0].id).toBe(consultaPreexistente.id)
  })

  it('bloqueia novas tentativas de agendamento em dia de folga com 409 Conflict', async () => {
    const paciente = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')
    const data = proximaSegunda()

    // Cadastra a folga
    await request(app)
      .post(`/profissionais/${profissional.id}/folgas`)
      .set('Authorization', profissional.auth)
      .send({ data })
      .expect(201)

    // Tentativa de marcar consulta no dia de folga
    const res = await request(app)
      .post('/consultas')
      .set('Authorization', paciente.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '10:00',
        tipo: 'retorno',
      })

    expect(res.status).toBe(409)
    expect(res.body.erro).toBe('O profissional está de folga nesse dia')
  })

  it('retorna lista vazia de horários disponíveis em dia de folga', async () => {
    const paciente = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')
    const data = proximaSegunda()

    await request(app)
      .post(`/profissionais/${profissional.id}/folgas`)
      .set('Authorization', profissional.auth)
      .send({ data })
      .expect(201)

    const res = await request(app)
      .get(`/profissionais/${profissional.id}/horarios?data=${data}&tipo=retorno`)
      .set('Authorization', paciente.auth)

    expect(res.status).toBe(200)
    expect(res.body.horarios).toEqual([])
  })

  it('indica status de folga na listagem de profissionais por data', async () => {
    const paciente = await criarUsuario('paciente')
    const prof1 = await criarUsuario('profissional', 'Dr. Folga')
    const prof2 = await criarUsuario('profissional', 'Dra. Disponivel')
    const data = proximaSegunda()

    // Bloqueia folga apenas para prof1
    await request(app)
      .post(`/profissionais/${prof1.id}/folgas`)
      .set('Authorization', prof1.auth)
      .send({ data })
      .expect(201)

    const res = await request(app)
      .get(`/profissionais?data=${data}`)
      .set('Authorization', paciente.auth)

    expect(res.status).toBe(200)
    const item1 = res.body.find((p: { id: string }) => p.id === prof1.id)
    const item2 = res.body.find((p: { id: string }) => p.id === prof2.id)

    expect(item1.folga).toBe(true)
    expect(item2.folga).toBe(false)
  })

  it('rejeita tentativa de bloquear dia de folga no passado com 400 Bad Request', async () => {
    const profissional = await criarUsuario('profissional')

    const res = await request(app)
      .post(`/profissionais/${profissional.id}/folgas`)
      .set('Authorization', profissional.auth)
      .send({ data: '2020-01-01' })

    expect(res.status).toBe(400)
    expect(res.body.erro).toBe('Não é possível bloquear um dia que já passou')
  })

  it('rejeita tentativa de cadastrar folga duplicada para o mesmo dia com 409 Conflict', async () => {
    const profissional = await criarUsuario('profissional')
    const data = proximaSegunda()

    // Primeiro cadastro
    await request(app)
      .post(`/profissionais/${profissional.id}/folgas`)
      .set('Authorization', profissional.auth)
      .send({ data })
      .expect(201)

    // Segundo cadastro idêntico
    const res = await request(app)
      .post(`/profissionais/${profissional.id}/folgas`)
      .set('Authorization', profissional.auth)
      .send({ data })

    expect(res.status).toBe(409)
    expect(res.body.erro).toBe('Esse dia já está bloqueado')
  })
})
