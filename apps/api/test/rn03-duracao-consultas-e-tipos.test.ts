import request from 'supertest'
import { describe, expect, it } from 'vitest'
import {
  DURACAO_MINUTOS,
  ehTipoConsulta,
  gradePorTipo,
  instante,
} from '@bemviver/shared'
import { app } from '../src/app'
import { horariosDisponiveis, temConflito } from '../src/agenda'
import { criarConsulta, criarUsuario, proximaSegunda } from './ajuda'

describe('RN03: Duração de Consultas e Tipos', () => {
  describe('Duração Canônica dos Tipos de Consulta', () => {
    it('primeira consulta tem duração estrita de 60 minutos e retorno de 30 minutos', () => {
      expect(DURACAO_MINUTOS.primeira).toBe(60)
      expect(DURACAO_MINUTOS.retorno).toBe(30)
    })

    it('ehTipoConsulta valida apenas os tipos permitidos pela clínica', () => {
      expect(ehTipoConsulta('primeira')).toBe(true)
      expect(ehTipoConsulta('retorno')).toBe(true)
      expect(ehTipoConsulta('outra')).toBe(false)
      expect(ehTipoConsulta('')).toBe(false)
      expect(ehTipoConsulta(null)).toBe(false)
      expect(ehTipoConsulta(undefined)).toBe(false)
    })

    it('calcula o horário de término (fim) com a duração exata do tipo', () => {
      const data = '2026-10-26'
      const inicio = instante(data, '09:00')

      // Primeira consulta: +60 minutos
      const fimPrimeira = new Date(inicio.getTime() + DURACAO_MINUTOS.primeira * 60_000)
      expect(fimPrimeira.toISOString()).toBe('2026-10-26T13:00:00.000Z') // 10:00 em Recife (13:00 UTC)

      // Retorno: +30 minutos
      const fimRetorno = new Date(inicio.getTime() + DURACAO_MINUTOS.retorno * 60_000)
      expect(fimRetorno.toISOString()).toBe('2026-10-26T12:30:00.000Z') // 09:30 em Recife (12:30 UTC)
    })
  })

  describe('Detecção de Conflitos e Sobreposição de Intervalos (temConflito)', () => {
    it('Caso 3: Primeira consulta às 09:00 bloqueia início às 09:00 e às 09:30', () => {
      const marcadas = [{ hora: '09:00', tipo: 'primeira' as const }]

      // Tentativa de marcar às 09:00
      expect(temConflito(marcadas, { hora: '09:00', tipo: 'retorno' })).toBe(true)
      // Tentativa de marcar às 09:30 (ocupado pelo segundo bloco de 30min da primeira)
      expect(temConflito(marcadas, { hora: '09:30', tipo: 'retorno' })).toBe(true)
      // 10:00 está livre
      expect(temConflito(marcadas, { hora: '10:00', tipo: 'retorno' })).toBe(false)
    })

    it('Caso 4: Consulta existente às 10:00 impede primeira consulta (60min) às 09:30', () => {
      const marcadas = [{ hora: '10:00', tipo: 'retorno' as const }]

      // Primeira consulta às 09:30 terminaria às 10:30, colidindo com a consulta das 10:00
      expect(temConflito(marcadas, { hora: '09:30', tipo: 'primeira' })).toBe(true)

      // Retorno às 09:30 dura 30 minutos (09:30 às 10:00), então NÃO tem conflito
      expect(temConflito(marcadas, { hora: '09:30', tipo: 'retorno' })).toBe(false)
    })
  })

  describe('Filtro de Horários Disponíveis por Tipo (/profissionais/:id/horarios)', () => {
    it('remove 11:30 e 17:30 para primeira consulta, mas mantém para retorno', () => {
      const gradePrimeira = gradePorTipo('primeira')
      const gradeRetorno = gradePorTipo('retorno')

      expect(gradePrimeira).not.toContain('11:30')
      expect(gradePrimeira).not.toContain('17:30')

      expect(gradeRetorno).toContain('11:30')
      expect(gradeRetorno).toContain('17:30')

      const dataSegunda = '2026-10-26'
      const agoraManha = new Date('2026-10-26T00:00:00.000Z')
      const disponiveisVazioPrimeira = horariosDisponiveis([], 'primeira', dataSegunda, agoraManha)
      expect(disponiveisVazioPrimeira).not.toContain('11:30')
      expect(disponiveisVazioPrimeira).not.toContain('17:30')

      const disponiveisVazioRetorno = horariosDisponiveis([], 'retorno', dataSegunda, agoraManha)
      expect(disponiveisVazioRetorno).toContain('11:30')
      expect(disponiveisVazioRetorno).toContain('17:30')
    })

    it('a rota /profissionais/:id/horarios retorna slots livres dependendo do tipo solicitado', async () => {
      const paciente = await criarUsuario('paciente')
      const profissional = await criarUsuario('profissional')
      const data = proximaSegunda()

      // Consulta existente às 10:00 (retorno)
      await criarConsulta({
        profissionalId: profissional.id,
        pacienteId: paciente.id,
        data,
        hora: '10:00',
        tipo: 'retorno',
      })

      // Para tipo retorno: 09:30 deve estar disponível (vai até as 10:00)
      const resRetorno = await request(app)
        .get(`/profissionais/${profissional.id}/horarios?data=${data}&tipo=retorno`)
        .set('Authorization', paciente.auth)

      expect(resRetorno.status).toBe(200)
      expect(resRetorno.body.horarios).toContain('09:30')
      expect(resRetorno.body.horarios).not.toContain('10:00')

      // Para tipo primeira: 09:30 NÃO deve estar disponível (iria até as 10:30)
      const resPrimeira = await request(app)
        .get(`/profissionais/${profissional.id}/horarios?data=${data}&tipo=primeira`)
        .set('Authorization', paciente.auth)

      expect(resPrimeira.status).toBe(200)
      expect(resPrimeira.body.horarios).not.toContain('09:30')
      expect(resPrimeira.body.horarios).not.toContain('10:00')
      expect(resPrimeira.body.horarios).toContain('09:00') // 09:00 às 10:00 está livre
    })

    it('bloqueia agendamento via POST /consultas quando a consulta de 60min colide com o segundo bloco', async () => {
      const paciente1 = await criarUsuario('paciente')
      const paciente2 = await criarUsuario('paciente')
      const profissional = await criarUsuario('profissional')
      const data = proximaSegunda()

      // Consulta existente às 10:00
      await criarConsulta({
        profissionalId: profissional.id,
        pacienteId: paciente1.id,
        data,
        hora: '10:00',
        tipo: 'retorno',
      })

      // Tentativa de marcar primeira consulta às 09:30 (colide das 10:00 às 10:30)
      const tentativa = await request(app)
        .post('/consultas')
        .set('Authorization', paciente2.auth)
        .send({
          profissionalId: profissional.id,
          data,
          hora: '09:30',
          tipo: 'primeira',
        })

      expect(tentativa.status).toBe(409)
      expect(tentativa.body.erro).toBe('Esse horário já está ocupado')
    })
  })
})
