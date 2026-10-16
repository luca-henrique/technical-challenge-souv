import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { app } from '../../src/app'
import { prisma } from '../../src/prisma'
import { criarConsulta, criarUsuario, proximaSegunda, somarDias } from '../ajuda'

describe('FEAT-03: Remarcação pelo próprio paciente (API)', () => {
  let profissional: Awaited<ReturnType<typeof criarUsuario>>
  let paciente: Awaited<ReturnType<typeof criarUsuario>>
  let paciente2: Awaited<ReturnType<typeof criarUsuario>>

  beforeEach(async () => {
    profissional = await criarUsuario('profissional')
    paciente = await criarUsuario('paciente')
    paciente2 = await criarUsuario('paciente')
  })

  it('permite que o paciente remarque sua consulta para outra data e horário disponíveis', async () => {
    const data1 = proximaSegunda()
    const data2 = somarDias(data1, 1) // Terça-feira

    const consulta = await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data: data1,
      hora: '09:00',
      tipo: 'primeira',
    })

    const res = await request(app)
      .patch(`/consultas/${consulta.id}/remarcar`)
      .set('Authorization', paciente.auth)
      .send({
        novaData: data2,
        novaHora: '14:00',
      })

    expect(res.status).toBe(200)
    expect(res.body.data).toBe(data2)
    expect(res.body.hora).toBe('14:00')
    expect(res.body.status).toBe('agendada')

    // Duração preservada (primeira = 60 min)
    const inicio = new Date(res.body.inicio).getTime()
    const fim = new Date(res.body.fim).getTime()
    expect(fim - inicio).toBe(60 * 60_000)

    // O horário antigo (data1 às 09:00) agora está livre
    const consultaAntigaOcupada = await prisma.consulta.findFirst({
      where: {
        profissionalId: profissional.id,
        data: data1,
        hora: '09:00',
        status: 'agendada',
      },
    })
    expect(consultaAntigaOcupada).toBeNull()
  })

  it('impede remarcação se o novo horário já estiver ocupado por outro paciente', async () => {
    const data = proximaSegunda()

    const consulta1 = await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data,
      hora: '09:00',
      tipo: 'retorno',
    })

    // Outro paciente ocupa as 10:00
    await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente2.id,
      data,
      hora: '10:00',
      tipo: 'retorno',
    })

    const res = await request(app)
      .patch(`/consultas/${consulta1.id}/remarcar`)
      .set('Authorization', paciente.auth)
      .send({
        novaData: data,
        novaHora: '10:00',
      })

    expect(res.status).toBe(409)
    expect(res.body.erro).toMatch(/já está ocupado/i)
  })

  it('impede remarcação para datas no passado, finais de semana ou dias de folga', async () => {
    const data = proximaSegunda()

    const consulta = await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data,
      hora: '09:00',
      tipo: 'retorno',
    })

    // Data no passado
    const resPassado = await request(app)
      .patch(`/consultas/${consulta.id}/remarcar`)
      .set('Authorization', paciente.auth)
      .send({ novaData: '2020-01-01', novaHora: '09:00' })
    expect(resPassado.status).toBe(400)

    // Fim de semana (sábado)
    const resSabado = await request(app)
      .patch(`/consultas/${consulta.id}/remarcar`)
      .set('Authorization', paciente.auth)
      .send({ novaData: '2026-10-17', novaHora: '09:00' })
    expect(resSabado.status).toBe(400)

    // Folga do médico
    const dataFolga = somarDias(data, 2)
    await prisma.folga.create({
      data: { profissionalId: profissional.id, data: dataFolga },
    })

    const resFolga = await request(app)
      .patch(`/consultas/${consulta.id}/remarcar`)
      .set('Authorization', paciente.auth)
      .send({ novaData: dataFolga, novaHora: '09:00' })
    expect(resFolga.status).toBe(409)
    expect(resFolga.body.erro).toMatch(/folga/i)
  })

  it('impede que outro paciente remarque consulta que não é dele', async () => {
    const data = proximaSegunda()

    const consulta = await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data,
      hora: '09:00',
      tipo: 'retorno',
    })

    const res = await request(app)
      .patch(`/consultas/${consulta.id}/remarcar`)
      .set('Authorization', paciente2.auth)
      .send({ novaData: data, novaHora: '11:00' })

    expect(res.status).toBe(403)
    expect(res.body.erro).toMatch(/suas próprias consultas/i)
  })

  it('notifica a fila de espera quando a vaga anterior é liberada pela remarcação', async () => {
    const data1 = proximaSegunda()
    const data2 = somarDias(data1, 1)

    // Consulta original às 09:00
    const consulta = await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data: data1,
      hora: '09:00',
      tipo: 'retorno',
    })

    // Paciente 2 está na lista de espera para data1 pela manhã
    const espera = await prisma.listaEspera.create({
      data: {
        profissionalId: profissional.id,
        pacienteId: paciente2.id,
        data: data1,
        tipo: 'retorno',
        turno: 'manha',
        status: 'aguardando',
      },
    })

    // Paciente remarca para o dia seguinte
    const res = await request(app)
      .patch(`/consultas/${consulta.id}/remarcar`)
      .set('Authorization', paciente.auth)
      .send({
        novaData: data2,
        novaHora: '14:00',
      })

    expect(res.status).toBe(200)
    expect(res.body.pacienteNotificadoListaEspera).toBeDefined()
    expect(res.body.pacienteNotificadoListaEspera.id).toBe(espera.id)

    // Verifica que o paciente 2 foi marcado como 'notificado'
    const esperaAtualizada = await prisma.listaEspera.findUnique({ where: { id: espera.id } })
    expect(esperaAtualizada?.status).toBe('notificado')
  })
})
