import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../../src/app'
import { prisma } from '../../src/prisma'
import { criarUsuario, proximaSegunda } from '../ajuda'

describe('BUG-06: Condição de Corrida em Agendamentos Simultâneos (Race Condition)', () => {
  it('relato da clínica: duas pessoas marcando o mesmo horário simultaneamente deve resultar em apenas 1 agendamento e 1 erro 409', async () => {
    const data = proximaSegunda()
    const profissional = await criarUsuario('profissional')
    const paciente1 = await criarUsuario('paciente')
    const paciente2 = await criarUsuario('paciente')

    // Dispara as duas requisições exatamente no mesmo milissegundo em paralelo
    const [res1, res2] = await Promise.all([
      request(app)
        .post('/consultas')
        .set('Authorization', paciente1.auth)
        .send({
          profissionalId: profissional.id,
          data,
          hora: '09:00',
          tipo: 'retorno',
        }),
      request(app)
        .post('/consultas')
        .set('Authorization', paciente2.auth)
        .send({
          profissionalId: profissional.id,
          data,
          hora: '09:00',
          tipo: 'retorno',
        }),
    ])

    const statusList = [res1.status, res2.status].sort()
    // Uma requisição obrigatoriamente teve sucesso (201) e a outra foi barrada com conflito (409)
    expect(statusList).toEqual([201, 409])

    const respostaErro = res1.status === 409 ? res1 : res2
    expect(respostaErro.body.erro).toBe('Esse horário já está ocupado')

    // No banco de dados, deve existir rigorosamente apenas 1 consulta gravada para esse horário
    const consultasNoBanco = await prisma.consulta.findMany({
      where: { profissionalId: profissional.id, data, hora: '09:00', status: 'agendada' },
    })
    expect(consultasNoBanco).toHaveLength(1)
  })

  it('evita condição de corrida entre consulta de 60 min e consulta de 30 min enviadas simultaneamente', async () => {
    const data = proximaSegunda()
    const profissional = await criarUsuario('profissional')
    const paciente1 = await criarUsuario('paciente')
    const paciente2 = await criarUsuario('paciente')

    // Paciente 1 tenta primeira consulta (60 min) às 10:00 (ocupa 10:00 até 11:00)
    // Paciente 2 tenta retorno (30 min) às 10:30 simultaneamente
    const [resPrimeira, resRetorno] = await Promise.all([
      request(app)
        .post('/consultas')
        .set('Authorization', paciente1.auth)
        .send({
          profissionalId: profissional.id,
          data,
          hora: '10:00',
          tipo: 'primeira',
        }),
      request(app)
        .post('/consultas')
        .set('Authorization', paciente2.auth)
        .send({
          profissionalId: profissional.id,
          data,
          hora: '10:30',
          tipo: 'retorno',
        }),
    ])

    const statusList = [resPrimeira.status, resRetorno.status].sort()
    expect(statusList).toEqual([201, 409])

    // Verifica que não há sobreposição no banco de dados
    const consultasNoBanco = await prisma.consulta.findMany({
      where: { profissionalId: profissional.id, data, status: 'agendada' },
    })
    expect(consultasNoBanco).toHaveLength(1)
  })
})
