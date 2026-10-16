import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { prisma } from '../src/prisma'
import { criarUsuario, proximaSegunda, somarDias } from './ajuda'

describe('consultasController.criarConsulta', () => {
  it('permite que um paciente agende uma consulta para si mesmo com sucesso', async () => {
    const paciente = await criarUsuario('paciente', 'Maria Paciente')
    const profissional = await criarUsuario('profissional', 'Dr. Roberto')
    const data = proximaSegunda()

    const resposta = await request(app)
      .post('/consultas')
      .set('Authorization', paciente.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '09:00',
        tipo: 'primeira',
      })

    expect(resposta.status).toBe(201)
    expect(resposta.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        profissionalId: profissional.id,
        pacienteId: paciente.id,
        data,
        hora: '09:00',
        tipo: 'primeira',
        status: 'agendada',
      }),
    )

    // Verifica cálculo do fim da consulta (60 minutos para primeira consulta)
    const consultaNoBanco = await prisma.consulta.findUnique({ where: { id: resposta.body.id } })
    expect(consultaNoBanco).not.toBeNull()
    expect(new Date(consultaNoBanco!.fim).getTime() - new Date(consultaNoBanco!.inicio).getTime()).toBe(
      60 * 60 * 1000,
    )
  })

  it('permite que a recepção agende uma consulta especificando o pacienteId', async () => {
    const recepcao = await criarUsuario('recepcao', 'Recepção Central')
    const paciente = await criarUsuario('paciente', 'João Paciente')
    const profissional = await criarUsuario('profissional', 'Dra. Ana')
    const data = proximaSegunda()

    const resposta = await request(app)
      .post('/consultas')
      .set('Authorization', recepcao.auth)
      .send({
        profissionalId: profissional.id,
        pacienteId: paciente.id,
        data,
        hora: '14:00',
        tipo: 'retorno',
      })

    expect(resposta.status).toBe(201)
    expect(resposta.body.pacienteId).toBe(paciente.id)
    expect(resposta.body.tipo).toBe('retorno')

    // Consulta de retorno dura 30 minutos
    const consultaNoBanco = await prisma.consulta.findUnique({ where: { id: resposta.body.id } })
    expect(new Date(consultaNoBanco!.fim).getTime() - new Date(consultaNoBanco!.inicio).getTime()).toBe(
      30 * 60 * 1000,
    )
  })

  it('rejeita com 400 quando faltam dados obrigatórios validados pelo Zod', async () => {
    const paciente = await criarUsuario('paciente')

    const resposta = await request(app)
      .post('/consultas')
      .set('Authorization', paciente.auth)
      .send({
        data: '2026-10-26',
        hora: '09:00',
      })

    expect(resposta.status).toBe(400)
    expect(resposta.body.erro).toBe('Informe o profissional')
  })

  it('rejeita com 400 tentativa de agendamento em final de semana (RN01)', async () => {
    const paciente = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')
    const segunda = proximaSegunda()
    // Somar 5 dias para cair no sábado
    const sabado = somarDias(segunda, 5)

    const resposta = await request(app)
      .post('/consultas')
      .set('Authorization', paciente.auth)
      .send({
        profissionalId: profissional.id,
        data: sabado,
        hora: '09:00',
        tipo: 'primeira',
      })

    expect(resposta.status).toBe(400)
    expect(resposta.body.erro).toBe('A clínica só atende de segunda a sexta')
  })

  it('rejeita com 400 primeira consulta às 11:30 pois invade o almoço (RN01)', async () => {
    const paciente = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')
    const data = proximaSegunda()

    const resposta = await request(app)
      .post('/consultas')
      .set('Authorization', paciente.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '11:30',
        tipo: 'primeira',
      })

    expect(resposta.status).toBe(400)
    expect(resposta.body.erro).toBe('A consulta precisa terminar antes do almoço ou do fim do expediente')
  })

  it('rejeita com 400 primeira consulta às 17:30 pois invade o fim do expediente (RN01)', async () => {
    const paciente = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')
    const data = proximaSegunda()

    const resposta = await request(app)
      .post('/consultas')
      .set('Authorization', paciente.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '17:30',
        tipo: 'primeira',
      })

    expect(resposta.status).toBe(400)
    expect(resposta.body.erro).toBe('A consulta precisa terminar antes do almoço ou do fim do expediente')
  })

  it('rejeita com 400 se o profissional ou paciente não forem encontrados', async () => {
    const paciente = await criarUsuario('paciente')
    const data = proximaSegunda()

    const resposta = await request(app)
      .post('/consultas')
      .set('Authorization', paciente.auth)
      .send({
        profissionalId: 'id-inexistente',
        data,
        hora: '09:00',
        tipo: 'primeira',
      })

    expect(resposta.status).toBe(400)
    expect(resposta.body.erro).toBe('Paciente ou profissional não encontrado')
  })

  it('rejeita com 409 quando o profissional está de folga na data', async () => {
    const paciente = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')
    const data = proximaSegunda()

    await prisma.folga.create({
      data: {
        profissionalId: profissional.id,
        data,
      },
    })

    const resposta = await request(app)
      .post('/consultas')
      .set('Authorization', paciente.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '09:00',
        tipo: 'primeira',
      })

    expect(resposta.status).toBe(409)
    expect(resposta.body.erro).toBe('O profissional está de folga nesse dia')
  })

  it('rejeita com 409 quando o horário já está ocupado', async () => {
    const paciente1 = await criarUsuario('paciente')
    const paciente2 = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')
    const data = proximaSegunda()

    // Primeira marcação às 09:00
    const primeiraMarcacao = await request(app)
      .post('/consultas')
      .set('Authorization', paciente1.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '09:00',
        tipo: 'retorno',
      })
    expect(primeiraMarcacao.status).toBe(201)

    // Tentativa de marcar no mesmo horário
    const conflito = await request(app)
      .post('/consultas')
      .set('Authorization', paciente2.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '09:00',
        tipo: 'retorno',
      })

    expect(conflito.status).toBe(409)
    expect(conflito.body.erro).toBe('Esse horário já está ocupado')
  })

  it('rejeita com 409 quando há sobreposição com consulta de 60 minutos', async () => {
    const paciente1 = await criarUsuario('paciente')
    const paciente2 = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')
    const data = proximaSegunda()

    // Primeira consulta de 60 minutos das 09:00 às 10:00
    const agendamento60min = await request(app)
      .post('/consultas')
      .set('Authorization', paciente1.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '09:00',
        tipo: 'primeira',
      })
    expect(agendamento60min.status).toBe(201)

    // Tentativa de agendamento às 09:30 (dentro do intervalo das 09:00-10:00)
    const conflitoSobreposicao = await request(app)
      .post('/consultas')
      .set('Authorization', paciente2.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '09:30',
        tipo: 'retorno',
      })

    expect(conflitoSobreposicao.status).toBe(409)
    expect(conflitoSobreposicao.body.erro).toBe('Esse horário já está ocupado')
  })

  it('permite agendar em horário cuja consulta anterior foi cancelada', async () => {
    const paciente1 = await criarUsuario('paciente')
    const paciente2 = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')
    const data = proximaSegunda()

    // Primeira marcação
    const primeira = await request(app)
      .post('/consultas')
      .set('Authorization', paciente1.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '10:00',
        tipo: 'retorno',
      })
    expect(primeira.status).toBe(201)

    // Cancelamento da consulta
    await request(app)
      .post(`/consultas/${primeira.body.id}/cancelar`)
      .set('Authorization', paciente1.auth)

    // Novo agendamento no mesmo horário após cancelamento
    const novoAgendamento = await request(app)
      .post('/consultas')
      .set('Authorization', paciente2.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '10:00',
        tipo: 'retorno',
      })

    expect(novoAgendamento.status).toBe(201)
  })
})
