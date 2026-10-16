import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { prisma } from '../src/prisma'
import { criarUsuario } from './ajuda'

describe('RN08: Registro de Faltas e Restrições Operacionais', () => {
  it('permite que a recepção registre falta em consulta cujo horário já passou', async () => {
    const recepcao = await criarUsuario('recepcao')
    const paciente = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')

    // Consulta ocorrida 2 horas atrás
    const inicioPassado = new Date(Date.now() - 2 * 60 * 60 * 1000)
    const fimPassado = new Date(inicioPassado.getTime() + 30 * 60 * 1000)

    const consulta = await prisma.consulta.create({
      data: {
        profissionalId: profissional.id,
        pacienteId: paciente.id,
        data: '2026-10-15',
        hora: '10:00',
        tipo: 'retorno',
        inicio: inicioPassado,
        fim: fimPassado,
        status: 'agendada',
      },
    })

    const res = await request(app)
      .post(`/consultas/${consulta.id}/falta`)
      .set('Authorization', recepcao.auth)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('faltou')

    const atualizadaNoBanco = await prisma.consulta.findUnique({
      where: { id: consulta.id },
    })
    expect(atualizadaNoBanco?.status).toBe('faltou')
  })

  it('impede registro de falta antes do horário da consulta (409 Conflict)', async () => {
    const recepcao = await criarUsuario('recepcao')
    const paciente = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')

    // Consulta futura (daqui a 3 horas)
    const inicioFuturo = new Date(Date.now() + 3 * 60 * 60 * 1000)
    const fimFuturo = new Date(inicioFuturo.getTime() + 30 * 60 * 1000)

    const consulta = await prisma.consulta.create({
      data: {
        profissionalId: profissional.id,
        pacienteId: paciente.id,
        data: '2026-10-26',
        hora: '15:00',
        tipo: 'retorno',
        inicio: inicioFuturo,
        fim: fimFuturo,
        status: 'agendada',
      },
    })

    const res = await request(app)
      .post(`/consultas/${consulta.id}/falta`)
      .set('Authorization', recepcao.auth)

    expect(res.status).toBe(409)
    expect(res.body.erro).toBe('A falta só pode ser registrada depois do horário da consulta')

    const noBanco = await prisma.consulta.findUnique({
      where: { id: consulta.id },
    })
    expect(noBanco?.status).toBe('agendada')
  })

  it('impede registro de falta em consulta cancelada (409 Conflict)', async () => {
    const recepcao = await criarUsuario('recepcao')
    const paciente = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')

    const inicioPassado = new Date(Date.now() - 1 * 60 * 60 * 1000)

    const consulta = await prisma.consulta.create({
      data: {
        profissionalId: profissional.id,
        pacienteId: paciente.id,
        data: '2026-10-15',
        hora: '09:00',
        tipo: 'retorno',
        inicio: inicioPassado,
        fim: new Date(inicioPassado.getTime() + 30 * 60 * 1000),
        status: 'cancelada',
      },
    })

    const res = await request(app)
      .post(`/consultas/${consulta.id}/falta`)
      .set('Authorization', recepcao.auth)

    expect(res.status).toBe(409)
    expect(res.body.erro).toBe('Só é possível registrar falta em uma consulta agendada')
  })

  it('impede registro de falta duplicado em consulta que já possui falta (409 Conflict)', async () => {
    const recepcao = await criarUsuario('recepcao')
    const paciente = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')

    const inicioPassado = new Date(Date.now() - 1 * 60 * 60 * 1000)

    const consulta = await prisma.consulta.create({
      data: {
        profissionalId: profissional.id,
        pacienteId: paciente.id,
        data: '2026-10-15',
        hora: '09:00',
        tipo: 'retorno',
        inicio: inicioPassado,
        fim: new Date(inicioPassado.getTime() + 30 * 60 * 1000),
        status: 'faltou',
      },
    })

    const res = await request(app)
      .post(`/consultas/${consulta.id}/falta`)
      .set('Authorization', recepcao.auth)

    expect(res.status).toBe(409)
    expect(res.body.erro).toBe('Só é possível registrar falta em uma consulta agendada')
  })

  it('retorna 404 Not Found para consulta inexistente', async () => {
    const recepcao = await criarUsuario('recepcao')

    const res = await request(app)
      .post('/consultas/id-inexistente/falta')
      .set('Authorization', recepcao.auth)

    expect(res.status).toBe(404)
    expect(res.body.erro).toBe('Consulta não encontrada')
  })

  it('impede paciente e profissional de registrar falta (403 Forbidden)', async () => {
    const paciente = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')

    const resPaciente = await request(app)
      .post('/consultas/qualquer-id/falta')
      .set('Authorization', paciente.auth)
    expect(resPaciente.status).toBe(403)

    const resProfissional = await request(app)
      .post('/consultas/qualquer-id/falta')
      .set('Authorization', profissional.auth)
    expect(resProfissional.status).toBe(403)
  })
})
