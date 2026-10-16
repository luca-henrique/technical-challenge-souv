import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { temConflito } from '../src/agenda'
import { prisma } from '../src/prisma'
import { criarConsulta, criarUsuario, proximaSegunda } from './ajuda'

describe('RN04: Exclusividade de Atendimento e Prevenção de Conflitos', () => {
  describe('Detecção Matemática de Conflitos (temConflito)', () => {
    it('detecta colisão no mesmo horário para consultas de 30 minutos', () => {
      const marcadas = [{ hora: '09:00', tipo: 'retorno' as const }]
      expect(temConflito(marcadas, { hora: '09:00', tipo: 'retorno' })).toBe(true)
      expect(temConflito(marcadas, { hora: '09:30', tipo: 'retorno' })).toBe(false)
    })

    it('detecta colisão quando uma consulta de 60 minutos bloqueia o slot seguinte', () => {
      const marcadas = [{ hora: '09:00', tipo: 'primeira' as const }] // ocupa 09:00 até 10:00
      expect(temConflito(marcadas, { hora: '09:00', tipo: 'retorno' })).toBe(true)
      expect(temConflito(marcadas, { hora: '09:30', tipo: 'retorno' })).toBe(true)
      expect(temConflito(marcadas, { hora: '10:00', tipo: 'retorno' })).toBe(false)
    })

    it('detecta colisão quando uma nova consulta de 60 minutos invade consulta existente posterior', () => {
      const marcadas = [{ hora: '10:00', tipo: 'retorno' as const }] // 10:00 às 10:30
      // 09:30 de 60min iria até 10:30, colidindo com a das 10:00
      expect(temConflito(marcadas, { hora: '09:30', tipo: 'primeira' })).toBe(true)
      // 09:30 de 30min termina às 10:00 em ponto, sem sobreposição
      expect(temConflito(marcadas, { hora: '09:30', tipo: 'retorno' })).toBe(false)
    })

    it('ignora consultas com status cancelada', () => {
      const marcadas = [
        { hora: '09:00', tipo: 'retorno' as const, status: 'cancelada' },
      ]
      expect(temConflito(marcadas, { hora: '09:00', tipo: 'retorno' })).toBe(false)
      expect(temConflito(marcadas, { hora: '09:00', tipo: 'primeira' })).toBe(false)
    })
  })

  describe('Exclusividade na API e Bloqueio de Encaixes (HTTP 409)', () => {
    it('retorna 409 ao tentar agendar para horário já ocupado pelo mesmo profissional', async () => {
      const paciente1 = await criarUsuario('paciente')
      const paciente2 = await criarUsuario('paciente')
      const profissional = await criarUsuario('profissional')
      const data = proximaSegunda()

      await criarConsulta({
        profissionalId: profissional.id,
        pacienteId: paciente1.id,
        data,
        hora: '14:00',
        tipo: 'retorno',
      })

      const res = await request(app)
        .post('/consultas')
        .set('Authorization', paciente2.auth)
        .send({
          profissionalId: profissional.id,
          data,
          hora: '14:00',
          tipo: 'retorno',
        })

      expect(res.status).toBe(409)
      expect(res.body.erro).toBe('Esse horário já está ocupado')
    })

    it('permite agendar em horário cuja consulta anterior foi cancelada', async () => {
      const paciente1 = await criarUsuario('paciente')
      const paciente2 = await criarUsuario('paciente')
      const profissional = await criarUsuario('profissional')
      const data = proximaSegunda()

      const consulta = await criarConsulta({
        profissionalId: profissional.id,
        pacienteId: paciente1.id,
        data,
        hora: '15:00',
        tipo: 'retorno',
      })

      // Paciente 1 cancela
      await request(app)
        .post(`/consultas/${consulta.id}/cancelar`)
        .set('Authorization', paciente1.auth)
        .expect(200)

      // Paciente 2 agora consegue agendar no mesmo horário
      const res = await request(app)
        .post('/consultas')
        .set('Authorization', paciente2.auth)
        .send({
          profissionalId: profissional.id,
          data,
          hora: '15:00',
          tipo: 'retorno',
        })

      expect(res.status).toBe(201)
      expect(res.body.hora).toBe('15:00')
      expect(res.body.status).toBe('agendada')
    })
  })

  describe('Prevenção de Condição de Corrida (Race Condition)', () => {
    it('garante que duas requisições simultâneas para o mesmo horário criem apenas uma consulta', async () => {
      const paciente1 = await criarUsuario('paciente')
      const paciente2 = await criarUsuario('paciente')
      const profissional = await criarUsuario('profissional')
      const data = proximaSegunda()
      const hora = '16:00'

      // Dispara simultaneamente duas requisições de agendamento para o mesmo slot
      const [res1, res2] = await Promise.all([
        request(app)
          .post('/consultas')
          .set('Authorization', paciente1.auth)
          .send({
            profissionalId: profissional.id,
            data,
            hora,
            tipo: 'retorno',
          }),
        request(app)
          .post('/consultas')
          .set('Authorization', paciente2.auth)
          .send({
            profissionalId: profissional.id,
            data,
            hora,
            tipo: 'retorno',
          }),
      ])

      const statuses = [res1.status, res2.status].sort()
      // Exatamente um deve ter sucesso (201) e exatamente um deve receber conflito (409)
      expect(statuses).toEqual([201, 409])

      const resErro = res1.status === 409 ? res1 : res2
      expect(resErro.body.erro).toBe('Esse horário já está ocupado')

      // No banco de dados, deve haver rigorosamente 1 consulta agendada
      const consultasNoBanco = await prisma.consulta.findMany({
        where: {
          profissionalId: profissional.id,
          data,
          hora,
          status: 'agendada',
        },
      })
      expect(consultasNoBanco).toHaveLength(1)
    })
  })
})
